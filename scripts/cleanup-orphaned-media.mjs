import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const amplifyOutputsPath = path.join(projectRoot, 'amplify_outputs.json');

const outputs = JSON.parse(await fs.readFile(amplifyOutputsPath, 'utf8'));

const args = new Set(process.argv.slice(2));
const shouldApply = args.has('--apply');
const dryRun = !shouldApply;

const defaultPrefix = 'public/media/';
const bucketName = String(outputs?.storage?.bucket_name || '').trim();
const region = String(outputs?.storage?.aws_region || outputs?.auth?.aws_region || '').trim();
const dataUrl = String(outputs?.data?.url || '').trim();
const mediaLibraryAuthToken = String(process.env.MEDIA_LIBRARY_AUTH_TOKEN || '').trim();

if (!bucketName || !region) {
  throw new Error('Missing storage bucket configuration in amplify_outputs.json.');
}

if (!dataUrl || !mediaLibraryAuthToken) {
  throw new Error('Missing GraphQL API URL or MEDIA_LIBRARY_AUTH_TOKEN for a permitted media manager.');
}

const s3 = new S3Client({ region });

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isRemoteUrl(value) {
  const text = normalizeText(value);
  return /^(https?:\/\/|blob:|data:)/i.test(text);
}

function extractStoragePathFromUrl(value) {
  const cleanValue = normalizeText(value);
  if (!cleanValue) return '';

  try {
    const parsed = new URL(cleanValue);
    return decodeURIComponent(parsed.pathname || '').replace(/^\/+/, '');
  } catch {
    return '';
  }
}

function normalizeStoragePath(value) {
  const cleanValue = normalizeText(value);
  if (!cleanValue) return '';

  const withoutLeadingSlash = cleanValue.replace(/^\/+/, '');
  if (/^(public|protected|private)\//i.test(withoutLeadingSlash)) {
    return withoutLeadingSlash;
  }

  if (/^media\//i.test(withoutLeadingSlash)) {
    return `public/${withoutLeadingSlash}`;
  }

  if (/^products\//i.test(withoutLeadingSlash)) {
    return `public/media/${withoutLeadingSlash}`;
  }

  return `public/media/${withoutLeadingSlash}`;
}

function toStoragePathFromMediaUrl(urlValue) {
  const cleanValue = normalizeText(urlValue);
  if (!cleanValue) return '';

  if (/^blob:/i.test(cleanValue) || /^data:/i.test(cleanValue)) {
    return '';
  }

  if (isRemoteUrl(cleanValue)) {
    const extracted = extractStoragePathFromUrl(cleanValue);
    if (/^(public|protected|private)\//i.test(extracted)) {
      return extracted;
    }

    return '';
  }

  if (/^\/?images\//i.test(cleanValue)) {
    return '';
  }

  return normalizeStoragePath(cleanValue);
}

async function graphqlRequest(query, variables = {}) {
  const response = await fetch(dataUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: mediaLibraryAuthToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  if (!response.ok || json.errors?.length) {
    const message = json.errors?.[0]?.message || `GraphQL request failed with status ${response.status}`;
    throw new Error(message);
  }

  return json.data;
}

async function fetchAllMediaItems() {
  const query = /* GraphQL */ `
    query ListManagedMediaLibrary {
      listManagedMediaLibrary {
        mediaItems
      }
    }
  `;
  const data = await graphqlRequest(query);
  return Array.isArray(data?.listManagedMediaLibrary?.mediaItems)
    ? data.listManagedMediaLibrary.mediaItems
    : [];
}

async function listAllKeys(prefix) {
  const keys = [];
  let continuationToken;

  do {
    const result = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    const pageKeys = (result.Contents || [])
      .map((entry) => String(entry.Key || ''))
      .filter((key) => key && !key.endsWith('/'));

    keys.push(...pageKeys);
    continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}

function chunk(array, size) {
  const chunks = [];
  for (let index = 0; index < array.length; index += size) {
    chunks.push(array.slice(index, index + size));
  }
  return chunks;
}

async function deleteKeys(keys) {
  const groups = chunk(keys, 1000);

  for (const group of groups) {
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: group.map((key) => ({ Key: key })),
          Quiet: true,
        },
      })
    );
  }
}

async function writeReport(payload) {
  const outputDir = path.join(projectRoot, 'output');
  const outputPath = path.join(outputDir, 'orphaned-media-report.json');
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(payload, null, 2), 'utf8');
  return outputPath;
}

async function main() {
  console.log(`Scanning bucket ${bucketName} in ${region} for orphaned media...`);
  console.log(dryRun ? 'Mode: DRY RUN (no deletes)' : 'Mode: APPLY (permanent delete)');

  const mediaItems = await fetchAllMediaItems();
  const referencedKeys = new Set(
    mediaItems
      .map((item) => toStoragePathFromMediaUrl(item?.url))
      .filter((key) => key && key.startsWith(defaultPrefix))
  );

  const allKeys = await listAllKeys(defaultPrefix);
  const orphanedKeys = allKeys.filter((key) => !referencedKeys.has(key));

  if (shouldApply && orphanedKeys.length > 0) {
    await deleteKeys(orphanedKeys);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    mode: dryRun ? 'dry-run' : 'apply',
    bucketName,
    region,
    prefix: defaultPrefix,
    totalMediaItems: mediaItems.length,
    referencedStorageKeys: referencedKeys.size,
    totalStorageKeysScanned: allKeys.length,
    orphanedStorageKeys: orphanedKeys.length,
    deletedStorageKeys: shouldApply ? orphanedKeys.length : 0,
    orphanedStorageKeySample: orphanedKeys.slice(0, 200),
  };

  const reportPath = await writeReport(report);

  console.log(`Media items found: ${mediaItems.length}`);
  console.log(`Storage objects scanned: ${allKeys.length}`);
  console.log(`Orphaned storage objects: ${orphanedKeys.length}`);
  if (dryRun) {
    console.log('No objects were deleted. Run with --apply to permanently delete orphans.');
  } else {
    console.log(`Deleted orphaned storage objects: ${orphanedKeys.length}`);
  }
  console.log(`Report written to: ${reportPath}`);
}

main().catch((error) => {
  console.error('Cleanup failed:', error?.message || error);
  process.exit(1);
});

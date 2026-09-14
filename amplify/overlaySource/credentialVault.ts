import { DecryptCommand, EncryptCommand, KMSClient } from '@aws-sdk/client-kms';
import { credentialMatches } from './domain';

const kms = new KMSClient({});
const context = (publication: { publicationId: string; brandId: string }) => ({ purpose: 'overlay-source', publicationId: publication.publicationId, brandId: publication.brandId });

function credentialRecord(value: unknown) {
  if (!value || typeof value !== 'object') throw new Error('Overlay publication access is denied');
  const record = value as Record<string, unknown>;
  if (typeof record.publicationId !== 'string' || typeof record.brandId !== 'string' || typeof record.credentialHash !== 'string') throw new Error('Overlay publication access is denied');
  return { publicationId: record.publicationId, brandId: record.brandId, credentialHash: record.credentialHash,
    credentialCiphertext: typeof record.credentialCiphertext === 'string' ? record.credentialCiphertext : undefined };
}

export function browserSourceUrl(origin: string, credential: string) {
  return new URL(`/overlay-source/${encodeURIComponent(credential)}`, origin).href;
}

export function importedCredential(value: unknown, origin: string, publication: unknown) {
  try {
    const url = new URL(String(value));
    if (url.origin !== new URL(origin).origin || url.username || url.password || url.search || url.hash) throw new Error();
    const match = url.pathname.match(/^\/overlay-source\/([A-Za-z0-9_-]+)$/);
    if (!match || !credentialMatches(credentialRecord(publication), match[1])) throw new Error();
    return match[1];
  } catch { throw new Error('Use the existing OBS URL for this active Browser Source'); }
}

export async function encryptCredential(value: unknown, credential: string) {
  const publication = credentialRecord(value);
  const result = await kms.send(new EncryptCommand({ KeyId: process.env.OVERLAY_CREDENTIAL_KEY_ID, Plaintext: Buffer.from(credential), EncryptionContext: context(publication) }));
  if (!result.CiphertextBlob) throw new Error('Could not secure Browser Source URL');
  return Buffer.from(result.CiphertextBlob).toString('base64');
}

export async function decryptCredential(value: unknown) {
  const publication = credentialRecord(value);
  if (!publication.credentialCiphertext) return undefined;
  const result = await kms.send(new DecryptCommand({ KeyId: process.env.OVERLAY_CREDENTIAL_KEY_ID, CiphertextBlob: Buffer.from(publication.credentialCiphertext, 'base64'), EncryptionContext: context(publication) }));
  const credential = result.Plaintext ? Buffer.from(result.Plaintext).toString() : '';
  if (!credentialMatches(publication, credential)) throw new Error('Could not retrieve Browser Source URL');
  return credential;
}

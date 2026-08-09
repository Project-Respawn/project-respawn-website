#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const PERMISSIONS_FILE = path.join(ROOT, 'amplify', 'myFunction', 'permissions', 'index.ts');
const REPORT_DIR = path.join(ROOT, 'output');
const REPORT_FILE = path.join(REPORT_DIR, 'permission-scan-report.json');

const CODE_FILE_EXTENSIONS = new Set(['.js', '.ts', '.vue', '.jsx', '.tsx']);
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage', '.amplify']);

function walk(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...walk(fullPath));
      continue;
    }

    if (CODE_FILE_EXTENSIONS.has(path.extname(entry.name))) {
      results.push(fullPath);
    }
  }

  return results;
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function extractRegistryPermissions(fileContent) {
  const patterns = [
    /['"`]([a-z0-9_-]+\.[a-z0-9_.-]+)['"`]\s*:/gi,
    /\bkey\s*:\s*['"`]([a-z0-9_-]+\.[a-z0-9_.-]+)['"`]/gi,
  ];
  const keys = new Set();

  for (const pattern of patterns) {
    for (const match of fileContent.matchAll(pattern)) {
      keys.add(match[1]);
    }
  }

  return keys;
}

function extractRoles(fileContent) {
  const cognitoGroupsMatch = fileContent.match(/COGNITO_GROUPS\s*=\s*\[([\s\S]*?)\]\s*as const/m);
  if (cognitoGroupsMatch) {
    return [...cognitoGroupsMatch[1].matchAll(/['"`]([A-Za-z0-9_]+)['"`]/g)]
      .map((match) => match[1])
      .sort();
  }

  const roleBlockMatch = fileContent.match(/ROLE_DEFINITIONS\s*=\s*\{([\s\S]*?)\n\};?/m);
  if (!roleBlockMatch) return [];

  const block = roleBlockMatch[1];
  const roles = [];
  const roleRegex = /\n\s*([A-Za-z0-9_]+)\s*:\s*\{/g;

  for (const match of block.matchAll(roleRegex)) {
    roles.push(match[1]);
  }

  return [...new Set(roles)].sort();
}

function extractDefaultPermissionRoleMap(fileContent) {
  const result = {};
  const blockMatch = fileContent.match(/DEFAULT_PERMISSIONS\s*=\s*\{([\s\S]*?)\n\};?/m);
  if (!blockMatch) return result;

  const block = blockMatch[1];
  const entryRegex = /['"`]([a-z0-9_-]+\.[a-z0-9_.-]+)['"`]\s*:\s*\[([\s\S]*?)\]/gi;

  for (const match of block.matchAll(entryRegex)) {
    const key = match[1];
    const rolesBlock = match[2];
    const roles = [];
    const roleRegex = /['"`]([A-Za-z0-9_]+)['"`]/g;

    for (const roleMatch of rolesBlock.matchAll(roleRegex)) {
      roles.push(roleMatch[1]);
    }

    result[key] = [...new Set(roles)].sort();
  }

  return result;
}

function extractSections(fileContent) {
  const sections = [];
  const sectionRegex = /\{\s*key:\s*['"`]([^'"`]+)['"`],\s*label:\s*['"`]([^'"`]+)['"`],\s*sectionClass:\s*['"`]([^'"`]+)['"`],\s*items:\s*\[([\s\S]*?)\]\s*\}/g;

  for (const match of fileContent.matchAll(sectionRegex)) {
    const itemsBlock = match[4];
    const items = [];
    const itemRegex = /\{\s*key:\s*['"`]([^'"`]+)['"`],\s*label:\s*['"`]([^'"`]+)['"`]\s*\}/g;

    for (const itemMatch of itemsBlock.matchAll(itemRegex)) {
      items.push({ key: itemMatch[1], label: itemMatch[2] });
    }

    sections.push({
      key: match[1],
      label: match[2],
      sectionClass: match[3],
      items,
    });
  }

  return sections;
}

function extractUsedPermissions(fileContent) {
  const patterns = [
    /canUser\s*\([^)]*['"`]([a-z0-9_-]+\.[a-z0-9_.-]+)['"`]/gi,
    /canRole\s*\([^)]*['"`]([a-z0-9_-]+\.[a-z0-9_.-]+)['"`]/gi,
    /hasPermission\s*\([^)]*['"`]([a-z0-9_-]+\.[a-z0-9_.-]+)['"`]/gi,
    /hasAnyPermission\s*\([^)]*['"`]([a-z0-9_-]+\.[a-z0-9_.-]+)['"`]/gi,
    /permission(?:Key)?\s*[:=]\s*['"`]([a-z0-9_-]+\.[a-z0-9_.-]+)['"`]/gi,
  ];

  const found = new Set();

  for (const regex of patterns) {
    for (const match of fileContent.matchAll(regex)) {
      found.add(match[1]);
    }
  }

  return found;
}

function isLikelyPermissionKey(key) {
  return /^[a-z][a-z0-9_-]*\.[a-z0-9_.-]+$/i.test(key);
}

function titleFromPermissionKey(key) {
  const action = key.split('.').slice(1).join(' ');
  return action.replace(/[_.-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
}

function main() {
  if (!fs.existsSync(PERMISSIONS_FILE)) {
    console.error(`Missing permissions file: ${PERMISSIONS_FILE}`);
    process.exit(1);
  }

  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const permissionsContent = readFileSafe(PERMISSIONS_FILE);
  const registryPermissions = [...extractRegistryPermissions(permissionsContent)].sort();
  const roleDefinitions = extractRoles(permissionsContent);
  const defaultPermissionRoleMap = extractDefaultPermissionRoleMap(permissionsContent);
  const sections = extractSections(permissionsContent);

  const sectionEntries = [];
  const registrySectionMap = new Map();

  for (const section of sections) {
    for (const item of section.items) {
      const entry = {
        sectionKey: section.key,
        sectionLabel: section.label,
        sectionClass: section.sectionClass,
        permissionKey: item.key,
        permissionLabel: item.label,
      };
      sectionEntries.push(entry);
      registrySectionMap.set(item.key, entry);
    }
  }

  const files = walk(SRC_DIR);
  const usedPermissionsByFile = [];
  const allUsedPermissions = new Set();

  for (const file of files) {
    const content = readFileSafe(file);
    const used = [...extractUsedPermissions(content)]
      .filter(isLikelyPermissionKey)
      .sort();

    if (used.length > 0) {
      for (const permissionKey of used) {
        usedPermissionsByFile.push({
          file: path.relative(ROOT, file),
          permissionKey,
          existsInRegistry: registryPermissions.includes(permissionKey),
          existsInDefaultMatrix: Object.prototype.hasOwnProperty.call(defaultPermissionRoleMap, permissionKey),
          sectionKey: registrySectionMap.get(permissionKey)?.sectionKey || '',
        });
        allUsedPermissions.add(permissionKey);
      }
    }
  }

  const invalidRoleAssignments = [];
  for (const [permissionKey, roles] of Object.entries(defaultPermissionRoleMap)) {
    for (const role of roles) {
      if (!roleDefinitions.includes(role)) {
        invalidRoleAssignments.push({ permissionKey, role });
      }
    }
  }

  const missingFromRegistry = [...allUsedPermissions]
    .filter(key => !registryPermissions.includes(key))
    .sort();

  const issues = [];
  for (const key of missingFromRegistry) {
    issues.push({
      issueType: 'Missing in registry',
      permissionKey: key,
      role: '',
      location: 'code usage',
      detail: 'Referenced in code but not defined in permission sections/registry',
      status: 'Open',
    });
  }

  for (const item of invalidRoleAssignments) {
    issues.push({
      issueType: 'Invalid role',
      permissionKey: item.permissionKey,
      role: item.role,
      location: 'DEFAULT_PERMISSIONS',
      detail: 'Role assigned in DEFAULT_PERMISSIONS is not defined in ROLE_DEFINITIONS',
      status: 'Open',
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    root: ROOT,
    permissionsFile: path.relative(ROOT, PERMISSIONS_FILE),
    summary: {
      roleCount: roleDefinitions.length,
      sectionCount: sections.length,
      registryPermissionCount: registryPermissions.length,
      defaultMatrixPermissionCount: Object.keys(defaultPermissionRoleMap).length,
      codeUsagePermissionCount: allUsedPermissions.size,
      usageReferenceCount: usedPermissionsByFile.length,
      issueCount: issues.length,
    },
    roleDefinitions,
    sections,
    registryPermissions: registryPermissions.map((permissionKey) => ({
      permissionKey,
      permissionLabel: registrySectionMap.get(permissionKey)?.permissionLabel || titleFromPermissionKey(permissionKey),
      sectionKey: registrySectionMap.get(permissionKey)?.sectionKey || '',
      sectionLabel: registrySectionMap.get(permissionKey)?.sectionLabel || '',
      sectionClass: registrySectionMap.get(permissionKey)?.sectionClass || '',
      rolesAssigned: defaultPermissionRoleMap[permissionKey] || [],
      existsInDefaultMatrix: Object.prototype.hasOwnProperty.call(defaultPermissionRoleMap, permissionKey),
      usedInCode: allUsedPermissions.has(permissionKey),
    })),
    codeUsage: usedPermissionsByFile,
    issues,
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf8');

  console.log(`Permission scan JSON written to ${path.relative(ROOT, REPORT_FILE)}`);
  console.log(JSON.stringify(report.summary, null, 2));

  if (
    issues.some(issue =>
      [
        'Missing in registry',
        'Missing in default matrix',
        'Matrix key missing in registry',
        'Invalid role',
        'Broken link',
      ].includes(issue.issueType)
    )
  ) {
    process.exitCode = 2;
  }
}

main();

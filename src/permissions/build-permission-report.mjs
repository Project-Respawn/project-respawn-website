#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

const ROOT = process.cwd();
const REPORT_JSON = path.join(ROOT, 'output', 'permission-scan-report.json');
const REPORT_XLSX = path.join(ROOT, 'output', 'permission-scan-report.xlsx');

function autoWidth(rows) {
  const widths = [];

  for (const row of rows) {
    row.forEach((value, idx) => {
      const len = String(value ?? '').length;
      widths[idx] = Math.min(Math.max((widths[idx] || 10), len + 2), 60);
    });
  }

  return widths.map(wch => ({ wch }));
}

function sheetFromObjects(data) {
  const ws = xlsx.utils.json_to_sheet(data);
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1 });
  ws['!cols'] = autoWidth(rows);
  return ws;
}

function main() {
  if (!fs.existsSync(REPORT_JSON)) {
    console.error(`Missing JSON report: ${REPORT_JSON}`);
    console.error('Run the scan script first.');
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(REPORT_JSON, 'utf8'));
  const wb = xlsx.utils.book_new();

  const overview = [
    { Metric: 'Generated At', Value: report.generatedAt },
    { Metric: 'Permissions File', Value: report.permissionsFile },
    { Metric: 'Role Count', Value: report.summary.roleCount },
    { Metric: 'Section Count', Value: report.summary.sectionCount },
    { Metric: 'Registry Permission Count', Value: report.summary.registryPermissionCount },
    { Metric: 'Default Matrix Permission Count', Value: report.summary.defaultMatrixPermissionCount },
    { Metric: 'Code Usage Permission Count', Value: report.summary.codeUsagePermissionCount },
    { Metric: 'Usage Reference Count', Value: report.summary.usageReferenceCount },
    { Metric: 'Issue Count', Value: report.summary.issueCount },
  ];

  const registry = report.registryPermissions.map(item => ({
    SectionKey: item.sectionKey,
    SectionLabel: item.sectionLabel,
    SectionClass: item.sectionClass,
    PermissionKey: item.permissionKey,
    PermissionLabel: item.permissionLabel,
    RolesAssigned: item.rolesAssigned.join(', '),
    ExistsInDefaultMatrix: item.existsInDefaultMatrix,
    UsedInCode: item.usedInCode,
  }));

  const usage = report.codeUsage.map(item => ({
    File: item.file,
    PermissionKey: item.permissionKey,
    ExistsInRegistry: item.existsInRegistry,
    ExistsInDefaultMatrix: item.existsInDefaultMatrix,
    SectionKey: item.sectionKey,
  }));

  const issues = report.issues.map(item => ({
    IssueType: item.issueType,
    PermissionKey: item.permissionKey,
    Role: item.role,
    Location: item.location,
    Detail: item.detail,
    Status: item.status,
  }));

  const sections = report.sections.flatMap(section =>
    section.items.map(item => ({
      SectionKey: section.key,
      SectionLabel: section.label,
      SectionClass: section.sectionClass,
      PermissionKey: item.key,
      PermissionLabel: item.label,
    }))
  );

  const roles = report.roleDefinitions.map(role => ({ Role: role }));

  xlsx.utils.book_append_sheet(wb, sheetFromObjects(overview), 'Overview');
  xlsx.utils.book_append_sheet(wb, sheetFromObjects(registry), 'Registry');
  xlsx.utils.book_append_sheet(wb, sheetFromObjects(usage), 'Code Usage');
  xlsx.utils.book_append_sheet(wb, sheetFromObjects(issues), 'Issues');
  xlsx.utils.book_append_sheet(wb, sheetFromObjects(sections), 'Sections');
  xlsx.utils.book_append_sheet(wb, sheetFromObjects(roles), 'Roles');

  xlsx.writeFile(wb, REPORT_XLSX);
  console.log(`Permission scan workbook written to ${path.relative(ROOT, REPORT_XLSX)}`);
}

main();
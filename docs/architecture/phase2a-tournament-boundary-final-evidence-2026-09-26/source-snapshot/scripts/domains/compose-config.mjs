import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {target, verifyReceipt, write, buildDir, stackName} from './lib.mjs';
export function plannedManifest(core, receipt) {
  return {manifestVersion: 'domain-endpoints.v1', domainOwner: 'Tournaments', environment: core.environment, account: core.account, region: core.region, stackName, stackArn: null, endpoint: null, status: 'PLANNED_NOT_DEPLOYED', authMode: 'COGNITO_JWT_ACCESS_TOKEN', contractVersion: 'tournament-preview.v1', deploymentRevision: receipt.revision, provenance: {source: 'isolated-tournament-assembly', coreSha256: receipt.coreSha256, assembly: receipt.assembly, liveVerified: false}};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const core = target(process.argv.slice(2)), receipt = verifyReceipt();
  const manifest = plannedManifest(core, receipt);
  write(path.join(buildDir, 'domain-endpoints.Ntgre.json'), manifest);
  console.log(JSON.stringify(manifest, null, 2));
}

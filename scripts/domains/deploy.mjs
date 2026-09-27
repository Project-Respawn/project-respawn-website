import path from 'node:path';
import {target, verifyReceipt, write, buildDir, stackName, relative} from './lib.mjs';
// Phase 2A stops at a local deployment review manifest. No AWS SDK/CLI/write primitive.
const core = target(process.argv.slice(2)), receipt = verifyReceipt();
const review = {version: 1, status: 'AWAITING_SEPARATE_AWS_AUTHORIZATION', domain: 'tournaments', account: core.account, region: core.region, environment: core.environment, stackName, assembly: receipt.assembly, revision: receipt.revision, coreSha256: receipt.coreSha256, total: receipt.total, rollbackEnabled: true, existingResourceChanges: 0, awsWrites: 0, requiredNextGate: ['Refresh AWS caller and core identity provenance', 'Prove target absent or owned independent root', 'Review a Tournament-only deployment role that cannot modify LegacyPlatform/production', 'Authorize bootstrap asset publication and CREATE change-set preparation', 'Inspect complete AWS-generated change set before separate execution approval'], executionEnabled: false};
write(path.join(buildDir, 'deployment-review.json'), review);
console.log(JSON.stringify({...review, file: relative(path.join(buildDir, 'deployment-review.json'))}, null, 2));

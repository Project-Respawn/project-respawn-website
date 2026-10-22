// Each suite runs in a real test-runner child; loader errors fail the command.
import './commerce/offline-guard.mjs'
import { spawnSync } from 'node:child_process'
const production=process.argv.includes('--production')
const common=['commerce/commerce.test.ts','commerce/completion.test.ts','fulfillment/security.test.ts','fulfillment/environmentBoundary.test.ts','fulfillment/atomic.test.ts','stage9/securityRelease.test.ts']
const sandbox=['merch/handlers.test.ts','fulfillment/orderPersistence.test.ts','revolut/webhook.test.ts','stage9/handlers.test.ts','stage9/orderReconciliation.test.ts','router/restRouter.twitch.test.ts']
const files=[...common,...(production?[]:sandbox)].map(file=>'amplify/myFunction/'+file)
if(!production)files.push('amplify/commerce/composition.test.ts')
const run=spawnSync(process.execPath,['--import',new URL('./commerce/test-prelude.mjs',import.meta.url).href,'--test','--test-concurrency=1',...files],{stdio:'inherit',windowsHide:true,env:{...process.env,COMMERCE_TEST_MODE:production?'production':'sandbox'}})
if(run.error)throw run.error
process.exitCode=run.status??1

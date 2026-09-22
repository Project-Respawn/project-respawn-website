# Audit evidence

Read-only regional snapshot on 2026-09-21, account `058264289478`, region `eu-north-1`. It covers 317 CloudFormation stacks across ten roots and both visible Amplify hosting applications. Source baseline is Git `development` at `3cf3928` plus existing uncommitted changes; the audit did not reset them. Stack inspection is a point-in-time observation, not a drift-detection run or proof that every declared conditional resource exists.

| File | Contents |
| --- | --- |
| [stack-inventory.csv](stack-inventory.csv) | One row per stack: root, parent, status, template and physical-entry counts, Lambda/AppSync/DynamoDB/Cognito/S3/IAM/custom/nested/output counts |
| [root-summary.json](root-summary.json) | Recursive family totals and largest individual templates |
| [live-inventory.json.gz](live-inventory.json.gz) | Full sanitized resource metadata: logical/physical IDs, types/status, removal policies, DependsOn, Ref/GetAtt/Sub/ImportValue references, nested parameter bindings, output names/references, IAM statements, tags and template hashes |
| [swg-template.yaml](swg-template.yaml) | Inspected legacy SWG template; supplements its manually reconciled YAML resource/reference metadata |
| [source-inventory.json](source-inventory.json) | TypeScript AST model/operation inventory; route import/path inventory and notable feature imports |
| [audit-synthesis.json](audit-synthesis.json) | Fresh master-managed local synthesis, template filenames/hashes and resource counts; 62 templates / 2,936 declarations |
| [production-entry-bundles.json](production-entry-bundles.json) | Entry manifest, dynamic chunks and byte measurements; Vite-reported gzip size and independently recompressed Node gzip size are labelled separately |
| [validation](validation/) | Captured local validation/test/build results; see the report ledger for limitations |

The rich inventory is compressed to avoid a 36 MB formatted JSON duplicate. Read it with Node, for example:

```js
const fs = require('node:fs');
const zlib = require('node:zlib');
const inventory = JSON.parse(zlib.gunzipSync(
  fs.readFileSync('docs/architecture/evidence/live-inventory.json.gz')
));
console.log(inventory.stacks.filter(stack => !stack.parentId));
```

Collection used AWS `sts get-caller-identity`, `cloudformation describe-stacks`, `get-template`, `list-stack-resources`, and Amplify `list-apps`/`list-branches`. It did not deploy, create change sets, invoke cleanup, inspect data rows or alter permissions. Raw output values, secret values and Lambda environment variables are deliberately absent from published metadata. Physical infrastructure identifiers are included so ownership is reviewable.

The SWG template was serialized as YAML rather than the JSON used by the Amplify stacks. Its 19 declarations/types were individually reconciled with physical resource entries. A local YAML dependency was unreadable, so the inspected simple resource blocks were extracted with a narrow audit helper; this is not a reusable general YAML parser. Its complete template preserves IAM details and full intrinsic expressions. No source/dependency fix was made for that audit-only parsing issue.

Counts include custom-resource declarations, not every underlying service resource a custom provider may create internally. A physical listing entry can be failed or conditional; use status alongside count. Template hashes describe retrieved templates, not a guarantee of no drift. References through custom resource code, plain-string endpoints, environment variables and external services are not completely recoverable from CloudFormation intrinsics, so the narrative also uses source review.

Audit helper scripts and full synthesis/build artifacts are under ignored `.amplify/`; they are local working evidence, not new deployment tooling. The inventory collector is read-only, but contains this audit's region assumptions and is not an approved future environment-selection mechanism. Refresh discovery and review scope before collecting another environment.

The isolated handler-alias candidate and its historical review are in `.codex-worktrees/shared-handler-alias-candidate/.candidate-analysis/`. Those artifacts may not be distributed with this repository checkout. The main report records their baseline and findings and explicitly requires a new comparison before use; they are not evidence of a live 167-resource deployment.

# Migration, recovery and validation plan

Status: **PROPOSED**. This audit does not authorize deployment, import, stack refactoring, backup mutation, resource deletion, user migration, DNS changes or production configuration changes. The sequence below is for a later reviewed implementation.

Update: the overall direction and Phase 1 safeguards/consolidation preparation have been approved. See [Phase 1 implementation and validation](phase1-implementation.md) for current results, commands and remaining gates. The original audit ledger below is historical; no deployment or later-phase implementation has been authorized or performed.

## Phase 0 — Baseline and recoverability

Record the exact source revision plus dirty changes, dependency lockfile, Node/CDK/Amplify versions, generated outputs provenance and physical resource mapping for the selected environment. Re-resolve the root ARN: current local is Ntgre, not the remaining legacy Ntgrestage8 root. Compare actual templates, not only source assumptions.

Before any approved stateful work, inspect backup/PITR/versioning/retention/deletion-protection settings, document RPO/RTO and rehearse restore in an explicitly authorized isolated target. Verify KMS decrypt grants and secrets recoverability. Cognito cannot be treated as a table export that preserves passwords and every identity/session attribute. Preserve the pool; do not use an untested user export/import as a rollback plan.

Inventory consumer endpoints, mobile/Companion clients, OAuth callbacks, webhooks, bucket object keys, signed URLs, workspace membership, group claims and external ECS resources. Assign module owners. Make a per-resource ledger: source stack/logical ID/physical ID, destination, supported migration method, policies, dependencies, validation and rollback. No stateful move proceeds without that ledger.

Exit: known environment, reproducible synthesis, restorable state, approved change scope. Stop if the actual physical IDs differ from the reviewed baseline.

## Phase 1 — Architecture and bounded consolidation

Approve logical owners, dependency contracts, naming, budgets and the future-feature rule. Add CI resource accounting before adding features. Keep data ownership and physical deployment separate in the transition.

Rebase the existing handler-alias candidate from its historical baseline onto current source in isolation. Preserve the two deliberate anchor identifiers, field authorization functions, schema operation signatures and Lambda code identity where intended. Reproduce clean Windows/Linux installs and synth both baseline/candidate. Review every deletion/update: the expected removal is redundant generated functions/data sources/roles/policies, never tables, pools, storage, keys or API identities. Historical numbers are a reference, not an acceptance oracle.

After separate approval, deploy only the reviewed in-place consolidation to a selected non-production environment, verify contracts/permissions, then review production rollout separately. Rollback must account for the extra generated resources that reverting aliases would reintroduce. Do not assume rollback to a larger template is always deployable. Treat the whole-tree create-size debt as still open after the candidate.

Exit: demonstrated authorization equivalence, no stateful replacement, measured resource reduction, and a tested rollback/roll-forward decision.

## Phase 2 — Frontend boundaries

Use route dynamic imports, eliminate eager domain service initialization and establish a configure-before-client bootstrap. Preserve URLs, route metadata, guard outcomes and browser-source behavior. Measure bundles and network traces. Keep folder relocation and unrelated UI work separate so failures are attributable.

Exit: production build, browser route/auth checks and bundle targets pass. Rollback is a frontend artifact rollback; handle previously cached HTML/chunks. No backend replacement belongs in this phase.

## Phase 3 — New infrastructure follows independent ownership

Pilot a new Tournament service, because existing tournament data is explicitly fixture-only. Start with a small useful slice; it may need one root, not separate Draft/Broadcast roots immediately. Share the platform identity contract, consume Team Hub through its public contract and own registration/match data. Keep fixture/live adapters explicit.

Build a selected-root synthesis/deployment pipeline with environment-specific config, scoped deployment role, budget gate and contract outputs. Frontend-only paths should not invoke unrelated backend deployment. Shared-library/Core changes require dependency-aware tests; path filters alone are insufficient. Existing Amplify hosting/backend coupling must be changed deliberately, including how hosted builds acquire verified outputs.

Exit: a Tournament-only change can synthesize/deploy its root without rebuilding unrelated domain infrastructure; auth and Team Hub remain compatible. Disable the feature adapter to roll back frontend adoption while retaining new data.

## Phase 4 — Extract selected execution paths before state

Define façades for Forums, Team Hub, Creators, Commerce and Operations in the existing code. Extract one small stateless operation into a domain-specific Lambda/API with exact IAM and the current table as its storage dependency. Prefer a contained low-risk read path over checkout or identity administration. Preserve compatibility for old clients and idempotency for writes. Avoid permanent direct cross-domain table writes.

Do not cut over all routes together. Check logs, error rates, latency, authorization and output provenance for each slice. Keep one authoritative writer throughout cutover. Runtime/overlay extraction needs special dependency review: the data stack must not acquire a new edge back to overlay.

Exit: domain execution/permission ownership is proven. The old table still contributes to legacy counts; do not claim complete deployment isolation yet. Roll back routing/adapter selection, not by deleting either state store.

## Phase 5 — Stateful ownership, only where supported

For native resources, evaluate CloudFormation stack refactoring or retain/import against the exact supported resource type and current stack graph. Refactoring only supports eligible mutable types and cannot simultaneously change resource configuration; AWS explicitly lists custom resources among limitations. Verify eligibility with AWS tooling before planning a move. No refactor or import was executed here. [AWS stack refactoring](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stack-refactoring.html)

For retain/import, the plan must prevent the source stack from deleting the physical resource, prevent two stacks claiming it, preserve all properties/dependencies, then prove the destination owns the same physical ID. Retain is not a backup. Treat source detachment and destination adoption as separate controlled actions with recovery instructions if adoption fails. [AWS retain/import guidance](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/refactor-stacks.html)

Generated `Custom::AmplifyDynamoDBTable` resources require provider-specific investigation. A native-table import is not a drop-in replacement for the custom provider plus generated schema/resolvers. A supported existing-table/custom-operation interface can be an intermediate API boundary while ownership stays put. If no verified transfer exists, leave the table in the legacy root and document the remaining count/lifecycle debt. Do not automatically copy/migrate production data to make a diagram clean.

Cognito, S3 uploads, KMS keys and AppSync API identity remain in place by default. Production Cognito ownership transfer is unnecessary for one-account cross-product login. The earlier cross-branch shared-login proposal requires its own client/trust/role isolation tests; do not bundle it with schema migration.

Exit: approved move method, restore rehearsal, exact physical-ID preservation, one writer, authorization parity and known recovery owner. Abort on any unplanned replacement/deletion or unexpected data discrepancy.

## Phase 6 — Retire compatibility paths and prove growth behavior

Remove old handlers/contracts only after consumer inventory, telemetry and an approved compatibility/retention window show they are unused. Remove obsolete generated resources only with a reviewed deletion list. No cosmetic physical renaming. Retained resources need an explicit continuing owner and cost/security monitoring.

Rehearse a fresh deployment of the intended topology in an explicitly authorized environment. Every independent root must be within its creation budget; the existing legacy root needs its own documented strategy until below limits. Record before/after synthesis, deployment duration, resource counts, and recovery exercise results. Do not infer fresh-create success from a successful small update.

## Validation

### Commands available in this repository

Run commands from the repository root. On this Windows workstation use `npm.cmd`/`npx.cmd` if PowerShell execution policy blocks the `.ps1` shims. These are verification examples, not permission to run deployment scripts.

```text
npm ci
npx tsc --noEmit -p amplify/tsconfig.json
npm run validate:amplify-contract
npm run test:amplify-guards
npm run test:team-hub-backend
node --test "src/features/Team Hub/teamHubFrontend.test.mjs" src/features/tournaments/tournament.test.mjs
npm run test:overlays
npm run test:connected-demo
npm run test:master-backend-preview
npm run synth:master-backend
npm run test:runtime-ownership
npm run validate:amplify-stack-size -- .amplify/master-preview/cdk.out
npm run validate:local-outputs
npm run build
```

`npm ci` belongs in an isolated clean checkout with the exact proposed lockfile before release; it resets node_modules. This audit did not reset the working local installation, which had just required an unreadable OneDrive dependency repair. The historical candidate lockfile differs substantially; do not port it without provenance and clean-install testing. A Windows build does not prove Linux case-sensitive imports.

`synth:master-backend` is synthesis-only but deletes/recreates its chosen local output directory. Verify that resolved directory is within the intended `.amplify` workspace before running it. It targets master configuration and is not a local-sandbox validator. The alternative audit command `node scripts/preview-shared-auth.mjs master managed` emits a unique isolated directory without replacing amplify_outputs.json. Neither command is an AWS deployment. Resolve environment/account/region rather than blindly reuse a historical helper for a different target.

`test:runtime-ownership` currently hard-codes `.amplify/master-preview/cdk.out`; synthesize its fixture first or update its future fixture contract deliberately. The current size guard checks only individual templates; add recursive/operation accounting described in [budgets](cloudformation-boundaries.md). Do not interpret a 475/480 pass as hierarchy safety.

`validate:local-outputs` makes AWS read-only calls for the protected local sandbox. Hosted environments need an equivalent branch-aware provenance validator; do not run the local validator against production outputs. Verify issuer, app client, identity role mapping, API/schema operations, bucket and custom endpoints as a consistent environment. Preserve the URL mismatch validator.

When affecting standalone infrastructure, also run its existing synthesis/test commands: `npm run iac:twitch:staging:synth`, `npm run iac:twitch:production:test`, `npm run iac:twitch:production:synth`, or `npm run iac:overlay-source:synth` as applicable. Review the synth app's environment/context first. The overlay standalone harness has review defaults, not live outputs. Deployment/diff scripts may contact AWS or create change sets and are not part of this audit's authorization.

There is no generic `npm test` script in this package. Enumerate applicable existing Node/tsx test files rather than claiming that a nonexistent umbrella command passed. Broaden to the complete repository test set in clean CI before a migration release; keep known baseline failures visible.

### Audit execution ledger

| Check | Result and limitation |
| --- | --- |
| Read-only AWS inventory | 317 stacks across 10 roots; all inspected. SWG YAML separately inspected and resource/type count reconciled; no customer data queries |
| Current source model/route scan | 52 models; 79 operations; 91 static route component imports, 21 dynamic imports |
| TypeScript `tsc --noEmit -p amplify/tsconfig.json` | Passed; no diagnostics |
| Amplify/frontend contract validator | Passed: 24 queries, 55 mutations, 0 subscriptions; 62 frontend operations, none missing |
| Amplify guard tests | 16/16 passed |
| Team Hub backend tests | 47/47 passed |
| Team Hub frontend + Tournament tests | 24/24 passed |
| Master managed synthesis | Passed, unique audit directory; 62 templates, 2,936 resources, maximum 475; no deploy |
| Existing stack-size guard on that assembly | Passed 475/480; explicitly insufficient for recursive creation safety |
| Runtime ownership original command | 2/3 passed; root fixture absent at its hard-coded location |
| Same runtime assertions against fresh audit assembly | 3/3 passed using a temporary test copy with only fixture directory changed; repository test left unchanged |
| Default production build | Failed correctly on local VITE_API_BASE_URL/output mismatch |
| Production build with process-only audit config | Passed, 10.70s; main 2,322.65 kB / gzip 603.51 kB; sandbox payment placeholder, no payment assertion |
| npm ci / clean Linux install for current dirty revision | Not run in this working installation; required future isolated CI gate |
| Full repository suite | Not run for this audit; historical candidate reported 610/617 passing, seven failures in both baseline/candidate; not a current result |
| Signed-in users, actual payments, webhook/provider round trips | Not exercised; require approved non-production integration checks |
| Backup restore / import / fresh AWS creation / deployment timing | Not performed; no AWS mutation authorized |

Evidence includes [synthesis counts and hashes](evidence/audit-synthesis.json) and captured test/build logs. Synthesis emitted authorization warnings about root fields; those require field-level authorization review during consolidation. A successful synthesis is not proof of permission correctness.

### Per-phase acceptance and rollback gates

All phases require relevant unit/contract tests, fresh synth resource/identity diff, environment output checks and critical route regression checks. Frontend phases additionally require production build, browser traces and direct-link tests. Infrastructure phases require reviewed nested change sets, IAM diff and explicit absence of unplanned replacement. Stateful phases additionally require tested recovery, physical-ID mapping, data/index/TTL checks, encryption checks and reconciliation.

Authentication acceptance: same user/sub across intended products; correct app-client audience and issuer; invalid/expired token rejection; sign-out; MFA/reset flows where enabled; member/admin/coach/workspace revocation; no cross-branch table/bucket access despite shared accounts. Test APIs directly as well as UI guards. Do not use a production admin credential to prove ordinary user isolation.

Critical paths: public home, forum reads/moderation, Team Hub roster/champion pool, tournament fixture/live transition, creator workspace/integration reconnect, overlay browser source, SWG builder, event submission, merch/checkout and idempotent webhook processing, application submission/review/bookings, investor expiry and Admin permission changes. Test sign-out, denied permissions and unavailable dependent services.

Set rollback triggers before rollout: new unauthorized access, unexpected stateful replacement, data mismatch, contract incompatibility, sustained error/latency regression or duplicate external side effects. Restore routing/previous compatible code while preserving authoritative data; if state ownership is partially moved, follow its specific import/refactor recovery plan rather than redeploying an old template blindly.

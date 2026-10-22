# Team Hub production overnight readiness — 22 October 2026

## Decision and scope

**NO-GO for public release or business cutover.** Production Team Hub is absent. The existing dark-infrastructure candidate remains proposed, with fresh operator, installed-IAM, change-set and live acceptance gates required.

This preparation-only task supersedes the interrupted deployment task. It performed **zero AWS writes, artifact publications, change sets, invocations, customer-record reads, secret-value reads, authority changes or Master pushes**. Core and R1/R2 remain accepted; completed investigations were reused.

The isolated review branch is review/team-hub-production-readiness-20261022, based on development fcfc93c9948127be043bc8b773a9fee1dc7556ab. Existing production preparation was recovered from its existing worktree. Neither the primary worktree nor the Commerce worktree was edited. SWG Buff Builder edits were not staged.

## Fresh metadata and evidence limits

See [metadata](team-hub-overnight-evidence-2026-10-22/metadata.json) and [baseline review](team-hub-overnight-evidence-2026-10-22/baseline-review.json).

| Boundary | Observed state |
| --- | --- |
| Account / region | 058264289478 / eu-north-1 |
| Production Legacy root | amplify-d2cux232bpa951-master-branch-53ef67772a, UPDATE_COMPLETE |
| Production recursive inventory | **2,936 resources; FunctionDirectiveStack 475** |
| Production Core | 6 security +7 product, both UPDATE_COMPLETE |
| Production Team Hub | Both roots absent |
| Ntgre Team product / Core / Tournament | 48 / 8+5 / 11 existing resources |
| Source recovery | Four exact tables ACTIVE; PITR/deletion protection enabled; four R1 backups AVAILABLE |
| Production Cognito | Existing pool eu-north-1_Uufjxul58 and client 2kc81ph5mgvo9eu2qjvmif5u8g |
| Retained Core log | /project-respawn/Production/core/contracts, preserved |

The familiar Legacy 2,621 / FunctionDirectiveStack 167 inventory belongs to Ntgre, not production. It must not be substituted for the production baseline.

The required codex-master-oauth profile resolved to the account root identity, not RavenTest. It was used solely for metadata and simulation APIs. It is not evidence of approved RavenTest execution custody or complete Organizations visibility. Future execution must verify its reviewed deployment identity and effective permissions.

Initial inspection used a guessed Core execution-role name and an ARN where AppSync required an ID. Partial receipts preserve these tooling failures; installed stack resources subsequently supplied the correct identities. They were not deployment failures.

Historical R1/R2 and accepted Core receipts establish 121 records and relationships. This task deliberately did not scan them. DescribeTable counts are approximate metadata, not fresh content/digest acceptance. Refresh consistent source verification only in a separately authorized scope. Existing drift metadata was read; no new drift detection or fresh IN_SYNC is claimed.

## KMS and security

The 20 October CreateGrant failure occurred in **Core** creation; Team deployment had not started. Core later passed actual Lambda creation, initialization, authentication and monitoring. The uninstalled Team candidate incorporates that accepted lifecycle correction.

Execution CreateGrant is restricted to the AWS-managed Lambda key 13ae83f9-bc5f-4486-a013-e07b9d7d52e7 in this account/region, mandatory Lambda ViaService, caller account and GrantIsForAWSResource=true. Explicit controls retain wrong/missing condition, wrong-key and KMS administration denials. DescribeKey is distinguished from operations requiring encryption context.

Runtime Decrypt preserves exact key/account/function context and the accepted absent-ViaService handling; a present wrong service is denied. Read alone retrieves its exact generated cursor secret. Secrets Manager-key 8802a37a-f981-4384-b538-fdb4f7aba74a retains mandatory service/account/SecretARN restrictions. Command has no secret access. Business keys, unknown keys, unrelated domains and Cognito administration stay denied.

The fresh [security certification](team-hub-overnight-evidence-2026-10-22/security-validation.json) passed **342 policy cases, 195 effective/injected-deny controls, 77 equivalence cases and four actual wrong-principal checks**. Access Analyzer found zero blocking findings. ExecutionBoundary resolves to 6,110/6,144 characters: recheck its narrow quota margin after actual output substitution. Installed Core roles, inline policies, trust and boundaries were read through dynamically resolved resource identities.

Simulation does not prove SCP completeness, real service/grantee context, Lambda creation or secret decryption. Installed-role and service-reaching acceptance remain mandatory. No permanent IAM changed.

## Functional coverage and frontend

The exact production runtime rerun passed **233 tests** covering transactional authority/epochs, membership/revision, idempotency/concurrency, nine mutations, four reads, cursor load/signing/tamper/expiry/context, Core integration, privacy and fail-closed dependencies. Legacy Team Hub passed **47 tests**. Additional production binding, migration, Core EMF and runtime-KMS checks passed **51 tests**. Team and Core TypeScript passed; the migration ledger reconciles.

The complete website compiled successfully into ignored scratch using the existing installed toolchain read-only. Existing stylesheet-reference and chunk-size notices remain. Compilation used an offline.invalid API value: it is neither publication nor production-endpoint acceptance.

The dormant production client requires accepted production Team/Core manifests, a reviewed activation epoch and fresh authenticated authority. It rejects Ntgre bindings, stale/missing authority and endpoint failure. TARGET_WRITER status cannot bypass server authorization or transactional enforcement. No live route or activation flag changed.

Synthetic persona/route coverage is distinguished from real browser acceptance. No new production sign-ins were requested while the operator was asleep. Five distinct production personas, real endpoint selection and business/browser acceptance remain cutover gates.

Membership, roster, champion pool and Coach Review/assessment retain the accepted contracts. Branding and Coach-private creation remain disabled. Independent VOD upload/feedback, AI generation/approval and development tracking are not implemented by the accepted nine-mutation/four-read contract. If needed for launch, they require explicit contracts and review; no optional infrastructure was added.

The initial broad regression exposed missing historical generated fixtures and a stale skeleton source hash after the prepared read-only production selector addition. These failures remain in [offline checks](team-hub-overnight-evidence-2026-10-22/offline-checks.json); tests were not disabled. Follow-up results are recorded separately. A historical skeleton receipt is not the production candidate.

## Immutable candidate and resource comparison

| Artifact | SHA-256 |
| --- | --- |
| Team manifest | 2827cdbb908c3ef51096b54320a22e68bb898f3d3461ae3e95575eb4d787306d |
| Security | 44262d06047926ada1d1ce88edc9ad55180ab8b2e080079218fc97090ee19bdc |
| Product | 995b40be6cd460999cbde2510b33c5e93a407251f48b1ba1905f75a2c8c0ef24 |
| Read/Command ZIP | 3b9da09caa3e8684aabd5c0421539326eb68d1ed5aa5696dcf76425659ea0287 |
| Execution package | 71fde2f53199ede68ca39d100d34159d42eae18405aa375947e724b946832e18 |

All 55 reviewed bindings passed byte verification. CloudFormation validated both JSON-equivalent whitespace-compacted bodies; immutable publication bytes were not changed.

Future expected delta: **8 security +39 product additions**, zero existing-resource modifications/deletions/replacements or nested stacks. Security owns the base API, retained secret and boundaries/deployment roles. Product owns protected Operational/Journal tables, Read/Command roles/functions, JWT routes, logs and alarms. API/secret identities use exact exports, not guessed suffixes.

No Legacy template, shared Commerce Lambda, Cognito/AppSync resource, API-key expiry, protected Ntgre configuration or unrelated 308-resource consolidation is selected. These are local expectations; AWS-generated change sets still require inspection. Successful synthesis cannot establish deployment compatibility.

## Ordered release and recovery

1. Complete any outstanding local checks in the final follow-up receipt. Review this branch without merging Master.
2. Confirm the exact dark-deployment scope, real RavenTest custody, window and no-concurrent-change condition. Refresh protections, backups, Cognito/Core/Master and separately authorized source verification.
3. Publish only three exact immutable objects with checksums/conditional creation. Inspect security: exactly eight additions, no unexpected changes. Deploy with rollback.
4. Verify installed trust, boundaries, artifact/KMS/PassRole isolation and sizes. Inspect product: exactly 39 additions. Deploy with rollback.
5. Verify actual code/environment, API/JWT, generated references, Core integration and monitoring. Stop on discrepancies; no automatic broadening, retry or substitution.
6. Separately authorize conditional production LEGACY_WRITER initialization. Missing authority must fail closed. Then verify authority endpoint and all dark denials.
7. Complete separately reviewed isolated cursor/KMS/transaction proofs and production source export/delta/fence preparation for nonempty data.
8. Authorize attended production maintenance: monotonic FROZEN, original-principal fence proof/drain/quarantine, import/reconciliation, TARGET_WRITER, five real personas/all contracts and monitoring.
9. Bind frontend to actual accepted production manifests/epoch. Review Master divergence/pipeline and reversible release bytes; obtain explicit publication approval. Never point Master at Ntgre.

Creation failures can retain tables/secret/logs: inventory and stop for reviewed recovery; no blind deletion/recreation or reversion to known-blocked IAM. After target writes, frontend rollback cannot restore Legacy authority. Freeze/drain/reconcile and use the accepted state-aware reverse migration with monotonic epochs. Legacy retirement is a later authorization.

## GitHub and isolation

Remote development was fcfc93c9948127be043bc8b773a9fee1dc7556ab; Master was a83a874dad50395518fb0d7e2f1e853cf6bf2513. Neither release branch was changed. No workflow files were found on the inspected refs. Amplify automatic branch creation is disabled and the new review branch has no Amplify mapping. Master retains branch-level auto-build, so Master pushes remain forbidden.

The checkpoint includes accepted Core emission and explicit offline production selector changes as migration dependencies. It contains no new Legacy/shared Commerce/SWG source changes. Tests cover the development checkpoint, not the other session's uncommitted Commerce work. A draft PR targets development only.

Private recovery evidence, credentials, sessions, caches, node_modules, CDK assemblies and frontend build output are excluded. Exact reviewed ZIPs and sanitized evidence are intentional checkpoint inputs. See final follow-up/checkpoint receipts for commit, push verification, PR and remaining blockers. Production Team Hub is not yet operational; next AWS stage is separately authorized dark deployment.

## Final follow-up results

[Machine-readable final summary](team-hub-overnight-evidence-2026-10-22/final-summary.json) distinguishes overlapping suites; their totals must not be added as unique tests.

| Check | Result |
| --- | --- |
| Exact production runtime | 233/233 |
| Legacy Team Hub | 47/47 |
| Additional production/Core/binding | 51/51 |
| Shared authentication, merchandise and Twitch mocks | 30/30; external sockets blocked |
| Targeted frontend/isolation | 294/295; remaining case requires full Legacy synthesis |
| Historical fixture/authority regression | 52/52 |
| Accounting/document-link unit tests | 43/43 |
| Unmodified website baseline | 306/307; existing Creator lazy-route parser mismatch |
| Website with isolated proposed test-helper patch | 307/307 |
| Team/Core TypeScript; website build; ledger | Passed |
| Exact pinned runtime reproduction | Byte-identical ZIP; original artifacts unchanged |
| CDK synthesis | Pinned independent 8+39 roots preserved, except unordered tag ordering |
| Local Ntgre outputs / AppSync contract | Verified; 62 frontend operations, zero missing |

The full Legacy synthesis attempt failed safely on Amplify PathNotUnderRoot: its parent-installed branch-linker dependency is outside this isolated projectRoot. No network call or deployment was permitted. Do not relax that guard or use a partial assembly as proof. A full dependency installation within a dedicated release worktree is required before Master compatibility acceptance.

The Creator route/parser failure is unchanged from development. Its isolated [shared test-helper patch](team-hub-overnight-evidence-2026-10-22/shared-route-test-compatibility.patch) handles lazy component declarations without changing routes or weakening assertions; all 307 source tests passed when that proposed helper was selected. The shared helper itself was not modified. Review/apply it during shared integration.

Navigation/status/runbook files are sealed by existing review bindings. Rather than overwrite those pins, [shared follow-up instructions](team-hub-overnight-evidence-2026-10-22/shared-update-instructions.md) and a navigation patch are provided. The existing production CI selector still summarizes historical preparation hashes: current deployment review must use the exact latest manifest and review-bindings. Rebind CI/navigation only under a new source-review receipt, preserving the old version.

Automatic approval review rejected an earlier reproduction command because a historical helper could overwrite accepted evidence. A self-contained replacement restricted writes to scratch and this new evidence directory; it passed and reproduced the accepted ZIP. No blocked command was used to mutate historical artifacts.

**Final recommendation: NO-GO for Master/publication or authority transfer.** The independent dark candidate is security-reviewed and preserved for a fresh controlled deployment decision. Required next gates are actual execution custody/window, inspected 8/39-addition change sets, installed-role and Lambda/KMS checks, then separately authorized authority bootstrap, nonempty-data migration, real persona acceptance and frontend publication.

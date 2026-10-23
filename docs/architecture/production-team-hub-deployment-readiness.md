# Production Team Hub dark deployment readiness - 21 October 2026

**PRODUCTION TEAM HUB READY FOR DARK DEPLOYMENT AUTHORIZATION**

Preparation and read-only AWS inspection only. No artifact publication, change set, Team deployment, authority initialization, source-data migration, FROZEN transition, Master publication or Legacy retirement occurred. This report supersedes historical combined Core/Team draft deployment instructions for the next Team-only stage. It does not reopen accepted Core or R1/R2 work.

## Current accepted baseline

[Fresh Core/security/collision/key/concurrency inspection](production-team-hub-deployment-evidence-2026-10-21/fresh-preflight.json) confirms RavenTest, account 058264289478, eu-north-1; both Core stacks UPDATE_COMPLETE with six security and seven product resources. Exact installed templates, policies, boundaries, trusts, runtime hash, complete environment and logging configuration match the [accepted Core release](production-core-emf-acceptance.md). The 13 actual authenticated contracts, valid signed Ntgre rejection and actual root-level EMF/alarm receipts remain accepted and were not replayed. Four current Core alarms are OK; that status supplements the accepted datapoint evidence rather than replacing it.

[Current source preservation](production-team-hub-deployment-evidence-2026-10-21/preservation-baseline.json) verifies Team 1, TeamMembership 8, TeamRosterSlot 11 and PlayerChampionPoolEntry 101, complete canonical digests/relationships, four exact AVAILABLE R1 backups, ACTIVE source tables, PITR/deletion protection and absence of the R2 recovery tables. Production Cognito pool eu-north-1_Uufjxul58, client 2kc81ph5mgvo9eu2qjvmif5u8g and original 15 users are preserved. Master and protected/Ntgre stack baselines remain unchanged. All 18 Team name/stack collisions are absent. Accepted [R1](team-hub-production-r1-result.md) and [R2](team-hub-production-r2-result.md) evidence and actual Core acceptance bindings were hash-verified, not recreated.

## Immutable candidates and boundaries

| Artifact | SHA-256 |
|---|---|
| Review manifest | 2827cdbb908c3ef51096b54320a22e68bb898f3d3461ae3e95575eb4d787306d |
| Execution package | 71fde2f53199ede68ca39d100d34159d42eae18405aa375947e724b946832e18 |
| Team security | 44262d06047926ada1d1ce88edc9ad55180ab8b2e080079218fc97090ee19bdc |
| Team product | 995b40be6cd460999cbde2510b33c5e93a407251f48b1ba1905f75a2c8c0ef24 |
| Read ZIP | 3b9da09caa3e8684aabd5c0421539326eb68d1ed5aa5696dcf76425659ea0287 |
| Command ZIP | 3b9da09caa3e8684aabd5c0421539326eb68d1ed5aa5696dcf76425659ea0287 |

[Manifest](production-team-hub-deployment-evidence-2026-10-21/manifest.json) and [exact proposed execution requests](production-team-hub-deployment-evidence-2026-10-21/execution-package.json). Read/Command use the same preserved bundle/object. Only three unique new objects are proposed: security template, product template and that ZIP. No runtime code or contract change and no fresh deployment synthesis occurred. [In-memory build reproduction and extracted-ZIP SDK test](production-team-hub-deployment-evidence-2026-10-21/runtime-reproduction.json) prove exact bytes and the corrected bounded, lazy cursor loader. Test-only fixture/dependency-path adaptations are recorded separately and do not enter the runtime ZIP.

| Independent root | Expected additions | Modify/delete/replace |
|---|---:|---|
| ProjectRespawn-TeamHub-Production-Security | 8 | 0 / 0 / 0 |
| ProjectRespawn-TeamHub-Production | 39 | 0 / 0 / 0 |

Total 47 new resources and zero Legacy/Core/Ntgre changes. These are reviewed template expectations, not AWS-generated change-set receipts. No nested stacks, new Cognito resources or record-seeding custom resources. Security owns the base API, retained cursor secret, execution/caller and runtime boundaries; product owns two retained protected tables, two runtime roles/Lambdas/log groups/integrations, JWT authorizer, default stage, five Lambda permissions, five alarms and seventeen routes. Both roots remain independently bounded sibling stacks, with explicit same-domain security exports.

Core binding is the accepted synchronous IAM Lambda contract arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Core-Production-Contracts; no invented HTTP Core endpoint or Ntgre identity. Both complete Lambda environment maps preserve AUTHORITY_GATED_V1, production Core environment and PRE_CUTOVER/LEGACY_WRITER flags. Runtime transaction checks use the actual Journal row, not a frontend value or these descriptive flags. No production epoch 5 is embedded. API ID and secret ARN are exactly Ref/ImportValue bound at creation; generated values are unknown until deployment and must be inspected. Synthetic API ID/secret suffix appear only in IAM certification inputs.

## Proposed IAM corrections

The uninstalled Team execution proposal already includes the previously reviewed exact AWS-managed Lambda-key CreateGrant correction. It permits only the Lambda service/account path with GrantIsForAWSResource true; wrong service/account/false/missing flag are explicitly denied. No speculative grantee/context condition is invented. Existing exact-function Encrypt/Decrypt/DescribeKey lifecycle permissions and two unqualified/$LATEST Lambda resource forms remain. No wildcard Lambda administration, Cognito administration, log-policy delivery administration, foreign-domain or business customer-managed-key permissions are introduced.

The not-yet-installed Team runtime identity policies and corresponding boundaries still contained the old Core runtime ViaService blocker. This candidate reuses the accepted correction: absent ViaService is accepted only for Decrypt on exact Lambda key 13ae83f9-bc5f-4486-a013-e07b9d7d52e7, with mandatory caller account and exact function encryption context; a wrong present service is denied. Read's Secrets Manager key 8802a37a-f981-4384-b538-fdb4f7aba74a retains mandatory Secrets Manager service/account/exact SecretARN. Command has no secret access. Unknown/customer-managed keys, KMS administration and foreign domains stay denied. Core IAM is unchanged.

Four deployment-policy documents add only the new exact product object/TemplateURL while retaining original product/runtime references. The aggregate execution boundary initially exceeded quota. Its equivalent compact representation shares identical DescribeKey/CreateGrant service/account conditions and adds an explicit CreateGrant false/missing-flag Deny. It preserves the full intended allowed request set, proven with 77 comparison cases; no broader resource or artifact prefix was used. Historical blocked artifacts remain recorded in [superseded candidates](production-team-hub-deployment-evidence-2026-10-21/superseded-candidates.json).

| Resolved policy | Characters | Limit |
|---|---:|---:|
| product.ParityCommandRole | 5060 | 10240 |
| product.ParityReadRole | 5685 | 10240 |
| security.ExecutionBoundary | 6110 | 6144 |
| security.ExecutionRole | 9322 | 10240 |
| security.PreparationCaller | 2129 | 6144 |
| security.DeploymentCaller | 2129 | 10240 |
| security.ParityCommandBoundary | 5060 | 6144 |
| security.ParityReadBoundary | 5685 | 6144 |

Execution boundary headroom is 34 characters under modeled generated values; actual installed rendered policy sizes must be rechecked before product execution. AWS excludes whitespace and sets managed policies to 6,144 and role inline aggregate to 10,240 characters: [IAM quotas](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_iam-quotas.html). Supported service/grant keys: [AWS KMS conditions](https://docs.aws.amazon.com/kms/latest/developerguide/conditions-kms.html). Region-wide logs:DescribeLogGroups read visibility is inherited and unchanged; no new DescribeIndexPolicies or optional code-signing/scaling permission is added without a demonstrated provider need.

## Validation and evidence limits

[Security certificate](production-team-hub-deployment-evidence-2026-10-21/security-validation.json): 342 policy cases, 195 identity/boundary and injected-Allow denial controls, 77 unoptimized-boundary equivalence cases and 4 actual installed wrong-principal checks. [Publication certificate](production-team-hub-deployment-evidence-2026-10-21/publication-security.json): 15 exact-object/operator/encryption/negative controls. Access Analyzer covered nine policy documents with zero blocking ERROR/SECURITY_WARNING findings. Trust and PassRole, wrong resource/template/principal, runtime Read/Command separation, authority partition/transaction-only writes, production Cognito isolation, KMS lifecycle and other domains remain controlled.

[Offline checks](production-team-hub-deployment-evidence-2026-10-21/offline-checks.json): 233 tests passed, Team/Core TypeScript passed, resource accounting and migration ledger reconciled. Coverage includes nine core mutations/four original reads plus team-list/directory paths, role/privacy/revocation, concurrency, idempotency/audit atomicity, transactional freeze and stale/missing epochs, cursor pagination/tamper/context/expiry, missing secret/timeouts/KMS/Core failures and fail-closed Legacy/FROZEN behavior. Exact compiled Read ZIP passed the real SDK transport/timeout/sanitization test against a local stub, not AWS. [CloudFormation validation](production-team-hub-deployment-evidence-2026-10-21/template-validation.json) passed both templates without publication or change sets. Account has ten unreserved concurrent executions; neither new Lambda reserves concurrency. Tests must remain sequential and stop on actual exhaustion/throttling.

One initial simulator harness request incorrectly typed an encryption-context string as stringList; its failed receipt is retained and the corrected scalar request passed without a policy change. Initial local harness fixture/dependency/compiler-path issues were corrected without changing runtime ZIPs. Simulations do not prove AWS service context, actual Lambda/Secrets Manager initialization, Organizations policies, future generated identities or installed-role enforcement. Those remain execution gates. No new Core invocation or production service failure was injected.

## Separately authorized execution order

1. Confirm actual operator availability/no concurrent administrative deployment, current identity/account/region, all immutable and rollback references, source/backup/Cognito/Master/Core/Ntgre preservation and every reserved-name collision. Stop on drift. Do not substitute HEAD or regenerated assets.
2. After exact dark-infrastructure authorization, publish only the three exact objects with AES256, checksum, non-overwrite and downloaded-byte verification. Existing broader operator rights are not a new domain-caller grant.
3. Inspect security CREATE change set: exactly the eight listed additions, no modify/delete/replacement/conditional/dynamic/nested effect. Execute with CREATE OnStackFailure=ROLLBACK. AWS forbids specifying ExecuteChangeSet DisableRollback when OnStackFailure was supplied: [CreateChangeSet](https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_CreateChangeSet.html). Do not invent a conflicting rollback flag.
4. Verify actual API/secret exports, installed trust/policies/boundaries/attachments and exact rendered sizes. Run the complete policy matrix against installed execution/caller roles and retain effective key-policy limitations. Stop if installed output substitution is not byte/structure-equivalent.
5. Inspect product CREATE: exactly 39 listed additions, no modifications/deletions/replacements. Execute only through the bounded caller/execution role. Verify complete configuration, exact ZIP hashes, roles/boundaries, integrations, production JWT authorizer and all state protections. Run installed runtime Read/Command positive/negative checks before live acceptance.
6. Verify exact production Core binding and read-only identity integration. Before the authority row exists, authenticated normal/status routes must fail closed, generally HTTP 503; unauthenticated/wrong-environment identities are rejected. A controlled missing-authority 503 can legitimately produce a monitoring datapoint/alarm and is not an unexpected business success. No business rows or authority record may be seeded by deployment.
7. Stop for the separate C1 package and explicit authorization. It must conditionally create only CONTROL#AUTHORITY / STATE, team-hub-authority.v1, LEGACY_WRITER epoch/version 1/1 with exact reviewed audit metadata and non-overwrite condition, fixed security-owned custody/window and cleanup. Deployment/runtime callers cannot perform initialization. No C1 write is authorized by this readiness package.
8. After separately accepted C1, authority endpoint must return authenticated HTTP 200 at actual LEGACY_WRITER 1/1. All sixteen business routes must return approved HTTP 403 under Admin and ordinary sessions; both business stores remain empty except the control row. Verify API/Lambda/DynamoDB/Core dependency, authority/epoch/counter signals, actual datapoint/alarm correlation and bounded ingestion after known pre-C1 probes settle.
9. Production cursor decryption requires a separately inspected isolated proof: normal LEGACY_WRITER routes deny before lazy secret access. Do not activate TARGET_WRITER or broaden IAM merely to reach the branch. Ntgre cursor success and local SDK tests do not equal production decryption proof. No temporary probe infrastructure is included in these 47 resources or this proposed authorization.

## Business acceptance and later migration gates

Five distinct real production personas (global Admin, Manager, Coach, Player, ordinary/nonmember) must be available for separately authorized business acceptance. The previous ordinary test account was deliberately deleted; do not claim its session persists or recreate it without scoped permission. No user creation/reset is included here. Team roles come from current Team membership; global authorization/directory comes from accepted live Core.

Live business success, nine mutations/four reads, Team creation/membership/revocation, Coach Review/Champion Pool, privacy, cursor/idempotency/audit and epoch races require reviewed isolated reversible fixtures or the later actual maintenance stage. They must not be forced by changing production authority during dark deployment. Branding and Coach-private creation remain disabled. Production's nonempty export/transform/delta reconciliation, original-principal writer fences, S3 audit/quarantine, source FROZEN, monotonic target transfer, state-aware recovery, frontend/pipeline publication and Legacy retirement all remain distinct gates. No Ntgre TARGET_WRITER 5/5 assumption transfers to production.

## Rollback and requested authorization

There is no prior installed production Team release. CREATE rollback must preserve retained cursor secret/tables and original source backups/data, with exact partial-resource ownership receipts; no blind retry/delete/recreate. Historical product/runtime object grants remain for audit/review, but the old runtime policies are known blocked and must never be restored automatically or advertised as a healthy rollback release. After any future target write, frontend rollback alone cannot reopen Legacy; containment/export/reverse transformation/reconciliation and a new monotonic transition are required.

Proposed approval: authorize manifest 2827cdbb908c3ef51096b54320a22e68bb898f3d3461ae3e95575eb4d787306d and execution package 71fde2f53199ede68ca39d100d34159d42eae18405aa375947e724b946832e18 for account 058264289478/eu-north-1/RavenTest: publish exactly three pinned objects, inspect and conditionally execute security CREATE (8 additions) then product CREATE (39 additions) with rollback, installed-role/configuration checks and read-only fail-closed dark acceptance only. Stop on any mandatory security/preservation gate, unexpected/ambiguous write or collision. This scope excludes C1 initialization, cursor-proof infrastructure, Cognito mutations, source fences, migration, FROZEN/TARGET authority, public frontend/Master and retirement. No approval is inferred or recorded by generating this request.

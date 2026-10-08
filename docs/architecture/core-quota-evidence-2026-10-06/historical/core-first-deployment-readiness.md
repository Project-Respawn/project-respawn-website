# PROJECT RESPAWN CORE — FIRST DEPLOYMENT GATE

6 October 2026. **Candidate ready for AWS review, not deployment authorization or live acceptance. STOP before AWS writes.** Current domain Shared/Core, phase M2 / Team Hub 2B5A-1. [Plan](core-domain-plan.md), [contracts](core-contracts-v1.md), [security](core-security-model.md), [Team integration](team-hub-2b5a-core-integration.md).

## Fresh baseline and pins

Approved identity `arn:aws:iam::058264289478:user/RavenTest`, account 058264289478, region eu-north-1. [Fresh baseline](core-2b5a-evidence-2026-10-06/baseline.json): all 62 Legacy templates and resource identities match the accepted inventory, 2,621 total / FunctionDirectiveStack 167. Team product 40/security 7 and Tournament 11 are UPDATE_COMPLETE, existing API IDs unchanged. [Absence](core-2b5a-evidence-2026-10-06/absence.json): Core product/security roots, function, proposed roles/boundaries, cursor secret and named API absent. [Preservation](core-2b5a-evidence-2026-10-06/preservation.json): both Team parity runtimes retain the accepted code and exact DISABLED/LEGACY_WRITER configuration; 35 accepted source hashes match. Business rows were not rescanned for this stateless Core review; accepted source recovery/empty-state evidence remains historical, not newly certified.

[Pinned candidate](core-2b5a-evidence-2026-10-06/candidate.json):

- Product SHA256: `89c712720e1fc09b9546865bd36b12a0123c8560ed8334d282918ac7cedbbaeb`.
- Security SHA256: `6b2afefb79172922e4338128a6b5fdab5e561e4055f8960650798acd4c4e8515`.
- Lambda ZIP SHA256: `4841f475dab09982d8ff5babc240c8a7d8809d05911de8e239ac9031e6fcefcf`.

The runtime ZIP remains in the ignored `.tmp/core-2b5a` assembly location. No object was published and no change set exists. Before any later publication, verify source manifest and exact preserved bytes; do not substitute HEAD or fresh synthesis without a new review. Core source changes supersede only the historical offline Core portion of 2B5; its old receipt is preserved, not rewritten. Team accepted pins are unchanged.

[Retained-resource check](core-2b5a-evidence-2026-10-06/retained-resource-check.json) also confirms no orphaned Core log groups or alarms.

## CONTRACTS

environment.v1: static, validated existing identity; no runtime endpoint.

authorization.decision.v1: implemented, fresh enabled account/Admin-SuperAdmin lookup, bounded decision; branding denied.

directory.assignment.v1: exact resolution, bounded prefix search, minimized results, encrypted scoped pagination, service delegation and abuse brake.

profile.summary.v1: not required; Team snapshots retained.

## ARCHITECTURE

Stack: ProjectRespawn-Core-Ntgre.

Product resources: 8. Security resources: 5 in separate ProjectRespawn-Core-Ntgre-Security.

API: synchronous IAM Lambda contract API; no HTTP API, URL or new JWT authorizer.

Lambda: one bounded Core runtime, five reserved concurrency, ten-second timeout.

DynamoDB: none. Cognito created: none. Data: one generated cursor secret, retained logs; no product records.

## RUNTIME IAM

Cognito reads: AdminGetUser, AdminListGroupsForUser, ListUsers on exact existing pool.

Cognito mutations: denied. Team data: denied. Tournament: denied. Creator: denied. Commerce: denied. Community: denied. Business S3: denied. Business/customer KMS: explicitly denied. IAM: denied. CloudFormation: denied.

Own log writes and cursor-secret read only. Exact AWS-managed encryption key boundary caps, zero identity KMS Allows; fresh key-policy evidence retained. Service initialization/secret retrieval must be proven after separately authorized deployment.

## DEPLOYMENT

Caller: ProjectRespawn-Core-Ntgre-Deploy; exact operator trust, stack/template/role scope.

Execution role: ProjectRespawn-Core-Ntgre-Execution; separate bounded lifecycle policy.

First-create API authority: none needed or proposed.

Existing APIs protected: no API Gateway Allow, explicit out-of-service denial; no existing API mutation.

Steady-state lockdown: exact function/resource scope from first creation; no temporary broad authority to remove.

Artifact publication: future exact Core object keys, AES256/SSE-S3 plus checksum/header readback. Caller/execution cannot publish. Rollback-enabled execution required. No CLI deployment command is run or authorized here.

## VALIDATION

Tests: Core 37/37, Team integration 7/7 (includes adapted mutation sequence), resource accounting 41/41.

Access Analyzer: five permission documents and three trust documents, zero findings. Eight logging policy-comparison/control checks pass.

Positive: 11/12 raw IAM simulator positives pass; own-log PutLogEvents returns implicitDeny, as in historical Team review. Independent Analyzer inclusion, missing-Allow and foreign-Deny controls establish the intended policy behavior without broadening it. Raw failure is preserved; this is not a claim of 12 simulator passes or live log delivery.

Negative: 27/27 IAM simulator negatives pass, including foreign data, Cognito mutation, wrong template, foreign stack, boundary removal and wrong PassRole.

Accounting: eight product/five security, exact Legacy reconciliation. TypeScript: pass. Build: isolated CDK/runtime pass. Isolation: Core-only runtime closure and Core-only assembly; no Legacy/Team/Tournament synthesis.

[Validation evidence](core-2b5a-evidence-2026-10-06/validation.json), [IAM evidence](core-2b5a-evidence-2026-10-06/security-review.json), [logging controls](core-2b5a-evidence-2026-10-06/logging-review.json), [trust validation](core-2b5a-evidence-2026-10-06/trust-review.json). Initial CLI policy-list/resource-type invocation mistakes were corrected; they did not install permissions. Historical broad Team hash-receipt failures from 2B5 were not rewritten or rerun as part of this Core-only review.

## LEGACY / TEAM HUB / TOURNAMENT

Legacy changed: no. Synthesized: no. Deployment: no.

Team Hub changed: no deployed or accepted source changes. Dormant integration compatibility tested; no invocation grant installed. Authority: LEGACY_WRITER, verification disabled, ordinary target writer disabled.

Tournament changed: no. Production target: none, prohibited.

## Required future execution acceptance

This review does not waive: fresh identity/baseline/absence/quota checks; named security custodian and alarm monitoring owner; exact security and product change-set inspection; installed role/trust/boundary readback and actual-principal tests; artifact encryption/checksum proof; rollback-enabled execution; live delegated JWT, directory privacy/pagination, disabled-account and failure tests with approved fixtures; runtime log/metrics and managed-key/secret initialization; effective invocation-principal review. No real account mutation is authorized for testing. Core may not be advertised as accepted until those pass.

The rate limiter is intentionally per warm container, not a distributed per-user quota. Same-account broad IAM invokers remain privileged; inspect before Team integration. No accepted manifest or frontend registration is published. Alarm actions are not assigned to an invented recipient. These limits must be accepted/addressed at the deployment review, not concealed as live proof.

AWS changes: 0. Business data writes: 0. Frontend cutover: false. Legacy retired: 0. Production touched: no. Ledger ownership rows changed: 0. Assigned 2,430; unresolved shared 191. No commit/push requested or performed; unrelated work preserved.

NEXT GATE: **CORE FIRST DEPLOYMENT REVIEW**.

CORE INDEPENDENT CONTRACT CANDIDATE READY FOR AWS REVIEW

**STOP HERE. DO NOT DEPLOY.**

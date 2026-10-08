# PROJECT RESPAWN CORE — QUOTA-CORRECTED CANDIDATE

6 October 2026. **CONCURRENCY CORRECTED; DEPLOYMENT REVIEW BLOCKED BY UNCHANGED ARTIFACT BINDINGS. DO NOT DEPLOY.**

## Decision and sole product change

Ntgre Core uses shared unreserved Lambda concurrency. ReservedConcurrentExecutions is **absent**, not zero; no provisioned concurrency or quota increase. This is a low-volume sandbox decision with no production SLO. Production requires its own account-capacity and reserved/provisioned concurrency review.

The original source is scripts/core-2b5a/build.mjs, Contracts Lambda Properties, ReservedConcurrentExecutions:5. The CDK app forwards that input; environment.v1 and runtime code do not set concurrency. No live Core Lambda exists. The historical builder is preserved. The current isolated derivation is [quota builder](../../scripts/core-quota/build.mjs), invoked with --domain core --env Ntgre --offline; it removes only that property from the preserved product input before independent CDK synthesis. Do not use the historical builder as the current deployment entrypoint.

[Semantic diff](core-quota-evidence-2026-10-06/semantic-diff.json) proves exactly one removal at /Resources/Contracts/Properties/ReservedConcurrentExecutions. Restoring value 5 makes the new template deeply equal to the old template. No resource addition/deletion/replacement, IAM, contract, route, Cognito, runtime or Lambda artifact change. Counts remain **8 product +5 security**.

## Revisions

Product revision and template SHA256 are the same identifier:

- Previous: 89c712720e1fc09b9546865bd36b12a0123c8560ed8334d282918ac7cedbbaeb
- Revised: 4aad4b8df1b1272f12e93144b3a1e89a2addaab5e404950f924ff7d7b58b9e46
- Security unchanged: 6b2afefb79172922e4338128a6b5fdab5e561e4055f8960650798acd4c4e8515
- Runtime ZIP unchanged: 4841f475dab09982d8ff5babc240c8a7d8809d05911de8e239ac9031e6fcefcf
- Runtime bundle unchanged: 80dd8e08b7f708285e44ae48911115b037c24e8a5a785be2ea25ec6327bc002a

[Candidate receipt](core-quota-evidence-2026-10-06/candidate.json). Both old templates and ZIP remain preserved. Rebuilding the runtime produces identical bundle/ZIP bytes. Updated source documentation is archived with original hashes in [history mapping](core-quota-evidence-2026-10-06/historical-documents.json); the old source receipt is not regenerated to hide documentation changes.

## Remaining blocker — exact artifact reference

The old deployment caller permits CreateChangeSet only with cloudformation:TemplateUrl pointing at the old product hash. Caller and execution policies also allow S3 GetObject only for the old template object. The security template is byte-for-byte unchanged, so the revised URL/object is correctly denied.

[AWS artifact-binding checks](core-quota-evidence-2026-10-06/artifact-binding.json) confirm caller and execution GetObject implicitDeny. The normal new-template CreateChangeSet positive also returns implicitDeny. This is a real immutable-artifact binding mismatch, not the known logging simulator limitation. No old hash-based key will be overwritten with different bytes.

Per the instruction to stop if a further change is required, no security reference was changed. A subsequent review must replace only old template URL/object references with the reviewed new ones in caller identity/boundary and execution identity/boundary. That would change security bytes and requires a new security candidate/hash; there is no need to broaden runtime/Cognito/domain/service permissions. No proposed correction has been installed or silently included.

## Capacity and failure behavior

[Fresh quota](core-quota-evidence-2026-10-06/quota.json): account concurrency 10, unreserved 10, requested reserved NONE. The 100-unreserved reservation requirement no longer applies to this candidate. Core has no guaranteed reservation or private ceiling; its requests compete with other functions in the regional account pool. This accepts possible throttling for low-volume Ntgre only, not dedicated capacity or production isolation.

Team Core-client tests prove thrown Lambda throttling, timeout and service-unavailable errors and Core dependency-error envelopes map to DEPENDENCY_UNAVAILABLE for authorization, resolve and search, without default Allow, alternate transport, direct Cognito or Legacy fallback. This covers surfaced transport errors; an upstream invocation terminated by a hard platform timeout cannot return an application envelope, but cannot authorize a successful Team mutation through fallback. No runtime/client change was made.

Monitoring unchanged: native Lambda Invocations, Errors, Throttles and Duration; existing Errors/Throttles alarms; sanitized Core dependency-failure metrics and DependencyFailures alarm. Existing Denied alarm remains. No extra monitoring resource or recipient was silently added. Live traffic/log/metric acceptance remains a deployment gate.

## Validation and protected baseline

Core 37/37; Team integration/failure cases 20/20; accounting 41/41; existing Team/Core security regression 37/37. Independent synthesis, TypeScript and byte-identical runtime rebuild pass. Access Analyzer: five permission policies plus three trusts, zero findings; logging inclusion/negative controls 8/8.

Raw main IAM matrix: 27/27 negative checks pass; 10/12 positives pass. One positive is the previously classified Logs simulator limitation; one is the new template URL's real denial. Two additional required new-template object-read positives also deny. Therefore this is **not** a fully passing deployment-security gate. [Validation](core-quota-evidence-2026-10-06/validation.json), [IAM results](core-quota-evidence-2026-10-06/security-review.json).

[Fresh baseline](core-quota-evidence-2026-10-06/baseline.json): Legacy 2,621 / FunctionDirectiveStack 167, all accepted template/physical identities match; Team 40+7/API t54b88casf; Tournament 11/API msipnwy39j. All UPDATE_COMPLETE. [Team preservation](core-quota-evidence-2026-10-06/preservation.json): LEGACY_WRITER, verification disabled, accepted code and 35 source hashes unchanged. Core remains absent. No production changes, AWS mutations, artifact publication, quota request, business writes or frontend cutover.

The original quota-blocked review is retained in [historical documents](core-quota-evidence-2026-10-06/historical-documents.json). Ledger ownership is unchanged; no migration/cutover/retirement milestone is claimed.

NEXT GATE: **CORE EXACT-ARTIFACT SECURITY REBIND REVIEW**, before any deployment.

CORE QUOTA CORRECTION BLOCKED

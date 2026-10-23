# Production Core runtime KMS correction — 21 October 2026

Status: candidate preparation only. No AWS writes, invocation, secret retrieval or deployment authorized or performed in this review. Production Core remains deployed but runtime acceptance is blocked. Team Hub deployment, authority initialization, migration and Master publication remain excluded.

## Demonstrated failure and confidence

The production runtime role `ProjectRespawn-Core-Production-Contracts` received an explicit identity-policy `kms:Decrypt` denial on AWS-managed Lambda key `arn:aws:kms:eu-north-1:058264289478:key/13ae83f9-bc5f-4486-a013-e07b9d7d52e7`. Lambda request `6069a27a-272b-47fe-b58a-736af41089d3` failed before handler execution. KMS request `63ecbfbd-4630-453a-985b-2fa76f62b675`, CloudTrail event `0066ac4a-3cae-43dd-9566-fd868be96c30`, records the denial; its request parameters are null. No actual denied encryption-context or ViaService value can be recovered from that event.

The installed identity policy and runtime boundary both deny a missing/wrong Lambda ViaService value. Their Allow also requires that value. Read-only inspection confirms an active grant to the exact runtime session, constrained by `EncryptionContextEquals` to the exact unqualified Core function ARN. The successful creation event is `6bbc5e67-0846-4774-8334-41a86dcf7106` (KMS request `d27f44c5-3b8f-4ce7-9845-69859f6c763b`).

AWS documents [ViaService as a forward-access-session condition](https://docs.aws.amazon.com/kms/latest/developerguide/conditions-kms.html) and distinguishes [forwarded requests from service-role credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_forward_access_sessions.html). A direct runtime decrypt without ViaService is therefore a supported explanation and passes the proposed model. It is an inference, not an observed condition value. Supplied-context simulations cannot prove real initialization succeeds.

## Minimum proposed correction

In the runtime identity policy and RuntimeBoundary only, change the exact Lambda-key Decrypt Allow from mandatory ViaService to `StringEqualsIfExists`. Add `Null: {"kms:ViaService":"false"}` to the matching wrong-service Deny. This allows absence while retaining explicit denial for a present wrong service. Mandatory caller account and exact function encryption context remain unchanged. Missing/wrong account or function context, qualified/foreign function context, wrong key, KMS administration and every extra KMS action remain denied.

This permits direct decrypt by the same runtime role with the exact key/account/context; encryption context is not independent proof of which process used role credentials. Existing service-only trust, restricted PassRole and unchanged code bindings remain important controls. No additional principal receives the role.

Secrets Manager service/context rules remain byte-equivalent. No cursor-secret value was retrieved. The execution-role KMS lifecycle correction, Cognito scope, foreign-domain denials, runtime code, environment and log group are unchanged.

## Immutable candidates

| Artifact | SHA-256 |
| --- | --- |
| Security template | `8f83dda21a47895b2f48cea19839daa84bdbcba7f28ff82e30906aec595b0c44` |
| Product template | `0302056f0152107ecabd9d459ab50d436245587eef3cec1aa4d971c77a6ca1e4` |
| Unchanged runtime ZIP | `fecdc0327a5f75c8be4f9e4f280776b6908f646dfdffdf6bee4e61e5e8126503` |

See [manifest](production-core-runtime-kms-evidence-2026-10-21/manifest.json), [exact semantic diff](production-core-runtime-kms-evidence-2026-10-21/policy-diff.json), [fresh installed baseline](production-core-runtime-kms-evidence-2026-10-21/fresh-runtime-baseline.json) and [validation](production-core-runtime-kms-evidence-2026-10-21/security-validation.json).

Expected security change set: five modifications, RuntimeBoundary plus exact product-artifact binding in ExecutionBoundary, CallerBoundary, Execution and Caller. Existing artifact references remain; only the exact new product S3 object and exact new TemplateURL are added. No prefix wildcard, arbitrary URL or PassRole change. Expected product change set: one Runtime IAM policy modification. Zero additions/deletions/replacements, Lambda changes or log-group changes. Counts remain six security plus seven product resources. AWS-generated counts must be inspected later; none were requested here.

## Validation and limits

The focused security/preservation suite passes 31/31. The new evidence records actual AWS policy validation, supplied-context positive/negative IAM checks, identity/boundary intersection checks, injected-Allow explicit-deny controls, policy quotas and CloudFormation template validation. Certification completed: six policies, 398 policy cases and 39 effective-policy/explicit-deny controls passed; zero Access Analyzer ERROR or SECURITY_WARNING findings; both CloudFormation templates validated. All policy sizes fit their applicable limits. Eighty prior execution/R2 artifact hashes remain intact; the new-package secret-pattern scan found no matches. The sealed manifest binds the evidence and preparation sources. No new runtime code was built; existing code/build evidence remains applicable to the unchanged ZIP. No complete organization-policy certification or live decryption success is claimed.

## Separate execution authorization required

1. Confirm a fresh accountable-operator window, account 058264289478/eu-north-1/RavenTest and protected baselines. Verify installed security/product hashes, runtime code/configuration, trust, grants, imported log IN_SYNC, production sources/backups/Cognito/Master and absent Team stacks. Stop on drift.
2. Verify the sealed manifest and every source/evidence/artifact hash. Publish only the two reviewed templates; reuse the existing ZIP unchanged. Inspect the complete security change set: exactly the five listed policy modifications, no replacement/deletion/unrelated effect. Execute with rollback enabled only under fresh authorization.
3. Verify installed boundary, execution/caller policies, trust and artifact restrictions. Inspect the product change set: exactly Runtime policy modification, no function update. Execute with rollback enabled and verify installed runtime identity/boundary equivalence and effective positive/negative controls.
4. Perform one controlled Core invocation. Require actual initialization and a valid response before opening the authentication helper. A KMS or initialization failure stops progression; preserve request IDs, do not retry automatically or broaden IAM.
5. Run production Admin and ordinary-user contracts plus authenticated Ntgre rejection through the reviewed local helper. Record actual receipts, not user recollection. Verify logs, counters, alarms and protected-domain/data preservation. Stop after Core acceptance; Team deployment requires separate authorization.

CloudFormation rollback may restore the known-unhealthy prior policy. Do not interpret UPDATE_COMPLETE as runtime acceptance or automatically revert a working policy to that unhealthy baseline. Any manual rollback decision must account for both policy layers and artifact permissions, retain the imported log and historical artifacts, and preserve all protected resources. No stack deletion, log reimport, authority change or frontend publication is part of this proposal.

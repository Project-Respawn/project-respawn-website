# Production Team Hub permission-runtime dark deployment result

**Superseded execution state:** the separately approved [stage-tagging recovery succeeded](team-hub-production-stage-tagging-recovery-result.md). Current production Team Hub is dark-deployed (8 security +41 product), with no authority/business/frontend transfer. The failed attempt below is preserved unchanged as historical evidence.

Follow-up: [stage-tagging correction review](team-hub-production-stage-tagging-recovery-review.md) prepares the two-policy delta and unchanged-product recovery. It preserves this execution record. Actual provider/schema and simulation evidence support the literal action, while Analyzer rejects its catalog entry. All 393 controls passed, but the explicit Analyzer exception remains unaccepted; no recovery mutation has occurred.

24 October 2026 (Europe/London). **BLOCKED: API Gateway stage tagging lifecycle permission.** The authorized security stack succeeded; the product attempt rolled back. The public Legacy website is unchanged. Production Team Hub is not accepted or operational.

## Authorization and exact artifacts

The owner's explicit approval covered package `2df8f08fec949b5b0eadac8fb0a472eea8edcc3f8bb3f3a2671d6afb5fd3909e`, three immutable publications, security CREATE 8 and product CREATE 41, within the confirmed 60-minute attended window and with no concurrent administrative deployments. [Actual authorization receipt](production-team-hub-permissions-execution-2026-10-24/authorization.json) records receipt time and expiry without inventing a message-signature timestamp.

| Artifact | Verified SHA-256 |
| --- | --- |
| Candidate manifest | `7774091b4cc4af23b769d2940a3dcd3410e66d47df82548c8529683efffa5a53` |
| Security | `d543bf22071bf001db042ee3af1f1d2f2c5ffb5ee020341531abbcef3dac6b33` |
| Product | `e375a995da78fee165e2ef653225224e7546a1e9066cf3d980d8a488ce30d012` |
| Shared Read/Command ZIP | `acbc6199e71ca001697a4f34636cada900dc50d3b9fa1068d2735c61425e3a5e` |

All three exact objects were conditionally published with AES256 encryption and full SHA-256 checksums, then downloaded and hashed. No overwrite, rebuild or artifact substitution occurred. Accepted parent/rollback bytes remain preserved. [Sanitized execution result](production-team-hub-permissions-execution-2026-10-24/result.json) and [evidence/harness hashes](production-team-hub-permissions-execution-2026-10-24/evidence-manifest.json).

## Fresh preflight and security acceptance

Actual operator: `arn:aws:iam::058264289478:user/RavenTest`, account `058264289478`, region `eu-north-1`. Fresh checks passed Core installed templates/IAM/trust/runtime/monitoring, production identity binding, source protections and backups, current source counts, name collisions, available unreserved concurrency, exact artifact bindings and Master preservation. An R1-era SWG timestamp difference was resolved against the later accepted 23 October preservation receipt; it was not silently discarded. [Preflight](production-team-hub-permissions-execution-2026-10-24/preflight.json), [baseline reconciliation](production-team-hub-permissions-execution-2026-10-24/baseline-reconciliation.json).

Security change set `permissions-security-d543bf22071bf001` contained precisely eight Add changes, zero modifications/deletions/replacements and the exact approved template. One execution reached `CREATE_COMPLETE` with rollback enabled. [Full inspected change set](production-team-hub-permissions-execution-2026-10-24/security-change-set-inspected.json).

Actual installed policy/trust/boundary readback matched. All 111 effective installed-role controls passed using generated API/secret identities; six actual policies passed Access Analyzer with zero blocking findings. Execution boundary: 6,118/6,144 characters; execution inline policy: 9,756/10,240. The earlier 333 custom-policy certification cases remain preserved and separate from these installed-role checks. Nine focused production runtime/client regressions also passed without rebuilding the ZIP.

A local verifier incorrectly expected every role to have no attached managed policy. It was corrected to compare exact attachments with the pinned template's `ManagedPolicyArns`; DeploymentCaller explicitly attaches PreparationCaller. This changed verification code only, not AWS IAM or approved artifacts. [Correction receipt](production-team-hub-permissions-execution-2026-10-24/verifier-correction.json).

## Exact failed product gate

Product change set `permissions-product-e375a995da78fee1` contained precisely 41 Add changes, zero modifications/deletions/replacements and the exact approved template. It was submitted through the approved DeploymentCaller with the exact CloudFormation execution role. [Full inspected change set](production-team-hub-permissions-execution-2026-10-24/product-change-set-inspected.json).

At `2026-10-23T23:48:45.021Z`, logical resource `Stage` failed:

- Principal: `arn:aws:sts::058264289478:assumed-role/ProjectRespawn-TeamHub-Production-ReadProofExecution/AWSCloudFormation`.
- Action: `apigateway:TagResource`.
- Evaluated resource: `arn:aws:apigateway:eu-north-1::/apis/9wk4a41l5m/stages`.
- AWS reason: no identity-based policy allows that action; HTTP 403 / AccessDenied.
- AWS request ID: `5ab0b5c3-0cc9-4b73-a60b-01d27b3edbe6`.
- Provider request token: `b650bc35-4d5f-7342-42ca-481380a9820e`.

Both reviewed execution identity and boundary omit the TagResource action. Their API Gateway lifecycle grants include GET/POST/PATCH/DELETE/PUT; those grants did not authorize the demonstrated tagging action. The positive permission matrix omitted this provider dependency. Successful simulations and Analyzer validation therefore did not prove complete service lifecycle coverage. This is not an IAM drift or KMS denial diagnosis.

CloudFormation rollback completed at `ROLLBACK_COMPLETE`. There was one product execution, no automatic retry, IAM patch, changed pin, authority initialization or cleanup mutation. [Original AWS events](production-team-hub-permissions-execution-2026-10-24/product-events.json), [terminal state](production-team-hub-permissions-execution-2026-10-24/product-failure-state.json).

## Actual terminal resource inventory

- Security stack remains `CREATE_COMPLETE`, with its eight approved resources, including API `9wk4a41l5m` and the generated cursor secret. Secret value was never retrieved.
- Product stack record remains `ROLLBACK_COMPLETE`.
- Actual service inspection confirms both proposed tables, both functions, both runtime roles and both log groups are absent. CloudFormation's table DELETE_SKIPPED events were not treated as proof that tables exist.
- The API has zero stages, routes, integrations and authorizers. There are zero Team Hub product alarms.
- Three approved immutable artifact objects remain retained.

[Service inventory](production-team-hub-permissions-execution-2026-10-24/rollback-resource-inventory.json), [alarm inventory](production-team-hub-permissions-execution-2026-10-24/rollback-monitoring-inventory.json). No retained-resource deletion or stack-record deletion was attempted.

## Preservation and pending acceptance

Post-attempt complete source reads match the preflight canonical digests and counts: Team 1, membership 8, roster/control/archive 15, champion pool 101. These are 125 stored rows, not a frozen migration snapshot or 125 active business entities. All four source tables remain ACTIVE with PITR/deletion protection enabled; all four exact backups remain AVAILABLE and match source identities.

Production Cognito, remote Master `5b0e0a574f503679120ca4e5e2a2c884d48de9e7`, hosting settings and protected stack inventory are preserved. Production Core's installed IAM, accepted code/environment and all four OK alarms were independently rechecked. [Source/identity/Master preservation](production-team-hub-permissions-execution-2026-10-24/preservation-post.json), [Core preservation](production-team-hub-permissions-execution-2026-10-24/post-core-preservation.json).

No business record, source fence, production authority, Cognito user, frontend release or unrelated domain was changed by this execution. No Team Hub Lambda initialization, authenticated integration, cursor decryption, HTTP dark runtime or live business monitoring acceptance can be claimed: the product rolled back before those gates. Existing Core acceptance remains valid.

## Next separately reviewed recovery

1. Prepare a minimal execution identity/boundary correction for the demonstrated TagResource lifecycle requirement using supported scope and conditions. Extend positive/negative provider-lifecycle coverage and recheck policy quotas, rollback and domain isolation; do not add broad administration.
2. Prepare exact recovery of the failed product stack record, preserving the accepted security stack and artifact objects. Service inspection found no retained product tables to import; refresh this fact before any future write. Stack-record deletion/recreation is not authorized by the completed attempt.
3. Pin and obtain approval for the revised security/recovery package before further mutations. Do not simply rerun the old CREATE request or edit an installed policy.
4. After eventual dark acceptance, retain separate authority bootstrap, isolated cursor proof, nonempty production migration/fence/reconciliation, five-persona permission acceptance and frontend-only Master publication gates.

**PRODUCTION TEAM HUB DARK DEPLOYMENT BLOCKED — APIGATEWAY TAGRESOURCE LIFECYCLE PERMISSION**

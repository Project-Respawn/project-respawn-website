# Team Hub 2B6 — business runtime configuration repair

**Corrected Lambda recovery execution (10 October 2026): FAILED; temporary executor removed.** The single corrected pinned workflow reached ReadUpdate but failed on explicit `kms:Encrypt` denial for the AWS-managed Lambda key. Command was never attempted. Both full configurations/revisions/code remain unchanged and both environments remain MODIFIED. Protected domains, source recovery and LEGACY_WRITER epoch/version 1 preserved; target business state empty. No IAM patch or retry. Separate KMS lifecycle review required before another attempt. [Result, exact error and cleanup](team-hub-2b6-corrected-lambda-recovery-result.md). Earlier entries below are historical.


**Qualified Lambda ARN security correction (9 October 2026): READY FOR EXECUTION REVIEW — NOT DEPLOYED.** Exact `$LATEST` update grants and matching explicit-deny exceptions prepared for Read and Command only. 109 AWS IAM controls, two old-policy denial controls and zero Access Analyzer findings; fixed workflow/maps/revisions/code and KMS restrictions preserved. Current functions remain incomplete; LEGACY_WRITER and live frontend unchanged. Recovery requires separate authorization. [Candidate, exact pins, evidence and future execution gates](team-hub-2b6-qualified-lambda-arn-security-review.md). Earlier entries below are historical.


**Lambda configuration recovery execution (9 October 2026): FAILED; temporary executor removed.** The single pinned workflow stopped on an explicit identity-policy denial for the Read function `:$LATEST` ARN. Command was never attempted. Full readback confirms both configurations/revisions/code unchanged and both Environment properties still MODIFIED. Authority remains LEGACY_WRITER epoch/version 1; business state empty, protected domains preserved. No retry or IAM patch. Qualified-ARN coverage requires separate security review; application/monitoring recovery acceptance and isolated AWS transaction/cursor proofs remain outstanding. [Execution result, cleanup and evidence](team-hub-2b6-lambda-configuration-recovery-result.md). Earlier entries below are historical.


**Configuration repair execution (9 October 2026): BLOCKED AT PRODUCT CHANGE SET.** Reviewed security is installed and verified, UPDATE_COMPLETE. AWS returned zero product changes instead of the required two Environment updates; product was not executed. Both functions still lack the documented variables. LEGACY_WRITER epoch/version 1, 48+7 resources and empty business state preserved. No direct patch, retry, frontend/fence/production change. [Execution result and exact stop evidence](team-hub-2b6-configuration-repair-result.md). Earlier entries below are historical.


9 October 2026. **BLOCKED: environment-only draft prepared; separate execution-role KMS and artifact-reference review required.** No AWS writes, IAM changes, deployment, secret retrieval, authority transition or frontend activation in this investigation. This report supersedes the unresolved diagnosis in the [dark deployment result](team-hub-2b6-business-runtime-dark-deployment-result.md), preserving that historical evidence.

## Diagnosis and evidence limits

Account 058264289478, eu-north-1; read-only operator `arn:aws:iam::058264289478:user/RavenTest`. [Fresh inspection](team-hub-config-repair-evidence-2026-10-09/inspection.json) verifies both installed ZIP hashes against the business pin and compares the previous endpoint template, business template and actual Lambda environment maps. Both actual environments exactly match the previous eight-variable endpoint configuration. No existing variable was renamed, unexpectedly added or changed. Read is missing four additions; Command is missing three. Both functions report Active / Successful, without an Environment.Error to this operator. CloudFormation stores the desired new environment, but Lambda has not acquired it.

The exact immediate 503 cause is `domains/team-hub/business-runtime/entry.mjs`: absent CORE_ENVIRONMENT parses as null and fails the strict accepted-Core environment comparison. It returns DEPENDENCY_UNAVAILABLE and emits Requests/DependencyFailures before authentication, Journal, Core or cursor calls. With that variable repaired alone, the router's absent TEAM_HUB_BUSINESS_RUNTIME check still returns 503/AUTHORITY_UNAVAILABLE. Missing CORE_CONTRACT_ARN and Read's secret ARN are subsequent lazy dependencies, not the cause of this first request. The pinned compiled ZIP reproduces the observed 503 locally.

The expanded [provider audit](team-hub-config-repair-evidence-2026-10-09/provider-audit.json) contains **21 actual KMS Decrypt AccessDenied events** under `ProjectRespawn-TeamHub-Ntgre-ReadProofExecution`, against `arn:aws:kms:eu-north-1:058264289478:key/13ae83f9-bc5f-4486-a013-e07b9d7d52e7`. Fresh DescribeKey identifies this as the enabled AWS-managed `alias/aws/lambda` key. The installed execution identity policy and ExecutionBoundary both contain `Deny kms:* NotResource <Secrets Manager key 8802a37a-f981-4384-b538-fdb4f7aba74a>`, so they explicitly deny the Lambda key. Actual-role simulation reproduces explicitDeny. [Installed security and exact statements](team-hub-config-repair-evidence-2026-10-09/security.json).

This is a confirmed deployment-security regression and a blocker for repair or rollback. Its timing and service path support a connection to the environment discrepancy, but do not prove CloudFormation's internal handling or why stabilization reported success. CloudTrail deliberately omits Lambda environment values; the recorded empty environment object is **not proof that the provider submitted an empty map**. [AWS CloudTrail documentation](https://docs.aws.amazon.com/lambda/latest/dg/logging-using-cloudtrail.html). The old-policy custom simulation's implicitDeny is not live proof of a broken prior deployment: identity simulation alone does not establish the complete AWS-managed service-key path. The actual AccessDenied events and current explicit deny are the decisive evidence.

Previous tests covered runtime Lambda-key access and execution access to the Secrets Manager key, but missed the execution role's Lambda-key path. Prior bundle tests injected complete environment variables; they did not validate installed configuration against the template. This investigation adds both missing checks. No deny is removed here, and no broad decrypt grant is proposed as a shortcut.

## Complete configuration contract

| Variable | Read | Command | Required value / behavior |
|---|---|---|---|
| CORE_ENVIRONMENT | Missing | Missing | Exact accepted environment.v1 object below; property order is significant to the existing JSON.stringify comparison |
| TEAM_HUB_BUSINESS_RUNTIME | Missing | Missing | AUTHORITY_GATED_V1 |
| CORE_CONTRACT_ARN | Missing | Missing | arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Core-Ntgre-Contracts; validated when invoking Core |
| TEAM_CURSOR_SECRET_ARN | Missing | Not applicable | Product Ref CursorSecret; resolves to arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-TeamHub-Ntgre-Cursor-wbclUV |
| EXPECTED_ISSUER | Preserved | Preserved | https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_n24iLL7QE |
| EXPECTED_POOL_ID | Preserved | Preserved | eu-north-1_n24iLL7QE |
| EXPECTED_CLIENT_ID | Preserved | Preserved | 1iq7ovjaf7d16imdvbqgfgvf86 |
| TEAM_HUB_RUNTIME | Preserved | Preserved | read / command respectively |
| TEAM_HUB_VERIFICATION | Preserved | Preserved | {"mode":"DISABLED","authority":"LEGACY_WRITER"} |
| TEAM_HUB_AUTHORITY | Preserved | Preserved | LEGACY_WRITER |
| TEAM_HUB_STAGE | Preserved | Preserved | PRE_CUTOVER |
| TEAM_HUB_NORMAL_WRITES | Preserved | Preserved | DISABLED |

```json
{
  "contractVersion": "environment.v1",
  "environment": "Ntgre",
  "account": "058264289478",
  "region": "eu-north-1",
  "poolId": "eu-north-1_n24iLL7QE",
  "clientId": "1iq7ovjaf7d16imdvbqgfgvf86",
  "issuer": "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_n24iLL7QE"
}
```

The exact Operational/Journal table names, CONTROL#AUTHORITY / STATE key, region and accepted Core contract are embedded in the pinned runtime. There is no missing table-name or authority-epoch environment variable to invent. The actual Journal row, not these dark-stage labels or browser input, determines writer authority. D1 namespace/dimensions are supplied by code; LoggingConfig/log groups remain unchanged. Core invocation remains lazy. Cursor access is Read-only and lazy for the two paginated operations after authority and authorization; no plaintext is an environment variable. Command must not acquire a secret reference. No arbitrary fallback defaults or source changes are necessary for the environment contract.

## Pinned blocked draft

Simply resubmitting the current desired template may produce no environment change. The draft changes **only the whitespace serialization of CORE_ENVIRONMENT in the two Lambda Environment properties**, preserving JSON member order and exact parsed value. This is an explicit configuration-resubmission mechanism, not a new configuration flag or default. All other properties are byte-equivalent after parsing; the complete approved map is present for eventual CloudFormation submission. AWS-generated inspection remains mandatory before execution.

| Artifact | SHA-256 |
|---|---|
| New draft manifest | b00d5846b65555d46dd49b0b355231fd48152f92b58750602bfeaa1fa0180b3d |
| New product | 38ea59476109a3b16348fb789364462af43f2813ff3eec7f92bfadb9581d6a4f |
| Unchanged security | ff226268cf9221d6f3b42bcd06dbc1525d12cbe841bacd79ced0ac60bb016067 |
| Unchanged runtime ZIP | da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e |
| Preserved previous manifest | b137c2e8be1fa380b35cd401219327875e3c8cdaae58ac78969c4d799478091d |

[Manifest with exact local paths and rollback hashes](team-hub-config-repair-evidence-2026-10-09/artifact-manifest.json), [candidate](team-hub-config-repair-evidence-2026-10-09/candidate.json), [product template](team-hub-config-repair-evidence-2026-10-09/product.template.json). Runtime archives are copied, not rebuilt. Original blocked, deployed and accepted endpoint pins are preserved.

Expected product change set: **0 additions, 2 modifications (ParityReadFunction / ParityCommandFunction Environment), 0 deletions, 0 replacements**, 48 product +7 security unchanged. API, authorizer, routes, tables, secret, alarms, code hashes and runtime permissions remain unchanged. No change set was created in AWS. There is no security update candidate in this task.

The restricted caller also only permits the previous exact product/rollback URLs. The new content hash requires separately reviewed exact S3/TemplateURL binding; do not overwrite a content-addressed old object or use a broader caller. These two security blockers mean the draft is **not executable under the current gate**.

## Update and rollback behavior

AWS classifies Environment updates as no interruption, but that is not a zero-error or atomic two-function guarantee. CloudFormation invokes configuration/code update APIs sequentially; Lambda may serve previous configuration while an update completes, and the two functions may transition at different times. Both maps are compatible with the identical ZIP, reducing code/config skew, but existing 503s can continue until the updates stabilize. Inspect LastUpdateStatus, actual full maps and code hashes before acceptance. [CloudFormation behavior](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-lambda-function.html), [Lambda update states](https://docs.aws.amazon.com/lambda/latest/dg/functions-states.html).

Rollback must be enabled at a future execution gate. CloudFormation success alone does not trigger rollback for an application 503; automatic stack rollback also does not prove healthy actual configuration where drift already existed. The previous desired template already has the required semantic values, so reverting the serialization change is not a guaranteed health recovery. No out-of-band Lambda patch is authorized.

| Option | Assessment |
|---|---|
| A — narrow configuration repair | Preferred after separate deployment-security review. Two environment modifications, unchanged code and 48 resources; local authority/dark regression passes. No business data migration. Fastest expected repair once the deployment path is safe, but no elapsed-time guarantee or live proof yet. |
| B — restore accepted endpoint product/runtime | Known accepted archives remain verified (product 5a2d99f…7d0e9, Read cd58cc35…eedd, Command a36406c4…a7d5; full hashes in manifest). Larger 48-to-42 product rollback plus reviewed security restoration; preserve cursor secret via its retention policy and preserve authority/data. The same execution-role deny must be reviewed before attempting rollback; historical product-first ordering must not be followed blindly. No business writes exist to reverse, but known archives do not make the current execution path safe. |

Recommend A subject to separately scoped execution-key/artifact-binding review and inspection. Use B as a separately authorized recovery if runtime defects remain after configuration is correct or operator recovery priorities change. Neither is performed or automatically retried.

## Validation and preservation

- 11 new compiled-ZIP configuration tests pass: actual installed map reproduces 503 without SDK I/O; missing runtime/Core configuration and wrong environment fail closed; corrected map returns authority 200 using the actual row as an isolated fixture; all 16 business routes deny with one authority GetItem each; no business writes/Core/secret calls. D1 dependency and writer-denial counters are asserted. These are local loopback tests, not live acceptance.
- 423 existing cursor, transactional epoch, Core, accounting/isolation, privacy and monitoring tests pass; migration ledger and TypeScript pass. [Validation](team-hub-config-repair-evidence-2026-10-09/validation.json).
- Website production build passes, with existing missing /css/styles.css, chunk-size and plugin-timing warnings. No publication. [Build](team-hub-config-repair-evidence-2026-10-09/build-result.json).
- 104 actual Read/Command IAM simulations pass and installed trust, inline policies and boundaries match the preserved pin. They do not prove live decryption. Execution-role Lambda-key explicit deny is independently confirmed and remains a failed deployment gate. [Runtime isolation](team-hub-config-repair-evidence-2026-10-09/runtime-security-after.json).
- Fresh protected-template comparison: Legacy 2,621 / FunctionDirectiveStack 167; Team Hub 48+7; Core 8+5; Tournament 11. Both current runtime hashes remain pinned. [Preservation](team-hub-config-repair-evidence-2026-10-09/preservation-after.json). No production access or changes were performed.
- [Secret-pattern scan](team-hub-config-repair-evidence-2026-10-09/secret-scan.json) passed. [Fresh source/target inventory](team-hub-config-repair-evidence-2026-10-09/inventory.json) confirms four empty Legacy sources with PITR/deletion protection and available backups, Operational 0, and Journal 15 historical audits plus the unchanged authority row. No secret value or browser token was retrieved; secret metadata/reference is intentionally non-secret. Authority remains LEGACY_WRITER, epoch 1, version 1.

## Exact next acceptance sequence — separate authorization required

1. Resolve and review the execution-role Lambda-managed-key denial and exact new artifact binding without broad KMS or runtime permission changes. Revalidate positive/negative execution lifecycle controls, including rollback. Preserve customer-key and foreign-domain denials. This is outside this task's permission-change scope.
2. Refresh account/region/identity, all pins, exact installed IAM/environment maps, source protection/backups and zero target business records. Require the unchanged authority row and absent fence/frontend activation. Stop on drift.
3. Publish only the reviewed exact product after separate authorization; prepare an AWS change set. Require the two Environment-only modifications above, no code/security/API/table changes, no replacement/deletion. Inspect the AWS-returned template. Execute only after review with rollback enabled. Stop on failure; no automatic retry.
4. Verify both complete installed maps, unchanged ZIP hashes, Active/Successful and no Environment.Error. Authenticated GET /v1/authority must return 200 and exact LEGACY_WRITER/epoch 1/version 1. Missing/wrong credentials must deny. Stop on mismatch or 5xx.
5. Exercise every current normal business route (all 16), requiring approved 403 and writer-denial metric correlation. Verify zero new Operational/business Journal rows and unchanged authority metadata; preserve the 15 historical audits. Do not alter authority to reach deeper code.
6. Reconfirm exact Core manifest/ARN/environment and invocation isolation. LEGACY_WRITER denies before Core, so dark-route results alone do not prove a live Core invocation. Use only a separately approved isolated Core verification mechanism; do not bypass authority or authorization.
7. Correlate request IDs, structured Lambda platform/application logs and D1 EMF/native metrics with expected requests/denials. Allow documented CloudWatch ingestion delay, fixed windows and retry of reads only. Require no unexplained API 5xx, Lambda errors/throttles or new KMS denies after stabilization.
8. Separately authorize isolated Read-role cursor decryption/signing/tamper/expiry/wrong-secret/cross-Team verification without logging material or activating ordinary target writes. IAM simulation is not live decryption proof.
9. Recheck Legacy/Core/Tournament hashes/counts, source PITR/deletion protection/backups, frontend and authority. Record live acceptance only after these checks. Gate B fence, business transactional live proof, FROZEN and TARGET_WRITER remain separate gates.

Current domain: Team Hub; phase: M5 / 2B6 configuration-repair preparation. AWS writes: 0. Business/authority, Legacy, production and ownership-ledger changes: 0. Next gate: separate execution-security and exact artifact-binding review, then reviewed configuration deployment. No freeze is ready.

**BUSINESS RUNTIME CONFIGURATION REPAIR BLOCKED**

# Project Respawn Team Hub 2B6 — cursor runtime correction

## Result

**CURSOR RUNTIME CORRECTION BLOCKED — DEPLOYMENT ARTIFACT POLICY QUOTAS**

The runtime defect is corrected and tested offline. Deployment preparation remains blocked because preserving every accepted artifact and adding the exact new Read ZIP exceeds both execution-policy size limits. No AWS resource writes, deployment, authority transition or frontend activation occurred.

Evidence directory: `team-hub-cursor-runtime-correction-evidence-2026-10-13`.

## Request path and correction

API Gateway authenticates the existing Ntgre Cognito access JWT. The Read router authenticates trusted claims, reads CONTROL#AUTHORITY / STATE strongly consistently, requires TARGET_WRITER and the request's matching authority epoch, and obtains a fresh accepted Core decision. The previous handler loaded cursor material only for the two champion-pool operations. LIST_MY_TEAMS queried candidate IDs, re-read candidate state and called the same `page()` implementation without signing material, producing DEPENDENCY_UNAVAILABLE even for an empty result.

The handler now includes LIST_MY_TEAMS in that existing lazy-loading predicate. The accepted Secrets Manager loader uses the same environment reference and now supplies a 3,000 ms AbortSignal timeout; the SDK already uses maxAttempts 1. Loading occurs after authority and Core checks and before business query/projection/pagination. Secret failures remain sanitized HTTP 503. The final authority read still rejects an authority transition during request handling. Every mutation's transactional authority, membership, revision, idempotency and audit checks are unchanged.

GET_TEAM_HUB does not paginate and does not need this secret. Both champion-pool routes already used the loader; tests now exercise all four routes through the router, without a constructor-injected secret. Cursor HMAC, five-minute expiry and actor/issuer/operation/team/filter/limit bindings are unchanged. Branding and Coach-private creation remain disabled.

Only `domains/team-hub/business-runtime/handler.mjs` and `entry.mjs` change in the runtime source closure. All 627 accepted dependency source hashes match. Historical source bytes are preserved under `previous`; old candidates and evidence are retained. The new ZIP is deployed to Read only: Command retains its original ZIP and environment.

## Installed dependency and security

Fresh read-only `security.json` confirms the actual Read environment contains:

- Secret: `arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-TeamHub-Ntgre-Cursor-wbclUV`.
- AWS-managed Secrets Manager key: `arn:aws:kms:eu-north-1:058264289478:key/8802a37a-f981-4384-b538-fdb4f7aba74a`.
- Read role: `ProjectRespawn-TeamHub-Ntgre-ParityRead`.

Actual runtime identities and boundaries match the accepted installed policies. Thirty actual-role positive/negative IAM simulations pass: Read's own secret/service decryption is allowed; Command secret/decryption is denied; foreign secret, wrong encryption context/service/account, direct KMS use, business/unknown/unrelated keys, KMS administration and Cognito administration remain denied. Four runtime-policy Analyzer validations have no ERROR or SECURITY_WARNING findings. These are policy-evaluation results, not new live decryption proof. The accepted nine live cursor checks from 12 October remain historical supporting evidence; no GetSecretValue request to AWS was made here.

Existing Core invocation, runtime permissions, boundaries, KMS conditions and foreign-domain restrictions remain unchanged. The proposed security update changes only exact S3 artifact and TemplateURL bindings, preserving all old references and adding an exact current-template rollback binding. Removing those proposed references reconstructs the accepted security template byte-for-byte as parsed JSON.

## Exact final candidate

| Artifact | SHA-256 |
| --- | --- |
| Candidate | `856a8f54e00c0508a6bac36b01b65e919c7df3298dd4cf363052c7a97c3a4723` |
| Read runtime ZIP | `ab6edf023d4091f87c56de7f4d5520cda580630d5e147e9c49c0a09a135c571e` |
| Product | `caa0a68384990438196ed7720f1a24062641e03220f6092c1b4a2340d2417241` |
| Proposed security — not installable | `3dee5dad57dd229e7d7bf9f6a7024722c88061f646ee5c71b2bd368ef5f7a9d4` |
| Installed Read/unchanged Command ZIP | `da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e` |

`artifact-manifest.json` binds content-addressed templates, ZIP and immutable candidate. No asset was uploaded. The product uses the actual installed CloudFormation desired template, matching the accepted cursor-security template. An initial comparison with the later configuration-repair proposal differed only in whitespace inside serialized CORE_ENVIRONMENT strings; that proposal is not the deployed baseline. The final product preserves the deployed strings exactly, avoiding two unintended environment updates.

Offline expected product change: zero additions, one Read Lambda Code modification, zero deletions or replacements. Environment, role, API, routes, Cognito, tables, alarms and Command properties remain identical. Product/security resources remain 48 + 7. AWS has not generated a change set; conditional replacements and provider behavior must be inspected later. A Code update is expected to put Read through its normal update lifecycle; transient errors are possible. Do not patch configuration directly. Recheck actual environment bytes, code hash, State/LastUpdateStatus and function drift after deployment.

## Mandatory failed deployment gates

The proposed execution boundary is **6,273 characters**, exceeding its 6,144-character managed-policy limit. The execution inline policy is **10,394 characters**, exceeding the role's 10,240-character aggregate inline-policy limit. Access Analyzer additionally reports policy-size warnings (its counting includes a one-character variation); these are genuine installation blockers. Five artifact-access/TemplateURL positive and negative simulations pass, but simulations do not establish that an oversized policy can be installed.

No accepted denial, rollback reference or lifecycle action was removed to make the policy fit. No artifact wildcard was introduced. Before deployment, prepare and separately review a quota-compliant artifact-binding/security representation with equivalent effective permissions and rollback coverage. Splitting inline policies alone does not resolve the aggregate inline-role limit. [AWS IAM quota documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_iam-quotas.html) confirms both fixed limits and that whitespace is excluded. Do not install the proposed oversized security template.

## Validation and preservation

- 45 routed/compiled tests: all four reads, real pagination across three list routes, expiry/tampering/context/actor/team binding, missing/invalid signing material, secret timeout/decryption failure, Core failure, missing/stale epoch, LEGACY_WRITER/FROZEN denial. The compiled entry uses local AWS SDK service endpoints; its real three-second abort path is tested, with exactly one secret request and no retry.
- 349 Team runtime/Core/frontend-contract/isolation/accounting/migration-control regressions passed.
- 47 existing Legacy Team backend regressions passed.
- Four new artifact/security-delta/preservation tests passed.
- TypeScript, migration-ledger reconciliation and temporary-output website build passed. Build retains existing stylesheet-resolution/chunk-size warnings; it is not the release pin and was not published.
- Targeted credential/private-key/JWT scan found no matches. Synthetic test signing material and SDK placeholders are explicitly test-only. No live secret, token or password was collected.
- Fresh preservation inspectors: Legacy 2,621 / FunctionDirectiveStack 167; Team 48 + 7; Core 8 + 5; Tournament 11. Existing runtime hashes, source table/logo/gateway policies, six D1 alarms and detailed metrics remain unchanged. Authority LEGACY_WRITER 3/3; Operational zero business records; Journal one authority row plus 15 historical audits. Source protections and backups remain intact.
- Epoch-5 activation manifest hash `3c4a04c630636d11a3235314c87699aa406b2451fd15a29e1d7be1cd5ba01bdf` and rollback manifest hash `65cf08822ea849bee4fc5b4d7371f50f4a06d8ee6db9fbeb255ad2a93b512a0a` match all 315/462 files. No frontend contract change or activation.

## Separately authorized execution and acceptance

First resolve the two deployment-policy quota gates without changing runtime IAM. Obtain authorization for the resulting exact security artifact bindings and Read-only dark product update; inspect complete AWS change sets before execution. Existing security-owner/operator risk acceptances and multipart amendment remain recorded, but they do not authorize substituting this new runtime into an old maintenance pin. Record a narrow artifact amendment naming the final runtime/product/security hashes after security preparation passes. No new acceptance of the existing S3 risk model is needed.

Future dark deployment must keep LEGACY_WRITER 3/3, the source fence absent and the Legacy frontend active. Rollback enabled: install only approved artifact bindings, then update Read Code. If any deployment gate fails, stop and preserve evidence; do not broaden permissions or retry automatically.

Live acceptance must verify installed Read ZIP, unchanged Command ZIP, complete unchanged environments, roles/boundaries, Active/Successful and IN_SYNC; authenticated authority HTTP 200 at LEGACY_WRITER 3/3; all 16 normal routes HTTP 403; zero business-data changes; D1 logs/metrics and protected-domain preservation. TARGET pagination success cannot be proven on the live non-authoritative runtime by bypassing authority. Use separately approved isolated verification where needed, then retain the real five-persona pagination acceptance during authorized TARGET_WRITER 5/5 maintenance. Require fence proof and source reconciliation before that transition.

FROZEN 4/4, TARGET_WRITER 5/5, epoch-5 frontend activation and subsequent maintenance remain separately gated. No Master publication or Legacy retirement is authorized here.

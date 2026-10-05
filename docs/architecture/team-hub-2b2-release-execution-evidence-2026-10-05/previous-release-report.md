# Team Hub Phase 2B2 read-path Release 1 — security gate blocked

**Subsequent security-only correction review:** [two-state deployment security proposal](team-hub-2b2-deployment-security-correction-2026-10-05.md) preserves this original blocked candidate and product. It corrects the evaluated protected API mutation permissions, but remains uninstalled and blocked on documented IAM simulator coverage. No deployment or AWS write occurred in that review.

## Latest resume: AWS access restored; deployment isolation failed

5 October 2026. **NOT READY. No AWS writes or deployment attempts occurred.** The normal approved outside-sandbox execution path now works with the existing Windows `default` profile. STS verified account `058264289478`, identity `arn:aws:iam::058264289478:user/RavenTest`, UserId `AIDAQ3EGSQDDCJSMJ75N5`; every AWS call explicitly selected `eu-north-1`. No credential recovery, profile change, secret copying or alternative administrator role was used. Earlier approval-service failures are retained below as historical evidence; they were not AWS authentication failures.

The pinned candidate's execution identity policy and execution boundary both allow regional `apigateway:*`. Their explicit existing-API deny covers Tournament `msipnwy39j` and REST APIs, but omits existing LegacyPlatform, staging and production API Gateway v2 resources. Authenticated AWS IAM simulation of these exact policies returned **52 allowed mutation decisions and 4 explicit denies across 56 resource/action cases**. DELETE and PATCH were tested on each of 14 existing APIs and a representative route child path. These were simulations only; no mutation request was sent to API Gateway.

| Protected owner | Actual API IDs | Proposed execution policy + boundary |
| --- | --- | --- |
| Ntgre LegacyPlatform | `jm15a0rmi0`, `f7oxg5hy72`, `oc7oz18v8k` | DELETE/PATCH allowed |
| Production / master | `g9eoo6e1h2`, `w0xfyjn6v7`, `ztevn4upnk` | DELETE/PATCH allowed |
| Staging | `mt6ctit5rf`, `96iei1y9x4`, `n4yh7awecc` | DELETE/PATCH allowed |
| Tournament | `msipnwy39j` | Explicit deny, including child path |

The remaining four inventoried non-Team APIs were also allowed. API ownership comes from live CloudFormation/Amplify tags, not name guesses. See [API inventory](team-hub-2b2-live-evidence-2026-10-05/api-inventory.json), [full simulator response](team-hub-2b2-live-evidence-2026-10-05/protected-api-simulation.json) and [review summary](team-hub-2b2-live-evidence-2026-10-05/security-review-summary.json). Inspect `ResourceSpecificResults`: the aggregate top-level API Gateway result reports an explicit deny because Tournament is among the inputs, but individual protected API paths are allowed. The permissions-boundary decision for those paths is also allowed. This is proposed-policy simulation, not evidence of an installed execution role or a performed mutation.

Access Analyzer validated the four extracted identity/boundary policy documents with **zero findings**. [Analyzer evidence](team-hub-2b2-live-evidence-2026-10-05/access-analyzer.json) does not override the failed isolation assertions. An initial simulator invocation had incorrectly encoded CLI policy-list arguments and returned a request ValidationError; the corrected JSON-list request completed successfully. No candidate policy was changed to obtain this result.

### Fresh baseline and candidate results

- Independent Team product/security stacks, APIs, Lambdas, policies, log groups and alarms were absent in successful read-only inventory responses. Four broadly matching IAM role names belong to existing Amplify master/staging resources, confirmed by their tags; they are not independent Team resources. [Initial inventory](team-hub-2b2-live-evidence-2026-10-05/initial-team-inventory.json), [role ownership](team-hub-2b2-live-evidence-2026-10-05/existing-team-named-roles.json).
- Legacy: `UPDATE_COMPLETE`, **2,621 resources / FunctionDirectiveStack 167**; root timestamp `2026-09-26T11:52:06.391000+00:00` unchanged; all 62 stack template/resource sets, 62 protected identities and five monitored Lambda code/configuration hashes matched. [Fresh comparison](team-hub-2b2-live-evidence-2026-10-05/legacy-after.json).
- Tournament: `UPDATE_COMPLETE`, **11 resources**, API `msipnwy39j`; resource identities, Lambda code/candidate revision, API configuration, invocation permission, runtime role/inline policy and the three recorded managed policies matched. Runtime boundary remains v2. [Fresh comparison](team-hub-2b2-live-evidence-2026-10-05/tournament-baseline.json). The verifier initially compared AWS `RevisionId` with the historical candidate `BUILD_REVISION`; correcting that field mapping resolved the comparison without any AWS or candidate change. RoleLastUsed telemetry is excluded as in the accepted baseline.
- Preserved candidate `d458da9a7a8d1d519aaab05418fda95097a26256da0a297b71c95a5aaef5085f`: **54 source inputs, both templates and both recorded bundle outputs match**. [Pin verification](team-hub-2b2-live-evidence-2026-10-05/pin-verification.json). No HEAD substitution, synthesis or rebuild.
- Accepted selector ran in `describe` mode: Team Hub/Ntgre/READ_PROOF only; no Legacy/Tournament synthesis, schema generation or shared bundling. Offline fail-closed tests remain the historical 47-pass result below; they were not rerun or misrepresented as live IAM validation.

### TEAM HUB SECURITY BOOTSTRAP GATE

AWS identity: `arn:aws:iam::058264289478:user/RavenTest`  
Account: `058264289478`  
Region: `eu-north-1`  
Candidate: `d458da9a7a8d1d519aaab05418fda95097a26256da0a297b71c95a5aaef5085f`  
Security template hash: `fd5aef33eef19e600fbc8e892facff2605c0286cf215156f1b2d34e842e33998`  
Stack: `ProjectRespawn-TeamHub-Ntgre-ReadProofSecurity` — absent  
Change set: not created  
Additions / Modifications / Deletions / Replacements: no AWS-generated plan; local template proposes 4 additions  
Unexpected: failed LegacyPlatform/production API isolation  
Roles: 1 proposed execution role; none installed  
Policies: 3 proposed managed policies and role inline policy; none installed  
Boundaries: preview/runtime and execution; neither installed  
LegacyPlatform mutation: **FAIL — API mutation allowed by proposed execution policies**  
Tournament mutation: API DELETE/PATCH explicitly denied; full suite not completed  
Production: **FAIL — master API mutation allowed by proposed execution policies**  
Cognito / AppSync / DynamoDB / Business S3 / Business KMS / PassRole: pinned definitions retained; remaining live checks not completed after blocking isolation finding  
Positive tests: not completed live  
Negative tests: **FAIL**, protected API cases above  
Access Analyzer: 0 findings across four documents; isolation still fails  
Legacy baseline: PASS, unchanged  
Tournament baseline: PASS, unchanged

**NOT READY**

### Stop and deployment result

Stopped at the live security review, before bootstrap principal authorization, asset publication, security change-set preparation or product change-set preparation. No IAM installation, policy patch, deployment, rollback, retry or endpoint-manifest generation. The product gate cannot be ready. Live Team authentication, Lambda initialization, metrics/logs, runtime role negatives and default-Lambda KMS behavior remain untested. No Team stack exists to test. Frontend cutover remains false; `amplify_outputs.json` is unchanged. Legacy/Tournament were not synthesized, diffed or deployed. Production was read only for inventory and IAM simulation; it was not modified.

The next required work is a separately authorized correction and review of deployment isolation, producing a new pinned candidate. This task explicitly prohibits changing the candidate or IAM to bypass the failed preflight, so no such correction was made.

**TEAM HUB READ-PATH RELEASE 1 FAILED** — security gate failure before deployment; AWS access/authentication succeeded and no CloudFormation operation failed.

## Historical attempt: approval-service failure (preserved)

5 October 2026. **No deployment was attempted. Release 1 is not accepted.** The user authorized conditional security bootstrap and product execution only after successful fresh AWS preflight, baseline refresh and inspected gates. Those conditions have not been established.

## Blocking evidence

`aws sts get-caller-identity --region eu-north-1 --output json --no-cli-pager` returned `NoCredentials: Unable to locate credentials` inside the sandbox. Subsequent existence checks on the standard local AWS configuration paths returned Access Denied. This does **not** establish that the user is signed out or that credentials are absent outside the sandbox. Current AWS identity/account remain unverified. An initial request to authenticate/provide the profile name was sent before this sandbox limitation was established; no credentials or tokens should be supplied in chat.

The same read-only identity check was requested outside the sandbox through the normal approval mechanism. It was **not executed**: automatic approval review failed because its selected model was at capacity. The tool explicitly reported that this was a review failure, not a determination that the action was unsafe. The approval check was not bypassed. Resume by completing the normal approval review for this read-only preflight; do not unnecessarily replace or recreate AWS credentials.

Without authentication, this attempt cannot verify that the product/security stacks and conflicting Team resources are absent, refresh protected identities and Lambda hashes, inventory protected APIs/default KMS key behavior, run Access Analyzer/IAM simulation, identify an approved bootstrap principal, or inspect AWS-generated change sets. No conditional execution gate is ready. Missing credentials are not evidence that a stack does not exist.

## Preserved candidate verified locally

Candidate: `d458da9a7a8d1d519aaab05418fda95097a26256da0a297b71c95a5aaef5085f`.

Product template SHA-256: `0796ee8170bd0417fca6b2806e58e48c18278b4e6c32999824f55ac65898e7ee`.

Security template SHA-256: `fd5aef33eef19e600fbc8e892facff2605c0286cf215156f1b2d34e842e33998`.

Lambda SHA-256: `0e3fde08f1dbf3c1803ff1daac65e902117d757c76506d478112d5291814e7b3`.

Preserved assembly: `infrastructure/domains/team-hub/.build/offline-1791205212119/assembly`.

The manifest revision was recomputed from the recorded mode/input manifest and matched. All 54 source inputs, both templates and all recorded bundle output hashes matched. Product count is 11; separate security count is 4; total proposed setup is 15. Product template contains no DynamoDB, S3 bucket, Cognito or AppSync resources. No fresh synthesis or HEAD substitution occurred. The original [review gate](team-hub-2b2-evidence-2026-10-05/gate.json) and preserved artifacts remain unchanged.

The accepted selector was run in `describe` mode, selecting only Team Hub / Ntgre / READ_PROOF. It did not invoke the displayed synthesis command. Legacy and Tournament were not selected; the recorded preview closure contains only Team preview/auth/contracts and its independent read-proof infrastructure. Fresh read-proof/security and selection tests: **47 passed (29 + 18)**. These remain offline tests, not live effective-policy or authentication evidence.

Both Tournament preservation verifiers pass: original candidate `b75a91494c03606d825e234a65d295c184067820cd77dfc84e11a2c83484ae2f`, 24 source/12 security files exact; accepted runtime boundary v2 and execution policy v8 preserved. This is local file evidence, not a refreshed live AWS baseline.

## TEAM HUB SECURITY BOOTSTRAP GATE

Resources: 4 proposed, 0 created by this attempt.
Roles: 1 proposed CloudFormation execution role.
Policies: 3 proposed managed policies, including the two boundaries and unattached preparation-caller policy; execution policy is inline on its role.
Boundaries: preview runtime and execution boundaries proposed.

Legacy access / Tournament access / Production access / PassRole: local candidate definitions reviewed and offline negatives pass; actual principal/effective policies and protected inventories are unverified. Practical regional API Gateway authority has the residual already recorded in the readiness report and needs fresh AWS review.
Positive tests: offline pass; live pending.
Negative tests: offline pass; live pending.
Access Analyzer: not run, authenticated AWS access unavailable to the sandbox and outside-sandbox approval review failed.

**NOT READY**

Separate security bootstrap is required by this candidate. No bootstrap change set was created or executed. No unrelated administrator identity was used. No permissions were patched.

## Product deployment and runtime

Stack: `ProjectRespawn-TeamHub-Ntgre`; live existence/status unverified.
Change set: none created.
AWS-generated additions/modifications/deletions/replacements: not available.
Proposed product inventory: HTTP API, stage, JWT authorizer, integration, GET preview route, Read Lambda, runtime role, invocation permission, log group and two alarms (11 total).

Authentication results (no token, invalid token, wrong issuer/client, existing valid identity): **not run live**.
Initialization, invocation/error counts, platform/application logs, Lambda/API metrics and alarm states: **not verified live**.
Actual runtime role security negatives: **not run**; no runtime role created by this attempt.
CloudFormation events: none generated by this attempt; no stack operation was initiated.

## Protected baselines and final scope

Legacy historical accepted baseline: 2,621 resources, FunctionDirectiveStack 167, UPDATE_COMPLETE, 62 protected identities and five monitored Lambda hashes. Before/after live counts, timestamps, identities and hashes are **not refreshed or compared in this attempt**.

Tournament historical accepted baseline: UPDATE_COMPLETE, 11 resources, API `msipnwy39j`. Before/after live resource identities, Lambda hash, policy versions and timestamps are **not refreshed or compared in this attempt**.

Legacy synthesis/diff/change set/deployment: none.
Tournament synthesis/change set/deployment: none.
AWS writes, security bootstrap resources, product resources, Team tables, S3 business storage, business mutations, data migration: **zero performed by this attempt**.
Production operations: none.
Endpoint manifest: not generated; successful live acceptance is required first.
`amplify_outputs.json`: unchanged.
Frontend cutover: none.

Resume with authenticated AWS preflight for the exact preserved candidate. Existing conditional deployment authorization remains subject to every stated gate; do not treat this blocked attempt as acceptance or bypass baseline checks. If an authorized execution subsequently fails, allow rollback, collect evidence and stop without permission changes/retries.

**TEAM HUB READ-PATH RELEASE 1 FAILED** — blocked before deployment by sandbox AWS-config access and approval-service failure; no CloudFormation deployment failure or rollback occurred.

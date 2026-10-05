# Phase 2B2 Team Hub deployment security correction

**Subsequent review:** the [first-create final security gate](team-hub-2b2-first-create-security-final-gate-2026-10-05.md) classifies all 280 simulator cases with UNKNOWN = 0 and resolves their use in the API permission review without broadening IAM. The full gate remains blocked by a separately identified real default-Lambda KMS dependency in the unchanged execution policy. Historical findings below remain intact.

5 October 2026. **Security-only correction prepared; gate remains blocked by inconclusive simulator coverage. Nothing installed or deployed.** This follows the [correctly blocked Release 1 gate](team-hub-2b2-read-path-release1-2026-10-05.md). The original candidate and its evidence are preserved unchanged.

## Scope and implementation

The [new security package](../../infrastructure/security/team-hub-Ntgre-deployment-v2/README.md) provides a first-create policy, an exact-API steady-state design, a restricted deployment-caller policy, four-resource CloudFormation security templates, an offline ownership-checked steady-state binding function, read-only inventory/validation tools and six local tests. It does not modify the product source, Lambda, contracts, runtime boundary/identity, original deployment source, Tournament, LegacyPlatform, Cognito, frontend or production. No product synthesis or rebuild occurred.

Both the execution role's inline policy and its managed permissions boundary receive the same API policy. Non-API execution statements remain byte-equivalent JSON structures to the original. First-create has practical regional `apigateway:*`, explicit denies for every inventoried protected API ID, and a fixed cutoff **2026-10-06T13:51:32.179Z**. The deny patterns conservatively match an API ID anywhere after the regional ARN prefix, covering API roots, descendants and encoded/decoded tag paths. The deny also covers GET; protected read access is not needed by this product. REST API paths remain denied. All three managed documents fit the 6,144-character limit: first-create 4,623, steady-state fixture 5,855, caller 2,067.

The deployment caller is designed as the same policy applied to its identity and permissions boundary, not as an extra permissive attachment to RavenTest. It allows only the exact Team product stack, passing its execution role to CloudFormation, and a hash-addressed product-template URL for change-set creation. It denies direct API administration and foreign stack operations. ExecuteChangeSet permission in this proposed document is not authorization to execute anything in this task. The caller remains uninstalled/unattached; a later installation gate must establish its actual principal and effective policy.

## Complete inventory

Authenticated default profile identity: `arn:aws:iam::058264289478:user/RavenTest`; account `058264289478`; region `eu-north-1`. Successful REST and v2 list calls found **14 APIs: 11 HTTP, 3 WebSocket, 0 REST**. No independent Team product/security stacks or suspected Team API were present. Ownership is based on live CloudFormation/Amplify tags and the accepted Tournament ID/tags. [Full inventory, names, types, tags, owners and environments](team-hub-2b2-security-correction-evidence-2026-10-05/inventory.json).

| Classification | Count | Protected IDs |
| --- | ---: | --- |
| LEGACY_PLATFORM (Ntgre) | 3 | `f7oxg5hy72`, `jm15a0rmi0`, `oc7oz18v8k` |
| TOURNAMENT | 1 | `msipnwy39j` |
| PRODUCTION (master) | 3 | `g9eoo6e1h2`, `w0xfyjn6v7`, `ztevn4upnk` |
| OTHER_EXISTING_PROTECTED | 7 | `7sqhe1oq7f`, `96iei1y9x4`, `mt6ctit5rf`, `n4yh7awecc`, `openg7joy6`, `pbbz0ux4ta`, `rwfv75jx2b` |
| UNKNOWN | 0 | None; unknown APIs would be protected by default |
| TEAM_HUB | 0 | None |

## First-create limits and immediate lockdown

Before creation, the policy cannot identify an API that does not exist. API Gateway ARNs omit account IDs; regional authority alone does not distinguish environments. The temporary role could manage APIs created after this inventory and other regional API Gateway service resources. These are residual permissions, not perfect isolation.

Before any separately authorized installation: reverify account, identity, region, stack, exact product template/ZIP and this security manifest; refresh the API inventory and regenerate/review the candidate if any API or ownership changed; avoid concurrent unrelated API provisioning; use the restricted product caller and designated execution role; inspect the complete change set and keep rollback enabled. Do not begin near expiry: allow enough time for deployment, verification, lockdown and rollback. Renewal requires a new reviewed security candidate.

Immediately after the product reaches CREATE_COMPLETE/UPDATE_COMPLETE and its eleven resources and template are verified, **before runtime acceptance or another deployment**, retrieve the physical `HttpApi` ID and actual API name/type. The offline binder requires the exact account/region/stack, eleven resource identities, matching API ownership and the pinned deployed template. It rejects protected IDs and the simulation fixture. A future authorized security custodian must inspect and execute the security-stack transition: two existing resource modifications (execution boundary document and execution-role inline policy), zero additions/deletions/replacements. Read back both policies and rerun tests against the actual ID. No runtime or product modification is involved.

Steady state allows `apigateway:*` only on the exact Team API, its children and exact tag representations. An explicit NotResource deny rejects every other API/control-plane resource, including collection `/apis` creation. No permanent broad API management grant remains. The product role cannot change its own policies/boundary. If binding, lockdown or readback fails, stop; Release 1 cannot be accepted and the bootstrap window must not be silently extended. Fixed expiry is a fallback, not a reason to defer lockdown.

The steady-state template is parameterized because no live Team ID exists. Its fixture policy uses `thproof123` for simulation only. The future bound template will receive a separate exact hash and must be reviewed; it is not an installable endpoint today.

## Validation and unresolved evidence

Six local tests pass: original source/artifact/runtime preservation, unchanged non-API permissions, policy limits/equivalence, invalid/protected input rejection, ownership/template binding and the two-resource lockdown scope.

Authenticated AWS review completed **64 simulation jobs / 1,494 action-resource cases**: **90 positive checks and 1,124 negative checks passed**, with no remaining contradictory decision or missing-context failure among those proven cases. **280 additional cases remain inconclusive and are excluded from the pass counts.** [Validation summary and per-job coverage](team-hub-2b2-security-correction-evidence-2026-10-05/validation.json).

The original failure is corrected for the evaluated API resources: POST/PUT/PATCH/DELETE on every inventoried API root and representative routes, integrations, authorizers and stages are explicitly denied in both states. First-create CreateApi and candidate child lifecycle are allowed. Steady-state own lifecycle is allowed; existing, arbitrary new and similarly prefixed foreign IDs are denied. Expiry and wrong-region controls, forbidden CloudFormation stacks, correct/wrong PassRole, template/role selection, Cognito, AppSync, DynamoDB, business S3 and business KMS cases pass. Tag POST/PUT paths are explicitly denied for protected IDs and allowed for the Team fixture.

The unresolved cases are PATCH/DELETE on tag representations and synthetic REST resource paths. The IAM simulator reports implicitDeny with no matched statements even for a simulation-only unconditional `apigateway:*` / `Resource: *` allow, without any boundary. The [unrestricted-service control request](team-hub-2b2-security-correction-evidence-2026-10-05/diagnostic-unrestricted-service-request.json) and [response](team-hub-2b2-security-correction-evidence-2026-10-05/diagnostic-unrestricted-service-response.json) establish that the simulator does not distinguish the policy effect in these cases. A [single-tag diagnostic](team-hub-2b2-security-correction-evidence-2026-10-05/diagnostic-single-tag-response.json) confirms this is not resolved by splitting the resource batch. The control was never installed and is not part of the deployable policy package.

Do not label those implicit denials proof of our explicit deny or treat the positive tag cases as passing. AWS's [v2 authorization reference](https://docs.aws.amazon.com/service-authorization/latest/reference/list_apigatewayv2.html), [management resource reference](https://docs.aws.amazon.com/service-authorization/latest/reference/list_apigateway.html) and [tagging API](https://docs.aws.amazon.com/apigatewayv2/latest/api-reference/tags-resource-arn.html) were reviewed; they do not resolve the observed simulator discrepancy. The original mixed-resource results are retained under the evidence `initial/` directory and `validation-initial-mixed-resources.json`. Two initial caller negatives also lacked the simulator's requested PassRole service context; supplying that context resolved them without changing policies.

Access Analyzer returned **zero findings** for first-create execution, steady-state execution and caller documents (execution identities and boundaries are identical copies). Thus errors, security warnings and invalid-action findings are all zero. [Analyzer responses](team-hub-2b2-security-correction-evidence-2026-10-05/analyzer.json). This does not close the simulation gap. Policy application/live probing is prohibited in this task, so no write was used to investigate it. Closure requires authoritative resolution of the affected authorization paths or separately authorized live validation; no broader IAM grant was added to satisfy a simulator.

## PHASE 2B2 TEAM HUB DEPLOYMENT SECURITY CORRECTION GATE

Existing API inventory: complete authenticated REST/v2 inventory  
Total APIs: 14  
Legacy: 3  
Tournament: 1  
Production: 3  
Other protected: 7  
Unknown: 0  
Protected API IDs: all 14 listed above

FIRST-CREATE POLICY  
CreateApi: ALLOW, simulated  
Child lifecycle: ALLOW on API resources; tag PATCH/DELETE unresolved  
Tournament PATCH / DELETE: explicit DENY on API/children  
Legacy PATCH / DELETE: explicit DENY on every API/children  
Production PATCH / DELETE: explicit DENY on every API/children  
Other-existing PATCH / DELETE: explicit DENY on every API/children  
Legacy CloudFormation: DENY, including representative nested stack  
Tournament CloudFormation: DENY  
Production CloudFormation: DENY  
PassRole: correct role/service ALLOW; wrong role/service DENY  
Cognito / AppSync / DynamoDB / Business S3 / Business KMS: DENY  
Residual first-create authority: unlisted/new API and regional service management until lockdown/expiry  
Mitigations: protected IDs, fixed expiry, exact target/artifacts/role/caller, refreshed inventory, inspected change set, rollback, immediate lockdown

STEADY-STATE POLICY  
Team Hub exact API: fixture lifecycle ALLOW; actual ID binding required, tag PATCH/DELETE unresolved  
Other APIs: explicit DENY on evaluated API paths; tag simulation caveat above  
CreateApi: explicit DENY  
Lockdown trigger: successful product creation and ownership/template verification, before runtime acceptance

VALIDATION  
Positive simulations: 90 PASS  
Negative simulations: 1,124 PASS  
Access Analyzer: zero findings  
Local tests: 6 PASS  
Unresolved: 280 simulator cases; not counted as passed and not overridden by Analyzer

CANDIDATES  
Product candidate changed: NO; all 54 source inputs and preserved artifacts match  
Product revision: `d458da9a7a8d1d519aaab05418fda95097a26256da0a297b71c95a5aaef5085f`  
Product template SHA-256: `0796ee8170bd0417fca6b2806e58e48c18278b4e6c32999824f55ac65898e7ee`  
Security candidate changed: YES, separate successor  
New security revision: `7e3f27a0191d5039f3035a4fddd0e14f10eb9c56fd41a8a13092ca5b4d14768b`  
First-create security template SHA-256: `757cc602fcf8388e440fb310bc0a312d702c52aa00a8ac0348ab93ed6c1ddf8b`  
Parameterized steady-state security template SHA-256: `bd1a70ee1df8312fe6d49af4c27c6fd06f11acec23a8ac448bf7c78e37b3e66f`  
[Full manifest](team-hub-2b2-security-correction-evidence-2026-10-05/manifest.json)  
AWS changes made: NONE; no policy application, security stack, change set, product deployment, asset publication or production mutation

**TEAM HUB DEPLOYMENT SECURITY REMAINS BLOCKED**

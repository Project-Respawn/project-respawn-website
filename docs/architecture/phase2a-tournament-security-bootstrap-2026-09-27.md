# Phase 2A Tournament security bootstrap — 2026-09-27

PHASE 2A SECURITY BOOTSTRAP SUCCESSFUL — READY FOR TOURNAMENT RELEASE 1 AUTHORIZATION

The authorized security-only bootstrap completed. Exactly two IAM roles and three managed policies were created. Tournament product infrastructure remains absent. Production was not modified. The authoritative design remains [the final boundary report](phase2a-tournament-deployment-boundary-final-2026-09-26.md); historical V1/V2/V3 proposals were not used.

## Target and execution

- Account: `058264289478`; region: `eu-north-1`.
- Caller: `arn:aws:iam::058264289478:user/RavenTest`.
- Security stack: `arn:aws:cloudformation:eu-north-1:058264289478:stack/ProjectRespawn-Tournaments-Ntgre-SecurityBootstrap/d582ba00-ba8f-11f1-b648-06e6638e0ecd`.
- Executed change set: `arn:aws:cloudformation:eu-north-1:058264289478:changeSet/ntgre-tournaments-security-final-20260926/5be68405-e12c-4e62-8e29-9c256694a1af`.
- Reviewed AWS plan: 5 additions, 0 modifications, 0 deletions, 0 replacements; no nested or product resources.
- Execution gate was printed before execution, under the user’s explicit conditional authorization. Execution token: `ntgre-security-bootstrap-20260927-approved`.
- Result: `CREATE_COMPLETE`. `OnStackFailure=ROLLBACK`; final `DisableRollback=false`. ExecuteChangeSet did not override rollback.
- Only the security change-set preparation and execution performed AWS writes. No artifact upload, product synthesis/deployment, CI change, or existing application modification occurred.

## Exact created resources

| Logical ID | Type | ARN |
| --- | --- | --- |
| DeploymentPolicy | AWS::IAM::ManagedPolicy | `arn:aws:iam::058264289478:policy/ProjectRespawn-Tournaments-Ntgre-DeployBoundary` |
| DeploymentRole | AWS::IAM::Role | `arn:aws:iam::058264289478:role/ProjectRespawn-Tournaments-Ntgre-Deploy` |
| ExecutionPolicy | AWS::IAM::ManagedPolicy | `arn:aws:iam::058264289478:policy/ProjectRespawn-Tournaments-Ntgre-ExecutionBoundary` |
| ExecutionRole | AWS::IAM::Role | `arn:aws:iam::058264289478:role/ProjectRespawn-Tournaments-Ntgre-CfnExecution` |
| RuntimeBoundary | AWS::IAM::ManagedPolicy | `arn:aws:iam::058264289478:policy/ProjectRespawn-Tournaments-Ntgre-RuntimeBoundary` |

Unexpected resources: 0. All five report CREATE_COMPLETE. The security root is CloudFormation orchestration metadata for this approved five-resource template.

## Artifacts, live documents and trust

The 12 final security files and all 42 preserved candidate files matched their approved byte hashes before preparation. No pinned file was edited. AWS’s prepared template matched the pinned template. Bootstrap template SHA-256: `cc67fc28cedd065e71c323918565b5efbdb89d490801ecd11366943f22b8f156`; request SHA-256: `2bcfb69836be73e0225dcb6e0119ed3cbfee9b3375037cc364f1d79b8c680e1d`.

AWS returns policy JSON with different formatting/key order. The following SHA-256 values canonicalize object keys, retaining array order; live and pinned content match exactly. Original file-byte hashes are retained in the artifact evidence.

| Managed policy | Live and pinned canonical SHA-256 |
| --- | --- |
| deployment | `05c99e00c22c94faa2d15818f7dd1afaf00816347fd79dcf3dd9c0927e84060a` |
| bootstrap | `f6f5f96076b434c3dcf496968a91fd2d1f9415071df56baa58e1fe4845fb9502` |
| runtime | `38302675116f29b6857f6baf5f2246c3ba7ae609e7cc816d0ffba91de8af8e6d` |

Deploy trust is exactly `{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::058264289478:user/RavenTest"},"Action":"sts:AssumeRole"}]}`.

Execution trust is exactly `{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"cloudformation.amazonaws.com"},"Action":"sts:AssumeRole"}]}`.

Both roles use path `/`, 3600-second maximum sessions, their sole respective managed policy as both identity policy and permissions boundary, and no inline policies. Each managed policy has only v1. DeployBoundary attaches only to Deploy; ExecutionBoundary only to CfnExecution; RuntimeBoundary remains unattached because the future product runtime role does not exist.

## Permissions and verification

Access Analyzer: zero findings across all eight approved policy/trust documents. Refreshed reference matrix: **167/167 positive, 196/196 negative**, zero unexplained denials.

Post-creation verification distinguishes live principals from future policies:

| Evaluation | Positive PASS | Negative PASS | Failures |
| --- | ---: | ---: | ---: |
| live-principal | 89 | 120 | 0 |
| prospective-steady-policy | 76 | 44 | 0 |
| live-runtime-boundary-document | 2 | 32 | 0 |
| Required steady-state operations against installed execution principal (additional check) | 76/76 | — | 0 |

Live-principal simulations used the actual role ARN and its attached policies/boundary, without supplied identity-policy or boundary overrides. Runtime tests evaluated the fetched live boundary document; no runtime role was created. The prospective steady fixture is not installed and is not represented as a deployed exact-API-ID policy. All 76 required steady-state positive operations also passed against the actual installed bootstrap execution role. Simulation does not prove a future CloudFormation service call or product deployment will succeed; no dummy resources or destructive test calls were used.

Deploy can target only its reviewed Tournament CloudFormation workflow and pass only CfnExecution to CloudFormation. The execution role is limited to approved Tournament resources and exact candidate artifact reads. AdministratorAccess and PowerUserAccess are absent. Tests deny LegacyPlatform/production stack mutation, arbitrary stack targeting, other-role PassRole, Cognito mutation, AppSync, DynamoDB, existing business S3/KMS, unrelated IAM/Lambda/alarm/log-group mutation, and broad Logs resource-policy/log-delivery administration. Required CDK asset reads are the documented S3 exception; read-only discovery does not confer business-resource mutation.

The disclosed first-create API child wildcard is still the approved temporary bootstrap policy, with the exact 13-existing-API deny inventory reconfirmed. It is not universal isolation from every future concurrently created API. All execution operations expire at **2026-09-27T23:59:00Z**. No expiry extension or policy redesign was made. API Gateway request-level access logging remains deferred.

## LegacyPlatform and product state

| Check | Before | After |
| --- | --- | --- |
| Total resources | 2621 | 2621 |
| FunctionDirectiveStack | 167 | 167 |
| Root status | UPDATE_COMPLETE | UPDATE_COMPLETE |
| Root last update | 2026-09-26T11:52:06.391000+00:00 | 2026-09-26T11:52:06.391000+00:00 |
| Stack/template identities | 62 | 62 unchanged |
| Protected resource identities | 62 | 62 unchanged |
| Monitored Lambda code/configuration hashes | 5 | 5 unchanged |
| Cognito contract and local outputs | Preserved | Unchanged |
| Tournament product root | Absent | Absent |

Legacy root: `amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332`. Before/after equality passed for root metadata, all stack/template/resource identities, protected resources, monitored Lambda hashes and core identity. Production touched: No. No product Lambda, API, log groups or alarms were created by this stack.

## Next Release 1 procedure — not executed

1. Obtain separate Tournament Release 1 authorization. Refresh account, identity, region, unchanged LegacyPlatform baseline, product absence, live security policies, API inventory and expiry immediately before deployment.
2. Preserve candidate revision `b75a91494c03606d825e234a65d295c184067820cd77dfc84e11a2c83484ae2f`, template SHA `b9be81faba86a3a8e1949cca1c802720a7bf557cc74cd6cb7f5ee17423c35705`, and 11-resource design. Publish only the preserved exact artifacts when authorized; do not synthesize from HEAD.
3. Prepare and inspect the product change set through Deploy, explicitly selecting CfnExecution. Require exactly 11 additions and no protected-resource effects, with rollback enabled.
4. Execute only under that separate authorization. After the actual API ID exists, perform the separately authorized reviewed security update to bind API child scope to that exact ID. Never install the literal `tournamentfixture` policy.
5. Complete product verification and preserve evidence. Release 2 and rollback proof remain later reviewed work.

Remaining blocker: separate Release 1 authorization and a fresh passing deployment gate. The current bootstrap execution window expires at 23:59 UTC on 27 September; an expired window requires a separately reviewed/authorized correction, not an automatic extension. Product execution and exact-ID lockdown are not claimed complete.

## Evidence

- [artifact-verification](phase2a-tournament-security-bootstrap-evidence-2026-09-27/artifact-verification.json)
- [identity](phase2a-tournament-security-bootstrap-evidence-2026-09-27/identity.json)
- [name-preflight](phase2a-tournament-security-bootstrap-evidence-2026-09-27/name-preflight.json)
- [existing-apis](phase2a-tournament-security-bootstrap-evidence-2026-09-27/existing-apis.json)
- [change-set](phase2a-tournament-security-bootstrap-evidence-2026-09-27/change-set.json)
- [change-set-template](phase2a-tournament-security-bootstrap-evidence-2026-09-27/change-set-template.json)
- [security-stack](phase2a-tournament-security-bootstrap-evidence-2026-09-27/security-stack.json)
- [security-resources](phase2a-tournament-security-bootstrap-evidence-2026-09-27/security-resources.json)
- [security-events](phase2a-tournament-security-bootstrap-evidence-2026-09-27/security-events.json)
- [access-analyzer-validation](phase2a-tournament-security-bootstrap-evidence-2026-09-27/access-analyzer-validation.json)
- [iam-simulation-results](phase2a-tournament-security-bootstrap-evidence-2026-09-27/iam-simulation-results.json)
- [live-document-verification](phase2a-tournament-security-bootstrap-evidence-2026-09-27/live-document-verification.json)
- [live-simulation-results](phase2a-tournament-security-bootstrap-evidence-2026-09-27/live-simulation-results.json)
- [live-steady-capabilities](phase2a-tournament-security-bootstrap-evidence-2026-09-27/live-steady-capabilities.json)
- [legacy-before](phase2a-tournament-security-bootstrap-evidence-2026-09-27/legacy-before.json)
- [legacy-after](phase2a-tournament-security-bootstrap-evidence-2026-09-27/legacy-after.json)
- [product-absence-after](phase2a-tournament-security-bootstrap-evidence-2026-09-27/product-absence-after.json)

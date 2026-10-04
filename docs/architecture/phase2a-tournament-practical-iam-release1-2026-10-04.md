# Phase 2A practical IAM / Tournament Release 1 — 4 October 2026

**PHASE 2A RELEASE 1 FAILED. Automatic rollback completed. No IAM patch or deployment retry followed the resource failure.**

The practical execution policy was installed and the inspected Tournament UPDATE was executed under the user's explicit conditional authorization. The new blanket `kms:*` explicit deny was too broad: it blocked Lambda's default environment-variable encryption. This was a defect in the new execution-policy design, not a change to the pinned product candidate. The policy gate's simulations did not cover this service dependency. The installed policy is retained, but is **not ready for another deployment**.

Tournament is safely back to one original empty API. LegacyPlatform's full before/after comparison passes. No live authenticated preview, observability acceptance, active endpoint-manifest publication, frontend cutover, Release 2 or Founder's Cup B1 work was performed.

## Architecture decision delivered

[Domain deployment/runtime security standard](domain-deployment-runtime-security.md) records the approved distinction: strict runtime/data isolation, practical service-level deployment execution permissions, mandatory LegacyPlatform/production safeguards, one shared identity authority per environment, and independent product roots. The [Phase 2 plan](phase2-domain-decomposition-plan.md) links this standard. Future domains' IAM roles were not implemented.

The authoritative September website audit, Phase 2 decomposition plan, v8 authorization report, September 29 failed Release 1 report, September 28 API-import success report and September 27 security-bootstrap report informed this work. Historical reports and preserved artifacts were not rewritten to imply success.

## Target, immutable inputs and authorization

- AWS account: `058264289478`; region: `eu-north-1`.
- Supervising identity: `arn:aws:iam::058264289478:user/RavenTest`.
- Product stack: `arn:aws:cloudformation:eu-north-1:058264289478:stack/ProjectRespawn-Tournaments-Ntgre/0bbf8810-bb52-11f1-8464-0ad1b20dfcbd`.
- Candidate SHA: `b75a91494c03606d825e234a65d295c184067820cd77dfc84e11a2c83484ae2f`.
- Product template SHA: `b9be81faba86a3a8e1949cca1c802720a7bf557cc74cd6cb7f5ee17423c35705`.
- Published ZIP key: `004def9c2189ea71a43cc3a05a796073327c0a084a7d896d0d6ee19aa8e54199.zip`; byte SHA: `813c9fc380baab07aa60f4f4c782db9955bb669432d60d8ec0f735a79e83929a`.

All 42 preserved files were checked against the preservation manifest. The checkpoint verifier confirmed all 24 approved source files and 12 original security files remain exact. Both existing S3 objects matched their approved byte hashes. There was no new synthesis, Lambda bundling, asset upload, current-HEAD substitution or alteration to `amplify_outputs.json`.

The normal sandbox could not see the Windows AWS profile; read-only verification through the normal user context successfully identified RavenTest. No credentials were requested, printed or saved. Restricted Deploy-role credentials for change-set operations existed only in process memory.

Evidence: [preflight and published object hashes](phase2a-tournament-practical-iam-evidence-2026-10-04/preflight.json), [restricted deployment identity](phase2a-tournament-practical-iam-evidence-2026-10-04/deployment-identity.json).

## Practical policy and validation

Conceptual v10 was installed as **IAM VersionId v7**, the next AWS-assigned version, on `ProjectRespawn-Tournaments-Ntgre-ExecutionBoundary`. This is distinct from the earlier uninstalled diagnostic called v7. The managed policy remains both the execution role's sole identity policy and its permissions boundary. Installation readback was semantically identical to [the local document](tournament-release1-checkpoint-history/tournaments-Ntgre-practical/execution-policy.json). No DeployBoundary, RuntimeBoundary, trust-policy, other-domain role or business-resource permission was changed.

The policy grants regional `apigateway:*` on `*`, with explicit denies for all 13 current other API IDs and REST API paths. Lambda, IAM runtime-role, logs and alarm lifecycle permissions retain Tournament naming scopes. It preserves exact two-object S3 reads and bootstrap-version SSM access. PassRole is restricted to bounded Tournament PreviewRole names and Lambda. It explicitly denies CFN operations from the execution role, Cognito, AppSync, DynamoDB, KMS, Secrets Manager, unrelated compute/event services, business S3, wrong PassRole, boundary replacement/removal, managed-policy escalation and Logs resource-policy/log-delivery administration.

The unchanged Deploy role only accepts the Tournament stack, the pinned template URL and designated execution role. The practical API grant does not guarantee isolation from every future API or account-level mapping in this account. This limit is explicit; account/region checks, artifact hashing, stack allowlisting and complete change-set review supplement IAM. Runtime remains logs-only. No AdministratorAccess or PowerUserAccess was used.

| Validation | Result |
|---|---|
| Access Analyzer, execution/runtime/deployment documents | Zero findings; zero ERROR; zero INVALID_ACTION |
| Positive simulation assertions | 153: 139 raw allows, 14 raw denials |
| Independent checks for those 14 discrepancies | 42/42 inclusion and sensitive-control checks pass; raw denials retained |
| Negative assertions | 119/119 pass, including runtime with broad identity-policy control |
| Tournament / dependency isolation | 26/26 pass in the preserved final-candidate worktree |
| Resource accounting / isolation | 41/41 pass |
| Candidate checkpoint | 24 sources / 12 original security files exact; 11 product resources |
| Script syntax / diff whitespace | Pass |
| Actual deployment lifecycle | **FAIL: unmodelled Lambda default-key encryption dependency** |

The initial workspace Tournament test invocation lacked isolated dependencies. The preserved candidate worktree was available; its sandboxed esbuild guard first hit filesystem access denial. Running the unchanged suite with normal filesystem access passed all 26 tests. No fresh candidate synthesis was used. Locked isolated dependencies were also restored without lifecycle scripts. The initial IAM harness used an invalid concrete `fixture` resource for a resource-unscoped discovery action; the corrected run uses `*`. Initial results are preserved.

The independent Analyzer checks establish policy inclusion, not live service authorization. The policy gate was printed as READY before installation based on these scoped tests; the subsequent KMS failure supersedes that readiness for any future attempt. Do not interpret the test counts as complete service-dependency coverage.

Evidence: [policy gate](phase2a-tournament-practical-iam-evidence-2026-10-04/policy-gate.json), [Analyzer](phase2a-tournament-practical-iam-evidence-2026-10-04/access-analyzer.json), [raw simulations](phase2a-tournament-practical-iam-evidence-2026-10-04/policy-simulations.json), [independent controls](phase2a-tournament-practical-iam-evidence-2026-10-04/independent-policy-checks.json), [installed readback](phase2a-tournament-practical-iam-evidence-2026-10-04/security-installed.json).

## Inspected UPDATE and single execution

Change set: `arn:aws:cloudformation:eu-north-1:058264289478:changeSet/ntgre-tournaments-release1-practical-20261004/bf3b3cd2-e132-4fe6-bd99-ecfdb0344526`.

AWS status before execution was CREATE_COMPLETE / AVAILABLE. Every page and the AWS-held template were retrieved and reconciled. The exact template matched the preserved candidate.

| Changes | Reviewed count |
|---|---:|
| Additions | 10 |
| Modifications | 1 |
| Deletions | 0 |
| Replacements, including conditional | 0 |
| Unexpected | 0 |

The one API modification removed explicit Delete/Delete lifecycle attributes, leaving equivalent default behavior. Properties and physical API ID `msipnwy39j` were unchanged; AWS reported static evaluation, RequiresRecreation=Never and Replacement=False. Additions were precisely DefaultStage, JwtAuthorizer, PreviewIntegration, PreviewRoute, PreviewFunction, PreviewRole, HttpInvoke, PreviewLogs, PreviewErrors and HttpErrors. No nested stacks, business state, Cognito, AppSync, DynamoDB, business S3, KMS resources or API access logging were present.

The required execution gate was printed. The restricted Deploy role submitted this one inspected change set with **DisableRollback=false** and fixed request token `ntgre-tournaments-release1-practical-20261004-execute`. No recovery mutation was needed before preparation. No retry or permission patch followed failure.

Evidence: [request](phase2a-tournament-practical-iam-evidence-2026-10-04/change-set-request.json), [all AWS pages](phase2a-tournament-practical-iam-evidence-2026-10-04/change-set-pages.json), [reconciliation](phase2a-tournament-practical-iam-evidence-2026-10-04/change-set-inspection.json), [execution gate](phase2a-tournament-practical-iam-evidence-2026-10-04/execution-gate.json), [rollback-enabled execution request](phase2a-tournament-practical-iam-evidence-2026-10-04/execute-request.json).

## Failure and rollback

At `2026-10-04T13:11:59.263000+00:00`, PreviewFunction CREATE_FAILED. Lambda reported `kms:Encrypt` denied by an explicit identity-policy deny in ExecutionBoundary for:

`arn:aws:kms:eu-north-1:058264289478:key/13ae83f9-bc5f-4486-a013-e07b9d7d52e7`.

Request ID: `d5891c40-4e37-442c-9f8a-af107c340d9d`. Principal: `arn:aws:sts::058264289478:assumed-role/ProjectRespawn-Tournaments-Ntgre-CfnExecution/AWSCloudFormation`.

Read-only DescribeKey confirms KeyManager=AWS and description “Default key that protects my Lambda functions when no other key is defined”. No key configuration, grant, encrypt/decrypt test or KMS permission modification was performed. AWS documents default Lambda environment encryption using an AWS-managed key; the explicit deny introduced here blocked that path. This is not evidence that broad business-key access or decrypt permission is necessary. [AWS Lambda encryption documentation](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars-encryption.html).

The blanket deny conflated business KMS protection with Lambda's service-managed encryption. Any future correction must separately review the service-mediated default-key dependency while preserving business-key and runtime isolation; **no correction was installed in this task**. The API Gateway inline Stage/tagging issue remains unproved because Stage creation was not reached.

| Resource | This attempt | Final presence |
|---|---|---|
| HttpApi | Preserved | Original `msipnwy39j` |
| JwtAuthorizer | Created, rolled back | Absent |
| PreviewLogs | Created, rolled back | Absent |
| PreviewRole | Created, rolled back | Absent |
| HttpErrors | Created, rolled back | Absent |
| PreviewFunction | Create failed, cleanup completed | Absent |
| DefaultStage / PreviewIntegration / PreviewRoute / HttpInvoke / PreviewErrors | Not created | Absent |

Final root: **UPDATE_ROLLBACK_COMPLETE**, rollback enabled, one resource. Original import template restored exactly. API drift: **IN_SYNC**; zero stages, routes, integrations, authorizers, deployments and mappings. No Tournament Lambda, runtime role, log group or alarm remains. ExecutionBoundary **v7 remains installed**; automatic product rollback does not roll back that separately installed policy. DeployBoundary and RuntimeBoundary remain unchanged. The historical SecurityBootstrap template must not be blindly reapplied over the installed policy.

Evidence: [complete CFN events](phase2a-tournament-practical-iam-evidence-2026-10-04/events.json), [attempt-only resource outcomes](phase2a-tournament-practical-iam-evidence-2026-10-04/attempt-resource-results.json), [failure key metadata](phase2a-tournament-practical-iam-evidence-2026-10-04/failure-key-metadata.json), [final rollback proof](phase2a-tournament-practical-iam-evidence-2026-10-04/rollback-proof.json).

## Legacy isolation, localhost and remaining proof

| Check | Before | After |
|---|---|---|
| Legacy resources | 2,621 | 2,621 |
| FunctionDirectiveStack | 167 | 167 |
| Status | UPDATE_COMPLETE | UPDATE_COMPLETE |
| Root timestamp | 2026-09-26T11:52:06.391000+00:00 | Unchanged |
| Stack template/resource identity sets | 62 | Identical |
| Protected resource identities | 62 | Identical |
| Monitored Lambda code/configuration hashes | 5 | Identical |
| Core identity / local outputs hash | Recorded | Identical |

The full before/after comparison passed. LegacyPlatform synthesized: No; diffed: No; change set: No; deployed: No. Production modified: No. API inventory metadata was read to construct protective denies; production was not a write target. No business data was accessed by Tournament runtime.

`npm run dev` passed Ntgre output validation and the Amplify contract check (24 queries, 55 mutations, 62 frontend operations, zero missing), then started Vite at localhost:5174. Subsequent browser-console warnings said Amplify was not configured; these were recorded as an observation, not investigated or treated as a successful authenticated workflow. No application changes were made to address them.

No-token, invalid-token, wrong-issuer/client and valid-identity live tests: **not performed**, because deployment failed and no Stage/route exists. Preview response, Lambda logs/metrics and two-alarm acceptance: **not available** after rollback. The prepared local verification helpers were not run. No active domain endpoint manifest was generated; no frontend cutover or `amplify_outputs.json` edit occurred. No credentials or tokens were committed or saved, and no commit/push was requested or performed.

Evidence: [before](phase2a-tournament-practical-iam-evidence-2026-10-04/legacy-before.json), [after equality proof](phase2a-tournament-practical-iam-evidence-2026-10-04/legacy-after.json).

Release 1 and live acceptance remain incomplete. The later Phase 2A proofs remain blocked:

1. Tournament-only Release 2.
2. Independent rollback to Release 1.

**PHASE 2A RELEASE 1 FAILED**

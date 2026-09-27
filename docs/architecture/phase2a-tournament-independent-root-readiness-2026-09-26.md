# Phase 2A Tournament independent root — implementation readiness

26 September 2026. **Local implementation, tests and isolated synthesis complete. No AWS resource was created or deployed.** Phase 1 remains complete; Phase 2 planning is complete; this is the first Phase 2 implementation gate, not completion of the live deployment proof.

## Candidate and authorization

Detached worktree: `.codex-worktrees/phase2a-tournaments-20260926`, based on commit `9cacb3bdc53ad2511ef1c8baa6dd1f4dfa71a633`. Implementation is uncommitted, isolated new files; no unrelated dirty workspace files were copied into it.

Candidate source-manifest SHA-256 / deployment revision:

`ea2eb10eca11b58fdd8713e322c3c00c3402c8a9a4bbd789af240b9950221f1f`

Template SHA-256:

`c3bd3b863541ece554592b9d68df2c4b9d9ea512ddc94e3622554babf4309f6c`

Isolation receipt SHA-256:

`6230fb03a4617811da652f4de0c0d28ecd531061cdf7ddb2869cc13fa52e004b`

The user authorized local implementation, testing, Tournament-only synthesis and read-only AWS verification. No asset upload, bootstrap, change-set creation, deployment, hosted pipeline modification or existing-resource mutation occurred. `domain:deploy` is a local review-manifest command at this gate, with no AWS invocation and no execution option. This document does not authorize enabling execution.

## Architecture and implementation

Tournaments / preview owns this public, non-sensitive fixture endpoint. It has no authoritative business records or writers. The independent product root is justified by the approved domain release-isolation proof; subsequent Tournament modules can remain in this product boundary. There is no new stack per page.

Paths below are relative to the candidate worktree:

| Path | Role |
| --- | --- |
| `infrastructure/domains/tournaments/app.ts` | Independent CDK app; instantiates exactly one `ProjectRespawn-Tournaments-Ntgre` root |
| `infrastructure/domains/tournaments/stack.ts` | Explicit L1 resources, scoped IAM, JWT, logs and alarms |
| `infrastructure/domains/tournaments/{package.json,package-lock.json,tsconfig.json}` | Separate pinned install, typecheck and toolchain |
| `domains/tournaments/preview/{handler.ts,contract.ts,fixture.json}` | Authenticated, stateless, versioned fixture response |
| `domains/tournaments/client.ts` | Future lazy client factory with no Amplify/global initialization |
| `contracts/{environment-v1,tournament-preview-v1}.schema.json` | Versioned Core identity and preview schemas |
| `config/environments/Ntgre.core.json` | Approved public identity/provenance snapshot |
| `scripts/config/domain-build-inputs.json` | Domain paths, shared-contract selection and exact Core snapshot pin |
| `scripts/domains/{select,plan,deploy,compose-config}.mjs` | Explicit domain tooling; AWS execution disabled |
| `scripts/domains/{lib.mjs,trace.cjs,tests/proof.test.mjs}` | Fail-closed target/import/pin guards, library tracing and tests |

No `backend.createStack()`, `NestedStack`, `defineData`, shared generated client/schema, CloudFormation imports/exports or other product infrastructure is used. No existing frontend, `amplify/**`, root package/lock, `amplify.yml`, outputs or shared resource-debt receipt was changed. Normal frontend development behavior is unchanged by this candidate.

The existing UI's much larger frontend fixture model is deliberately left intact. The new small versioned preview DTO is a future adapter seam, not a migration of those pages. The client factory accepts its own validated endpoint and access-token callback, performs no request until `preview()` is called, and does not initialize other domains.

## Identity and request contract

Account `058264289478`; region `eu-north-1`; environment `Ntgre`. Read-only verification identity: `arn:aws:iam::058264289478:user/RavenTest`.

Existing pool `eu-north-1_n24iLL7QE`; public client `1iq7ovjaf7d16imdvbqgfgvf86`; issuer `https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_n24iLL7QE`. These values were generated from the verified local `amplify_outputs.json` and checked against AWS, including the existing public client. They were not taken from production or guessed. The source outputs SHA-256 is `c1426527f9ee674325f02bea05b5e7b407c1fdbe1238f46434a67b03456d8a92`; the derived Core contract SHA-256 is `9bea68ab5781eeb7265c363fd6baac78d1e3e032196f9aa209bc3780644a6b9e`.

The Core contract records source, source hash, Legacy root ARN, auth-stack ARN, verifier and time. Commands validate the fixed account/region/environment, issuer/pool/client structure, provenance and exact reviewed bytes. A changed Core contract requires review and a new pin. Production, stack overrides, extra flags and conflicting AWS target environment variables fail closed. No Cognito resource is created, imported as an owned construct or modified.

Only `GET /v1/tournaments/preview` exists as a business route. API Gateway JWT verification uses the existing issuer/client. The handler additionally requires the trusted authorizer context, own API ID, access-token type, expected client, subject and expiry. Bodies/query parameters cannot supply identity and are rejected. An access token is required; an ID token does not satisfy the handler. Responses are marked `preview:true`, `nonProduction:true`, `registrationEnabled:false`, `environment:Ntgre`, and `contractVersion:tournament-preview.v1`, with the candidate revision. No subject/token is echoed. See [AWS HTTP API JWT verification](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html).

Tests use trusted-context fixtures; they do **not** claim cryptographic JWT verification or a successful live authenticated request. Those require the deployed API and a valid existing Ntgre test-user token at a later gate.

The separate generated `domain-endpoints.Ntgre.json` identifies owner, environment, account, region, intended stack, auth mode, contract, revision and provenance. It correctly has `PLANNED_NOT_DEPLOYED`, null endpoint/stack ARN and `liveVerified:false`. The client refuses it. Future deployed configuration must come from verified root outputs. No fake Amplify entry or global reconfiguration exists. CORS currently permits localhost:5174 only; any hosted frontend origin needs a later reviewed change.

## Actual synthesis and dependency evidence

The final build/typecheck/synthesis completed in 7,114 ms on Node 24.14.1; Lambda bundle target/runtime is Node 22, ARM64. No speedup claim is made. The isolated package pins CDK library 2.260.0, constructs 10.6.0, CDK CLI 2.1137.0, esbuild 0.28.0, TypeScript 6.0.3, Node types 25.9.1 and Ajv 8.17.1. Installation used `--ignore-scripts`; no root install was run.

The receipt contains 24 source/build/config inputs, 272 actual loaded library files with hashes, 16 generated files with hashes, resource identities and the exact package lock. Actual infrastructure/runtime esbuild source closure is:

```
domains/tournaments/preview/contract.ts
domains/tournaments/preview/fixture.json
domains/tournaments/preview/handler.ts
infrastructure/domains/tournaments/app.ts
infrastructure/domains/tournaments/stack.ts
```

Configuration/schema/tooling inputs are separately recorded; the client has its own metafile. CDK library tracing resolves exclusively inside the isolated Tournament package plus the generated app. Dependency resolution must not fall back to parent `node_modules`. Explicit local package scopes and esbuild configuration avoid dependence on root application settings. Node built-ins are toolchain primitives, not repository dependencies.

The runtime bundle has **zero external imports**. Its zip contains exactly `index.js` and its CommonJS `package.json`. One runtime zip and one root template are the only deployment file assets; no unrelated functions are bundled. There is no `amplify/`, Team Hub, Creator, Commerce, Community, Investor, Intake, Twitch or payment implementation in the closure. The import guard rejects forbidden files before esbuild loads them. The assembly has one root template and no missing AWS context lookups.

Evidence: [preserved receipt](phase2a-tournament-evidence-2026-09-26/pinned-build/isolation-receipt.json), [full template](phase2a-tournament-evidence-2026-09-26/pinned-build/assembly/ProjectRespawn-Tournaments-Ntgre.template.json), [preservation hashes](phase2a-tournament-evidence-2026-09-26/preservation-manifest.json). The evidence directory preserves both source snapshots and the self-contained assembly. Receipt paths remain candidate-relative; preservation-manifest paths are evidence-relative. The original `.build` remains in the candidate. No Phase 1 pinned assembly was touched.

## Exact proposed resources

| Logical ID | CloudFormation type |
| --- | --- |
| HttpApi | AWS::ApiGatewayV2::Api |
| DefaultStage | AWS::ApiGatewayV2::Stage |
| JwtAuthorizer | AWS::ApiGatewayV2::Authorizer |
| PreviewIntegration | AWS::ApiGatewayV2::Integration |
| PreviewRoute | AWS::ApiGatewayV2::Route |
| PreviewFunction | AWS::Lambda::Function |
| PreviewRole | AWS::IAM::Role |
| HttpInvoke | AWS::Lambda::Permission |
| PreviewLogs | AWS::Logs::LogGroup |
| AccessLogs | AWS::Logs::LogGroup |
| PreviewErrors | AWS::CloudWatch::Alarm |
| HttpErrors | AWS::CloudWatch::Alarm |

**Total 12**, within the 12–16 envelope. The IAM policy is inline, so it is not an additional CloudFormation resource. The function may only create streams/write events in its explicit log group. There is no wildcard business-data policy, AWS SDK client, managed broad Lambda policy, Cognito Admin access, secret, VPC, business bucket, table or key. Invoke permission is scoped to this API's GET path and account.

Both logs retain events for 14 days. Access logs include request ID, route, status and response length, not payload/token/claims. Two alarms monitor Lambda Errors and HTTP 5xx; notification destinations are not configured at this proof gate. API throttling is 10 requests/second with burst 20. [AWS HTTP API logging prerequisites](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-logging.html) must be included in the later deployment-role review.

Proposed additive plan: 12 new resources in a new sibling root; no existing-resource additions/modifications/deletions/replacements. This is a **local template assessment**, not an AWS-generated change set. LegacyPlatform remains 2,621, including FunctionDirectiveStack 167; the new root budget is 12. No new business state, AppSync, DynamoDB, S3, KMS or Cognito resource exists. CDK references the standard bootstrap artifact bucket/roles for future publication; this does not create an S3 resource here, and nothing was uploaded or bootstrapped.

## Validation and Legacy protection

- **26/26 Tournament tests passed**, covering all 18 requested categories, additional JWT/context rejection, scoped invocation/logging, actual forbidden-import bundling, asset contents, and future lazy client behavior. [Final test output](phase2a-tournament-evidence-2026-09-26/tests.txt).
- **TypeScript passed**, as a mandatory step in the isolated plan.
- **Tournament build and synthesis passed**; exactly one app/root/template, one Lambda bundle and no shared schema generation.
- **24/24 existing pure resource-accounting tests passed**, run from the clean candidate. [Output](phase2a-tournament-evidence-2026-09-26/resource-accounting-tests.txt).
- The repository-wide `validate:infrastructure-ci` was **intentionally not run**: its scanner includes new `infrastructure/` and `scripts/` inputs and would invoke `synthesize-resource-accounting.mjs` for LegacyPlatform. That conflicts with the user's explicit Tournament-only synthesis boundary. The independent exact-resource/closure checks serve this gate; no legacy receipt was changed to bypass the global scanner.
- No root/frontend build was required or run: no existing frontend code changed. Existing hosted pipeline decomposition remains deferred.

[Before](phase2a-tournament-evidence-2026-09-26/legacy-before.json) completed at `2026-09-26T13:19:56.033Z`; [after](phase2a-tournament-evidence-2026-09-26/legacy-after.json) at `2026-09-26T13:33:17.378Z`. Both checks used allowlisted read-only AWS operations. The after verifier reports `beforeAfterEqual:true`.

| Legacy measure | Before and after |
| --- | --- |
| Root status | UPDATE_COMPLETE |
| Recursive resource count | 2,621 |
| FunctionDirectiveStack | 167 |
| Root LastUpdatedTime | 2026-09-26T11:52:06.391000+00:00 |
| DisableRollback | false |
| Stack templates and resource identity hashes | All 62 identical |
| Protected resources | All 62 identical/present: 55 tables, 3 buckets, 2 keys, Cognito pool, AppSync API |
| Previously verified Lambdas | All 5 code hashes and configuration hashes identical; Active |
| Core pool/client/output provenance | Identical |
| AWS writes | 0 |

Protected identity checks preserve users/groups by making no Cognito mutations. AppSync identity is verified through CloudFormation; table/key/bucket/pool availability also receives service-level read checks. This is not a claim of a full AWS drift-detection job or application smoke test. API-key physical IDs are compared by hash without printing key material.

[Read-only root check](phase2a-tournament-evidence-2026-09-26/new-root-absence.json) confirms `ProjectRespawn-Tournaments-Ntgre` does not exist. Production was not targeted or mutated.

## Commands and later gates

From the candidate `infrastructure/domains/tournaments` directory:

```powershell
npm ci --ignore-scripts --no-audit --no-fund
npm run domain:plan -- tournaments --env Ntgre
npm test
npm run domain:deploy -- tournaments --env Ntgre
npm run domain:compose-config -- tournaments --env Ntgre
```

These commands are local. `domain:deploy` verifies all pinned source/generated/library hashes, rejects a changed source set, then emits `AWAITING_SEPARATE_AWS_AUTHORIZATION`, `executionEnabled:false`, `rollbackEnabled:true`. It does not run CDK deploy or AWS. Selection handles Tournament source changes as Tournament only; shared contracts select compatibility tests without automatic deployment. Unknown/production deploy targets fail closed.

No implementation blocker remains for **AWS deployment review**. The following remain mandatory before or during separately authorized deployment:

1. Revalidate caller/account/region and Core identity provenance; verify the target is absent or the intended independent root.
2. Review deployment and asset-publishing permissions that exclude LegacyPlatform/production. The default CDK bootstrap role references are not evidence that an appropriately restricted execution role already exists. Do not run this assembly under an unchecked broad role.
3. Authorize artifact publication and new-root change-set preparation separately; inspect the complete AWS-generated plan and explicitly enable rollback before any execution authorization.
4. After authorized creation, compose the real endpoint manifest from verified stack outputs and test missing/expired/wrong issuer/wrong client plus a valid existing Ntgre access token.
5. Prove a second domain-only release and rollback, with repeated unchanged Legacy evidence. Hosted CI dispatch and frontend migration remain later work.

Rollback design: no current route or writer switches, so existing application rollback is unnecessary. Future failed first creation must be allowed to roll back with events collected. The proof has no business state; its log groups use CloudFormation default deletion behavior with bounded event retention while present. A later update rolls back using the preserved previous assembly/config. Teardown requires separate authorization and never means deleting/recreating the Ntgre sandbox. Actual live deployment/rollback isolation is not yet demonstrated.

## Implementation gate

Candidate/worktree: detached candidate above, source manifest pinned above.

Tournament entrypoint: `infrastructure/domains/tournaments/app.ts`.
Independent CDK application: YES.
LegacyPlatform imported: NO.
Amplify schema imported: NO.
Tournament synthesis: YES.
LegacyPlatform synthesis: NO.
Unrelated Lambda bundling: NO.
Isolation receipt: preserved and hash-pinned above.
Tournament dependency closure: 5 actual infrastructure/runtime source files; 24 reviewed inputs; isolated locked libraries.
Unexpected dependencies: NONE.
Tests: 26 Tournament + 24 resource-accounting passed.
TypeScript: PASS.
Build: PASS.
Isolation tests: PASS.
Identity configuration: pinned verified Ntgre Core contract.
Existing Cognito consumed: YES.
Cognito created: 0.
Cognito modified: 0.
HTTP API: 1. Stage: 1. JWT authorizer: 1. Integration/routes: 2. Lambda: 1. IAM: 1 role/inline policy. Log groups: 2. Alarms: 2. Other: 1 invoke permission. TOTAL: 12.
Business-state resources: 0. AppSync: 0. DynamoDB: 0. S3: 0. KMS: 0.
Existing LegacyPlatform additions: 0. Modifications: 0. Deletions: 0. Replacements: 0.
LegacyPlatform resource count: 2,621. FunctionDirectiveStack: 167.
LegacyPlatform timestamp: unchanged, 2026-09-26T11:52:06.391000+00:00.
Protected resources: 62 unchanged. Lambda hashes: 5 unchanged.
Future lazy frontend compatibility: YES, standalone client boundary; no migration.
Separate domain endpoint manifest: YES, explicitly planned and unusable until verified deployment.
Global Amplify configuration modified: NO.
Production touched: NO.
Unexpected findings: NONE outside documented proof boundaries.
Remaining blockers: NONE for deployment review; AWS execution is disabled and requires the later gates above.

**PHASE 2A IMPLEMENTATION READY FOR AWS DEPLOYMENT REVIEW**

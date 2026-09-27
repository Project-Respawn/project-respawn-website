# Tournament independent root proof

Owner: Tournaments / preview. Public, non-sensitive fixture data; no business-state reader/writer. One stateless product root is justified by the approved independent deployment proof and future Tournament lifecycle. It consumes the versioned Core identity snapshot; it does not own or modify identity.

Run from this directory, with Node 24/npm 11 (Lambda target Node 22):

```powershell
npm ci --ignore-scripts --no-audit --no-fund
npm run domain:plan -- tournaments --env Ntgre
npm test
npm run domain:deploy -- tournaments --env Ntgre
npm run domain:compose-config -- tournaments --env Ntgre
```

`domain:plan` typechecks, builds only Tournament code and synthesizes one independent CDK application. It performs no AWS lookups/writes. `domain:deploy` currently validates the pinned local assembly and writes a review manifest only. Execution flags are rejected. Actual AWS creation, asset publication and deployment require the next authorization/review gate; there is deliberately no executable AWS deployment path in Phase 2A. These commands never call Amplify. Root package scripts, hosted CI and `npm run dev` are unchanged.

The `.build/isolation-receipt.json` records reviewed source hashes, actual esbuild import graphs, loaded CDK library hashes, isolated package lock and generated assembly/assets. Revision is the SHA-256 of the source input manifest. Any changed input requires a new plan/review. The package installs locally; there is no dependency on the root package/lock or unrelated workspace changes. Schema and package metadata are explicit shared/build inputs, not application imports. Build artifacts are ignored, preserved locally and not committed.

Final Phase 2A envelope: 11 resources; one HTTP API, stage, JWT authorizer, integration, route, Lambda, IAM role with a security-owned runtime boundary and inline log-only policy, Lambda permission, one runtime log group and two alarms. HTTP API access logging is deferred to a separately reviewed Security/Observability capability. Request-level access records are unavailable in this proof; Lambda logs, native metrics, alarms and CloudFormation events remain. No new business state, Cognito, AppSync, DynamoDB, S3 or KMS resources. The CDK bootstrap asset bucket is an existing deployment prerequisite, not a new business bucket. The tool does not bootstrap or upload. LegacyPlatform stays 2,621/167; no nested stacks or imports/exports link the two roots. No budget/debt allowance changes. This candidate supersedes the earlier 12-resource candidates for future execution review; none has been deployed.

`GET /v1/tournaments/preview` requires an existing Ntgre Cognito access token. API Gateway validates signature/issuer/audience/time, and the handler requires access-token type, expected client and trusted authorizer subject. It accepts no body/query identity. The small new versioned preview DTO intentionally does not reproduce the entire existing frontend fixture model: the future adapter can map it without importing existing UI code. Existing pages remain unchanged. The standalone client is lazy and receives its endpoint/access-token callback; it never configures Amplify. CORS permits localhost:5174 only; hosted frontend origins need a separately reviewed change before future integration.

The separate endpoint manifest has `PLANNED_NOT_DEPLOYED`, null endpoint/stack ARN and `liveVerified:false`. The client refuses it. A future deployment must compose a deployed manifest from verified root outputs, not guessed endpoints. Existing `amplify_outputs.json` remains untouched.

Operational owner: Tournaments. Access logs exclude payload/tokens; log retention 14 days; Errors/5xx alarms have no notification actions yet. Scope is an observed proof, not production operations. Log groups are deleted with this proof root by default (retention policy is documented, no teardown authorized). Rollback must be enabled in the next AWS change-set gate. On failed initial create, collect events and permit rollback; do not repair LegacyPlatform. Subsequent release/rollback must use retained immutable assemblies. Live JWT tests and a second isolated release/rollback are future deployment gates, not claimed here.

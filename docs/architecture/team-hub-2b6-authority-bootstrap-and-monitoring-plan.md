# Team Hub 2B6 - Authority bootstrap and monitoring plan

**TEAM HUB AUTHORITY / MONITORING PLAN BLOCKED.** Investigation and review artifacts are complete; execution remains blocked by the initializer custody decision, a separately pinned minimal monitoring runtime, and production-path probe reachability. No AWS writes are authorized or performed. Option A remains selected, with API access logs deferred and no log-administration grant. LEGACY_WRITER, disabled normal target writes and Legacy frontend remain unchanged.

## Actual installed baseline and three-way comparison

Read directly from IAM, not inferred from CloudFormation: [installed IAM snapshot](team-hub-2b6-evidence-2026-10-07/authority-plan/installed-iam.json). Principals are ProjectRespawn-TeamHub-Ntgre-ParityRead and ProjectRespawn-TeamHub-Ntgre-ParityCommand in account 058264289478. Each has one inline ExactSyntheticTeamState policy, zero attached identity policies, and its corresponding ParityReadBoundary / ParityCommandBoundary default version v5. Both documents match accepted dark artifacts. Trust policies are recorded. Operational and Journal have no resource policies. Lambda configurations remain LEGACY_WRITER / normal writes DISABLED.

| Version | Runtime access | Authority mechanism |
|---|---|---|
| Installed accepted dark | Own log group, accepted Core Lambda only, AWS Lambda environment decrypt under alias/aws/lambda condition; DynamoDB explicitly denied | Environment guards; no repository or authority-row reader |
| Previous offline business candidate | Adds scoped business table reads/writes, control read/transaction check, cursor secret | Conditional authority record and epochs |
| Pinned Gate D candidate | Same runtime identity policies and boundaries as offline business candidate | Same record-based business handler; telemetry correction only relative to offline candidate |

[Exact permission delta](team-hub-2b6-evidence-2026-10-07/authority-plan/permission-delta.json) retains all 17 added/removed/changed statement records, affected principal/boundary ARN, complete actions/resources/conditions and classification reasons. JSON property ordering is normalized for comparison. [Expanded action/resource/key classifications](team-hub-2b6-evidence-2026-10-07/authority-plan/expanded-permission-classification.json) classify each new allow, including mixed control/idempotency statements. Both identity policy and boundary need to permit a new operation. Unchanged permissions are recorded separately. This is not an offline-to-offline substitute for the installed baseline.

Let O = arn:aws:dynamodb:eu-north-1:058264289478:table/ProjectRespawn-TeamHub-Ntgre-Operational and J = the same ARN ending Journal. Full literal ARNs and conditions are in the delta.

| Added permission versus installed | Principal | Classification and decision |
|---|---|---|
| GetItem J, LeadingKeys CONTROL#AUTHORITY | Read + Command | REQUIRED_FOR_AUTHORITY_ENFORCEMENT; minimal C2 proposal only |
| GetItem J, IDEMP#* | Command | UNNECESSARY for C1/C2/D monitoring; later business idempotency review only |
| GetItem/Query O, TEAM#team:* and SLUG#* | Both | UNNECESSARY for current authority-read/monitoring scope; not a claim that future business handlers never need it |
| Query O/index/BySubject and ByTeamStatus, SUBJECT#* and STATUS#* | Both | UNNECESSARY for current scope; later business read/pagination review |
| PutItem/DeleteItem O, TEAM#team:* and SLUG#*, EnclosingOperation TransactWriteItems | Command | UNNECESSARY for current monitoring scope; do not install |
| PutItem J, TEAM#team:* and IDEMP#*, transactional only | Command | UNNECESSARY for current scope; later audit/idempotency review |
| ConditionCheckItem J CONTROL#AUTHORITY | Command | REQUIRED_FOR_AUTHORITY_ENFORCEMENT for future business transactions only; not needed for C2 read-only and not granted now |
| ConditionCheckItem TEAM/SLUG keys | Command | UNNECESSARY for current scope; future business concurrency checks |
| GetSecretValue exact Ntgre cursor-secret suffix ARN | Both | UNRESOLVED: pinned entry fetches it before authority read, but cursor pagination is not monitoring. Minimal-runtime separation must remove that prerequisite through a separately reviewed candidate, not silently grant it |
| Expanded NotAction ceiling | Both identity + boundary | UNRESOLVED as a whole business change; minimal C2 opens only GetItem with matching exact-partition allow |
| Foreign DynamoDB explicit deny | Both | REQUIRED_FOR_AUTHORITY_ENFORCEMENT confinement, not an added allow |

Core InvokeFunction on exact accepted unqualified/$LATEST ARNs is already installed: REQUIRED_FOR_CORE_INTEGRATION, zero new access. Own-group CreateLogStream/PutLogEvents already support EMF: REQUIRED_FOR_MONITORING, zero new access. New PutMetricData, Cognito, broad Logs, business KMS or cross-domain grants are UNNECESSARY and excluded.

[Minimal C2 identity](team-hub-2b6-evidence-2026-10-07/authority-plan/c2-read-identity.PROPOSAL.json) and corresponding command/boundary files preserve installed permissions, opening only GetItem on J with ForAllValues:StringEquals LeadingKeys CONTROL#AUTHORITY and Null=false. They grant no Query, Scan, write, secret read or transaction check. LeadingKeys restricts the partition key, not the sort-key value; the reviewed reader supplies SK=STATE. Do not describe this as IAM enforcement of an exact composite item key.

[Effective policy checks](team-hub-2b6-evidence-2026-10-07/authority-plan/iam-validation.json) use the actual installed inline policies plus boundaries and compare minimal C2. Tests cover authority read, unrelated key/table, control write, Query, Core invocation and log administration. Table policies are absent. Simulator results do not prove all SCP/RCP/session/VPC-endpoint effects or installed service enforcement. [AWS simulator limitations](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html).

## C1 exact initialization request

[Typed DynamoDB PutItem proposal](team-hub-2b6-evidence-2026-10-07/authority-plan/c1-put-item.PROPOSAL.json), [request hash/review metadata](team-hub-2b6-evidence-2026-10-07/authority-plan/c1-review.json). Not executed.

- Table: ProjectRespawn-TeamHub-Ntgre-Journal.
- PK CONTROL#AUTHORITY; SK STATE; schemaVersion team-hub-authority.v1.
- mode LEGACY_WRITER; epoch 1; version 1.
- ConditionExpression: attribute_not_exists(PK) AND attribute_not_exists(SK).
- changedBy: team-hub-authority-bootstrap (service label, no person). changedAt is the prepared timestamp; gateDigest binds the preserved Gate D manifest. A refreshed execution timestamp/request must be rehashed/reviewed. Neither digest nor timestamp is authorization.
- ReturnValues NONE; no credentials, tokens, email or personal fields.

A repeat or racing PutItem must fail ConditionalCheckFailedException; never fall back to unconditional write/update. Read back consistently and compare the entire approved item. An existing row stops C1, even if apparently equivalent, until separately reconciled. [AWS conditional PutItem](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html).

Installed runtime cannot read this record: explicit IAM deny and no reader code. Initializing alone cannot enable normal target writes because installed dark code remains environment-gated with no mutation path. The business candidate also refuses non-TARGET authority. Six new isolated tests verify conditional-create refusal, schema, monotonic transition rules and missing/LEGACY read+command denial; they are not a live DynamoDB condition test.

Initialization needs a separate, tightly scoped security-owned principal. [Initializer permission proposal](team-hub-2b6-evidence-2026-10-07/authority-plan/c1-initializer-policy.PROPOSAL.json) limits GetItem/PutItem to J's authority partition and denies other operations/resources. This is an upper bound, not a deploy-ready principal: IAM does not enforce mode/epoch values, SK=STATE or the required ConditionExpression. Those must be fixed in a reviewed one-shot executor accepting no caller-supplied item/condition, with pinned code/request, no interactive assumption path, explicit operator approval and immediate removal of write capability. Exact trust/custody and executor deployment remain UNRESOLVED; no existing broad user or runtime role is designated by inference. [DynamoDB condition-key scope](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/specifying-conditions.html).

C1 rollback defaults to leaving the harmless LEGACY_WRITER row, not deleting authority history. If removal is essential, require separate authorization and conditional equality with the original row, zero downstream use/writes, and a reviewed restoration plan. No delete privilege is in the initializer proposal.

## Safe probe matrix

Never forge API JWT context through a privileged Lambda invocation and call it HTTP acceptance. Never reorder authentication/authority/business authorization to obtain a counter. No Core outage, policy revocation or target authority mutation for testing.

| Required probe | Real handler path and expected signal | Safe proof scope / timing |
|---|---|---|
| HTTP 403 authorization denial | Authenticated API -> route -> valid LEGACY control -> requireTarget rejects -> WriterNotAuthoritative and TEAM_REQUEST FORBIDDEN/AuthorizationFailures | Safe after independently reviewed runtime/reader deployment. Proves writer denial and counter classification; does NOT prove later membership/capability denial |
| HTTP 503 Core failure | Auth -> TARGET control -> matching epoch -> Core call fails -> CoreDependencyFailures + DependencyFailures | Unreachable under LEGACY. Use local exact-source harness with in-memory transport and injected Core failure; for AWS ingestion proof, a separately reviewed isolated function/log namespace with no business credentials, no live Core outage and no route to business tables. Isolation is not deployed-business-path acceptance |
| Writer denial | Auth -> LEGACY control epoch 1 -> requireTarget -> 403 | Safe real non-mutating request when a reviewed reader is deployed. Distinct WriterNotAuthoritative counter required |
| Missing/stale epoch | TARGET required before header comparison; wrong header -> conflict + AuthorityEpochMismatch | Under LEGACY the same request is writer-denied, not epoch-tested. Isolated exact-source proof now; actual business-path proof must wait beyond FROZEN until separately authorized TARGET, before any business write |
| Successful request | Current dark direct read-only Core-proof envelope can succeed with real delegated JWT and Core verification, but is not HTTP business-handler success | May establish existing Core health in separately authorized live probe work. Pinned business success needs TARGET and matching epoch; GET /v1/teams non-mutating proof deferred. Exact-source isolated success must show Requests=1, failure counters=0 |
| Missing authority | Auth -> missing record -> AuthorityUnavailable + DependencyFailures, HTTP 503 | Isolated proof now; optional real proof only while row is genuinely absent and reviewed runtime exists. Never delete the C1 row to create this signal; not Core failure |

An isolated AWS telemetry harness would be a new separately reviewed resource/security candidate: isolated tables/control data or injected in-memory transport, no live business reads/writes, no production route, separate namespace/dimensions, full cleanup and artifact-equivalence record. It must not add a magic header, actor, principal bypass or test switch to normal business authorization. Nothing is provisioned in this task.

D2 cannot honestly be fully accepted under current LEGACY restrictions with the preserved business pin. Maintenance alone in FROZEN still cannot reach TARGET-only epoch/Core/success branches. The ordering therefore needs explicit partial-acceptance criteria or a reviewed isolated-equivalence decision before final scheduling; do not silently waive any requirement.

## Separately reviewable execution sequence

| Gate | Prerequisites and allowed changes | Validation | Rollback and stop conditions |
|---|---|---|---|
| C1 | Installed baseline/pins/protections refreshed; exact request and dedicated executor/custody reviewed; separate initialization authorization. Only conditional LEGACY epoch/version 1 record | Consistent readback; duplicate-create denial in isolated test; normal API writes remain denied; unchanged installed runtime | Leave harmless row; revoke initializer write capability. Stop existing row, unexpected value/identity/drift, any enabled target write. Never overwrite |
| C2 | C1 reviewed; exact minimal identity+boundary policies, security deployment role permissions and change set reviewed separately | Actual-role control read; other keys/tables/writes/log admin denied; no Core/logging regression | Restore exact installed policies/boundary versions; retain LEGACY row. Stop new grant beyond authority GetItem, replacement or policy drift |
| D1 | A NEW minimal-runtime/template/artifact pin based on deployed dark state, separately reviewed. Preserve environment write disables and normal business denial. No cursor secret/business routes/table grants bundled as monitoring | Handler ordering, EMF, Core proof contracts, artifact/CFN reconciliation and scoped deployment permissions; rollback enabled | Exact accepted dark bytes/settings. Stop unreviewed contract/environment/IAM change. Old 44+7 Gate D business pin is NOT approved for D1 |
| D2 | D1 installed; approved authenticated probes, manual responder Ntgre, bounded collection and explicit isolated-vs-live criteria | Correlated request/log/metric evidence; exact Environment/Runtime dimensions; complete windows; no false zeros; classify unreachable paths honestly | No business-state rollback; stop probes on unexpected success/mutation, missing evidence, dependency outage or drift. Do not induce faults in Core |
| E/F | Independent frontend/manifest builds and offline rollback tests may continue; no real epoch binding, frontend publication or AWS rehearsal by this task | Five-persona evidence scoped correctly; export/reverse/restore/reconcile/cleanup in isolated approved rehearsal later | Discard local artifacts/in-memory state; retain historical pins. Stop real data or authority impact |
| B | Separate FROZEN authorization; reviewed detached source fence and exact installed policy revisions | Actual generated/direct/manual/privileged all-path denial, not simulation | Follow existing revision-guarded fence rollback, keep target denied during partial failure. No broad Legacy deploy; no permanent bypass |

C2 changes alone do not teach the dark runtime to read control. D1 still needs code review; the preparation includes policy/request artifacts, not a claim that a deployable minimal monitoring Lambda has already been accepted. Future business permissions remain a separate gate from C2. Final B/authority transition/frontend activation must not be inferred from C1-D2 authorization.

## Validation and preservation

[Regression/monitoring/Core/accounting/TypeScript results](team-hub-2b6-evidence-2026-10-07/authority-plan/validation.json), [bootstrap tests](team-hub-2b6-evidence-2026-10-07/authority-plan/bootstrap-tests.json), [IAM checks](team-hub-2b6-evidence-2026-10-07/authority-plan/iam-validation.json), [inventory](team-hub-2b6-evidence-2026-10-07/authority-plan/inventory.json), [accepted template comparison](team-hub-2b6-evidence-2026-10-07/authority-plan/accepted-template-preservation.json). 613 tests pass, including six new bootstrap tests; TypeScript and ledger pass. Three Access Analyzer policies have no ERROR/SECURITY_WARNING findings, and 32 positive/negative IAM checks pass. Fresh inventory confirms Legacy 2,621 / directive 167, Team 40+7, Core 8+5, Tournament 11; source protections/backups intact and target business/control rows absent. Four accepted Team/Core templates match. Normal and independent frontend builds pass with existing stylesheet/chunk-size warnings. No runtime bundle or accepted pin regenerated. Exact old candidate ZIP/templates remain preserved. New policy/request hashes are in [proposal pins](team-hub-2b6-evidence-2026-10-07/authority-plan/proposal-pins.json).

Secret scan and document links are recorded separately. AWS work is read-only IAM, simulation, Access Analyzer, stack/table/backup/template reads. Source protections and business state are preserved. No live probe invocation, AWS write, Cognito change, business authority transfer, frontend publication, production modification or Legacy retirement.

**TEAM HUB AUTHORITY / MONITORING PLAN BLOCKED**

# Team Hub 2B3 — separately authorized AWS write proposals

**None of A–E has been applied.** Account 058264289478, region eu-north-1, Ntgre only. No production, Cognito, AppSync identity, sandbox replacement, Team business writes or cutover is authorized by this preparation task. These are reviewable operation/resource proposals, not commands to execute. Each gate needs its own candidate, impact inspection and explicit authorization; authorization for A does not authorize B–E.

## A. Legacy protection

Exact four table names/ARNs, current nested stack identities, current custom resources and proposed replacements of their **configuration objects** are recorded in [legacy-protection-proposal.json](team-hub-2b3-final-evidence-2026-10-05/legacy-protection-proposal.json). This does **not** propose replacing any physical table.

| Setting | Existing | Proposed on all four `Custom::AmplifyDynamoDBTable` declarations |
|---|---|---|
| `Properties.pointInTimeRecoverySpecification.pointInTimeRecoveryEnabled` | absent/disabled | true |
| `Properties.deletionProtectionEnabled` | absent/false | true |
| `Properties.allowDestructiveGraphqlSchemaUpdates` | true | false |
| `Properties.replaceTableUponGsiUpdate` | true | false |
| DeletionPolicy / UpdateReplacePolicy | Delete / Delete | Retain / Retain |

Leave tableName expressions, keys, GSIs, encryption, streams, tags and ServiceToken byte-identical. The future Legacy candidate must propagate these four nested template edits through the existing root, with no fresh unrelated synthesis. Parent TemplateURL updates are inspected as propagation, not extra physical resources. Reject any other resource effect, new identity, delete or replacement. Pin the four source-template hashes and the complete parent manifest at that gate; do not apply a partial child-stack update or replay current HEAD.

Provider operations resulting from the reviewed change are `dynamodb:UpdateContinuousBackups` and `dynamodb:UpdateTable` for deletion protection, on the exact four ARNs. Verify the provider role has both permissions before preparation; if missing, stop for an exact provider-policy amendment, never a wildcard workaround. No table key/index change is permitted. Explicitly set rollback-enabled CloudFormation behavior; on failure, inspect actual protection state because rollback to the old desired configuration could disable newly enabled protections. Stop further deployments until a protective candidate is restored. Do not “roll back” by deleting/recreating a table.

After protection succeeds, call `CreateBackup` once per table, names `ProjectRespawn-TeamHub-Ntgre-M4-<Model>-<approved UTC gate stamp>`. Bind returned backup ARNs in the gate receipt and wait for AVAILABLE. Retain at least through the rollback window and 30 days after cutover acceptance; deletion is a later explicit cleanup authorization. On-demand backup is the immutable named rehearsal/cutover baseline. PITR protects writes that might arrive before freeze; deletion protection guards destructive operations; Retain prevents CloudFormation lifecycle removal. They address different failures even with zero current rows. No recurring backup service or vault is proposed.

**Provider compatibility:** [deployed artifact hashes](team-hub-2b3-final-evidence-2026-10-05/provider-artifacts.json) and [pure-helper review](team-hub-2b3-final-evidence-2026-10-05/provider-review.json) match the installed handler SHA256 `4f5589b3eb5bb964ebc642068f169c35e32a5409ba7c7ae79c093d8055d0b075`. Omitted desired PITR/deletion protection turns off out-of-band protection at a later Update. Key/GSI replacement checks occur before the protection update; disabling destructive replacement is therefore essential. Replacement throws if the physical table is protected. Delete returns success without deleting a protected table, potentially leaving it unmanaged; Retain avoids invoking that lifecycle. The provider has no DeleteBackup call. Named backups are separate recovery artifacts; live PITR history is not preserved by table replacement. Re-enabling PITR after disabling it resets the available window. [AWS PITR behavior](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/PointInTimeRecovery_Howitworks.html).

Risk: template regeneration later dropping the overrides. Require a repository guard and pinned template diff at every subsequent Legacy deployment. Do not rely on one-time CLI toggles. Provider code is unchanged. Recovery rollback is to a protected reviewed configuration, not reduced safeguards.

Cost: no charge for deletion protection/Retain itself; PITR and four backup artifacts incur storage charges. Use [recorded Stockholm pricing](team-hub-2b3-evidence-2026-10-05/pricing.json) only as a dated estimate; refresh at authorization. Dependencies: stable exact table identities, no schema/index drift, provider permissions and a narrow Legacy change set.

## B. Restore rehearsal

After A, use each **returned exact backup ARN**, `RestoreTableFromBackup`, to these four names (replace the date suffix with the approved run ID if names already exist; never overwrite):

- `ProjectRespawn-TeamHub-Ntgre-M4Restore-Team-20261005`
- `ProjectRespawn-TeamHub-Ntgre-M4Restore-TeamMembership-20261005`
- `ProjectRespawn-TeamHub-Ntgre-M4Restore-TeamRosterSlot-20261005`
- `ProjectRespawn-TeamHub-Ntgre-M4Restore-PlayerChampionPoolEntry-20261005`

Temporary unmanaged verification tables only; never wire a Lambda, AppSync data source, frontend, Cognito or domain endpoint to them. Wait for ACTIVE and all expected GSIs ACTIVE. Compare exact id key, attribute definitions, original GSIs, billing/encryption settings, restore source backup ARN and complete two-pass consistent counts. Empty count alone is not sufficient. Verify permissions permit inspection but no business writer targets these names. Record operation durations and actual recovery point. Re-apply and verify PITR, deletion protection, TTL/streams/tags/resource policies as required by the intended recovery use: restored tables do not automatically inherit all operational settings. For this disposable isolated rehearsal, explicitly leave PITR/streams/TTL off, enable deletion protection while verifying, then disable it only for the named cleanup step. [AWS restore settings](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/pointintimerecovery_restores.html).

An existing approved recovery operator needs `RestoreTableFromBackup` on the four bound backup ARNs and exact destination ARNs, plus DescribeTable/Scan/DescribeContinuousBackups/DescribeTimeToLive/ListTagsOfResource/UpdateTable/DeleteTable on those four destinations. CreateBackup belongs to A. No write access to the four source tables, no PassRole, no Cognito/KMS wildcard, no business PutItem. Bind fresh region/time constraints at authorization. Do not create another identity merely for the rehearsal if the approved operator is sufficient.

Cleanup requires the same B authorization to explicitly include **only these new temporary tables**: prove ARN/run-ID/restore receipt and no consumers, disable their deletion protection, DeleteTable, wait absent. Do not delete source tables/backups. If cleanup cannot be safely proved, retain them and report residual resources. Risk/rollback: unexpected schema or counts aborts acceptance, source remains untouched. Reserve a 60-minute operator window and stop on timeout; restoration duration is measured, not promised. Cost = restored bytes × restore rate + temporary table storage and verification reads; empty does not establish a zero invoice or remove service minimums. Four temporary tables peak. No restore occurred in this task.

## C. Dark target creation

[Exact local template proposal](team-hub-2b3-final-evidence-2026-10-05/dark-target.template.json) preserves all eleven accepted product declarations and adds:

1. OperationalTable — `ProjectRespawn-TeamHub-Ntgre-Operational`, native AWS::DynamoDB::Table, PK/SK, two sparse KEYS_ONLY GSIs BySubject and ByTeamStatus.
2. JournalTable — `ProjectRespawn-TeamHub-Ntgre-Journal`, native AWS::DynamoDB::Table, PK/SK, expiresAt TTL.

Both PAY_PER_REQUEST, PITR enabled, deletion protection enabled, Retain/Retain, default DynamoDB-owned service encryption (`SSEEnabled:false`, not plaintext), no customer-managed KMS dependency, no streams/CDC, no provider/Lambda/log/route additions. [AWS SSE specification](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-properties-dynamodb-table-ssespecification.html).

The prior four additions were two tables + LogoBucket + LogoTransportPolicy. **Defer both S3 declarations.** Zero logos plus disabled branding removes the need to introduce logo recovery now. A later branding gate must propose both resources, versioning/private access/TLS/retention, verified recovery, permissions and revised accounting.

The existing `ProjectRespawn-TeamHub-Ntgre-ReadProofExecution` role needs a separately inspected extension to its existing inline execution policy and ExecutionBoundary for **only the two exact target ARNs**: CreateTable, DescribeTable, UpdateTable, DescribeContinuousBackups, UpdateContinuousBackups, DescribeTimeToLive, UpdateTimeToLive, ListTagsOfResource, TagResource, UntagResource. No business data writes, table DeleteTable, Legacy ARNs, new API bootstrap, KMS or runtime-role expansion. Prepare the corresponding two existing security-resource modifications at C; security remains five declarations. Do not silently reuse the old failed first-create/diagnostic policy or grant the preview role write access.

The [concrete security template](team-hub-2b3-final-evidence-2026-10-05/dark-security.template.json) starts from the installed lockdown template. It replaces the blanket DynamoDB deny with an exact-two-table lifecycle allowance, deny on every other DynamoDB resource, and region restriction. Unallowed business writes/DeleteTable remain denied by the boundary. To fit the 6,144-character managed-policy limit, it removes the redundant enumerated foreign-API deny; the unchanged exact-API NotResource deny already rejects every foreign API/REST API. Tests prove the retained API scope and policy size. [Write-set JSON](team-hub-2b3-final-evidence-2026-10-05/write-sets.json) records exact documents, hashes and operations; this proposal is not installed.

Prerequisites: A/B evidence; exact name absence; current 11+5 acceptance; prospective two-resource-only product change set and narrow policy delta; rollback enabled. The local JSON is not an AWS-generated change set or published assembly. Review those at the separately authorized preparation gate before execution. On failure, retain any created tables, stop, inspect CFN ownership and state; do not delete/recreate to make a retry pass. Cost: table/PITR storage and eventual requests; no business requests while dark. Backups before subsequent writer releases; restore to new isolated names, verify schema/counts/hashes/protections and rebind only at a separate recovery authorization.

## D. Migration/verification IAM

Mode A creates **zero migration IAM resources** and performs zero copying. Existing read-only verification authority is sufficient for counts/metadata; its presence is not authorization to use its administrative powers. Do not grant the normal Team runtime access to Legacy tables.

If Mode B is triggered, stop and review the [historical temporary identity proposal](team-hub-2b3-evidence-2026-10-05/migration-identity-proposal.json). Its illustrative timestamps are not current authorization. Rebind exact source/target resources, issue a 900-second session within a new approved window, exact source reads/target writes, permissions boundary, audit destination and privacy transform. It would add one role + one managed boundary (two declarations); no source business writes, PassRole, production or unrelated domains. Nonempty logos also require the deferred S3 gate. Revoke sessions/remove grants after reconciliation; retained data is not deleted on IAM rollback. State-authority rollback's Legacy import writer is a different exceptional authorization, not this forward-copy identity.

## E. Writer fence

Authoritative state is one **non-TTL Journal row** `CONTROL#AUTHORITY / STATE`, not a frontend configuration variable. Initially LEGACY_WRITER, epoch/version monotonic. Conditional updates compare previous mode/version and bind a signed/reviewed gate digest. Only the separately authorized cutover custodian can change it; normal runtimes cannot.

| Path | LEGACY_WRITER | FROZEN | TARGET_WRITER |
|---|---|---|---|
| readTeamHub | Legacy authorized DTO | labelled read-only Legacy / maintenance | explicit DOMAIN_MOVED; upgraded client reads owner |
| mutateTeamHub + all 12 actions | Legacy with server authority/version check | reject, no write | reject old operation |
| Direct shared Lambda adapter | same control check inside DDB transaction | underlying table write denied | underlying table write denied |
| Generated model writes/admin Lambda | only existing reviewed paths | all-principal source deny | remain denied; owner API required |
| Target writer | disabled | disabled | transaction condition on TARGET_WRITER+epoch, business/audit/idempotency atomic |
| Admin/manual/cleanup/provider | reviewed maintenance only | deployment freeze + source data deny | no Legacy business writes; controlled recovery only |
| Logo upload/commit/remove | current Legacy route | deny exact prefix writes and drain old URLs | disabled until separate branding gate |

Generated Team subscriptions are a reader compatibility path: reject new Legacy subscriptions at the server, drain existing connections/queued deliveries and verify no source events can be published after the source write deny. Stream read policies are absent; known IAM-capable stream readers remain explicitly inventoried. A future owner event contract requires its own adapter, not silent reuse of raw Legacy model events.

An early read of the control row is insufficient: a request could pass it before freeze and commit later. Legacy direct transactions must condition-check the row atomically. Generated GraphQL, S3 and administrative bypass paths additionally require resource-level denies. For each exact source table, propose `PutResourcePolicy` with Principal `*`, Effect Deny for PutItem, UpdateItem, DeleteItem, BatchWriteItem, PartiQLInsert/Update/Delete; include underlying operations used by transactional writes, not an invented TransactWriteItems IAM grant. Keep source reads available only to reviewed consumers/verifier. Review support/size/previous policy revision before installation; all four current table policies are absent. Do not overwrite unrelated policy statements.

Merge a Deny for s3:PutObject/DeleteObject/DeleteObjectVersion/AbortMultipartUpload on the **existing exact `team-logos/*` prefix** into the current bucket policy, preserving its TLS and generated cleanup statements. The explicit deny also covers cleanup/provider and old presigned URL paths. This changes no unrelated prefix. Stop Lifecycle/provider/Legacy deployment activity during the window; source deletion protection and Retain remain required. Control-plane protection and all relevant writer tests must pass before cutover.

Grant the transitioning Legacy server only exact Journal control-key GetItem/ConditionCheckItem, constrained by LeadingKeys and exact resources in its existing inline policy; no Journal mutation rights. This is a temporary, documented cross-domain authority-control exception, not access to Team business state. Future target runtime receives only owner-table operations with bounded transactions; that runtime/security release is not installed by C. Modify existing role/policy declarations, no new function, table, SSM parameter, policy resource or scheduled coordinator.

Root and sufficiently privileged administrators can remove IAM/resource policies. Root can remove a DynamoDB resource policy even if denied. This design does not claim to defeat account ownership. Freeze administrative change/deployment activity, record custodian control, re-read policy revisions immediately before transitions, and fail on drift. [AWS root policy-removal exception](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DeleteResourcePolicy.html).

Install gate E only in a separate reviewed runtime/security release, with negative tests for every row in [coverage](team-hub-2b3-writer-reader-coverage.md). This task does not modify a deployed handler, permissions or control row. On E failure leave both writers FROZEN; revert a fence only after proving current authority and reconciliation, never by enabling two writers. No additional CloudFormation declarations; one control data row, four table resource-policy documents and one existing bucket-policy update. Costs are bounded control reads/writes plus audit storage; no standing coordinator/CDC cost. Dependencies: A/B/C, compatible runtime adapter, privacy/reverse/replay tests and explicit E authorization.

## Accounting

[Accounting evidence](team-hub-2b3-final-evidence-2026-10-05/resource-accounting.json): Legacy 2,621 (Team attribution 192; FunctionDirective 167), Team current 11 product +5 security, Tournament 11. Tracked baseline =2,648 declarations. Dark adds two →2,650; four simultaneous rehearsal tables →**2,654 tracked declarations/tables at peak**, plus four separately counted on-demand backup artifacts and one Journal control row. A has zero new declarations; C security/fence changes modify existing declarations; D Mode A zero; E zero new declarations. If B cleanup finishes before C, actual overlap is smaller; use conservative simultaneous peak.

This is **not a full physical AWS account inventory**: custom resources, nested declarations and backup artifacts have different counting semantics, and unrelated account resources were not inventoried. Full-account peak is unmeasured; do not label 2,654 a complete account total. No retirement or savings claimed. Mode B's extra two IAM declarations and deferred branding's two resources are excluded from Mode A and must be added if separately authorized.

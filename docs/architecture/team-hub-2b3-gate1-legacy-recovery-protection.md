# Team Hub 2B3 Gate 1 — Legacy recovery protection

**Subsequent result:** The user later authorized direct temporary protection instead of this managed-template deployment. That alternative succeeded; see [direct recovery protection](team-hub-2b3-direct-legacy-recovery-protection.md). This report preserves the earlier failed change-set gate and its then-current disabled protections. The change set remains unexecuted. The proposed helper is no longer wired into `amplify/backend.ts`.

**Result: NOT READY — STOPPED BEFORE EXECUTION, 5 October 2026.**

The authorized protection-only candidate was prepared, but the AWS-generated plan exceeds its reviewed scope. No change set was executed, no protection was installed, no backups were created, and no retry or Gate 2 action occurred. This is a failed execution gate, not a failed deployment or rollback. The unexecuted change set remains available; **do not execute it**.

## Authorization and target

The user authorized only Gate 1: managed recovery protection on four exact existing Legacy Team tables, followed by four named backups **only after successful protection verification**. Execution was conditional on the complete AWS plan having no unexpected deletion/replacement and the source remaining empty. The replacement/scope condition failed.

- Identity: `arn:aws:iam::058264289478:user/RavenTest`, profile `default`.
- Account: `058264289478`; region: `eu-north-1`; protected sandbox: `Ntgre`.
- Legacy root: `amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332`.
- Production target: none. Production untouched.
- Root `DisableRollback=false` before and after. Any eventual separately accepted execution must explicitly retain rollback-enabled behaviour. No execution command was run.

## Fresh preflight and source

[Legacy before](team-hub-2b3-gate1-evidence-2026-10-05/legacy-before.json) matched the accepted baseline: 2,621 recursive resources, FunctionDirectiveStack 167, 62 protected identities, five monitored Lambda hashes/configurations. Root `UPDATE_COMPLETE`, last updated `2026-09-26T11:52:06.391000+00:00`. All 62 original templates matched the historical inventory using its code-point canonical key ordering. An initial local comparison used locale ordering; correcting that comparator resolved the mismatch without changing AWS or accepting template drift.

[Source before](team-hub-2b3-gate1-evidence-2026-10-05/source-before.json) and [source after the stop](team-hub-2b3-gate1-evidence-2026-10-05/source-after.json) each used two complete strongly consistent COUNT passes per table. No private row values were read or stored.

| Model | Before counts | After counts | PITR before/after | Deletion protection before/after | Backups found after |
|---|---|---|---|---|---|
| Team | 0 / 0 | 0 / 0 | DISABLED / DISABLED | false / false | 0 |
| TeamMembership | 0 / 0 | 0 / 0 | DISABLED / DISABLED | false / false | 0 |
| TeamRosterSlot | 0 / 0 | 0 / 0 | DISABLED / DISABLED | false / false | 0 |
| PlayerChampionPoolEntry | 0 / 0 | 0 / 0 | DISABLED / DISABLED | false / false | 0 |

The existing storage bucket's exact `team-logos/` prefix remained **0 objects** before and after. Enabled writers still exist; these observations do not establish a writer fence or authorize later empty-source cutover.

Exact table ARNs:

- `arn:aws:dynamodb:eu-north-1:058264289478:table/Team-dxb2tdlulrch7hj2pts2mfijia-NONE`
- `arn:aws:dynamodb:eu-north-1:058264289478:table/TeamMembership-dxb2tdlulrch7hj2pts2mfijia-NONE`
- `arn:aws:dynamodb:eu-north-1:058264289478:table/TeamRosterSlot-dxb2tdlulrch7hj2pts2mfijia-NONE`
- `arn:aws:dynamodb:eu-north-1:058264289478:table/PlayerChampionPoolEntry-dxb2tdlulrch7hj2pts2mfijia-NONE`

## Managed source, pinned candidate and provider behaviour

The uninstalled source changes are [teamHubRecovery.ts](../../amplify/teamHubRecovery.ts) and its narrow call from [backend.ts](../../amplify/backend.ts). They select exactly the four generated custom table logical IDs in the existing Ntgre root. Hosted branches and other root names are excluded. The aspect runs after the sandbox destroy-policy aspect and applies:

- PITR enabled and deletion protection enabled;
- `allowDestructiveGraphqlSchemaUpdates=false` and `replaceTableUponGsiUpdate=false`;
- `DeletionPolicy=Retain`, `UpdateReplacePolicy=Retain`.

These local changes remain **pending and undeployed**. They do not make current HEAD or a future full Legacy synthesis an approved deployment candidate.

The deployment candidate was built from the exact 62 deployed original templates, not current HEAD or a fresh Legacy synthesis. Only four custom declarations and five parent TemplateURL links changed: six template files, nine declaration edits. Keys, indexes, names, tags, streams, encryption, service tokens, APIs, authentication and Lambda code were preserved. No provider or IAM implementation change was required. Candidate manifest SHA256:

`8b01cd991e5e31ddb4ad40d8fa27a3e59a250c031faf6b0674c66a7bcd84f899`

[Candidate manifest and exact declaration changes](team-hub-2b3-gate1-evidence-2026-10-05/candidate.json); [62-template baseline](team-hub-2b3-gate1-evidence-2026-10-05/template-baseline.json).

[Fresh provider inspection](team-hub-2b3-gate1-evidence-2026-10-05/provider-preflight.json) confirmed both deployed handler archives still match `q+aRohk6Pue2C3rAv4iDrC4bq7c1afDEw+t8Pa8Utx4=`. Existing roles already allow UpdateContinuousBackups and UpdateTable on the existing Amplify table suffix. No permission expansion occurred.

Tests execute the hash-verified installed provider handler in a VM with mocked SDKs and no network. They cover Create plus PITR completion, protection-only Update, no-op, future preservation, rejected destructive key replacement, protected physical replacement, protected Delete, and rollback to previous properties. Source tests cover four-table isolation, sandbox aspect retention, hosted/other-environment exclusion and missing-table rejection.

Rollback can restore the previous protection settings in place: it does not require deleting/replacing the table. It can also disable newly enabled PITR/deletion protection, so any failed deployment must stop and inspect actual state. The protected Delete callback returns success while retaining the table; Retain avoids invoking that lifecycle. Deliberate future deletion requires separate exact-resource authorization, recovery/restore evidence, consumer retirement, and a separately reviewed removal of retention/protection. None of those actions is authorized here.

## AWS change set and execution review

**TEAM HUB STATEFUL GATE 1 — LEGACY RECOVERY PROTECTION**

Change set: `ntgre-teamhub-gate1-recovery-20261005`.

ARN: `arn:aws:cloudformation:eu-north-1:058264289478:changeSet/ntgre-teamhub-gate1-recovery-20261005/5a645758-687b-48dc-aa88-2eed2d1daabd`.

Root status `CREATE_COMPLETE`; execution status `AVAILABLE`; **not executed**. Ten linked root/nested change sets were retrieved. Nested `UNAVAILABLE` is expected because they execute through the root; it is not treated as a separate defect.

| Classification | Count |
|---|---:|
| Additions | 0 |
| Modifications, including replacements | 238 |
| Deletions | 0 |
| Replacement=True | 185 |
| Replacement=Conditional | 4 |
| Replacement=False | 49 |
| Dynamic evaluation detail entries (not a resource count) | 508 |
| Reviewed declaration edits represented | 9 |
| Extra generated modifications | 229 |

Every proposed resource logical ID, type, action, replacement classification, property path, evaluation source, causing entity and declaration comparison is recorded in [reconciliation.json](team-hub-2b3-gate1-evidence-2026-10-05/reconciliation.json). The [change-set review](team-hub-2b3-gate1-evidence-2026-10-05/change-set-review.json) binds all ten AWS change-set identities and the complete response digest. Before/after values and contexts are hashed in source-controlled evidence; full responses are retained only under ignored `.tmp/team-hub-gate1/`.

| Resource type | Modifications | Replacement classification |
|---|---:|---|
| CloudFormation nested stack handles | 9 | False |
| Lambda permissions | 23 | True |
| AppSync data sources | 2 | True |
| AppSync functions | 81 | True |
| AppSync resolvers | 79 | True |
| Team-model AppSync resolvers | 28 | False |
| Team-model AppSync data sources | 4 | False |
| Four protected Team custom tables | 4 | Conditional |
| IAM policies | 3 | False |
| Lambda functions | 2 | False |
| API Gateway integrations | 2 | False |
| API Gateway authorizer | 1 | False |

**Discrepancies:**

1. The four table property changes are reviewed and offline provider tests preserve physical identity, but CloudFormation still classifies custom-resource property updates as conditional replacement. Those classifications are not silently converted to False.
2. All 229 extra declarations are unchanged in the pinned source templates. Nevertheless, 224 report `KNOWN_AFTER_APPLY` values through nested references; for example AppSync ApiId and Lambda permission FunctionName. The unresolved values produce 185 replacement classifications across unrelated application permissions/resolvers/functions/data sources. This is evidence of nested-reference propagation in the plan, not proof that execution would perform no replacement.
3. Four additional parent handles report Dynamic/Automatic changes: root API, function and overlay stacks plus FunctionDirectiveStack. These exceed the five reviewed TemplateURL links.
4. The additional OverlaySource IAM policy reports a Static/DirectModification, but AWS replaces its AfterValue and AfterContext policy with a `(Truncated-Signature)` marker. Its actual proposed resolved policy could not be fully reviewed. The original declaration is unchanged, but that alone cannot reconcile the AWS plan.
5. The other proposed IAM, Lambda environment, API integration and authorizer updates are outside the four-table recovery intent. No Cognito, S3 bucket or GraphQL API declaration is listed as changing; however, unresolved GraphQL identity references affect dependent resources. No protected replacement can be accepted under this gate.

**NOT READY**

No `execute-change-set` call, patch/retry, direct table update, backup creation or later migration action followed this result. The user-visible execution review reported the identity, zero counts, four ARNs, proposed protections, AWS counts, intended backup names, all three stack baselines, rollback requirement and no production target before stopping.

## Backup plan — not executed

| Model | Intended backup name | Result |
|---|---|---|
| Team | ProjectRespawn-TeamHub-Ntgre-M4-Team-20261005-Gate1 | NOT CREATED |
| TeamMembership | ProjectRespawn-TeamHub-Ntgre-M4-TeamMembership-20261005-Gate1 | NOT CREATED |
| TeamRosterSlot | ProjectRespawn-TeamHub-Ntgre-M4-TeamRosterSlot-20261005-Gate1 | NOT CREATED |
| PlayerChampionPoolEntry | ProjectRespawn-TeamHub-Ntgre-M4-PlayerChampionPoolEntry-20261005-Gate1 | NOT CREATED |

Backup ARN, creation time, size and AVAILABLE status are **not applicable**, because the required managed-protection prerequisite failed. No restore occurred.

## Final live isolation

- [Legacy after](team-hub-2b3-gate1-evidence-2026-10-05/legacy-after.json): UPDATE_COMPLETE; 2,621 resources; FunctionDirectiveStack 167; all 62 templates and physical resource identities unchanged; all 62 protected identities and five monitored Lambda hashes/configurations unchanged; original update timestamp unchanged.
- [All 55 tables before](team-hub-2b3-gate1-evidence-2026-10-05/all-table-protection-before.json) versus [after](team-hub-2b3-gate1-evidence-2026-10-05/all-table-protection-after.json): identical PITR, deletion protection, key/index and stream identities. No unrelated table protection changed.
- [Team Hub after](team-hub-2b3-gate1-evidence-2026-10-05/team-baseline.json): CREATE_COMPLETE; 11 product +5 security resources; API `t54b88casf`; product/Lambda/security unchanged; first-create authority remains ineffective; no business tables created; frontendCutover=false.
- [Tournament after](team-hub-2b3-gate1-evidence-2026-10-05/tournament-baseline.json): UPDATE_COMPLETE; 11 resources; API `msipnwy39j`; Lambda/security unchanged. No Tournament deployment.
- [Final stop confirmation](team-hub-2b3-gate1-evidence-2026-10-05/stop-confirmation.json): change set remains unexecuted; backups=0; Gate 2 not started; production untouched.

Preparation performed **seven explicit AWS writes**: six content-hashed template objects in the existing CDK asset bucket, with AES256 and verified upload checksums, and one root CreateChangeSet request. AWS generated nine nested change sets. These artifacts remain for auditability; no cleanup/delete was performed. This is not a claim that no AWS write occurred. Deployed resources changed: **0**.

## Validation and migration control

[Validation receipt](team-hub-2b3-gate1-evidence-2026-10-05/validation.json): 10 provider/source tests +41 accounting tests +47 Team backend regressions = **98 passed**. Amplify TypeScript, Amplify contract, accepted Team 54-input preservation and accepted Tournament security/config preservation passed. Required live `validate-local-outputs` passed for the existing Ntgre outputs. Windows sandbox credential/profile restrictions required the read-only AWS checks and TypeScript test loader to run outside that restriction; no credentials were written to source.

The [domain status](domain-migration-status.json), [ownership ledger](legacy-resource-ownership.json) and [ownership summary](legacy-resource-ownership-summary.md) record Gate 1 stopped. The four tables remain MIGRATION_PREP / LegacyPlatform-authoritative / NOT_ELIGIBLE for retirement, with their existing Delete/ Delete lifecycle policies still deployed. `m4RecoveryAccepted=false`. No MIGRATED, CUTOVER_COMPLETE, RETIREMENT_REVIEW or RETIRED status was introduced.

Final [output audit](team-hub-2b3-gate1-evidence-2026-10-05/output-audit.json): ten additional ledger-control tests passed, bringing the total to **108**. Five credential/token/private-key pattern checks found zero matches across 43 task files; 20 report links resolved. Full AWS response contexts and deployment templates remain in the ignored temporary directory. `git diff --check` passed, with only existing Windows line-ending notices.

Data copied: no. Target tables created: no. Writer fence installed: no. Frontend cutover: no. Legacy resources retired: no. Production touched: no. No commit or push requested/performed.

**Next required work:** separately review the Gate 1 change-set discrepancy. Gate 2 — restore rehearsal — remains the subsequent gate, blocked until Gate 1 protection and backups succeed. This task does not begin or authorize Gate 2.

**TEAM HUB LEGACY RECOVERY PROTECTION FAILED**

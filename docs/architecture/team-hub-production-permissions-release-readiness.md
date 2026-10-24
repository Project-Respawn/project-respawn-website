# Production Team Hub permissions and Master publication

## Production authority initialized — 24 October 2026

[Actual C1 result](team-hub-production-c1-result.md): one fixed conditional workflow SUCCEEDED; complete strong readback confirms **LEGACY_WRITER epoch/version 1/1**. The two temporary resources were removed and absence verified. Operational is empty; Journal contains only the authority control row. Permanent IAM/runtime, source data/protections/four backups, Core/Cognito, Master and protected domains remain unchanged. Authenticated authority 200 and all **18** business-route denial checks remain pending real production sessions; missing/invalid JWT 401 checks are not substitutes. Next: authenticated dark acceptance and separately authorized isolated cursor proof; nonempty migration, business transfer and public release remain separately gated. Do not rerun initialization. Earlier entries below are historical.


## Current state — dark deployment accepted

[Actual approved recovery](team-hub-production-stage-tagging-recovery-result.md) completed the two-policy Stage tagging correction and unchanged-product deployment. Production Team Hub now has 8 security +41 product resources, exact runtime/environment/IAM verification, 199 actual-role checks, real Lambda initialization and dark monitoring acceptance. Both target tables are protected and empty; authority is uninitialized. Production source data/backups/protections, Core, Cognito, Master and protected domains are preserved. Working production permission save/revoke and public publication still require the separately authorized authority bootstrap, nonempty source migration/fence/reconciliation and real business acceptance. No Master publication is authorized by dark acceptance. Earlier execution/preparation statements below are historical.

## Current execution result — 24 October 2026

The owner approved dark package `2df8f08fec949b5b0eadac8fb0a472eea8edcc3f8bb3f3a2671d6afb5fd3909e`. Three exact artifacts were published; security CREATE 8 passed installed-state acceptance. Product CREATE 41 was inspected and executed once, then rolled back after a demonstrated `apigateway:TagResource` denial at Stage creation. Security remains CREATE_COMPLETE; the product record is ROLLBACK_COMPLETE. Service readback confirms target tables/functions/runtime roles/log groups and API routes/stages are absent. Source data/protections/backups, Cognito, Core, Master and protected stacks are preserved. No authority, migration or frontend change. [Authoritative result and recovery requirements](team-hub-production-permissions-dark-deployment-result.md), [current runbook](team-hub-production-migration-runbook.md).

**Further AWS writes require a revised reviewed tagging-lifecycle and failed-stack recovery package. Master publication remains held.** The following preparation record is preserved as historical evidence; its statements that both stacks are absent and no AWS writes occurred describe preparation, not the current partial execution state.

## Preserved preparation record

24 October 2026. **Master publication is held until working production permissions and live acceptance.** The owner explicitly selected completing the production permission backend before publication; a dashboard with disabled saving is not the approved release outcome.

## Actual state and preservation

Read-only RavenTest inspection confirmed account 058264289478, eu-north-1. Production Core is Active/Successful and its code matches accepted SHA-256 `dc2a7137a725f6a82582abc8a800f5d30846058ecdbe12965f81a19c887154c4`. Both independent production Team Hub stacks are **ABSENT**. The live public Team Hub still uses Legacy; local Ntgre's accepted TARGET_WRITER state is not production authority.

[Current inspection](team-hub-production-permissions-candidate-2026-10-24/v2/read-only-preflight.json) records ACTIVE source tables, all four R1 backups AVAILABLE and matching source TableIds/ARNs, PITR enabled and deletion protection enabled. Current strongly read counts are Team 1, TeamMembership 8, TeamRosterSlot 15 and PlayerChampionPoolEntry 101. These are 125 stored rows, not 125 active business entities or an atomic frozen snapshot. [Non-identifying roster classification](team-hub-production-permissions-candidate-2026-10-24/v2/roster-row-classification.json) identifies three active starters, one active RULES_V1 control row and eleven inactive roster/guard rows. Historical 121-row assumptions must not be substituted for the current state.

No production record was changed or deleted. No users, Cognito configuration, IAM, authority, source policies, APIs, stacks or hosting configuration were modified. Accepted R1/R2 and Core evidence was reused from the existing historical preparation checkout read-only; all new work is in the main project directory, with no new Git worktree. No unrelated Commerce/SWG work was staged, reverted or published.

Remote Master remains `5b0e0a574f503679120ca4e5e2a2c884d48de9e7`; existing Amplify job 156 is SUCCEED at the same commit. Master's frontend-only prebuilt pipeline accepts only earlier pinned artifacts. Never replace it with the current feature branch's broader Amplify backend pipeline. Master's tracked generated outputs are also not the accepted production Cognito binding; a production release must reuse verified production build outputs without repointing the protected main-folder Ntgre outputs.

## Prepared production permission candidate

[Immutable candidate](team-hub-production-permissions-candidate-2026-10-24/v2/candidate.json), based on approved but undeployed production manifest `2827cdbb908c3ef51096b54320a22e68bb898f3d3461ae3e95575eb4d787306d`:

| Artifact | SHA-256 |
| --- | --- |
| New review manifest | `7774091b4cc4af23b769d2940a3dcd3410e66d47df82548c8529683efffa5a53` |
| New security template | `d543bf22071bf001db042ee3af1f1d2f2c5ffb5ee020341531abbcef3dac6b33` |
| New product template | `e375a995da78fee165e2ef653225224e7546a1e9066cf3d980d8a488ce30d012` |
| New Read/Command runtime ZIP | `acbc6199e71ca001697a4f34636cada900dc50d3b9fa1068d2735c61425e3a5e` |

The earlier size-blocked candidate and all accepted parent bytes are preserved. [Archived source closure](team-hub-production-permissions-candidate-2026-10-24/v2/source-archive.json) preserves all 22 production runtime inputs. Production-specific tests exercise the actual revised handler/repository/codec using isolated synthetic DynamoDB transport, not production records. They verify production-only identities, rejection of Ntgre/wrong clients, saved grants and immediate revocation, actual Journal authority gating and protected Manager grants. This is not live Lambda/KMS or real Cognito acceptance.

The [exact proposed dark execution package](team-hub-production-permissions-candidate-2026-10-24/v2/execution-package.PROPOSED.json) has SHA-256 `2df8f08fec949b5b0eadac8fb0a472eea8edcc3f8bb3f3a2671d6afb5fd3909e`. It pins three conditional/checksummed object publications, both CREATE requests, complete expected resource inventories, rollback and exclusions. It records no approval and has not been executed. Combined focused, production-specific, frontend, authority and accounting validation passed 132 Node tests; the prior synthetic dashboard browser run passed 11 checks and the frontend build passed. These counts are separate from the 333 read-only IAM controls.

The new runtime enables `TEAM_HUB_PERMISSIONS=MEMBER_GRANTS_V1` in both complete environment maps. It adds authenticated permission inspection and replacement endpoints to the existing API, with per-team/current-member/target-version checks, actual transactional authority/epoch checks, idempotency and audit. Global Admin remains a fresh Core decision. Manager and Head Coach can configure subordinate grants; they cannot use the permission endpoint to alter protected leadership. Pool access does not automatically reveal shared reviews or private notes. Planned features cannot be granted.

Two routes are added relative to the accepted undeployed product: GET `/v1/teams/{teamId}/permissions` and PUT `/v1/teams/{teamId}/permissions/{membershipId}`. Existing same-domain invoke permissions already cover these paths and are unchanged. Both runtime code references and the explicit release switch change; all other prior product resources are byte-equivalent. Runtime IAM, runtime boundaries, trust, Core permissions, KMS conditions, Cognito bindings, tables and monitoring are unchanged.

Since production Team stacks are absent, future AWS change sets must be CREATE: **8 security additions and 41 product additions**, zero modifications/deletions/replacements. Relative comparison to an undeployed proposal is not an AWS-generated change set. No change set or artifact publication was performed during this task.

## Execution-policy review

Four deployment policy documents add exact new runtime/product references and the exact new product TemplateURL, retaining historical references. The full-length-key proposal exceeded the execution-boundary limit. The v2 proposal uses exact 128-bit digest-prefix object names with mandatory full SHA-256 verification and conditional non-overwrite publication. A collision is a stop condition, never overwrite permission.

Only unconditional Allow statements over disjoint service resource namespaces are combined in the execution boundary. No existing action or ARN is added by that factoring, no Resource wildcard or prefix is broadened, and no Condition, Deny, KMS or PassRole predicate is changed. The builder verifies 154 preserved service-valid authorization atoms. Invalid action/resource-service combinations are not service-reaching requests; this is explicitly not a claim of identical arbitrary invalid-resource simulator results. The applicable [AWS service authorization guidance](https://docs.aws.amazon.com/service-authorization/latest/reference/reference_policies_actions-resources-contextkeys.html) requires resource compatibility with each action.

The managed execution boundary is 6,142 characters before intrinsic resolution and 6,118 with the explicitly synthetic API ID used in review, within the [6,144-character managed-policy limit](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_iam-quotas.html). Execution inline policy is 9,780 before resolution, within the 10,240 aggregate role limit. Exact installed/resolved quotas must be rechecked after provisioning. This compact representation is a new proposed security candidate, not an already approved installed policy.

[Read-only AWS security validation](team-hub-production-permissions-candidate-2026-10-24/v2/security-validation.json): four Access Analyzer policy checks with zero ERROR/SECURITY_WARNING findings; 333 successful policy and identity/boundary-intersection controls, including retained lifecycle/PassRole/isolation controls, exact new object and TemplateURL positives and wrong-object/URL negatives; both CloudFormation templates validated. Generated API ID is a labelled synthetic value because the API is not yet deployed. No actual-role, Organizations, KMS resource-policy, Lambda creation or secret decryption success is inferred from simulation.

## Frontend integration and release requirements

The main-folder dashboard has the staff hierarchy, feature table, member selector, dependent checkboxes, Save, Untick all and Discard. Save requires the actual permission contract and backend acknowledgement. There is no browser-storage fallback. The current deployed Ntgre/Legacy APIs still lack the feature; Save therefore remains unavailable there until a separately reviewed compatible deployment. Proposed staff positions beyond the current Head Coach, additional games, ownership transfer and future roadmap tools are not implemented by this grant update.

`src/features/team-hub/api/production-client.mjs` provides a production-only candidate client with exact production Cognito/Core binding, live authenticated authority reads, stale-epoch rejection and the new permission operations. It rejects Ntgre identities/endpoints and does not assume epoch 5. Proposed production endpoint/activation manifests remain NOT_DEPLOYED, reviewed false and epoch null. They cannot activate a release. The public Legacy service is not silently redirected.

Before public publication, migration compatibility must also preserve the current production personal-role preferences, founder-team entitlements, membership revocation and three-substitute policy. Reconcile active, inactive and RULES_V1/guard records explicitly; never import control rows as players or discard retained champion pools. R1 backups are historical capture points; use current PITR and separately reviewed final maintenance recovery evidence for later writes. A grant feature does not waive the nonempty production migration, writer-fence, S3 quarantine or rollback gates.

## Ordered authorization gates

1. **New dark deployment review and explicit approval.** The old exact-hash approval does not authorize this revised runtime/security/product. Proposed scope is the three pinned object publications, security CREATE 8 and product CREATE 41, with rollback and installed-state/dark acceptance gates only. No source writes, authority initialization, Cognito changes or Master publication. Require an actual operator window, no concurrent administrative deployment, fresh source/recovery/identity/Core/policy/collision/quota evidence and exact AWS-generated change-set inspection before any mutation.
2. **Installed dark acceptance.** Verify all actual policies, boundaries, trusts, generated API/secret identities, runtime hashes/configurations, Core integration and monitoring. No business data or authority row is seeded by stacks. Stop on unexpected success or drift; do not patch permissions or retry ambiguous operations.
3. **Separately reviewed authority bootstrap and isolated proofs.** Conditionally create only the production LEGACY_WRITER record under a fixed restricted executor after prerequisite acceptance. Confirm all eighteen normal business routes deny; prove cursor/KMS behaviour separately without activating business authority.
4. **Separate production maintenance/migration authorization.** Refresh the complete current source export under approved secure custody; preserve new fields/control-state semantics, install and prove original-principal fences, reconcile data and S3 quarantine, use monotonic conditional authority transitions and verify real five-persona business and permission save/revoke acceptance. Do not reuse Ntgre epoch values or historical record counts.
5. **Master publication after successful backend/business acceptance.** Prepare an exact-Master frontend-only build with verified production outputs, the actual production endpoint and reviewed actual server epoch, preserving Master-only fixes and unrelated domains. Verify rollback, obtain the scoped hosting/publication authorization and monitor the public site. Never merge the dirty feature branch wholesale or publish an interface that claims permissions were saved when they were not.

Post-grant rollback must retain a compatible codec or transactionally remove optional grant attributes under a separately reviewed recovery. An old strict codec rejects even an empty `permissions` array. After target writes, a frontend rollback cannot safely reopen Legacy authority; containment, reverse transformation and reconciliation remain mandatory.

**Outcome: production permission implementation and security candidates prepared; Master not pushed. Production deployment, migration and live acceptance remain separately authorized execution gates.**

# Team Hub 2B4 writer-fence preparation

6 October 2026. Current live authority remains LEGACY_WRITER. No fence policy, authority record or authority transition was installed. [Migration control](README-PHASE2-MIGRATION.md).

| State | Legacy business writes | Target business writes |
|---|---|---|
| LEGACY_WRITER | Allowed | Denied |
| FROZEN | Denied | Denied |
| TARGET_WRITER | Denied | Allowed only after separately accepted production authorization/adapter |

[State machine and future transaction condition](../../domains/team-hub/parity/fence.mjs) implement the truth table and compile the target CONTROL#AUTHORITY/STATE condition on mode, epoch and version. No direct normal-user business path is activated in this candidate. The current candidate independently rejects ordinary callers before repository access. Verification is a different synthetic namespace, with explicit subject/Team allowlist and expiring lease, and is disabled by default. It cannot serve arbitrary Team IDs even with an administrative test grant. FROZEN/TARGET_WRITER configuration does not enable this verification handler.

Authority record classification: INFRASTRUCTURE_CONTROL_STATE, but it is still real durable state. No record is seeded. The accepted 2B3 design described it without authorizing creation. The future normal-user adapter must place the authority ConditionCheck in the same transaction as each business mutation, reserve its extra transaction slot, and receive separately reviewed control-read permission. This candidate deliberately has no CONTROL#AUTHORITY IAM grant. Do not treat the external test lease as an installed production fence or accept normal-user cutover on this evidence.

## Legacy coverage and smallest enforcement unit

[Offline exact-four-table policy compiler](../../scripts/team-hub-2b4/legacy-fence.mjs) prepares all-principal denies for PutItem, UpdateItem, DeleteItem, BatchWriteItem and PartiQL writes in FROZEN/TARGET_WRITER; LEGACY_WRITER preserves existing policy statements. [Exact proposals](team-hub-2b4-evidence-2026-10-06/legacy-fence-proposal.json). Before a future installation, freshly retrieve/merge current policies, compare revisions and inspect the entire result. No resource policy was installed here.

These resource-level denials cover mutateTeamHub/shared Lambda, generated AppSync/direct models, Admin Team paths, supported privileged/manual tools and compatibility paths because all eventually write the same four source tables. Their transaction actions are governed by underlying item permissions. The resolved [writer inventory](team-hub-2b3-final-evidence-2026-10-05/coverage.json) remains the reviewed starting point; refresh effective principals and consumers at freeze.

Logo writers and already issued presigned URLs also require the separately reviewed exact team-logos/ prefix deny in the existing bucket policy. Preserve every unrelated statement and object prefix. Branding remains deferred here; do not interpret deferral as permission for Legacy logo writes during a future freeze. The prior [write-set proposal](team-hub-2b3-final-evidence-2026-10-05/write-sets.json) includes this resource-policy mechanism. No S3 write or new storage is performed.

Resource-policy installation can avoid a giant Legacy CloudFormation update; it still needs its own exact AWS-write review. No Legacy source edit, synthesis or change set is prepared. Privileged operators able to remove policies or replace control-plane resources require an explicit maintenance/deployment freeze and break-glass control; resource denies cannot prove an administrator can never undo them. Drain in-flight calls/retries/subscriptions and expired presigned grants, then prove negative writes from every inventoried path before transferring authority. Generated provider updates can reset direct source PITR/deletion protection, so the existing no-Legacy-deploy operational guard remains.

Target business activation, all-path live denial proof and authority rollback remain later gates. No FROZEN or TARGET_WRITER transition occurred. No resources became migrated/cutover/retirement candidates.

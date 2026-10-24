# Production Team Hub migration runbook

## Production authority initialized — 24 October 2026

[Actual C1 result](team-hub-production-c1-result.md): one fixed conditional workflow SUCCEEDED; complete strong readback confirms **LEGACY_WRITER epoch/version 1/1**. The two temporary resources were removed and absence verified. Operational is empty; Journal contains only the authority control row. Permanent IAM/runtime, source data/protections/four backups, Core/Cognito, Master and protected domains remain unchanged. Authenticated authority 200 and all **18** business-route denial checks remain pending real production sessions; missing/invalid JWT 401 checks are not substitutes. Next: authenticated dark acceptance and separately authorized isolated cursor proof; nonempty migration, business transfer and public release remain separately gated. Do not rerun initialization. Earlier entries below are historical.


## Current state — dark infrastructure accepted, authority uninitialized

[Accepted stage-tagging recovery](team-hub-production-stage-tagging-recovery-result.md) completed under exact package `88039809ac363780db0df392081580b70f58fd023166249693f881f18c59473d`. Security UPDATE_COMPLETE (8) and product CREATE_COMPLETE (41); approved runtime SHA `acbc6199e71ca001697a4f34636cada900dc50d3b9fa1068d2735c61425e3a5e` installed in both healthy functions. API `9wk4a41l5m` has 19 reviewed JWT routes; target tables are ACTIVE/PITR/deletion protected and empty. Production authority **does not exist**; do not infer LEGACY_WRITER or an epoch from infrastructure completion. Public Legacy, source data and recovery, Core/Cognito, Master and protected domains remain unchanged.

Do not rerun failed-stack deletion or CREATE. Preserve actual ownership receipts, exact artifacts, historical failures and the narrowly recorded two-finding Analyzer exception. The next gate is a separately reviewed fixed conditional production authority bootstrap, followed by authenticated authority/eighteen-route dark acceptance and approved isolated cursor proof. Nonempty migration/fence/quarantine/reconciliation, five-persona business/permission acceptance and frontend-only Master publication retain separate authorization gates. Existing data are 125 stored source rows at this acceptance, not the historical 121 baseline or an atomic frozen export.

## Prepared correction — new validation decision only

[Exact review and future requests](team-hub-production-stage-tagging-recovery-review.md): proposed execution package `88039809ac363780db0df392081580b70f58fd023166249693f881f18c59473d` contains one conditional security-artifact publication, exactly two security-policy modifications, verified-empty failed product stack-record deletion and unchanged product CREATE 41. All 393 IAM cases pass with tagging controls batched separately from API Gateway HTTP-verb controls. Exactly two Analyzer INVALID_ACTION errors for the provider-required TagResource action remain blocking until explicitly accepted by the owner. No other Analyzer error/security warning may be waived. Before execution require a valid attended window and fresh complete preflight; preserve existing security API/secret and all source/backup/Core/Cognito/Master protections. No authority or business data change is included.

## Current execution stop — 24 October 2026

[Actual dark-deployment result](team-hub-production-permissions-dark-deployment-result.md) is authoritative. Security is CREATE_COMPLETE (8); product is ROLLBACK_COMPLETE after its inspected 41-addition attempt. AWS denied `apigateway:TagResource` on the new API's stages collection. No automatic retry, IAM patch, stack deletion or authority/data/frontend operation is authorized by that failed attempt.

Preserve security API `9wk4a41l5m`, cursor secret, roles/boundaries, three exact published artifacts and historical evidence. Both target tables/functions/runtime roles/log groups are service-verified absent; API routes/stages/integrations/authorizers and product alarms are absent. Refresh actual ownership/existence before any future recovery; do not infer retained tables from DELETE_SKIPPED events.

## Ordered gates

1. **Recovery review:** pin a minimal provider-tagging execution IAM correction, extend lifecycle tests and verify policy quotas/isolation. Prepare recovery of only the failed product stack record, preserving accepted security. Require explicit revised-package authorization before mutation.
2. **Dark deployment:** fresh operator/window/source/backup/Cognito/Core/Master/protected-domain checks; exact hashes and installed IAM; complete AWS-generated change-set inspection; rollback enabled; terminal state followed by actual service readback. Stop on drift, unexpected resources, denial, ambiguous writes or incomplete rollback. No automatic permission broadening or retry.
3. **Authority bootstrap:** separate fixed-executor review/approval for conditional production LEGACY_WRITER initialization. No Ntgre epoch substitution. Require actual authority readback, eighteen business-route denials and monitoring. Actual cursor decryption requires its approved isolated proof; never retrieve secret material into evidence.
4. **Nonempty migration:** separately authorize secure current source capture, original-principal writer fences, S3 logical quarantine/audit, consistent final export, deterministic transform, conditional import and reconciliation. Preserve current roster/control/archive state, role preferences, entitlements, memberships and personal pools; historical backup counts are not current migration counts.
5. **Business authority:** only after all prior gates pass, perform separately approved monotonic transitions and real five-persona reads/mutations/permissions/privacy/revocation/cursor/idempotency/audit acceptance. After target writes, rollback requires containment and reconciliation; frontend rollback cannot reopen Legacy authority.
6. **Public website:** exact-Master frontend-only release with actual production endpoints/Cognito/verified server epoch, preserved Master-only fixes and explicit publication approval. Keep the current Legacy website until backend and business acceptance pass. Do not deploy the feature branch's broad Amplify pipeline.

Accepted production Core and R1/R2 recovery evidence remains valid. Retain source PITR/deletion protection and all four backups. Never disable successful protections or restore an unhealthy configuration automatically. Stop and preserve evidence on failed gates. No Legacy retirement, Master publication or destructive cleanup is authorized here.

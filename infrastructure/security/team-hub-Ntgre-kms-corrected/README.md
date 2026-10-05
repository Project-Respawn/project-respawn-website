# Team Hub KMS-only security correction

This package prepares review artifacts only. It does not install IAM, publish assets, create change sets or deploy resources.

Run `node infrastructure/security/team-hub-Ntgre-kms-corrected/build.mjs` from the repository root to verify the preserved product and previous security inputs and produce the corrected documents. The only policy change is removal of `kms:*` from the execution Deny action list in both the identity policy and execution boundary, for first-create and steady state. No KMS Allow is added. Runtime IAM, caller policy, API permissions and expiry are unchanged.

`inventory.mjs` and `ownership.mjs` perform read-only AWS inspection. `validate.mjs` runs the supported complete security suite and real customer-key negatives. It deliberately excludes the 280 previously resolved unsupported simulator representations. IAM-only implicit denial on the Lambda key is not proof that service-managed encryption fails: the current AWS-managed key resource policy supplies the Lambda service path. Customer key policies and grants must be reviewed separately.

`verify-lockdown.mjs` tests the preserved exact-ID binder with the corrected template and validates ownership failure cases. Its API ID is a local test fixture, never a deployment target.

The unpublished product ZIP must be uploaded with explicit AES256 (SSE-S3), then checked using HeadObject before any separately authorized deployment. The asset bucket defaults to AWS-managed SSE-KMS; do not silently inherit that default or add artifact KMS permissions. First-create authority expires at 2026-10-06T13:51:32.179Z. Recheck remaining margin at actual execution; review readiness is not execution authorization.

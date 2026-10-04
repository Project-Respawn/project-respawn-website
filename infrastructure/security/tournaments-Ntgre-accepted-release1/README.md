# Accepted Tournament Release 1 security

This is the **current accepted reference package** for `ProjectRespawn-Tournaments-Ntgre` in account `058264289478`, region `eu-north-1`. It is configuration/evidence, not an automatically deployable security stack.

| File | Accepted meaning |
|---|---|
| `execution-policy.json` | Installed ExecutionBoundary **IAM v8**, also the CloudFormation execution role's identity policy; practical API Gateway lifecycle permissions and reviewed other-service restrictions |
| `runtime-boundary.json` | Installed RuntimeBoundary **IAM v2**; only exact AWS-managed Lambda-key Decrypt escapes the blanket non-logging deny; all other keys and KMS administration denied |
| `deployment-policy.json` | Existing DeployBoundary, unchanged; scoped root/service-role/artifact selection |
| `runtime-identity-policy.json` | Existing PreviewLogsOnly inline identity policy; zero KMS Allows |
| `runtime-trust.json` | Lambda service only |
| `execution-trust.json` | Designated CloudFormation service role trust |
| `deployment-trust.json` | Original approved deployment caller trust |
| `package-status.json` | Source hashes, candidate and installed versions, evidence references; no mutation authorization |

Execution policy v8 and runtime boundary v2 are **installed IAM VersionIds**, not the unrelated historical API Gateway diagnostic candidates named v8/v9. No temporary first-create, renewal or recovery permission is selected by this package.

Run `node scripts/checkpoints/verify-tournament-release1.mjs` from the repository root to compare these policies semantically with the recorded installation, verify hashes and validate accepted endpoint/environment configuration. This is offline and makes no AWS calls. Live deployment facts are dated evidence, not a fresh AWS inspection.

The original `tournaments-Ntgre-final` files remain immutable historical inputs to candidate `b75a91494c03606d825e234a65d295c184067820cd77dfc84e11a2c83484ae2f`; their original runtime/steady policies are superseded and must not be installed over this accepted state. The narrower `tournaments-Ntgre-kms-corrected` and `tournaments-Ntgre-runtime-kms` files retain the exact accepted correction sources referenced in the reports. They match this package; no duplicate has different active policy semantics.

Do not redeploy the original security bootstrap or run historical recovery commands. Release 2, rollback, IAM changes, production promotion and infrastructure execution require a separately reviewed concrete scope. The accepted stack is already deployed with eleven resources.

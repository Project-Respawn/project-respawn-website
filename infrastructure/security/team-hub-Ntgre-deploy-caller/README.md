# Restricted Team Hub deployment caller

This package records the authorized 2026-10-05 Team Hub read-path deployment. Do not rerun mutation commands as a generic deployment shortcut. Future changes require their own pinned candidate and execution authorization.

The product remains candidate `d458da9a7a8d1d519aaab05418fda95097a26256da0a297b71c95a5aaef5085f`. `build.mjs` changes only the prior security template's PreparationCaller document and adds DeploymentCaller. The existing preparation managed policy is reused as the role's sole identity attachment and permissions boundary. Its changes add exact template/ZIP reads and three stack-scoped inspection actions. No new managed policy, IAM user or long-lived credential is needed. Security inventory grows from four resources to five.

`ProjectRespawn-TeamHub-Ntgre-Deploy` trusts only the existing RavenTest operator. CloudFormation product preparation, inspection, execution and monitoring run in its assumed session. `common.mjs` keeps temporary STS credentials in process memory and passes them only to child-process environments; it neither prints nor writes them. The broad operator is reserved for explicitly authorized security custody, exact artifact publication and read-only audit work.

The caller can pass only the existing `ProjectRespawn-TeamHub-Ntgre-ReadProofExecution` role to CloudFormation. The user explicitly resolved the prompt's CfnExecution naming discrepancy in favor of that installed role. Other roles, stacks, business data and direct service administration are denied. Account-wide ListStacks is not granted; targeted DescribeStacks and ListStackResources provide inspection.

The exact template URL is restricted by policy. Assets require explicit AES256 publication and checksum/readback verification; bucket-default KMS encryption must not be inherited. The caller's real S3 reads and actual principal simulations are recorded in the evidence directory.

After product creation, `ownership.mjs` verifies all eleven CloudFormation identities, the pinned product template and the API's system/project/domain/environment tags. It uses the preserved binder for the actual API ID and retains the new caller resources in the steady-state security template. `lockdown.mjs` permits only two security resource modifications: execution identity and execution boundary. It preserves caller/runtime permissions. Active first-create authority is removed before browser acceptance; an inactive historical managed-policy version is not effective authority.

Read-only validation comprises caller positive/negative simulations, Analyzer checks, actual execution-role lockdown simulations, actual runtime negatives and logging inclusion/deny controls. The logging simulator limitation is retained as raw evidence; it is resolved independently, not relabeled as a raw Allow. Browser verification keeps tokens in the browser and records only sanitized outcomes. Wrong-issuer/client tampered-token tests also invalidate signatures, so authorizer configuration and independent handler tests establish those separate controls.

See [release report](../../../docs/architecture/team-hub-2b2-read-path-release1-2026-10-05.md) and [reusable caller pattern](../../../docs/architecture/independent-domain-deployment-callers.md). The endpoint manifest is acceptance output, not frontend cutover.

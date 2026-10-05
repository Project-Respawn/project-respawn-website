# Team Hub Phase 2B1 resource accounting

**Local synthesis only: 43 product resources + 3 domain-security resources = 46.** No resource was created in AWS. Full proposed product envelope remains 50–65, maximum 75 including security. This narrower offline skeleton is below the forecast lower bound, not padded to match an estimate. Owned logo storage, release/version/alias machinery and any later observability additions are absent and must be counted when designed.

| Resource | Product | Security | Total |
|---|---:|---:|---:|
| HTTP API | 1 | 0 | 1 |
| JWT authorizer | 1 | 0 | 1 |
| Routes (six read, twelve command) | 18 | 0 | 18 |
| Integrations | 2 | 0 | 2 |
| Stage | 1 | 0 | 1 |
| Lambda functions | 2 | 0 | 2 |
| Lambda invoke permissions | 2 | 0 | 2 |
| IAM roles | 2 | 1 | 3 |
| IAM managed policies/boundaries | 2 | 2 | 4 |
| Log groups | 3 | 0 | 3 |
| Access-log resource policy | 1 | 0 | 1 |
| CloudWatch alarms | 6 | 0 | 6 |
| DynamoDB tables | 2 | 0 | 2 |
| S3 buckets | 0 | 0 | 0 |
| Nested stacks/custom providers/Cognito/AppSync | 0 | 0 | 0 |
| **Total** | **43** | **3** | **46** |

The operational table has two keys-only GSIs, `BySubject` and `ByStatus`, represented as table properties rather than separate CloudFormation resources. The journal has application expiry/TTL for idempotency; audit items omit TTL. Both local table definitions have Retain policies, deletion protection and PITR enabled. These are proposed target settings only: existing Legacy tables, backup/PITR/TTL settings and delete policies were not changed. No data read/copy/backup was performed.

The product is `ProjectRespawn-TeamHub-Ntgre`; the separate local security root is `ProjectRespawn-TeamHub-Ntgre-Security`. Runtime roles and boundaries belong to the product count. The three separately counted bootstrap definitions are the execution role, its permissions boundary, and an unattached preparation-caller policy. Inline role policies are counted within their role resources; there are no hidden `AWS::IAM::Policy` objects.

CDK produces two asset declarations and two runtime bundles; these are files, not additional stack resources. No bootstrap bucket/role is synthesized or assumed newly created. A later asset-publication/security bootstrap review must account for any missing shared prerequisites and installation identities. No live endpoint output/manifest is emitted.

The [retained synthesis receipt](team-hub-2b1-evidence-2026-10-04/synthesis-receipt.json) contains per-template hashes/counts, exact resource types, bundled source closure and loaded library hashes. All libraries loaded during synthesis resolve beneath the Team package's own `node_modules`. The process is network/subprocess guarded and receives no AWS credential/config environment. The runner rejects wrong environments, deployment flags, unexpected roots, context lookups, nested/custom resources and totals above 75. Negative tests exercise prohibited imports and socket calls.

No Legacy, Tournament, Creator or Commerce application was synthesized or bundled. Existing Legacy source inventory (51 hashes) and Tournament accepted hash verifiers pass unchanged. Full Legacy resource counts are retained historical baselines, not refreshed live measurements. This task makes no claim that extracting Team will immediately remove 192 Legacy declarations: physical retirement is a separately authorized migration stage.

The generic repository CI selector remains unsuitable for an independent-domain-only change; its attempted child startup failed before Legacy synthesis. See the [implementation validation caveat](team-hub-2b1-implementation.md). Team-specific accounting passes independently and does not refresh the Legacy debt receipt.

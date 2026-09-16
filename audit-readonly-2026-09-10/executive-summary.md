# Read-only AWS audit findings

Audit date: 2026-09-12. Account **058264289478**, existing **default** profile, region **eu-north-1**, verified IAM user **RavenTest**. Repository **master @ 7838e2b30a1cc518c1cd13e377c15cf7d17a9595**. Global IAM, S3, CloudFront and Route 53 metadata included where available. Reports reflect a collection interval, not an atomic snapshot.

## Verified facts

- 397 current stacks and 174 additional historical/deleted stack summaries; 16969 inventory rows including subresources and conservative historical retained records. Row counts are not billing units.
- Production root is UPDATE_COMPLETE. Production FunctionDirectiveStack has **475 resources**, five below the repository's 480 guard; AWS's documented template limit is 500. Staging has 463. See stack inventory for exact identifiers.
- Local outputs resolve to protected root **amplify-projectrespawnwebsite-Ntgrestage8-sandbox-767a43f84e** through Cognito pool eu-north-1_X5BIIkPZR. This root is **UPDATE_FAILED**. Its 10 September auth event reports invalid Cognito AttributeDataType. No repair attempted.
- Recorded operation **df1344e0-9717-11f1-b028-0e0a66557d45** is still available: 77 operation events; its FunctionDirectiveStack reached UPDATE_COMPLETE on 13 August. Current status of that stack: UPDATE_COMPLETE. This historical cleanup incident is separate from the later Cognito failure. The canonical root/data/function current states are listed below.
- 287 DynamoDB tables; 58 report nonzero approximate item counts. None has deletion protection; 3 have PITR enabled.
- 139/141 log groups have no retention setting. 1 bucket has a public policy: projectrespawn.com. Account-level S3 public-access block is absent; see bucket-specific controls.
- Account-wide unblended Cost Explorer totals: **USD 43.5904** for 13 August - 11 September (30 complete days), **USD 46.3948** for 14 June - 11 September (90 complete days). These are not solely website costs; environment allocation is limited.

## Environment map

| Environment | Root stack | Status | Termination protection |
| --- | --- | --- | --- |
| preview/Demo | amplify-d2cux232bpa951-Demo-branch-e6d14a6927 | CREATE_COMPLETE | false |
| staging | ProjectRespawnTwitchRuntimeStaging | CREATE_COMPLETE | false |
| sandbox/Ntgrestage8-b3e3a9eb96 | amplify-projectrespawnwebsite-Ntgrestage8-sandbox-b3e3a9eb96 | REVIEW_IN_PROGRESS | false |
| sandbox/Daniel | amplify-projectrespawnwebsite-Daniel-sandbox-bbfa03cf7c | UPDATE_COMPLETE | false |
| staging | amplify-d2cux232bpa951-staging-branch-8b38605406 | UPDATE_COMPLETE | false |
| protected-local/Ntgrestage8-767a43f84e | amplify-projectrespawnwebsite-Ntgrestage8-sandbox-767a43f84e | UPDATE_FAILED | false |
| sandbox/Ntgrestage8-583d036e70 | amplify-projectrespawnwebsite-Ntgrestage8-sandbox-583d036e70 | UPDATE_COMPLETE | false |
| production/master | amplify-d2cux232bpa951-master-branch-53ef67772a | UPDATE_COMPLETE | false |
| historical/development | amplify-d2cux232bpa951-development-branch-62707e873c | ROLLBACK_COMPLETE | false |
| historical/Ntgre | amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332 | UPDATE_FAILED | false |
| shared/bootstrap | CDKToolkit | CREATE_COMPLETE | false |

| Stack | Environment | Listed resources | Status |
| --- | --- | --- | --- |
| amplify-d2cux232bpa951-Demo-branch-e6d14a69-amplifyDataFunctionDirectiveStackNestedSta-KGT4TIF4G252 | preview/Demo | 355 | CREATE_COMPLETE |
| amplify-projectrespawnwebsite-Ntgrestage8-s-amplifyDataFunctionDirectiveStackNestedSta-1AYDVUNTVUEV5 | sandbox/Ntgrestage8-b3e3a9eb96 | 0 | REVIEW_IN_PROGRESS |
| amplify-projectrespawnwebsite-Daniel-sandbo-amplifyDataFunctionDirectiveStackNestedSta-GB0QU4Y6A57T | sandbox/Daniel | 355 | UPDATE_COMPLETE |
| amplify-d2cux232bpa951-staging-branch-8b386-amplifyDataFunctionDirectiveStackNestedSta-86G2CHX8JSF4 | staging | 463 | UPDATE_COMPLETE |
| amplify-projectrespawnwebsite-Ntgrestage8-s-amplifyDataFunctionDirectiveStackNestedSta-1WM93IZ1NI1A3 | protected-local/Ntgrestage8-767a43f84e | 463 | UPDATE_COMPLETE |
| amplify-projectrespawnwebsite-Ntgrestage8-s-amplifyDataFunctionDirectiveStackNestedSta-1YRD7T0AJD3P | sandbox/Ntgrestage8-583d036e70 | 307 | UPDATE_COMPLETE |
| amplify-d2cux232bpa951-master-branch-53ef67-amplifyDataFunctionDirectiveStackNestedSta-161ITRTNOX6TX | production/master | 475 | UPDATE_COMPLETE |
| amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataFunctionDirectiveStackNestedSta-E7V8WE38CB6U | historical/Ntgre | 331 | UPDATE_COMPLETE_CLEANUP_IN_PROGRESS |

## Probable findings

- Historical environments and retained resources may contribute to maintenance burden. Similar names do not establish duplication or safe removal.
- Storage recovery controls and indefinite log retention deserve review; lack of deletion protection/PITR does not prove data loss or lack of all backups.
- Current repository model coverage differs by environment; generated resources lack direct literal references by design. No exact synthesis/deployed-template equivalence is claimed.

## Unverified candidates

Only provisional candidates in duplicate-and-orphan-candidates.md. No resource is RETIRE_READY. No backup decision or rollback plan was created. Protected identity/data resources remain protected regardless of activity.

## Access and evidence limitations

0 unresolved command failures at generation; full error evidence and scope exclusions are in evidence-and-commands.md and the other reports. Successful absence responses (for example no lifecycle configuration or no export consumers) are distinguished from access failures. Existing monitoring can have sparse data; no datapoints is not zero usage. The audit uses metadata and daily CloudWatch series, no live workload tests, user documents, credential values or secret values. Deleted-stack history is limited by AWS retention. Regional service inventory is eu-north-1; account-wide costs may include other regions/services. No drift detection or backend synthesis was run. Frontend artifacts are dated 3 September and predate HEAD.

## Recommended actions requiring future approval

1. Review canonical Cognito schema failure without replacing the pool or sandbox.
2. Plan a separately reviewed stack-size change before adding more custom operations.
3. Decide table recovery/deletion protection and log retention requirements by environment.
4. Review public storage intent, wildcard IAM/CORS and the legacy RavensBot runtime.
5. Observe provisional candidates and confirm ownership, dependencies, backups and rollback before any cleanup proposal.

No AWS/application change, deployment, invocation, drift detection or change set was performed. Only authorised local reports and ZIP are produced.


## Cleanup incident: current owning chain

| Stack | Current status |
| --- | --- |
| amplify-projectrespawnwebsite-Ntgrestage8-s-amplifyDataFunctionDirectiveStackNestedSta-1WM93IZ1NI1A3 | UPDATE_COMPLETE |
| amplify-projectrespawnwebsite-Ntgrestage8-sandbox-767a43f84e-data7552DF31-NAE95CTVMI8U | UPDATE_COMPLETE |
| amplify-projectrespawnwebsite-Ntgrestage8-sandbox-767a43f84e | UPDATE_FAILED |

The canonical root/data/function chain is no longer in the previously reported cleanup state. The root now has the separate auth failure described above. 24 other current stacks remain in cleanup, all identified individually in stack-inventory.csv; do not conflate their environment with this operation.

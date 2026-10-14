# Team Hub 2B6 — generated delete proof correction

**GENERATED DELETE PROOF READY FOR EXECUTION REVIEW.** Preparation only; no AWS mutations, policy/resolver/role changes, fixture creation or authority transition.

## Diagnosis

The failed request `29a7a14d-2a8d-4d89-98ee-82fcb7aa30c9` returned GraphQL HTTP 200, `deleteTeam:null`, no errors. The old validator incorrectly required an exposed ConditionalCheckFailedException for every generated operation.

Fresh inspection of all four installed delete pipelines shows an authorization GetItem function, a NONE post-authorization function, then an original-table DeleteItem function. The final function unconditionally builds DeleteItem with an `attribute_exists(id)` condition plus the supplied contradictory condition. There is no absent-item request short circuit in that function, custom failure Lambda, or response-template branch suppressing AccessDenied. Its response template calls `$util.error` when `$ctx.error` is present; the resolver returns the preceding result.

AWS documents that after a DeleteItem condition failure AppSync reads the current item and treats the operation as successful when the item is absent. Thus the documented datasource reconciliation explains the observed null, rather than a successful deletion or evidence of a fence. [AWS condition handling](https://docs.aws.amazon.com/appsync/latest/devguide/aws-appsync-resolver-mapping-template-reference-dynamodb-condition-expressions.html).

Historical request-level execution cannot be independently reconstructed: current API has no logConfig and X-Ray is disabled; no matching AppSync log group exists. The old receipt establishes the GraphQL response only. The root-cause diagnosis is supported by the exact installed mappings, AWS behavior and absent state; it is not a fabricated historical DynamoDB trace.

IAM request authentication happens at AppSync admission. Within the installed pipeline, the first datasource GetItem occurs before the authorization function's response-template checks. Do not claim all authorization evaluation precedes all data access. For direct RavenTest IAM identity the response template sets hasAuth/isAuthorized; the next NONE function checks that state. No authorization order is changed by this correction.

## Exact original-principal path

| Mutation | DynamoDB datasource / table | Original service role name |
| --- | --- | --- |
| deleteTeam | TeamTable / Team-dxb2tdlulrch7hj2pts2mfijia-NONE | TeamIAMRoleb6b1b2-dxb2tdlulrch7hj2pts2mfijia-NONE |
| deleteTeamMembership | TeamMembershipTable / TeamMembership-dxb2tdlulrch7hj2pts2mfijia-NONE | TeamMembershipIAMRolb0882a-dxb2tdlulrch7hj2pts2mfijia-NONE |
| deleteTeamRosterSlot | TeamRosterSlotTable / TeamRosterSlot-dxb2tdlulrch7hj2pts2mfijia-NONE | TeamRosterSlotIAMRol236c3d-dxb2tdlulrch7hj2pts2mfijia-NONE |
| deletePlayerChampionPoolEntry | PlayerChampionPoolEntryTable / PlayerChampionPoolEntry-dxb2tdlulrch7hj2pts2mfijia-NONE | PlayerChampionPoolEn5c689d-dxb2tdlulrch7hj2pts2mfijia-NONE |

All roles are in account 058264289478; API is dxb2tdlulrch7hj2pts2mfijia, eu-north-1. Caller forwarding is false. Exact resolver ARNs, ordered function IDs, trust/policies and role/table ARNs are pinned in [fresh paths](team-hub-generated-delete-proof-evidence-2026-10-13/resolver-paths.json), [datasources](team-hub-generated-delete-proof-evidence-2026-10-13/data-sources.json) and [actual-role IAM review](team-hub-generated-delete-proof-evidence-2026-10-13/iam-review.json).

## Safe diagnostic and response requirements

Reuse each original pinned GraphQL document and variables unchanged. Diagnostic IDs are `__team_hub_fence_probe_20261012_<Model>`. Require strongly consistent absence immediately before and after, reserved-key custody, and complete source reconciliation. No new record is needed. The input condition requires one model attribute both to exist and not exist; it is impossible for any item. Do not remove that condition even if absence is confirmed.

Read-only AWS EvaluateMappingTemplate produced actual DeleteItem requests for all four installed final-function templates. For Team the generated condition is `attribute_exists(id) AND attribute_exists(slug) AND attribute_not_exists(slug)` using expression-name substitutions. The other three evaluated conditions are pinned likewise. This evaluator does not invoke DynamoDB or prove live enforcement.

Before fence: existing null response is compatible with AppSync's documented conditional-delete reconciliation. It is not standalone evidence of a write attempt. Certify exact current pipeline/datasource bindings, evaluated conditional DeleteItem, actual-role GetItem/DeleteItem allowance, unchanged absence and the existing guarded transport control together. An exposed conditional failure is also compatible; authorization or validation failures are not acceptable controls. Any new before-fence mutation invocation needs execution authorization and the same guards.

After the separately authorized write-only fence is installed: replay the same original GraphQL mutation with RavenTest IAM SigV4. Require GraphQL errors containing DynamoDB DeleteItem AccessDenied, the exact source table ARN, the original datasource assumed-role identity and explicit denial in a resource-based policy. Archive the AppSync request ID, sanitized error and available underlying DynamoDB request ID. Reconfirm installed fence hash and live datasource role binding before correlation. Preserve source digests/counts and diagnostic absence after each request.

HTTP 200 is only transport status. Null, ConditionalCheckFailedException, unauthorized GraphQL admission, validation failure, GetItem denial, wrong role/table/action, or identity-policy denial all fail the installed-fence gate. If AWS omits the required original-principal/action/resource attribution, stop; do not infer it from a simulator or substitute a helper. Supported additional read-only evidence may be inspected, but no logging installation is authorized by this report. No fallback fixture or changed resolver is proposed.

This method proves enforcement through the actual unchanged generated datasource during future maintenance, not through a custom Lambda, temporary role or direct operator DeleteItem. AWS-generated service errors remain mandatory even though pre-fence null classification is corrected. The separately accepted shared/cleanup criterion is neither changed nor expanded.

## Validation and pins

- Eight read-only AWS mapping evaluations: four guarded DeleteItem requests and four supplied-error propagation checks. Injected errors are synthetic evaluator inputs, not live fence receipts.
- Sixteen focused tests pass, including all four evaluated requests and rejection of null, conditional failure, wrong role/action/table, identity denial, caller denial, changed state, missing request ID and unverified fence.
- Twelve actual-role simulations pass: original table GetItem/DeleteItem allowed; independent Operational DeleteItem denied for all four roles. Four identity policies validated with Access Analyzer, zero blocking findings. Simulation is not installed-resource-policy enforcement.
- All four source tables still empty and each exact diagnostic ID absent. Authority strongly read at LEGACY_WRITER epoch/version 1/1. Eleven maintenance and 21 S3 package references preserved. No resource addition/modification/deletion, no role change, no CloudFormation deployment.

New immutable candidate SHA-256: `cd335b6f16a422715388d31e30ffe54798be5fe45698754e96f13ed0a93ab351`.

[Candidate reference](team-hub-generated-delete-proof-evidence-2026-10-13/candidate-reference.json) binds the content-addressed candidate, installed mappings, datasource/role evidence, evaluator results and proof validator/tests. Original probe packet SHA remains `f28b406a106c94580291023f9235543eba0595dc7d65fe79ae39fb58da3665b0`. The correction is a supplemental verification candidate; it does not overwrite the packet or any accepted maintenance artifact.

## Execution review and remaining maintenance

Review the supplemental proof criterion and hash before execution resumes. Existing approvals remain recorded. No new account, IAM grant, fixture, logging resource, API or database is proposed. Fresh time-sensitive baselines and attended-window start must still be recorded at execution.

Maintenance still requires conditional FROZEN, exact source fence/gateway installation, all generated create/update/delete and operator original-principal proofs, reconciliation/quarantine, conditional TARGET transfer, five distinct live business personas, pinned local frontend activation, observation and state-aware recovery. Null-before-fence handling does not discharge any of those live gates. Stop before TARGET on any unsuccessful attribution or changed source state. Master/production and Legacy retirement remain prohibited.

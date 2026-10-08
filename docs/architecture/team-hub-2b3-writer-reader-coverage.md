# Team Hub 2B3 — writer/reader coverage

Snapshot 2026-10-05T20:46:32.199Z. Account 058264289478, eu-north-1, exact Ntgre Team resources. No AWS writes. ACTIVE means an enabled source path, not an observed recent invocation.

## Result and evidence boundary

13 active business writer paths; 2 possible business paths; 8 privileged/manual or conditionally administrative paths; 8 generated internal paths; one test-only path; one condition-excluded source grant. **Unknown writers 0; unknown readers 0.** Five active application readers and two compatibility contracts remain. Administrative/raw/generated reader capabilities are separately enumerated, not folded into those seven application contracts.

The [complete machine inventory](team-hub-2b3-final-evidence-2026-10-05/coverage.json) records EVERY writer's source, principal, operation, targets, enabled/reachable interpretation, environment, purpose, fence, retirement and evidence. Reader records contain consumer/principal/operation/DTO, compatibility/future contract and retirement condition. Principal grants retain exact resources, policy-variable patterns, conditions, trust and boundary references. This document summarizes that inventory rather than replacing it.

Read-only investigation enumerated 764 roles, 4 users and 37 managed policy documents, with complete pagination and zero missing referenced documents. Expanded matching includes exact four tables/indexes/stream ARNs, exact Team AppSync fields and shared Lambda invocation. Policy variables are matched as wildcards within the ARN, not treated as a match for every resource. The six initially overmatched authenticated storage roles were excluded after ARN matching: their own-bucket paths do not match the Ntgre Team logo prefix. Denies/conditions/boundaries can narrow the conservative Allow inventory. This is not IAM simulation or proof that every potential principal has exercised access.

All 30 selected Query/Mutation resolvers and 95 referenced pipeline functions were mapped to deployed data sources. Generated model authorization permits IAM service callers; a Cognito-only source search would miss the admin-user Lambda's generated Team GraphQL grant. Exact role mappings, not name guesses, classify the four table data-source roles, Lambda invoker and two hash-verified table providers. The bucket resource policy additionally grants the generated S3 cleanup role deletion authority. The old unknown external bucket/table paths are resolved to these explicit capabilities; root and privileged administrators remain named, not declared absent.

No source table resource policies were present in the initial scoped inspection. The current logo policy grants no external principal; its Allow is the exact generated cleanup role. No rules target the shared writer on the enumerated default bus, no Scheduler schedules were present, and no Lambda stream event mappings were found for the four source streams. IAM-capable automation and raw stream readers remain covered as potential principals even without observed schedules. This snapshot is not an account-wide workload inventory and must be repeated before fencing.

| Writer path | Classification | Purpose / interpretation |
|---|---|---|
| CREATE_TEAM | ACTIVE_BUSINESS_WRITER | Enabled Legacy Team business command |
| UPDATE_TEAM | ACTIVE_BUSINESS_WRITER | Enabled Legacy Team business command |
| SET_MANAGER | ACTIVE_BUSINESS_WRITER | Enabled Legacy Team business command |
| MANAGE_MEMBER | ACTIVE_BUSINESS_WRITER | Enabled Legacy Team business command |
| SET_ROSTER_SLOT | ACTIVE_BUSINESS_WRITER | Enabled Legacy Team business command |
| UPSERT_MY_CHAMPION | ACTIVE_BUSINESS_WRITER | Enabled Legacy Team business command |
| DELETE_MY_CHAMPION | ACTIVE_BUSINESS_WRITER | Enabled Legacy Team business command |
| UPSERT_COACH_ASSESSMENT | ACTIVE_BUSINESS_WRITER | Enabled Legacy Team business command |
| SET_TEAM_PLAN | ACTIVE_BUSINESS_WRITER | Enabled Legacy Team business command |
| REQUEST_TEAM_LOGO_UPLOAD | ACTIVE_BUSINESS_WRITER | Enabled Legacy Team business command |
| COMMIT_TEAM_LOGO | ACTIVE_BUSINESS_WRITER | Enabled Legacy Team business command |
| REMOVE_TEAM_LOGO | ACTIVE_BUSINESS_WRITER | Enabled Legacy Team business command |
| PRESIGNED_LOGO_PUT | ACTIVE_BUSINESS_WRITER | Previously issued URLs remain usable until expiry or policy denial |
| SHARED_LAMBDA_DIRECT_ADAPTER | POSSIBLE_BUSINESS_WRITER | Internal direct table transaction bypass of the public gateway |
| SYNTHETIC_TESTS | TEST_ONLY | Offline fixtures |
| PRINCIPAL:amplify-projectrespawnweb-adminusermanagementlambda-OIbycFZWXsdJ | POSSIBLE_BUSINESS_WRITER | Admin Lambda has generated Team GraphQL authority; no Team business intent assumed |
| PRINCIPAL:amplify-projectrespawnweb-AmplifyManagedTableIsComp-i528Yre6Bga7 | GENERATED_INTERNAL | Exact deployed data-source or hash-verified table-provider role mapping; preserve ownership, fence by role/path |
| PRINCIPAL:amplify-projectrespawnweb-AmplifyManagedTableOnEven-QvbafGiZcl6c | GENERATED_INTERNAL | Exact deployed data-source or hash-verified table-provider role mapping; preserve ownership, fence by role/path |
| PRINCIPAL:amplify-projectrespawnweb-FnSubmitInvestorAccessReq-D8KMAbW9Y6qD | GENERATED_INTERNAL | Exact deployed data-source or hash-verified table-provider role mapping; preserve ownership, fence by role/path |
| PRINCIPAL:AWSAmplifyDomainRole-Z09658113PMRCPOCQ18QP | PRIVILEGED_MANUAL | Potential administration/deployment authority; conditions and boundaries may limit escalation, not presumed business use |
| PRINCIPAL:AWSServiceRoleForSSO | PRIVILEGED_MANUAL | Potential administration/deployment authority; conditions and boundaries may limit escalation, not presumed business use |
| PRINCIPAL:cdk-hnb659fds-cfn-exec-role-058264289478-eu-north-1 | PRIVILEGED_MANUAL | Potential administration/deployment authority; conditions and boundaries may limit escalation, not presumed business use |
| PRINCIPAL:cdk-hnb659fds-deploy-role-058264289478-eu-north-1 | DEAD | Matched S3 statement excludes this account via s3:ResourceAccount; deployment delegation remains maintenance-frozen |
| PRINCIPAL:PlayerChampionPoolEn5c689d-dxb2tdlulrch7hj2pts2mfijia-NONE | GENERATED_INTERNAL | Exact deployed data-source or hash-verified table-provider role mapping; preserve ownership, fence by role/path |
| PRINCIPAL:ProjectRespawn-TeamHub-Ntgre-ReadProofExecution | PRIVILEGED_MANUAL | Potential administration/deployment authority; conditions and boundaries may limit escalation, not presumed business use |
| PRINCIPAL:ProjectRespawn-Tournaments-Ntgre-CfnExecution | PRIVILEGED_MANUAL | Potential administration/deployment authority; conditions and boundaries may limit escalation, not presumed business use |
| PRINCIPAL:TeamIAMRoleb6b1b2-dxb2tdlulrch7hj2pts2mfijia-NONE | GENERATED_INTERNAL | Exact deployed data-source or hash-verified table-provider role mapping; preserve ownership, fence by role/path |
| PRINCIPAL:TeamMembershipIAMRolb0882a-dxb2tdlulrch7hj2pts2mfijia-NONE | GENERATED_INTERNAL | Exact deployed data-source or hash-verified table-provider role mapping; preserve ownership, fence by role/path |
| PRINCIPAL:TeamRosterSlotIAMRol236c3d-dxb2tdlulrch7hj2pts2mfijia-NONE | GENERATED_INTERNAL | Exact deployed data-source or hash-verified table-provider role mapping; preserve ownership, fence by role/path |
| PRINCIPAL:RavenTest | PRIVILEGED_MANUAL | Potential administration/deployment authority; conditions and boundaries may limit escalation, not presumed business use |
| PRINCIPAL:Zmar | PRIVILEGED_MANUAL | Potential administration/deployment authority; conditions and boundaries may limit escalation, not presumed business use |
| ACCOUNT_ROOT | PRIVILEGED_MANUAL | Break-glass; explicit operator maintenance freeze, cannot technically prevent root policy removal |
| LOGO_CLEANUP_PROVIDER | GENERATED_INTERNAL | Generated bucket teardown path; no lifecycle changes permitted during cutover |

The eight privileged/manual rows include root, administrators and conditionally constrained service/deployment administration. They are not eight observed human writers and do not assert the narrowly bounded Team/Tournament execution roles can currently access Legacy data. The excluded CDK deploy S3 grant has a StringNotEquals s3:ResourceAccount condition that does not authorize same-account Ntgre objects; its deployment delegation still participates in the maintenance freeze.

## Reader contracts

| Consumer | Current fields / principal path | Future contract and retirement |
|---|---|---|
| Team Hub pages | Shared gateway: Team context, membership display/role, roster; own Player pool; Manager/Coach competitive projection | Owner API v1, base-item authorization; retire Legacy calls only after client acceptance |
| /home shortcuts | Shared gateway: personal Team IDs/slugs/names/game/role summaries | Owner list-my-teams; no raw-table fallback |
| Admin Team UI | Shared gateway: administrable Team/settings/assignment information; no implicit Coach privacy access | Owner admin capability commands, independently checked membership for competitive data |
| readTeamHub gateway | Shared Lambda role, policy-selected read action DTO | Explicit DOMAIN_MOVED after cutover; no silent stale reads |
| Logo signed read | Shared Lambda GetObject for exact team-logos prefix | Disabled/empty in Mode A; future owner storage contract after separate branding gate |
| Old client contracts | Existing custom operation fields/response shape | Maintain Legacy before freeze, then explicit maintenance/upgrade response; forwarding requires separate reviewed adapter |
| Generated model access | Four AppSync data-source roles; raw schema fields including assessment; IAM callers include shared/admin functions | Raw consumer grants blocked/retired at separate review; app consumers use owner API |

The [IAM inventory](team-hub-2b3-final-evidence-2026-10-05/iam-coverage.json) also captures lookup/admin/export/stream capabilities; these are privileged/potential readers with raw fields, not safe public DTOs. Their retirement condition is explicit revocation of source access or approved recovery-only retention. No privileged actor is silently treated as a business reader.

## Traffic and limitations

Additional [stream/subscription inspection](team-hub-2b3-final-evidence-2026-10-05/reader-edges.json) resolves four stream resource policies (all absent) and twelve generated subscriptions with all 36 authorization/pipeline functions. Their exact Subscription field ARNs were included in the final IAM pass. Generated auth permits the inventoried IAM callers; empty Cognito rule branches do not grant user-pool callers access merely because the SDL advertises that auth mode. Raw subscription payloads remain a generated compatibility path: block new subscriptions, drain existing connections/queued deliveries, and prevent Legacy mutation events after cutover. No implicit owner-event implementation is claimed.

[Seven-day metrics](team-hub-2b3-final-evidence-2026-10-05/traffic.json) show zero consumed write capacity, and eight read units per table in the inventory hour. Classification is EMPTY_AND_APPARENTLY_UNUSED in the observed window despite enabled writers. [CloudTrail coverage](team-hub-2b3-final-evidence-2026-10-05/cloudtrail-coverage.json) does not supply complete data-event history. No assertion of never-used, no hidden-client absence inferred solely from source, and no assumption that current identity policies cannot change tomorrow.

Unknown=0 means every currently identified capability/path has an explicit classification, not that privileged intervention is impossible. Recheck IAM/resource policies, resolver bindings, relevant Lambda hashes, schedules and counts at cutover. A newly discovered principal/path becomes UNKNOWN and fails the gate until reviewed. The [server fence proposal](team-hub-2b3-aws-write-proposal.md#e-writer-fence) covers underlying source writes independent of callers, plus an administrative maintenance freeze. Root policy-removal capability remains an explicit operational limitation.

Evidence: [IAM](team-hub-2b3-final-evidence-2026-10-05/iam-coverage.json), [resolvers](team-hub-2b3-final-evidence-2026-10-05/resolver-coverage.json), [pipeline authorization](team-hub-2b3-final-evidence-2026-10-05/resolver-functions.json), [Lambda principals](team-hub-2b3-final-evidence-2026-10-05/principal-functions.json), [schedules](team-hub-2b3-final-evidence-2026-10-05/schedule-coverage.json), [bucket policy](team-hub-2b3-final-evidence-2026-10-05/logo-resource-policy.json), [initial table/stream consumer inspection](team-hub-2b3-evidence-2026-10-05/live-consumers.json).

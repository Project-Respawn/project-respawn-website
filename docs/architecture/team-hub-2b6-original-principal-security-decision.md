# Team Hub 2B6 — original-principal security decision

13 October 2026. Review only; AWS writes: zero. **TEAM HUB READY FOR CONTROLLED MAINTENANCE AUTHORIZATION**, conditional on the security owner explicitly accepting the criterion below. This is readiness for approval, not approval or installed-fence acceptance.

## Actual baseline and risk

[Fresh role review](team-hub-original-principal-decision-evidence-2026-10-13/helper-effective-review.json), [bucket policy](team-hub-original-principal-decision-evidence-2026-10-13/bucket-policy.json) and [inspection identity](team-hub-original-principal-decision-evidence-2026-10-13/identity.json) are read-only receipts. Both original roles retain Lambda-only trust, no boundary and unchanged identity grants. Twelve identity simulations completed; four Access Analyzer validations returned no findings. They do not include a complete role/resource-policy effective simulation.

Shared writer `amplify-projectrespawnweb-myFunctionrebuildlambdaSe-mwrta80Al783` can write source Teams/memberships/rosters and logos, call Legacy GraphQL and access unrelated existing secret references and a customer-managed key. A replacement/helper Lambda under this role would inherit those privileges. Reject same-role reuse; no trust, role, code or permanent permissions changes are proposed.

Cleanup role `amplify-projectrespawnweb-CustomS3AutoDeleteObjects-LxFoKPsKh5l3` has bucket-resource grants for PutBucketPolicy, GetBucket*, List* and DeleteObject*. Identity-only implicit denial of PutBucketPolicy does not remove that grant. Invoking teardown or reusing this role could remove the fence or delete real data. Neither is permitted. The proposed object-write deny does not restrict bucket-policy administration.

Same-account identity/resource grants combine; explicit denial overrides grants. Role resource-policy simulation is unsupported, so simulator success is not a service-reaching original-role receipt. [AWS evaluation rules](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html), [simulation API limitations](https://docs.aws.amazon.com/IAM/latest/APIReference/API_SimulateCustomPolicy.html).

## Options and recommended criterion

| Option | Benefit | Risk / decision |
| --- | --- | --- |
| Temporary exact control-plane restriction on original cleanup role | Prevents its bucket-policy removal during diagnostic use | Requires new reviewed IAM/fence artifacts, lifecycle/rollback review and propagation proof; does not attenuate shared-role foreign privileges. Not recommended for this release. |
| Original-role effective-policy review plus representative live proof | Preserves existing roles and accepted artifacts; tests installed source policies through real supported paths | Cannot establish a direct service-reaching receipt for every shared/cleanup execution path. Must explicitly record and accept that gap. |
| Separately accepted alternative criterion | Security owner accepts the preceding evidence with control-plane custody, audit and abort obligations | Recommended; acceptance is not inferred from this engineering report. If declined, maintenance remains blocked pending a new isolated design. |

Use the existing [original writer inventory and probe packet](team-hub-maintenance-preparation-evidence-2026-10-12/fence-probes.json) and [coverage](team-hub-maintenance-preparation-evidence-2026-10-12/writer-coverage.json). Preserve all 19 principals, 30 resolvers and 131 functions, including generated, manual, privileged, direct-table and logo paths. No principal is removed from coverage because a safe invocation is unavailable.

During separately authorized FROZEN maintenance: snapshot actual identity/resource policies, trust and boundaries; verify the installed four table policies and exact logo-prefix policy match the pins with no exemptions; run supported explicit-deny projections for original grants. Execute the existing guarded AppSync generated-operation probes and operator probes against reserved absent diagnostic keys. Require service-reaching pre-controls and post-install AccessDenied receipts attributable to the actual request/principal/data source. A gateway-maintenance response, validation failure or simulator result cannot replace that live evidence.

Do not invoke the original destructive cleanup handler or replace either original Lambda. No safe fixed original shared/cleanup handler path covering their direct writes has been established. Their direct service-role receipt therefore remains **unperformed**, explicitly covered only by the alternative criterion. A restricted diagnostic helper, if separately authorized, proves policy behavior for its own principal only; the accepted helper was removed and is not available by assumption.

Ntgre must establish exclusive change custody for source policies, role/trust/code changes and Legacy deployments throughout maintenance/observation: no cleanup invocation, replacement, teardown or administrative fence removal. Refresh hashes before transfer; audit and stop on unexpected changes. This is an operational custody control, not a new IAM denial. Bucket-owner root can manage bucket policies despite a bucket-policy deny; company administrators remain a residual governance risk. Do not claim universal administrator prevention or complete organization authorization. [AWS PutBucketPolicy](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketPolicy.html).

## Real-cutover logical-quarantine criterion

[Accepted isolated execution](team-hub-2b6-isolated-s3-verification-result.md) proves 3/3 correlated canaries and 4/4 race-event correlations. Held and previously issued requests returned 403. The injected late object demonstrates detection/reconciliation, not measured physical late completion or universal revocation. No accepted earlier runtime/transaction/cursor/frontend evidence is reopened.

For real cutover, require all of the following:

1. Branding/logo modification remains disabled. Target readers suppress Legacy logo URLs; no import/display/adoption worker or endpoint is enabled. The accepted target mutation transaction enforces actual TARGET_WRITER/epoch and authorization; no Legacy URL can create an authoritative association.
2. Install and prove the source table and logo fences during FROZEN. Keep them installed after transfer. Metadata association is fenced independently of object upload. No stale source writer may attach a late logo.
3. Establish a complete current-object baseline; drain known requests and inventory multipart operations without deleting unknown objects. Track request-terminal evidence where available. Preserve late/unknown objects and fingerprints; never automatically adopt, display or delete them.
4. Verify the retained trail selectors, health and correlated delivery before reliance. Continue 30-second listing/metadata/event reconciliation for at least 30 minutes after frontend activation, then ongoing Ntgre custody. Audit events may arrive later; a five-minute evidence gap or incomplete scan holds acceptance and triggers investigation, not an assertion of zero arrivals.
5. Any unexpected authoritative logo association, source business mutation after fence proof, source-policy change, privacy breach or stale-epoch acceptance immediately stops progression. A quarantined late blob alone is investigated/preserved rather than automatically classified as a target business write.

The unversioned source bucket cannot reconstruct every overwritten/deleted body or transient arrival. CloudTrail delivery has no assumed completeness deadline; presigned request expiry is not a bound on an already started request. Unknown uploads can remain unresolved beyond observation. Explicitly accept this residual **physical completion/audit completeness** uncertainty only because all Legacy media remains non-authoritative and branding is disabled. Do not claim detection of every historical arrival. [AWS presigned URL behavior](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html), [multipart abort limits](https://docs.aws.amazon.com/AmazonS3/latest/API/API_AbortMultipartUpload.html).

## Exact authorization language — not yet granted

Security owner:

> I approve the original-principal alternative proof criterion in this report for account 058264289478, eu-north-1, Ntgre only. I accept that original shared/cleanup service-role direct-write receipts are unavailable and are not replaced by helper or simulator receipts. I require exact installed-policy review, original AppSync/operator service-reaching proof, no same-role helper or destructive cleanup, exclusive control-plane custody and abort on policy drift. I accept late physical S3 completion and asynchronous/incomplete audit-history risk under the specified non-authoritative quarantine model, with branding disabled and unknown objects preserved. This decision grants no permission to broaden IAM, remove source fences or publish to Master/production.

Maintenance operator:

> After the named security owner records the preceding decision, I authorize the existing pinned Ntgre maintenance sequence and its explicit abort/rollback gates: fresh preflight; conditional LEGACY_WRITER epoch 1 to FROZEN epoch 2; exact source-fence installation and original AppSync/operator proof; source/target reconciliation and quarantine controls; conditional TARGET_WRITER epoch 3; real business/persona acceptance; reversible Ntgre localhost frontend activation; monitored observation and state-aware recovery. I accept custody, reconciliation, incident response and retained audit costs. I authorize no unsafe original-role helper, destructive cleanup, permanent IAM broadening, Master/production publication or Legacy retirement. Any failed gate stops progression.

Record actual security-owner and operator names, UTC approval and the unchanged maintenance manifest hash before execution. Ntgre is the proposed operator; ownership of company-level security approval must not be assumed. Approval of these paragraphs must be explicit; this task did not supply it.

## Remaining maintenance gates and same-day assessment

Retain all eleven maintenance hashes and the S3 manifest `e5395aac10635a8b65c50ccc8ca8fda0d125458643e69cd971372b07d9b5bde9`. No new AWS resource or IAM candidate is required by the recommendation. The private three-resource audit stack remains retained; temporary helper/race resources remain absent.

After explicit decision and maintenance authorization: fresh baselines, FROZEN, installed fence proof, reconciliation, TARGET transfer, real business acceptance, local frontend activation and observation remain mandatory live gates. Expected unchanged domain counts: Legacy 2,621/167; Team Hub 48+7; Core 8+5; Tournament 11; auxiliary audit +3. Authority remains LEGACY_WRITER 1/1 until separately authorized execution.

Budget 150 minutes using the existing runbook; retain at least 60 minutes before TARGET transfer. Same-day Ntgre-local maintenance is technically feasible if the named security owner accepts the criterion, exclusive custody and test sessions are available, and fresh gates pass. No claim that Team Hub is already operational or that Master is ready.

Before target writes, recovery follows exact fence/gateway restoration and conditional monotonic epoch controls. After target writes, keep fences installed and use FROZEN/export/reverse-transform/reconciliation and separately approved state restoration. Frontend rollback alone never restores Legacy authority.

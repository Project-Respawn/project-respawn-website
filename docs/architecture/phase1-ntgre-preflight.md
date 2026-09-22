# Phase 1 — existing Ntgre deployment preflight

2026-09-22. **NO-GO.** The exact validated source was reconstructed successfully, and consolidation passes the local Ntgre-context comparison. However, comparison against the deployed templates proposes **five unexpected application Lambda code-reference modifications**. Preparation stopped at that safeguard. No AWS assets were uploaded, no change set was created, and no deployment or AWS mutation was executed.

This is a failed live-equivalence preflight, **not evidence that the application has regressed**. Build-context differences are established; exact equivalence to the deployed Lambda packages is not. The prior green validation report remains valid for its recorded snapshot.

## A. Target confirmation

| Field | Confirmed value |
| --- | --- |
| AWS account | `058264289478` |
| Region | `eu-north-1` |
| Environment / identifier | Existing sandbox `Ntgre` |
| Amplify namespace | `project-respawn-website` |
| Root name | `amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332` |
| Root ARN | `arn:aws:cloudformation:eu-north-1:058264289478:stack/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332/8b2122c0-b5c7-11f1-b780-0aadaa40eeed` |
| Status at capture | `UPDATE_COMPLETE` |
| Last root update | `2026-09-21T14:32:51.577Z` |

Proof chain: AWS STS identified the account; the pool referenced by current outputs has `amplify:deployment-type=sandbox` and an AWS-owned CloudFormation auth-stack tag; describing that stack resolved the root ARN above. Its sandbox tags, root name, pool/client/API relationships and root outputs agree. This does not select master, staging, Demo, Daniel, legacy Ntgrestage8, the failed development root, external Twitch staging or SWG infrastructure. No automatic `ampx sandbox` watcher was running, and none was started.

All **1,128 manifest files** were copied byte-for-byte into `.amplify/ntgre-preflight/candidate` from the preserved snapshot and verified against the recorded candidate manifest. The retained isolated Linux candidate also passed its exact source verifier. Current outputs match the snapshot. Unrelated SWG work was neither included nor edited. [Reconstruction receipt](phase1-ntgre-preflight-evidence/reconstruction.json).

## B. Live baseline

Captured the root plus 61 nested stacks: **62 templates / 2,929 resource declarations**, including **475 FunctionDirectiveStack resources**. All physical IDs, template definitions and current stack outputs were captured locally. This is a deployed-template inventory, not an exhaustive service-level out-of-band drift scan.

| Identity | Live value |
| --- | --- |
| Cognito pool | `eu-north-1_n24iLL7QE` |
| Cognito client | `1iq7ovjaf7d16imdvbqgfgvf86` |
| Identity pool | `eu-north-1:a3621b12-4773-4295-b232-b55863c37fd3` |
| AppSync API | `dxb2tdlulrch7hj2pts2mfijia` |
| GraphQL endpoint | `https://ymoeacodczfipbtu67jpg73cp4.appsync-api.eu-north-1.amazonaws.com/graphql` |
| Application bucket | `amplify-projectrespawnweb-projectrespawnstoragebuc-ketz6kwxegaw` |

Inventory includes **52 custom-managed model tables, three native tables, three S3 buckets, two KMS keys, 10 Lambda functions and 10 Cognito groups**. Every recorded table, Lambda, KMS, HTTP API, endpoint-resource and IAM physical identity is available in the [physical inventory](phase1-ntgre-preflight-evidence/physical-resources.json). The API-key resource identifier is intentionally omitted from that publishable list; it remains counted. Raw templates/outputs are retained in ignored `.amplify/ntgre-preflight/live`, rather than publishing API-key-bearing outputs.

## C. Drift / reproducibility analysis

The structural pre-consolidation architecture matches: same stack paths, resource counts, stateful logical identities and FunctionDirectiveStack layout. **Exact deployed-artifact equivalence does not pass.** Even the reconstructed pre-consolidation baseline differs from live in 129 resource definitions:

| Difference against local pre-consolidation baseline | Count |
| --- | ---: |
| Nested-stack template references | 61 |
| CDK metadata analytics | 62 |
| Application Lambda code references | 5 |
| API-key expiry | 1 |

Seven template descriptions also differ (`createdOn: Windows` versus `Linux`), outside the resource-action counts. Decoding CDK metadata proves **live Node 24.14.1 versus local Node 22.18.0**, with CDK **2.260.0** on both sides. These metadata differences propagate into nested-template hashes. They must not be silently excluded to claim the reviewed action count.

Affected Lambda physical names and full live/proposed S3 asset keys are recorded in [Lambda code references](phase1-ntgre-preflight-evidence/lambda-code-references.json):

- `amplify-projectrespawnweb-postconfirmationlambda19-Wy2H39UMXn5K`
- `amplify-projectrespawnweb-adminusermanagementlambd-pQxwX6AKOxBE`
- `amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV`
- `amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA`
- `amplify-projectrespawnweb-OverlaySourceOverlaySour-2kKQMxNdJ0Qr`

There is also a concrete **preflight-tooling reproducibility issue**: my Ntgre synthesis helper used `.amplify/ntgre-preview`, one directory level shallower than the prior `.amplify/master-preview/cdk.out`. Against the cached OverlaySource artifact with the same key as the live template, executable JS and embedded source contents are identical, but source-map paths change from `../../../../amplify/...` to `../../../amplify/...`. All other map fields match. This explains that local map mismatch; it does **not** establish equivalence of all actual deployed ZIPs. No live package was downloaded after the stop, and no corrective re-synthesis was performed.

The remaining investigation must reproduce the deployed build context/output depth from the unchanged source, then verify actual live package bytes. It must not alter the accepted source, substitute live assets without verification, or weaken the comparator.

## D. Proposed resource counts

| Metric | Current live Ntgre | Local baseline | Local candidate |
| --- | ---: | ---: | ---: |
| Hierarchy resources | 2,929 | 2,929 | 2,621 |
| FunctionDirectiveStack | 475 | 475 | 167 |
| Template instances | 62 | 62 | 62 |

The exact **local baseline-to-candidate** comparison passes **0 additions / 81 updates / 308 deletions**, with **1,234/1,234 checks passing**, including exact local Lambda asset bytes. Ntgre has seven fewer resources than master; the master 2,628 candidate total was not transplanted into this preflight.

The accounting report is included in the [local comparison](phase1-ntgre-preflight-evidence/local-comparison-summary.json). The hierarchy remains above the 2,500 fresh-create threshold. Existing pinned debt authorization covers the reviewed branch roots, not a blanket Ntgre waiver; target-specific accounting/update-operation readiness still requires review. No baseline receipt, budget or exception was changed.

## E. Exact action summary — static template diff, not an AWS change set

| Action | Live → local candidate |
| --- | ---: |
| ADD | 0 |
| MODIFY | 207 |
| DELETE | 308 |
| REPLACE | Not authoritatively assessed; no explicit replacement detected in the static identity comparison |

**207 modifications:** 77 AppSync resolvers, 61 nested-stack references, 62 CDK metadata resources, five Lambda code references, one API-key expiry and one codegen bucket-deployment asset reference.

**308 deletions:** 77 redundant invocation functions, 77 AppSync data sources, 77 IAM roles and 77 IAM policies, all in FunctionDirectiveStack.

Every action is enumerated in [action-summary.json](phase1-ntgre-preflight-evidence/action-summary.json). There are no added/deleted stateful logical resources. Nevertheless, these are template-level findings; no CloudFormation replacement/conditional-replacement plan has been generated or approved. The unexpected protected Lambda modifications triggered STOP before creating a change set or publishing templates/assets.

## F. Protected resources

“PASS” below means identical captured deployed-template definitions/identities, not an execution guarantee or a service-level drift scan.

| Category | Result |
| --- | --- |
| Cognito pool/client/identity pool/groups | PASS — unchanged |
| 52 model tables and three native tables | PASS — unchanged |
| Three S3 buckets / two KMS keys | PASS — unchanged |
| AppSync API/schema identity | PASS — unchanged |
| Application Lambda definitions | **FAIL** — five Code.S3Key / asset-path changes |
| Actual live Lambda package equivalence | **NOT PROVEN — blocking** |
| Team Hub state resources | PASS — unchanged |
| Creator/Twitch state resources | PASS — unchanged; runtime Lambda package verification blocked |
| Payment/webhook infrastructure | PASS for routes/integrations/permissions; shared-handler package verification blocked |
| Three HTTP APIs, 36 routes, four integrations, three stages, 37 Lambda permissions | PASS — unchanged |
| Generated outputs | PASS — snapshot bytes preserved and core identities match live outputs |
| External runtime resources | No proposed external resource action; external stacks were not inspected |

See [per-category verification](phase1-ntgre-preflight-evidence/protected-resources.json).

## G. IAM / authorization wiring

Live FunctionDirectiveStack has the pre-consolidation layout. Its meaningful resource definitions match the reconstructed baseline; its metadata differs. Local exact comparison verifies all 79 field operations, authorization stages, retained handler anchors, invocation semantics and retained IAM definitions. The proposed 77-role/77-policy removals correspond to the reviewed redundant directive resources. Shared/admin handlers, readTeamHub, mutateTeamHub, investor and creator/workspace operations retain their reviewed local wiring.

No authorization implementation or existing broad IAM was redesigned. However, **the complete live deployment dependency/wiring review is not signed off**, because the protected-code stop occurred first. Actual live IAM policy state beyond captured templates was not separately fetched.

Critical isolated checks completed before the stop: manifest verification, Amplify contracts, **16 guard tests**, **two handler tests**, and **47 Team Hub backend tests**, all PASS. The prior complete 653-test result was not misrepresented as a new full-suite run. [Critical ledger](phase1-ntgre-preflight-evidence/critical-test-ledger.json).

## H. Recovery readiness

**Not established; no backup or protection setting was modified.** Observations already available at the stop:

- Application bucket `GetBucketVersioning` returned `{}`; no enabled versioning was reported. `GetObjectLockConfiguration` reported no configuration.
- Cognito reports deletion protection `INACTIVE`.
- Captured templates specify `Delete/Delete` deletion/update-replace policies for the pool, client, identity pool, all 55 table declarations and three buckets. This describes policy configuration, not a proposed deletion of those resources.
- Both KMS keys have `Retain/Retain` template policies. Their current key states and independent recovery arrangements were not inspected.
- Two native-table templates explicitly configure PITR. Actual PITR status, existing backups and restore readiness for all tables remain unverified; absence of a inspected setting is not evidence that no backup exists.
- Current outputs, schema/template configuration and physical identities were captured. Secret/token recovery and relevant external recovery dependencies were not assessed; no secret values were requested.

Before any execution decision, finish read-only backup/PITR/restore-readiness and retention assessment, establish Cognito/user preservation and secret/token/key recovery arrangements, and determine which protection changes are actually necessary for this update. Any backup/protection mutation would require separate authorization. [Recovery observations](phase1-ntgre-preflight-evidence/recovery-readiness.json).

## I. Deployment ordering

**Not approved or completed after the stop.** The intended logical transition is to repoint resolvers to retained invocation/data-source/role chains before obsolete chains disappear. A local field-equivalence check does not prove CloudFormation will execute that transition safely.

The remaining review must explicitly establish resolver-update/deletion dependencies, absence of dangling references/cycles, IAM/data-source final-use ordering and the actual update plan. Rollback could restore approximately 308 resources and the 475-resource FunctionDirectiveStack; its feasibility must be established rather than assumed. No rollback-versus-roll-forward recommendation is signed off for an unverified code-changing plan, and neither was executed.

## J. Final go / no-go

**NO-GO: the exact validated Phase 1 candidate has not yet been proven safe to deploy to existing Ntgre.** The live plan includes five unexpected protected Lambda code-reference changes plus build metadata/template churn. Actual live package equivalence, full recovery readiness, authoritative change-plan replacement analysis and execution ordering remain unverified.

Resolve build-context/artifact reproducibility against live Ntgre without changing the validated source or relaxing safeguards; then rerun the live comparison and complete the stopped review stages. No deployment command is proposed for execution in this NO-GO report. The two local validation containers were stopped after evidence capture. No sandbox watcher, change set, asset publishing, CloudFormation update, deployment, DNS change or data migration was performed.

All new repository files for this task are this report and its [evidence directory](phase1-ntgre-preflight-evidence/README.md). Investigation tools, raw captures and isolated source/build copies remain under ignored `.amplify/ntgre-preflight`. Accepted Phase 1 source/configuration and concurrent SWG work are untouched.

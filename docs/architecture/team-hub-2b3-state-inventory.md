# Team Hub M4 / 2B3 state inventory

[START HERE](README-PHASE2-MIGRATION.md) · [recovery](team-hub-2b3-recovery-plan.md) · [migration](team-hub-2b3-migration-plan.md) · [dark target](team-hub-2b3-dark-target-readiness.md)

Scope: read-only Ntgre inventory on 5 October 2026, from checkpoint `4591f326de5c8ef6f09fc0b3a3d459d5d0d8580f`. Account `058264289478`, region `eu-north-1`, identity `arn:aws:iam::058264289478:user/RavenTest`. Existing default profile; no credentials persisted. Production was not inspected or modified. Team Hub remains M3 accepted, M4 preparation in progress; **LegacyPlatform remains business authority**.

## Protected baselines

[Legacy readback](team-hub-2b3-evidence-2026-10-05/legacy-after.json): UPDATE_COMPLETE, 2,621 declarations across 62 stacks, FunctionDirectiveStack 167, 62 protected identities and five Lambda hashes unchanged. Root update timestamp remains `2026-09-26T11:52:06.391000+00:00`. Every recorded stack template and physical identity reconciled.

[Team readback](team-hub-2b3-evidence-2026-10-05/team-baseline.json): CREATE_COMPLETE, eleven product resources, API `t54b88casf`, accepted Lambda hash unchanged; five-resource security stack UPDATE_COMPLETE. Caller, execution and runtime trust/attachments/inline/default boundary documents match acceptance. Exact-API lockdown remains effective; first-create authority is ineffective.

[Tournament readback](team-hub-2b3-evidence-2026-10-05/tournament-baseline.json): UPDATE_COMPLETE, eleven resources, API `msipnwy39j`, identities/Lambda/API/security unchanged. No baseline required a mutation.

## Exact observed record inventory

Every table was resolved again from its current Ntgre nested stack and matched to the ledger before scanning. Physical names use suffix `dxb2tdlulrch7hj2pts2mfijia-NONE`.

| Model | Metadata count | First complete scan | Second complete scan | Observed records |
|---|---:|---:|---:|---:|
| Team | 0 | 0 | 0 | 0 |
| TeamMembership | 0 | 0 | 0 | 0 |
| TeamRosterSlot | 0 | 0 | 0 | 0 |
| PlayerChampionPoolEntry | 0 | 0 | 0 | 0 |
| Total | 0 | 0 | 0 | 0 |

[Exact table evidence](team-hub-2b3-evidence-2026-10-05/table-inventory.json) records table ARNs, key schemas, GSIs, stream/billing/encryption metadata, timestamps, TTL, recovery configuration and scan start/end times. Eight one-page `Select=COUNT, ConsistentRead=true` scans completed without pagination remainder; total reported capacity 32 units, zero retries/errors. No item attributes or private records were retrieved. Each table is ACTIVE, PAY_PER_REQUEST, zero metadata bytes, TTL disabled, NEW_AND_OLD_IMAGES stream enabled, PITR disabled and deletion protection false. Source custom declarations retain Delete/ Delete lifecycle policy.

These are exact counts observed by each scan, **not an atomic cross-table snapshot or a guarantee that future writes cannot occur**. DynamoDB does not provide snapshot isolation for a strongly consistent scan. A final fenced count/hash is still required. [AWS Scan contract](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html).

Structural evaluation is empty: no role/status/revision distributions, missing subjects, relationships, privacy-ambiguous records or duplicates were observed because no records were returned. This does not validate nonempty customer data or prove Cognito subject existence. [Live empty-input dry run](team-hub-2b3-evidence-2026-10-05/live-dry-run.json) passes the same deterministic transform/reconciliation as fixtures, with zero outputs/rejects/warnings and no writes.

## Assets

[Logo evidence](team-hub-2b3-evidence-2026-10-05/logo-inventory.json): source bucket `amplify-projectrespawnweb-projectrespawnstoragebuc-ketz6kwxegaw`, verified against current Ntgre CloudFormation. Only `team-logos/` was listed. Zero current objects, versions, delete markers, references, orphan candidates and missing referenced objects. Current and version listings completed. No image contents were downloaded. No bucket versioning configuration exists. Association/content-type/size/hash distributions are empty, not assumed safe for future objects.

## Readers and writers

[Machine inventory](team-hub-2b3-evidence-2026-10-05/reader-writer-inventory.json) records tracked-source search scope and line references; [live consumer inspection](team-hub-2b3-evidence-2026-10-05/live-consumers.json) records the actual shared writer role, relevant IAM, stream consumers, default-bus schedules and table policies. Source matches cover frontend imports/routes, admin tools, shared AppSync dispatch, generated model access, direct DynamoDB transactions, logo presigning, scripts, tests and offline target code.

Writer entries: **13 ACTIVE**, **2 POSSIBLE**, **1 TEST_ONLY**, **1 UNKNOWN**. ACTIVE means an enabled path, not recent traffic: twelve business commands plus presigned logo PUT. Possible paths are generated/direct IAM model access and privileged CLI operators. The unknown is external/untracked clients or schedules not proven absent by scoped inspection. No path is labeled DEAD merely because tables are empty. Existing direct transactions and generated CRUD must both be fenced.

Reader entries: **5 ACTIVE**, **2 COMPATIBILITY_REQUIRED**, **1 UNKNOWN**. Current Team pages, global home shortcuts, admin composition, legacy read gateway and signed-logo reads remain active. Old-client contracts and generated model access need compatibility handling. External direct consumers remain unresolved. Other independent domains have no identified source dependency on Team storage; this is not account-wide absence proof.

The unresolved writer class **blocks migration readiness**. Resolve effective principal/resource-policy grants, sessions, custom schedules, external tooling and data-event coverage with the operator before asserting exhaustive coverage. Unknown readers block Legacy retirement. Current lack of records does not remove either requirement.

No AWS writes, source-data writes, frontend changes, production changes or resource retirement occurred.

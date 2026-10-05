# Accepted Team Hub source checkpoint

[Migration START HERE](../README-PHASE2-MIGRATION.md) · [accepted Release 1](../team-hub-2b2-read-path-release1-2026-10-05.md)

The deployed candidate remains `d458da9a7a8d1d519aaab05418fda95097a26256da0a297b71c95a5aaef5085f`. Its portable receipt and product template remain in the dated 2B2 evidence directory. The current installed security template is `lockdown-security.template.json` in the caller-release evidence directory: five security resources, exact API `t54b88casf`, and no effective first-create authority. The original four-resource security synthesis is historical, not the installed security architecture.

This maintenance checkpoint changes one pinned test only: the pre-deployment assertion that the endpoint manifest is absent becomes assertions for the accepted deployed endpoint and disabled frontend cutover. [Source deltas](source-deltas.json) records both hashes; the original test bytes are intentionally retained as a small provenance snapshot. The other 53 pinned source inputs and accepted manifest/security evidence remain byte-identical. No deployed runtime or infrastructure source changed.

Run `node scripts/checkpoints/verify-team-hub-release1.mjs` for portable offline source, endpoint schema, accepted security and preservation verification. It does not depend on local deployment caches. For the historical foundation test suites, first run `node scripts/team-hub/plan.mjs --env Ntgre --offline` and `node scripts/team-hub/plan.mjs --env Ntgre --offline --mode READ_PROOF`, then the Team Hub tests. These generate ignored **test-only** assemblies; they must never replace the accepted deployment pin. They perform no AWS calls and synthesize neither LegacyPlatform nor Tournament.

Operational security runners retain their original pinned gate/assembly dependencies and require a new explicit authorization before reuse. This checkpoint grants no deployment permission.

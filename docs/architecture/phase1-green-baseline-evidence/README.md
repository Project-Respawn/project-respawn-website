# Stopped green-baseline validation evidence

No AWS actions. Source snapshot was converted to LF before Linux synthesis, unlike the preserved earlier synthesis. The exact comparator failed on five changed Lambda source-map assets. Tests and build after the comparison were not executed.

| File | Purpose |
| --- | --- |
| [validation/npm-ci.txt](validation/npm-ci.txt) | Clean install output, including warnings |
| [validation/master-synthesis.txt](validation/master-synthesis.txt) | Local-only synthesis output |
| [validation/exact-comparison.txt](validation/exact-comparison.txt) | Failed comparison output |
| [validation/ledger.json](validation/ledger.json) | Actual executed command ledger; later steps did not run |
| [comparison/summary.json](comparison/summary.json) | Counts and failed check names |
| [comparison/changes.json](comparison/changes.json) | Every exact resource change |
| [comparison/checks.json](comparison/checks.json) | All comparison assertions |
| [comparison/resolvers.json](comparison/resolvers.json) | Operation and authorization equivalence checks |
| [comparison/lambda-assets.json](comparison/lambda-assets.json) | Asset hash comparison |
| [asset-diagnostic.json](asset-diagnostic.json) | Read-only proof of source-map-only line-ending differences |
| [source-preservation.json](source-preservation.json) | Task-start vs final source byte hashes and protected-file preservation |
| [run-linux.mjs](run-linux.mjs) | Attempted validation sequence with stop on comparison failure |
| [diagnose-assets.mjs](diagnose-assets.mjs) | Read-only diagnostic procedure |
| README.md | This complete evidence file list |
| files.json | SHA-256 hashes of every evidence file except itself |

# Reproducible Phase 1 validation evidence

Final result: 653 passed / 0 failed / 0 skipped; production build passed; exact comparison 0 additions / 81 updates / 308 deletions with 1,238 checks passing. No AWS deployment or mutation. The validation directory preserves the earlier 652/1/0 helper failure; validation-final is the complete corrected run. Candidate manifest identifies the tested snapshot and excludes unrelated concurrent SWG frontend edits.

## Files

| File | Purpose |
| --- | --- |
| [accepted-asset-preservation.json](accepted-asset-preservation.json) | All 12 corrected Lambda references match accepted assets |
| [artifact-details.md](artifact-details.md) | Human-readable affected Lambda hashes and source paths |
| [artifact-root-cause.json](artifact-root-cause.json) | Per-source conversion proof and every hash |
| [baseline-manifest.json](baseline-manifest.json) | Exact baseline source bytes and explicit schema provenance |
| [baseline-provenance.json](baseline-provenance.json) | Original baseline schema receipt and unchanged other runtime inputs |
| [baseline/environment.json](baseline/environment.json) | Clean synthesis/input-verification log or final synthesis gate |
| [baseline/ledger.json](baseline/ledger.json) | Clean synthesis/input-verification log or final synthesis gate |
| [baseline/master-synthesis.txt](baseline/master-synthesis.txt) | Clean synthesis/input-verification log or final synthesis gate |
| [baseline/npm-ci.txt](baseline/npm-ci.txt) | Clean synthesis/input-verification log or final synthesis gate |
| [baseline/verify-input-bytes.txt](baseline/verify-input-bytes.txt) | Clean synthesis/input-verification log or final synthesis gate |
| [baseline/verify-installed-source.txt](baseline/verify-installed-source.txt) | Clean synthesis/input-verification log or final synthesis gate |
| [baseline/verify-post-synthesis-source.txt](baseline/verify-post-synthesis-source.txt) | Clean synthesis/input-verification log or final synthesis gate |
| [candidate-initial-manifest.json](candidate-initial-manifest.json) | Candidate before test-only amendments |
| [candidate-manifest.json](candidate-manifest.json) | Exact tested candidate bytes and reviewed test/helper amendments |
| [candidate/environment.json](candidate/environment.json) | Clean synthesis/input-verification log or final synthesis gate |
| [candidate/ledger.json](candidate/ledger.json) | Clean synthesis/input-verification log or final synthesis gate |
| [candidate/master-synthesis.txt](candidate/master-synthesis.txt) | Clean synthesis/input-verification log or final synthesis gate |
| [candidate/npm-ci.txt](candidate/npm-ci.txt) | Clean synthesis/input-verification log or final synthesis gate |
| [candidate/verify-input-bytes.txt](candidate/verify-input-bytes.txt) | Clean synthesis/input-verification log or final synthesis gate |
| [candidate/verify-installed-source.txt](candidate/verify-installed-source.txt) | Clean synthesis/input-verification log or final synthesis gate |
| [candidate/verify-post-synthesis-source.txt](candidate/verify-post-synthesis-source.txt) | Clean synthesis/input-verification log or final synthesis gate |
| [comparison/changes.json](comparison/changes.json) | Unmodified exact infrastructure/resource/asset comparison evidence |
| [comparison/checks.json](comparison/checks.json) | Unmodified exact infrastructure/resource/asset comparison evidence |
| [comparison/lambda-assets.json](comparison/lambda-assets.json) | Unmodified exact infrastructure/resource/asset comparison evidence |
| [comparison/resolvers.json](comparison/resolvers.json) | Unmodified exact infrastructure/resource/asset comparison evidence |
| [comparison/summary.json](comparison/summary.json) | Unmodified exact infrastructure/resource/asset comparison evidence |
| [final-comparison/changes.json](final-comparison/changes.json) | Unmodified exact infrastructure/resource/asset comparison evidence |
| [final-comparison/checks.json](final-comparison/checks.json) | Unmodified exact infrastructure/resource/asset comparison evidence |
| [final-comparison/lambda-assets.json](final-comparison/lambda-assets.json) | Unmodified exact infrastructure/resource/asset comparison evidence |
| [final-comparison/resolvers.json](final-comparison/resolvers.json) | Unmodified exact infrastructure/resource/asset comparison evidence |
| [final-comparison/summary.json](final-comparison/summary.json) | Unmodified exact infrastructure/resource/asset comparison evidence |
| [final-preflight/exact-comparison.txt](final-preflight/exact-comparison.txt) | Clean synthesis/input-verification log or final synthesis gate |
| [final-preflight/ledger.json](final-preflight/ledger.json) | Clean synthesis/input-verification log or final synthesis gate |
| [final-preflight/master-synthesis.txt](final-preflight/master-synthesis.txt) | Clean synthesis/input-verification log or final synthesis gate |
| [final-preflight/verify-source.txt](final-preflight/verify-source.txt) | Clean synthesis/input-verification log or final synthesis gate |
| [final-test-ledger.json](final-test-ledger.json) | Final complete command/test totals |
| [previous-stopped-report.md](previous-stopped-report.md) | Historical report preserved before this successful follow-up |
| [run-final.mjs](run-final.mjs) | Final synthesis/comparison precondition runner |
| [run-synthesis.mjs](run-synthesis.mjs) | Byte verification, clean install and synthesis runner |
| [run-validation-final.mjs](run-validation-final.mjs) | Corrected full validation runner |
| [run-validation.mjs](run-validation.mjs) | Initial full validation runner |
| [source-classification.json](source-classification.json) | Task-owned changes versus concurrent SWG edits |
| [test-files.json](test-files.json) | Complete enumerated test-file set |
| [update-gate.json](update-gate.json) | Unchanged existing-debt accounting result |
| [validation-final/accounting-update-gate.txt](validation-final/accounting-update-gate.txt) | Final successful validation log/ledger |
| [validation-final/ci-accounting.txt](validation-final/ci-accounting.txt) | Final successful validation log/ledger |
| [validation-final/connected-demo.txt](validation-final/connected-demo.txt) | Final successful validation log/ledger |
| [validation-final/contracts.txt](validation-final/contracts.txt) | Final successful validation log/ledger |
| [validation-final/final-exact-comparison.txt](validation-final/final-exact-comparison.txt) | Final successful validation log/ledger |
| [validation-final/full-suite.txt](validation-final/full-suite.txt) | Final successful validation log/ledger |
| [validation-final/guards.txt](validation-final/guards.txt) | Final successful validation log/ledger |
| [validation-final/handler-consolidation.txt](validation-final/handler-consolidation.txt) | Final successful validation log/ledger |
| [validation-final/infrastructure-accounting.txt](validation-final/infrastructure-accounting.txt) | Final successful validation log/ledger |
| [validation-final/ledger.json](validation-final/ledger.json) | Final successful validation log/ledger |
| [validation-final/master-preview.txt](validation-final/master-preview.txt) | Final successful validation log/ledger |
| [validation-final/overlays.txt](validation-final/overlays.txt) | Final successful validation log/ledger |
| [validation-final/production-build.txt](validation-final/production-build.txt) | Final successful validation log/ledger |
| [validation-final/runtime-ownership.txt](validation-final/runtime-ownership.txt) | Final successful validation log/ledger |
| [validation-final/teamhub-backend.txt](validation-final/teamhub-backend.txt) | Final successful validation log/ledger |
| [validation-final/teamhub-frontend.txt](validation-final/teamhub-frontend.txt) | Final successful validation log/ledger |
| [validation-final/tournaments.txt](validation-final/tournaments.txt) | Final successful validation log/ledger |
| [validation-final/typescript.txt](validation-final/typescript.txt) | Final successful validation log/ledger |
| [validation-final/verify-final-source.txt](validation-final/verify-final-source.txt) | Final successful validation log/ledger |
| [validation/accounting-update-gate.txt](validation/accounting-update-gate.txt) | Initial run (one helper failure) retained without alteration |
| [validation/ci-accounting.txt](validation/ci-accounting.txt) | Initial run (one helper failure) retained without alteration |
| [validation/connected-demo.txt](validation/connected-demo.txt) | Initial run (one helper failure) retained without alteration |
| [validation/contracts.txt](validation/contracts.txt) | Initial run (one helper failure) retained without alteration |
| [validation/final-exact-comparison.txt](validation/final-exact-comparison.txt) | Initial run (one helper failure) retained without alteration |
| [validation/full-suite.txt](validation/full-suite.txt) | Initial run (one helper failure) retained without alteration |
| [validation/guards.txt](validation/guards.txt) | Initial run (one helper failure) retained without alteration |
| [validation/handler-consolidation.txt](validation/handler-consolidation.txt) | Initial run (one helper failure) retained without alteration |
| [validation/infrastructure-accounting.txt](validation/infrastructure-accounting.txt) | Initial run (one helper failure) retained without alteration |
| [validation/ledger.json](validation/ledger.json) | Initial run (one helper failure) retained without alteration |
| [validation/master-preview.txt](validation/master-preview.txt) | Initial run (one helper failure) retained without alteration |
| [validation/overlays.txt](validation/overlays.txt) | Initial run (one helper failure) retained without alteration |
| [validation/production-build.txt](validation/production-build.txt) | Initial run (one helper failure) retained without alteration |
| [validation/runtime-ownership.txt](validation/runtime-ownership.txt) | Initial run (one helper failure) retained without alteration |
| [validation/teamhub-backend.txt](validation/teamhub-backend.txt) | Initial run (one helper failure) retained without alteration |
| [validation/teamhub-frontend.txt](validation/teamhub-frontend.txt) | Initial run (one helper failure) retained without alteration |
| [validation/tournaments.txt](validation/tournaments.txt) | Initial run (one helper failure) retained without alteration |
| [validation/typescript.txt](validation/typescript.txt) | Initial run (one helper failure) retained without alteration |
| [validation/verify-final-source.txt](validation/verify-final-source.txt) | Initial run (one helper failure) retained without alteration |
| README.md | This complete evidence index |
| files.json | SHA-256 manifest of all evidence except itself |

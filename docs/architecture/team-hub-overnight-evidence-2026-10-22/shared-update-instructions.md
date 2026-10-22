# Shared follow-up patches

These are isolated proposals, not applied shared-file changes. Keep the original reviewed manifests and evidence immutable.

- migration-control-followup.patch: prepend current navigation with git apply --unidiff-zero after preparing a new documentation binding version. The current README/status/runbook are sealed by the accepted 55-file review record.
- shared-route-test-compatibility.patch: correct the existing AST test helper for lazy route declarations. All 307 source tests pass with this isolated test-only proposal; the unmodified development baseline passes 306/307. No application route changes.
- The existing production deployment CI selector reports the historical 20 October preparation hashes. Use the latest manifest plus team-readiness.test.mjs and exact review-bindings verification for the actual deployment proposal; update CI routing only in a new reviewed source-binding revision. Do not mistake the old CI summary for execution authorization.

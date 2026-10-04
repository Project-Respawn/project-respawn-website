# Mandatory new-domain and migration checklist

Effective 4 October 2026. Use with the [architecture standard](project-respawn-domain-architecture-standard.md), [classification](project-respawn-domain-classification.md) and [roadmap](domain-migration-roadmap.md). Required for every substantial new product area, substantial existing-domain extension, and migration stage. These are review requirements, not implemented automation or execution authorization.

Copy the checklist into the issue/PR and link evidence beside every completed item. Mark an item N/A only with a specific reason: a stateless domain needs no speculative data store, a module may reuse its existing independent root, and a frontend-only section needs no backend. An unchecked migration/security/lifecycle item prevents readiness claims. Do not silently mark a planned capability deployed.

## Architecture decision record

```text
Feature / domain / module and accountable owner:
Classification: Shared/Core | existing-domain module | new independent domain | frontend-only
Business capability and alternatives considered:
Current physical owners / target owners:
New independent unit justification (or existing unit reused):
Core and cross-domain contracts / versions / consumers:
Data sensitivity / authoritative writer / tenant and subject model:
Frontend routes, deep links, lazy closure and current bundle baseline:
Runtime versus deployment identities / boundaries / negative cases:
Environment / account / region / root / identity provenance:
Generated resource delta / root and template budgets / growth estimate:
Stateful transfer classification / backup and restore / rollback:
Compatibility, observability and success criteria:
Unresolved decisions / temporary exceptions / expiry or exit milestone:
Implementation authorization / deployment authorization / production authorization:
```

## Required sequence

1. **Classify and justify ownership.** Identify current and target owner, distinct capability/data/lifecycle and several independence benefits if requesting a new domain. Check the complete website catalog. Keep brackets/matches/drafts inside Tournament and overlays/analytics inside Creator unless a new lifecycle is justified. A page, Cognito group or table alone is insufficient. Keep Core conservative and record unresolved decisions before creating infrastructure.

2. **Inventory the current dependency and state boundary.** Identify actual callers, imports, tables/custom providers, API URLs, keys, object prefixes, event sources, runtime consumers, IAM and physical stack owners. Distinguish pure source moves, stateless recreation, retain/import candidates, protected identity and high-risk state. Record remaining Legacy dependencies honestly. Existing custom-managed tables are not assumed importable as native resources. A new domain with no existing state records that fact explicitly.

3. **Create the frontend ownership boundary.** Plan `src/features/<domain>/` or the repository equivalent for routes/pages/components/composables/services/API/contracts/state. Preserve existing routes, aliases, auth and deep links. Require dynamic major layouts/pages, lazy API clients and domain-local stores. Confirm shell/guards do not import unrelated product implementations. Capture before/after route chunks and initialization/network evidence; no fake precise bundle target.

4. **Define versioned contracts before implementation coupling.** Specify domain API/schema, resource IDs, auth modes, trusted identity, roles/memberships, errors, pagination, concurrency/idempotency, privacy, compatibility and deprecation. Contract libraries must be pure and pinned. Define authorized service/delegated-user calls and useful events only where needed. No direct foreign database access, shared giant Lambda or circular root exports.

5. **Select an independent infrastructure root when justified.** Give the domain its own app/entrypoint, sibling root, package/lock/toolchain, input closure, isolated assembly and deployment artifact. Do not instantiate LegacyPlatform or another product and do not use `backend.createStack()` as an independence claim. For a module, explicitly reuse its owner's root; for frontend-only work, omit this step with justification.

6. **Consume existing environment identity.** Validate account/region/environment and environment identity provenance. Reuse the existing Cognito issuer/client and canonical subject; no per-domain pools or localhost-to-production switches. Derive callers from trusted authorizer claims, never JSON user IDs. Core alone owns identity administration. Define product authorization and negative personas independently of login.

7. **Implement the domain API and runtime ownership.** Own request validation, handlers/business logic, domain authorization and error behavior. Use a dedicated domain client/endpoint. Keep compatibility facades explicit; if a facade or state still belongs to Legacy, label that stage partially separated. No provider secret or full generated global schema leaks into a generic client.

8. **Plan owned data only where needed.** Identify one authoritative writer and domain lifecycle. Review indexes/transactions/TTL/idempotency/encryption/deletion, backup and restore, private storage and Core asset contracts. For extraction, rehearse physical ownership transfer and reconciliation separately from code rollout; no unreviewed replacement, two managing stacks or uncontrolled dual writers. A fixture proof remains stateless and clearly marked.

9. **Define strict runtime identity and boundary.** Scope trust, actions/resources and permissions boundary to the domain. Test own-service positives and foreign S3/DynamoDB/secrets/keys, Cognito admin, IAM, CloudFormation and business administration negatives. Inspect identity plus boundary plus resource policy. Evidence any default service-encryption exception with exact key/action and context where supported; keep business and unknown keys denied. Never copy a broad execution policy to runtime.

10. **Define practical, controlled deployment permissions.** Separate caller and CloudFormation service role from runtime. Bind account/environment/root/artifact/role, restrict PassRole and legacy/production targets, document any required service-level permission with residual risks. No administrator policy shortcut. A deployment failure does not authorize arbitrary permissions expansion. Production requires separate explicit authorization.

11. **Prepare environment and endpoint configuration.** Reuse genuine Amplify outputs only for LegacyPlatform. Specify the domain manifest's owner/domain, account/region/environment, stack/API identities, endpoint, auth mode, contract/candidate revision and provenance. Planned manifests are not accepted live endpoints. Do not reconfigure global Amplify per product. Prepare consumer compatibility checks and an explicitly separate frontend cutover.

12. **Add meaningful tests and accounting evidence.** Cover contract/runtime/auth/resource ownership, dependency closure, frontend lazy loading, wrong targets, manifests, role boundaries and negative controls. Count all generated/nested/custom/IAM/API/log resources and compare approved budgets/growth. Do not refresh debt receipts to hide a regression. Record simulation limits and actual service tests separately. Include only tests relevant to the changed capability; no blanket live writes.

13. **Prove independent build and hosted selection.** Tests and isolated synthesis must produce only the selected root/assets. A changed product selects its own pipeline; shared contracts select compatibility tests. Frontend-only work must not synthesize/deploy any backend. Inspect both the accounting step and actual hosted deploy command. Existing local Tournament checks do not prove `amplify.yml` isolation. Record unimplemented guardrails as gaps, not passes.

14. **Prepare and inspect the concrete release gate.** Only within separate authorization: verify immutable candidate/artifact hashes and identity immediately before preparation, get the complete AWS change set including nested effects, and reconcile additions/updates/deletions/replacements/IAM/stateful/protected impacts. Record rollback-enabled execution and prior artifact/configuration. Stop at preparation if execution is not authorized; no HEAD or fresh-synth substitution for an approved pinned candidate.

15. **Prove deployment, runtime and unrelated stability.** Only after explicit execution authorization, deploy the selected domain. Verify valid same-environment identity, auth negatives, domain behavior, platform/application or approved equivalent logs, metrics, alarms and service-encryption path. Rerun effective security negatives after success. Compare unrelated roots, protected physical identities, timestamps and monitored Lambda hashes. Record exact operation scope; do not claim independence from a successful create alone.

16. **Prove independent update and rollback.** Release a separately reviewed compatible revision and restore the previous immutable template/code/config without selecting other roots. Confirm both versions' contracts and unchanged unrelated resources. Stateful rollback requires separate restore/reconciliation proof, not only old code. Stop on a failure at the authorized boundary. This step remains pending for Tournament Phase 2A.

17. **Publish accepted configuration and close the stage.** After the applicable live acceptance gate, publish the validated endpoint/provenance manifest and operational runbook, update the classification/status, disclose any still-legacy state or hosted pipeline gap, and retain evidence. Frontend cutover, production promotion, migration and old-resource cleanup each require their own reviewed scope. Record remaining rollback proof if an initial release is accepted before lifecycle proof is complete, as with Tournament Release 1.

## Required proof before READY_TO_EXTRACT

For an existing product, READY_TO_EXTRACT requires an owner-approved bounded stage, complete contracts/dependencies, an isolated candidate and resource accounting, viable security plan, applicable backups/restore and ownership-transfer rehearsal, compatibility/rollback plan, and a concrete authorized next gate. A high-level classification alone is insufficient. If physical data transfer is not ready, scope a stateless/compatibility stage and disclose retained state rather than labeling the whole domain independent.

## Review enforcement and exceptions

Attach evidence paths and results to the PR; identify which checks exist and which require manual review. The guardrail design in the standard must be implemented later through its own approved task. For each temporary exception, document the exact violated rule, owner, narrow access/dependency, compensating control, exit milestone and explicit review approval. An exception cannot authorize production, protected resource replacement, migration or an AWS write.

For this documentation task all execution steps are out of scope. Release 2 stays paused. The next work item is a separately authorized Tournament-only Release 2/rollback plan, not automatic execution of this checklist.

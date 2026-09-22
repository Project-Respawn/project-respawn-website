# Architecture rule: adding a substantial feature

## LegacyPlatform rule (approved)

The existing Amplify Gen 2 backend is LegacyPlatform and retains existing physical resources until safely migrated. Do not add substantial new product domains there by default. Before a significant backend feature, record: (1) owning domain, (2) whether it is frontend-only, (3) whether an existing independent service fits, (4) whether a new independent root is justified, (5) shared Core contracts, (6) effective CloudFormation cost, (7) new stateful resources, and (8) whether unrelated domains must redeploy.

Choose deployment units by lifecycle, size, security, permissions, release isolation, resource growth and operational owner. Logical ownership is not physical ownership. `backend.createStack()` or another nested stack can reduce a template's size but does not create an independent deployment or remove the hierarchy-operation limit. Large domains may become sibling roots; do not create one stack for every small feature. Drafting, Broadcast and Competitive History may initially remain Tournament modules.

The overall direction and Phase 1 preparation are approved. No deployment, Phase 2 frontend implementation or Phase 3 backend creation is authorized by that approval. Use `npm run test:resource-accounting` and `npm run validate:infrastructure-ci` for infrastructure changes. Budget-baseline/debt-receipt changes require explicit review; never refresh them automatically to make a failing growth check pass.

This rule governs future feature planning. It does not authorize deployments or change existing sandbox/resource protections. The [platform architecture](platform-architecture.md) has an approved overall direction; use the assessment below while independently reviewing each implementation/deployment phase.

Before implementation, include a short architecture note in the issue/PR answering:

1. **Owner:** Which top-level domain and submodule owns this feature and its authoritative data?
2. **Existing module:** Does it fit an existing module's lifecycle, permissions and contract? Prefer that module when it does.
3. **Infrastructure boundary:** Does independent growth, release cadence, runtime or security justify a new deployable unit? A folder or nested stack alone does not establish deployment isolation.
4. **Shared services:** Which identity/profile/authorization/media/configuration contracts are required? Preserve one platform account; do not create a new per-product Cognito pool by default.
5. **Effective cost:** Which tables, indexes, functions, resolvers, pipelines, data sources, IAM resources, permissions, custom providers, logs and nested resources will synthesis add?
6. **Budgets:** What are the before/after per-template and recursive-root counts, growth delta and creation/update implications? Use [resource budgets](cloudformation-boundaries.md); do not add another generated model to the shared schema without counting it.
7. **Frontend loading:** Can routes and domain SDKs load on demand? Identify eager imports and public-shell impact, preserving guards and existing deep links.
8. **Deployment isolation:** What actually runs when this feature changes? Identify pipeline/root dependencies and consumer compatibility. Do not promise independent deployment for a nested Amplify stack.

Also state the data classification, writer/reader authority, cross-domain contracts, IAM scope, observability owner, test plan and rollback. For any existing physical resource change, name the migration category: safe source move, recreatable stateless resource, retention/import required, do-not-move identity, or stateful/high risk. A construct move can be a replacement even when the physical service sounds unchanged.

Required review evidence scales to impact: small frontend changes need relevant build/route checks; substantial backend changes need synth/template/budget diffs and authorization tests. Preserve handler consolidation and gateway contracts; never multiply generated per-field handler infrastructure without measuring and justifying it. Do not create one stack per page or an all-purpose integrations/admin stack that absorbs every domain.

When a boundary is unclear, document the provisional owner and dependency before changing infrastructure. Do not use ambiguity as permission to migrate data, swap environments or recreate a sandbox. Existing user authorization and repository protection rules remain controlling.

Suggested architecture note:

```text
Feature / domain / module:
Authoritative data owner and classification:
Existing or new deployment unit, with reason:
Shared and cross-domain contracts:
Generated resource delta and root/template budgets:
Frontend loading and route/guard impact:
IAM scope and deployment dependencies:
Stateful identity/migration implications:
Validation, rollback, and owner:
```

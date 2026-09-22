# Proposed architecture decision records

The overall direction of these decisions was **APPROVED** after the 2026-09-21 audit. Their acceptance is separate from authorization to execute a migration. Phase 1 safeguards and consolidation preparation are implemented locally; independent roots, stateful migrations, frontend lazy loading and deployment remain future separately authorized work. See [Phase 1 review](phase1-implementation.md).

## ADR-001 — Logical hierarchy and independent release boundaries

Context: products have nested logical ownership, while the present Amplify root deploys all backend domains together.

Decision proposed: use domain/submodule ownership in source and docs; create sibling deployable roots only when growth, permissions or lifecycle warrants it. Keep Drafting/Broadcast within Tournaments initially. Do not introduce a new umbrella nested root.

Alternatives: one monolithic Amplify root retains coupling; one root per page adds cost without useful isolation; more nested stacks only split templates.

Consequences: meaningful selective deployments, but more pipeline/configuration/contract management. Acceptance requires the pilot domain's deployment to exclude unrelated roots.

## ADR-002 — One platform identity, isolated domain and branch data

Context: the user wants shared accounts and separate branch data. Production owns the desired pool; current prepared referenceAuth also shares IAM identity roles.

Decision proposed: preserve production pool and stable subject identifiers; use shared identity across products with explicit clients/audiences and scoped environment data-access roles. Keep domain entitlements local. Roll out cross-branch login only after proving role/trust/output isolation.

Alternatives: per-domain pools duplicate accounts; reusing every production role across branches risks permission expansion; recreating a pool loses identity continuity.

Consequences: login is shared while authorization remains domain-specific. Changing pool ownership is unnecessary initially. Acceptance includes cross-branch negative access tests and compatibility with the chosen Amplify integration.

## ADR-003 — Preserve stateful physical identity

Context: moving constructs/model definitions can translate to deletion/recreation. Model tables are custom-managed.

Decision proposed: use logical ownership/façades first; leave existing stateful resources where they are unless a supported, verified retention/import/refactor method exists. Preserve pool, bucket, table, AppSync and KMS identities by default.

Alternatives: big-bang source/stack reorganization risks data loss; copying data automatically creates consistency, identity and rollback hazards.

Consequences: transitional legacy dependencies persist and must be measured honestly. Acceptance requires a per-resource mapping and recovery rehearsal, not just a clean CDK diff.

## ADR-004 — Count generated resources and preserve consolidation

Context: 79 custom operations create 475 FunctionDirectiveStack resources; historical alias candidate reduces this to 167, while full tree remains 2,628.

Decision proposed: re-prove/adopt the candidate through a separately approved change, retain action authorization, and use per-template plus root-operation budgets. Do not treat handler reuse as a reason to combine all business execution permanently.

Alternatives: per-field Lambda bindings recreate growth; only counting functions misses generated IAM/pipelines; a 480-template guard alone misses recursive limits.

Consequences: a short-term resource reduction and durable budget gate; generated models still need a long-term independent deployment strategy.

## ADR-005 — One writer and versioned cross-domain contracts

Context: schema relationships, shared Lambda dispatch and direct table grants blur ownership.

Decision proposed: one authoritative writer per model, stable IDs, owner APIs for commands/authorization and versioned events for asynchronous projections. Use minimal Core contracts and avoid reciprocal stack exports/table-write grants.

Alternatives: a universal shared database/API is easy initially but couples releases; eventual-consistency events alone are inadequate for immediate permission revocation.

Consequences: explicit failure/version/idempotency behavior is required. A registry/SSM contract provides discovery, not permission or automatic configuration refresh.

## ADR-006 — Lazy frontend domains with explicit bootstrap

Context: 91 static route component imports and a 2.32 MB main JS artifact load unrelated products eagerly; static imports can initialize Amplify clients before configuration.

Decision proposed: keep route metadata available, lazy-load components/domain services, configure Amplify before client initialization, and preserve existing route/guard contracts.

Alternatives: rewriting into separate frontend apps immediately complicates navigation/session/deployment; cosmetic chunk splitting alone may still load everything initially.

Consequences: smaller initial dependency graph, asynchronous error/loading handling, mandatory direct-link and authentication tests. No claim that infrastructure stacks improve page speed.

## ADR-007 — Stable naming and explicit environment registry

Context: generated stack names are lengthy; Ntgre/Ntgrestage8, branch stages and Twitch runtime tags disagree.

Decision proposed: improve logical labels, supported tags and registry ownership first; give only new independent roots consistent names. Preserve deployed construct paths and physical stateful names.

Alternatives: mass renaming creates replacements; guessing target environment from the visible prefix can act on the wrong stack.

Consequences: console readability improves progressively; discovery uses authoritative ARNs/outputs rather than string assumptions.

## ADR-008 — Pilot new services before migrating old data

Context: Tournaments currently use a fixture adapter; existing Forums/Team Hub/Commerce hold state in the shared schema.

Decision proposed: establish new independent service/pipeline patterns with a small Tournament slice, then extract bounded stateless paths and only later consider physical state ownership. Keep Companion and the SWG EC2 host as separately audited boundaries.

Alternatives: extracting all existing tables first puts the highest-risk operation at the start; continuing every new feature in legacy data increases creation-limit debt.

Consequences: migration takes multiple compatible releases, but validates deployment isolation before risking established data. Release pipelines and contract compatibility must be proven, not assumed from folder layout.

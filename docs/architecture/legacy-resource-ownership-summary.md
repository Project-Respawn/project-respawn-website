# Legacy resource ownership coverage

[Phase 2 START HERE](README-PHASE2-MIGRATION.md) · [Full ledger](legacy-resource-ownership.json) · [Human-readable ledger](legacy-resource-ownership.md)

Inventory coverage is **100.00%** (2621/2621); future-owner resolution is **92.71%**. Inventory is complete for the accepted recursive Ntgre scope; ownership resolution and full-account/production coverage are not complete. No AWS call was made for this checkpoint. Evidence was last verified 2026-10-05T15:19:39.684Z.

| Measure | Count | % of Legacy |
|---|---:|---:|
| Total | 2621 | 100.00% |
| Assigned | 2430 | 92.71% |
| Unassigned | 0 | 0.00% |
| Unresolved shared | 191 | 7.29% |
| Shared | 627 | 23.92% |
| Stateful | 61 | 2.33% |
| Protected | 62 | 2.37% |
| Retirement candidates | 0 | 0.00% |
| Migrated | 0 | 0.00% |
| Retired | 0 | 0.00% |

Stateful/shared/protected are overlapping dimensions, not additive buckets. Statefulness follows the accepted source definition (61 tables/buckets/keys/pool declarations); protected includes the AppSync API (62). Logical ownership is not physical transfer or deletion eligibility.

| Future owner/domain | Current resources | Assigned | Migrated | Retirement candidates | Unresolved |
|---|---:|---:|---:|---:|---:|
| SHARED_CORE | 418 | 418 | 0 | 0 | 0 |
| TOURNAMENT | 0 | 0 | 0 | 0 | 0 |
| TEAM_HUB | 188 | 188 | 0 | 0 | 0 |
| CREATOR | 629 | 629 | 0 | 0 | 0 |
| COMMERCE | 305 | 305 | 0 | 0 | 0 |
| COMMUNITY_EVENTS | 382 | 382 | 0 | 0 | 0 |
| APPLICATIONS_INTAKE | 302 | 302 | 0 | 0 | 0 |
| INVESTOR_ACCESS | 144 | 144 | 0 | 0 | 0 |
| FRONTEND_OR_BUILD_SUPPORT | 62 | 62 | 0 | 0 | 0 |
| LEGACY_COMPATIBILITY | 0 | 0 | 0 | 0 | 0 |
| RETIRE_CANDIDATE | 0 | 0 | 0 | 0 | 0 |
| UNASSIGNED | 0 | 0 | 0 | 0 | 0 |
| UNRESOLVED_SHARED | 191 | 0 | 0 | 0 | 191 |

All resources remain Legacy-authoritative. Tournament/Team Hub independent previews add their own resources; they do not remove any of these rows. **No Legacy resource reduction is claimed.** Mixed shared providers, APIs, IAM and storage need consumer/lifecycle evidence before resolution. Unresolved entries include an explanation and source pointers. Do not assign them merely to improve coverage.

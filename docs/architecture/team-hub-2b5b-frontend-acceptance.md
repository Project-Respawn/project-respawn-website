# Team Hub 2B5B frontend acceptance

7 October 2026. **SOURCE PREPARED; BROWSER ACCEPTANCE PENDING; LIVE FRONTEND UNCHANGED.**

The normal website continues using the protected Legacy Team service. `migration-mode.mjs` defaults to false. The separate `scripts/team-hub-2b5b/frontend-candidate.vite.mjs` aliases the existing Team service consumers to `independent-service.mjs`; it is not selected by normal build/dev. `frontend-cutover.PROPOSAL.json` has `reviewed:false`, so it cannot activate live API calls. Epoch 3 is only the proposed first transfer from initialized epoch 1; it must be checked against actual control state at 2B6.

The independent client consumes the accepted Team endpoint and Core environment manifests, obtains the current access token per call, sends the expected authority epoch, and has no Legacy fallback or global Amplify.configure switch. The adapter maps native DTOs and optimistic versions to the existing website. Account changes clear adapter caches and remount private routed views. Branding and unsupported scheduled plan expiry fail closed.

## Consumer inventory

| Actual consumer | Previous backend | Candidate operations | Acceptance / limitations |
|---|---|---|---|
| `/team-hub` home/dashboard | Legacy readTeamHub/mutateTeamHub | LIST_MY_TEAMS, GET_TEAM_HUB, CREATE_TEAM | Core admin capability; bounded list/detail requests; browser pending |
| `/team-hub/:teamSlug` | Legacy readTeamHub | GET_TEAM_HUB | Native membership/roster projection; browser pending |
| `/team-hub/:teamSlug/manage` | Legacy Team gateway | GET_TEAM_HUB, MANAGE_MEMBER, SET_ROSTER_SLOT, directory search/resolve | Team Manager authorization; exact existing account email for assignment; no invented emails |
| Champion Pool | Legacy Team gateway | LIST_MY_CHAMPION_POOL, UPSERT_MY_CHAMPION, DELETE_MY_CHAMPION | Sequential writes preserve shared Team version; browser pending |
| Coach Review / team-pool redirect | Legacy Team gateway | LIST_TEAM_CHAMPION_POOLS, UPSERT_COACH_ASSESSMENT | Team-visible assessment only; no private notes, tier or suggestion writes |
| Admin Team UI | Legacy permissions and Team gateway | LIST/GET/CREATE/UPDATE, SET_MANAGER, SET_TEAM_PLAN, directory resolve | Admin authorization from Core; branding disabled; browser pending |
| Signed-in website homepage shortcuts | Legacy Team service | Bounded LIST_MY_TEAMS and GET_TEAM_HUB through the same alias | Existing homepage consumer needs no separate endpoint; browser pending |

## Isolation and build evidence

[Normal build](team-hub-2b5b-evidence-2026-10-07/frontend-build.json) and [independent candidate build](team-hub-2b5b-evidence-2026-10-07/frontend-candidate-build.json) record static import closures. Route declarations remain shared; domain page/client modules are lazy. Main normal bundle is approximately 563 kB (132 kB gzip). Existing CSS syntax and main-chunk size warnings remain; builds pass. Static import evidence is not a substitute for browser network inspection.

The prior source guard was amended only for an explicit list of reviewed frontend paths and the already accepted 2B4 backend hash. Other protected Legacy source hashes retain their original pins. The original Legacy Team service remains byte-identical. [Frontend source pins](team-hub-2b5b-evidence-2026-10-07/frontend-source-manifest.json) record the exact reviewed files; historical manifests were not rewritten.

## Browser gate

The actual website helper at localhost:5177 uses normal Ntgre sign-in and live Core contracts. Team state and transactions are in-memory fixtures only; the helper has no DynamoDB writer. Access tokens stay in request memory and are not written to evidence. Sanitized receipts contain operation, persona, status and time only. This does not prove deployed Team runtime-role permissions.

Admin/SuperAdmin and ordinary account checks are available. Manager/Coach/Player are Team memberships, not platform Cognito groups. Approval to attach isolated in-memory personas to an existing non-admin identity is pending; no real Cognito groups or Team memberships were changed. The user agreed to switch accounts locally. No completed persona receipt has yet established browser acceptance.

Required remaining checks: login/account switching; homepage/navigation; all routes above; Admin and ordinary denial; Manager roster/directory; Player pool save/delete; Coach assessment; stale/error/empty states; disabled logo controls; actual browser import/network isolation. Do not mark this gate PASS from unit tests or a successful HTML request.

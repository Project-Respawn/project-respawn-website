# Team Hub 2B5A-2 Core integration candidate

6 October 2026. **Preparation only. Team Hub is not deployed or changed by 2B5A-1.** Current authority remains LEGACY_WRITER, target ordinary writes and synthetic verification disabled, frontend cutover false.

The existing dormant [real Core client](../../domains/team-hub/cutover/core-client.mjs) and [entry](../../domains/team-hub/cutover/entry.mjs) invoke only the exact `ProjectRespawn-Core-Ntgre-Contracts` Lambda ARN. Server credentials authenticate the service; delegated access JWT independently authenticates the human. Global decision response must match actor, environment, capability and bounded timestamps. Failure denies, with no Cognito or Legacy fallback. Core contract changes in this phase remain compatible with that adapter and are tested together. RATE_LIMITED maps to dependency-unavailable in the current Team adapter; it does not retry or bypass authorization.

Team remains owner of membership/Manager/Coach/Player/resource decisions. Manager/global admin authorization precedes directory delegation and is rechecked before assignment. Core cannot inspect Team data. Direct ListUsers, AdminGetUser and Cognito mutations remain denied to Team. Proposed exact InvokeFunction identity/boundary changes from 2B5 remain uninstalled; Team security and product templates are not deployed alongside Core.

Browser path: Team frontend → Team API → Core. No browser Core SDK, IAM credentials, direct directory endpoint or duplicated authoritative browser permission decision. Static environment identity may be consumed without constructing Core. The live frontend keeps its current endpoint and global Amplify configuration unchanged.

Prerequisites for 2B5A-2: accepted Core deployment/config manifest; actual service caller and delegated JWT tests; explicit Team artifact/security change review; ordinary authority fence preserved; no verification bypass in the new bundle. Normal routes must still deny while authority is Legacy. The 2B5 Core build receipt is historical and must not be substituted for this phase's new Core artifact. No accepted Team pin is regenerated.

Publishing a Core manifest is not Team cutover. Frontend migration, Legacy fencing, authority-control creation, rollback rehearsal and business authority switch retain their separate gates. [Core readiness](core-first-deployment-readiness.md).

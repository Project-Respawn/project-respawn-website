# Team Hub development integration and Master release review

## Development integration

The accepted checkpoint `d3df6d18fc11be6f52e31984d465d1db7fa132be` fast-forwards development from `5048a7fd0f8310b2615e7ae346707abee9fe7805`. All seven commits are retained; there are no development-only commits or merge conflicts. The complete difference contains 5,043 files, mostly architecture evidence and migration tooling. The two dirty SWG Buff Builder files in the primary workspace are excluded and untouched.

An isolated integration checkout passed 710 frontend/domain/security/privacy/authority/epoch/accounting tests and 47 Legacy Team tests, both Team Hub and Amplify TypeScript checks, the build, migration ledger, documentation links, local outputs and Amplify contract validation. Credential-pattern checks across the branch difference reported no findings. Build warnings remain the existing CSS and chunk-size warnings. Existing local historical bundles, synthesis receipts and generated type declarations were used only as test inputs; no deployment artifact was synthesized or AWS resource changed.

The initial checkout retained a normalized `package.json` from its former branch state. Its bytes were restored to the exact accepted Git object and receipt hash; HEAD, index and working-file hashes now match. There is no package dependency or semantic source change. This documentation checkpoint follows the accepted integration without rewriting history.

AWS Amplify app `d2cux232bpa951` currently has Master, Staging and Demo branches, with automatic branch creation disabled. Development has no connected hosted environment and pushing development does not select a new AWS backend. Offline build checks use the existing Ntgre local output/identity contracts. The ordinary source frontend remains Legacy-selected; acceptance of a separately pinned Ntgre localhost artifact does not activate it globally or make a production frontend.

## Production observations and blockers

Account `058264289478`, region `eu-north-1`, read-only operator RavenTest. Master HEAD and the latest successful public deployment are `a83a874dad50395518fb0d7e2f1e853cf6bf2513` (Amplify job 151). Master auto-build is enabled. Nine Master-only commits, including SWG installer/launcher/city releases, must be retained in a future merge. No Master merge or push is performed here.

Production root: `amplify-d2cux232bpa951-master-branch-53ef67772a`. Production Cognito pool `eu-north-1_Uufjxul58`, client `2kc81ph5mgvo9eu2qjvmif5u8g`, estimated users 15. Existing authentication is preserved. This is distinct from Ntgre pool `eu-north-1_n24iLL7QE`; no local account/session is evidence of production persona acceptance. Existing public API is `https://g9eoo6e1h2.execute-api.eu-north-1.amazonaws.com`. Master serves `projectrespawn.com` and `www.projectrespawn.com`; Staging serves the test domain. Amplify's AVAILABLE domain association is not a fresh browser or DNS acceptance receipt.

Only Ntgre independent Core/Team Hub stacks, functions and endpoint manifests were found in the inspected region. No production independent Core, Team Hub API/tables, authority record or accepted production runtime/permissions package is established. The environment schema and cutover client explicitly require Ntgre. They cannot be repointed to production or used to send production users to Ntgre.

Strongly consistent, complete count-only reads found existing production Legacy data:

| Source table | Rows | PITR | Deletion protection | Listed on-demand backups | Table resource-policy fence |
| --- | ---: | --- | --- | ---: | --- |
| Team-lte47f3mgbbvxehfgz476en3xy-NONE | 1 | Disabled | Disabled | 0 | Absent |
| TeamMembership-lte47f3mgbbvxehfgz476en3xy-NONE | 8 | Disabled | Disabled | 0 | Absent |
| TeamRosterSlot-lte47f3mgbbvxehfgz476en3xy-NONE | 11 | Disabled | Disabled | 0 | Absent |
| PlayerChampionPoolEntry-lte47f3mgbbvxehfgz476en3xy-NONE | 101 | Disabled | Disabled | 0 | Absent |

No record contents or user attributes were retrieved. These 121 rows are not an empty-source migration. The production storage bucket is `amplify-d2cux232bpa951-ma-projectrespawnstoragebuc-bw3gimudfvur`; current `team-logos/` listing contains zero objects. A count alone is not upload quiescence, ownership reconciliation or a fence proof. Recovery protection, pending uploads and production writer inventory require their own approved package.

Current Master `amplify.yml` permits `ampx pipeline-deploy` unless its narrowly scoped SWG frontend-only exception applies. The incoming development pipeline instead rejects production hosted execution, and its selector has no production adapter. Therefore a direct Master merge would fail its reviewed production gate; bypassing that gate could trigger an unreviewed broad Legacy deployment. Neither is an accepted release plan.

## Exact prerequisites before Master publication

1. Separately review recovery protection and backups for the four exact source tables above; verify recoverability and preserve the existing production Cognito users, client, source stack and storage. No protection changes are authorized by this Git integration.
2. Prepare production environment/authentication contracts bound to the existing pool/client, issuer `https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_Uufjxul58`, account and region. Preserve Ntgre contracts and require negative tests rejecting Ntgre tokens/endpoints in production. Review actual production group/persona semantics and bounded directory privacy.
3. Prepare independent production Core authorization/directory and Team Hub sibling roots using the accepted design: existing Cognito, one Team API, Read/Command runtimes, Operational/Journal state, Team-owned cursor signing, exact boundaries and monitoring. Proposed names `ProjectRespawn-Core-Production` and `ProjectRespawn-TeamHub-Production` are design inputs, not installed resources or permission grants. Independently synthesize/review resource counts, exact IAM/KMS and pinned artifacts; do not deploy the Ntgre templates or initialize target authority from 5/5.
4. Install and accept only separately authorized production dark infrastructure/security. Initialize a new production authority control row conditionally at LEGACY_WRITER with its reviewed initial epoch, then prove transactional business authority, Core integration, cursor security and dark denials under actual production roles. No authority row currently exists in an independent production Journal.
5. Inventory actual production AppSync, Lambda, direct/manual and S3 writers; prepare exact production source fences and original-principal proofs. Reconcile/export/transform all 121 source rows and relationships, including memberships/roles, rosters and champion pools. Refresh counts and upload/audit state during authorized maintenance; preserve unknown objects and apply the accepted logical-quarantine model. No Ntgre writer ARN or fence receipt substitutes for this work.
6. Prepare and rehearse state-aware production rollback, target recovery and reverse transformation using isolated state. Preserve audits/idempotency. After target business writes, a frontend rollback cannot reopen Legacy authority; containment and reconciliation are mandatory.
7. Prepare a production frontend bound only to the accepted production Team Hub/Core manifests and actual server epoch. Complete five distinct production personas, all business operations, privacy/revocation/pagination, homepage/Admin and network/lazy-loading checks. Branding and Coach-private creation stay disabled until separately accepted.
8. Preserve all nine Master-only commits in a reviewed merge. Prepare a narrowly scoped production publication adapter that uses independently inspected infrastructure artifacts and branch-specific generated outputs, with no implicit Legacy `pipeline-deploy` fallback. Review current payment/environment settings, CORS for the public origins, hosting pins, previous public artifact and rollback. Run full release checks and request explicit approval before pushing Master or otherwise triggering live publication.
9. Only after separately authorized production maintenance, reconciliation, writer-fence proof, authority transfer and business acceptance may the exact frontend be published. Monitor the actual Amplify job and authenticated live website; Git push or job SUCCEED alone is insufficient.

Development can be integrated now. **Master release is blocked by missing production independent infrastructure/contracts, unprotected existing production data and the absence of a reviewed production deployment/migration gate.** No AWS writes, production publication, authority transition or Legacy retirement occurred in this task. [Sanitized inspection and validation evidence](team-hub-development-master-release-evidence-2026-10-14/review.json).

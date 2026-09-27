# SWG Cognito beta login

## Implementation scope and architecture (2026-09-25)

Approved experience: Beta Members download Setup through the existing website;
installation and repair need no device approval. Launcher sign-in uses the existing
website/Cognito account without a typed pairing code. The native server must
validate current beta access before accepting a game login.

Owner: SWG delivery/runtime access, extending the existing independent
`swg-beta-downloads` service in `the sibling swg-main repository’s tools directory`. No Amplify
LegacyPlatform resources, schemas, pools or sandbox outputs change. Website
changes remain in the lazy-loaded SWG view and its small service/config module.

Identity and state: retain the existing Cognito pool, BetaMember group, device
session table, stable eight-slot game assignments and saved characters. Website
passwords stay in the existing Cognito sign-in flow. A launcher session has a
random secret held in launcher memory; the website explicitly confirms launcher
sign-in after authenticating. There is no installer confirmation. Installation
uses a public, release-allowlisted ticket endpoint backed by private S3: client
binaries are distributable, server admission remains restricted.

Native login uses a short-lived one-use random ticket in the legacy password
field. Only its hash is stored. The native auth bridge validates it through the
existing game service, which checks current account enabled status and BetaMember
membership again and atomically consumes the ticket. Static tester passwords do
not bypass the new bridge. Removing membership blocks subsequent logins; existing
in-game sessions are not claimed to be instantly disconnected.

Resource plan: reuse the separate root's Lambdas, IAM roles, HTTP API/JWT
authorizer and DynamoDB tables. Add narrowly scoped routes for launcher sign-in,
public release files and native ticket redemption. No new table, identity pool,
stateful replacement, nested stack or product root. Record exact generated
resource counts/template bytes after tests. Unrelated Amplify domains need no
deployment. Cognito/retained assignment data are do-not-move resources; code and
route additions are in-place, stateless changes.

Trust contracts: authenticated website approval validates the JWT audience/type
and current BetaMember status; native sessions verify high-entropy secrets;
game tickets bind account and website identity, expire and cannot be replayed.
Public file tickets accept only the active release and known manifest/chunk/Setup
keys; no list, write, backup or arbitrary S3 access. Logs exclude passwords,
session secrets, tickets and signed URLs. Existing scoped server wake/IP/idle
controls are retained.

Validation: beta/ordinary/disabled/revoked identities, secret/expiry/replay,
stable slot mapping, actual HTTP native auth bridge, compiled launcher transport,
installer transport/recovery, website route/UI contracts and template accounting.
No tests may start/stop AWS resources or provision real accounts. Deployment,
host installation, payload upload and clean-Windows live acceptance remain
separate steps. Release with a new manifest/Setup hash; preserve the old release
and saved galaxy. A rollback of server authentication must be an explicit access
policy decision, never an automatic fallback to static passwords.

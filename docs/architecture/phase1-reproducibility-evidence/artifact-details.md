# Source-map discrepancy: exact provenance

These are hashes from the preserved baseline and the failed LF-normalized attempt, not from the corrected fresh comparison. All executable files are byte-identical. All changed source-map content is explained by CRLF-to-LF conversion in the previous temporary snapshot helper. No comparison rule ignores these differences.

## postconfirmationlambda195D98D2

| Item | Baseline | Failed candidate |
| --- | --- | --- |
| Asset hash | `4010828c72d4fcb1c52849ff1325524db1127d65e51026b6e3c21d477263663e` | `8acce5b98d23e3c0e5a5c41cc0bfbb4fb3ba1633d90b43d7bcced3004eebd30b` |
| index.mjs SHA-256 | `8b78e98b3052f40703cb8cd8bca3099755315c53802f61249ecb4c129a18f7f0` | `8b78e98b3052f40703cb8cd8bca3099755315c53802f61249ecb4c129a18f7f0` |
| index.mjs.map SHA-256 | `83760f18cfb1abe6811d3e425ca68dc27357960b054b654258c7c9530a9c762e` | `63c48a178531c0b1d1a5289e65ff805490ac51375ea6c0305fe61acbde208af1` |

Only source-map embedded source line endings differ: **true**. The following 1 files match both the original working tree and the earlier helper-generated LF snapshot exactly under that conversion:

- `amplify/auth/post-confirmation/handler.ts`

## adminusermanagementlambdaB07E6EFC

| Item | Baseline | Failed candidate |
| --- | --- | --- |
| Asset hash | `10d1f71f972541a85835b64a9838da6b5f50476f93a2a5dbe7ef73d90171e89e` | `2710c4ce8ecbaffab2301695abf99cf7cae143f23db9c6f7fb7ac65a6b02d7ac` |
| index.mjs SHA-256 | `ffbce0054e018c4144587a08d055aad38b839823a09048fa3674836ebd2873a2` | `ffbce0054e018c4144587a08d055aad38b839823a09048fa3674836ebd2873a2` |
| index.mjs.map SHA-256 | `7cc09f503fea84cca63a8ec68d7871beeda7224995739cb75f7e4026135633aa` | `c527bee2e351ffd9f7200394d749ab8c748b2edeaad4ac0c1b1120106369951b` |

Only source-map embedded source line endings differ: **true**. The following 10 files match both the original working tree and the earlier helper-generated LF snapshot exactly under that conversion:

- `amplify/functions/admin-user-management/handler.ts`
- `amplify/myFunction/investors/policy.ts`
- `amplify/functions/admin-user-management/investorRequestWorkflow.ts`
- `amplify/functions/admin-user-management/dataClient.ts`
- `amplify/functions/admin-user-management/authorization.ts`
- `amplify/myFunction/shared/requirePermission.ts`
- `amplify/myFunction/shared/auth.ts`
- `amplify/myFunction/shared/effectivePermissions.ts`
- `amplify/myFunction/shared/permissionConstants.ts`
- `amplify/functions/admin-user-management/rolePolicy.ts`

## myFunctionrebuildlambdaFBFF6F05

| Item | Baseline | Failed candidate |
| --- | --- | --- |
| Asset hash | `b5a5391055220537c34c8d64087229c598c0249e1c6242c26c2306bd2daadd51` | `6ac3c8589010486c2e4d4196c23fc2307384b627e21b1bdc0d0d5f4037b90874` |
| index.mjs SHA-256 | `47f02bbb811660815e60f0ebd7e1ece56a1d4fc2d842119c02e9a0678c48356b` | `47f02bbb811660815e60f0ebd7e1ece56a1d4fc2d842119c02e9a0678c48356b` |
| index.mjs.map SHA-256 | `7fabec27b9c1ece7e6e04e9b484422074aa77e35517131b570b84690ae7e1ab2` | `34cb5994ad7f3b7dbaa5801d7be88c642b4bef04b9461478907181cceb1e4d80` |

Only source-map embedded source line endings differ: **true**. The following 71 files match both the original working tree and the earlier helper-generated LF snapshot exactly under that conversion:

- `amplify/myFunction/shared/http.ts`
- `amplify/myFunction/shared/logger.ts`
- `amplify/myFunction/shared/responses.ts`
- `amplify/myFunction/shared/dataClient.ts`
- `amplify/myFunction/fulfillment/orderJson.ts`
- `amplify/myFunction/fulfillment/orderValidation.ts`
- `amplify/myFunction/config/env.ts`
- `amplify/myFunction/printful/handlers.ts`
- `amplify/myFunction/printful/index.ts`
- `amplify/myFunction/fulfillment/index.ts`
- `amplify/myFunction/revolut/handlers.ts`
- `amplify/myFunction/revolut/index.ts`
- `amplify/myFunction/handler.ts`
- `amplify/myFunction/router/appSyncRouter.ts`
- `amplify/myFunction/events/index.ts`
- `amplify/myFunction/events/handlers.ts`
- `amplify/myFunction/shared/dates.ts`
- `amplify/myFunction/events/managedHandlers.ts`
- `amplify/myFunction/shared/auth.ts`
- `amplify/myFunction/shared/audit.ts`
- `amplify/myFunction/shared/requirePermission.ts`
- `amplify/myFunction/shared/effectivePermissions.ts`
- `amplify/myFunction/shared/permissionConstants.ts`
- `amplify/myFunction/events/managedPolicy.ts`
- `amplify/myFunction/brands/index.ts`
- `amplify/myFunction/brands/policy.ts`
- `amplify/myFunction/forums/index.ts`
- `amplify/myFunction/forums/handlers.ts`
- `amplify/myFunction/permissions/index.ts`
- `amplify/myFunction/workspaces/accessContext.ts`
- `amplify/myFunction/workspaces/access.ts`
- `amplify/myFunction/shared/strings.ts`
- `amplify/myFunction/merch/index.ts`
- `amplify/myFunction/merch/handlers.ts`
- `amplify/myFunction/merch/policy.ts`
- `amplify/myFunction/twitch/index.ts`
- `amplify/myFunction/twitch/managedHandlers.ts`
- `amplify/myFunction/twitch/managedPolicy.ts`
- `amplify/myFunction/twitch/handlers.ts`
- `amplify/myFunction/twitch/integrationHandlers.ts`
- `amplify/myFunction/twitch/oauthState.ts`
- `amplify/myFunction/twitch/health.ts`
- `amplify/myFunction/twitch/capabilities.ts`
- `amplify/myFunction/twitch/integrationTypes.ts`
- `amplify/myFunction/twitch/awsJson.ts`
- `amplify/myFunction/twitch/oauthHandlers.ts`
- `amplify/myFunction/twitch/tokenStore.ts`
- `amplify/myFunction/discord/index.ts`
- `amplify/myFunction/discord/handlers.ts`
- `amplify/myFunction/discord/policy.ts`
- `amplify/myFunction/media/index.ts`
- `amplify/myFunction/media/handlers.ts`
- `amplify/myFunction/stage9/handlers.ts`
- `amplify/myFunction/applications/index.ts`
- `amplify/myFunction/applications/validation.ts`
- `amplify/myFunction/workspaces/index.ts`
- `amplify/myFunction/investors/index.ts`
- `amplify/myFunction/investors/policy.ts`
- `amplify/myFunction/investors/documents.ts`
- `amplify/myFunction/investors/requests.ts`
- `amplify/myFunction/teamHub/gateway.ts`
- `amplify/myFunction/teamHub/index.ts`
- `amplify/myFunction/teamHub/policy.ts`
- `amplify/myFunction/teamHub/dynamo.ts`
- `amplify/myFunction/teamHub/accounts.ts`
- `amplify/myFunction/teamHub/branding.ts`
- `amplify/myFunction/teamHub/entitlements.ts`
- `amplify/myFunction/router/restRouter.ts`
- `amplify/myFunction/revolut/webhook.ts`
- `amplify/myFunction/twitch/rewardEventHandlers.ts`
- `amplify/myFunction/twitch/rewardEventAuth.ts`

## twitchruntimelambdaE27C0484

| Item | Baseline | Failed candidate |
| --- | --- | --- |
| Asset hash | `424a8c76f33d4b5762f88aab6979b31900009c9788ed45ee35f507e852062c57` | `f5e2ffa61e58ecba26529115f68760beafb689fa12b4f45d6da5e032302da21e` |
| index.mjs SHA-256 | `eed6be692acc06b55066ed07eee28b4fa5db4e858bf34ec2c8fa410870ad0ff4` | `eed6be692acc06b55066ed07eee28b4fa5db4e858bf34ec2c8fa410870ad0ff4` |
| index.mjs.map SHA-256 | `7d09097445efcfaf3a83055ed4a5d1dc4f22fa805fd2824c76c00e19be9ac37a` | `1e5eb3b0850a104d6396fb018e367cd75de2486e50a32ec9c2150e1458126ca1` |

Only source-map embedded source line endings differ: **true**. The following 15 files match both the original working tree and the earlier helper-generated LF snapshot exactly under that conversion:

- `amplify/myFunction/twitch/tokenStore.ts`
- `amplify/myFunction/shared/twitchRuntimeDataClient.ts`
- `amplify/functions/twitch-runtime/handler.ts`
- `amplify/myFunction/twitch/runtimeHandlers.ts`
- `amplify/myFunction/shared/http.ts`
- `amplify/myFunction/shared/responses.ts`
- `amplify/myFunction/twitch/runtimeAuth.ts`
- `amplify/myFunction/twitch/rewardEventHandlers.ts`
- `amplify/myFunction/twitch/rewardEventAuth.ts`
- `amplify/myFunction/twitch/awsJson.ts`
- `amplify/overlaySource/domain.ts`
- `amplify/overlaySource/canonicalPublisher.ts`
- `amplify/overlaySource/awsPublisher.ts`
- `amplify/overlaySource/twitchEventDedupe.ts`
- `amplify/myFunction/shared/logger.ts`

## OverlaySourceOverlaySourceFunctionC8484D26

| Item | Baseline | Failed candidate |
| --- | --- | --- |
| Asset hash | `923ca380819a43414dce4ecc968eaee7072e0bdefd14d4ad2516156e9eb19fb9` | `95b0251d14a09173d50e5b0e26f276d53800e258ae2d357eba6b8a024b21511b` |
| index.js SHA-256 | `b65395da0a8a92597b2df913ecced0769770cf95e0589b5135412a05f524d035` | `b65395da0a8a92597b2df913ecced0769770cf95e0589b5135412a05f524d035` |
| index.js.map SHA-256 | `90a09309ac1460a6d3e799634836168bacb9be3ba74a6bb751fce9d571a9dfff` | `0ec4a9916a29f4d504230243422c90fcc804bfcc7c998437f9b398a11f525efe` |

Only source-map embedded source line endings differ: **true**. The following 5 files match both the original working tree and the earlier helper-generated LF snapshot exactly under that conversion:

- `amplify/overlaySource/handler.ts`
- `amplify/overlaySource/domain.ts`
- `amplify/overlaySource/canonicalPublisher.ts`
- `amplify/overlaySource/awsPublisher.ts`
- `amplify/overlaySource/credentialVault.ts`

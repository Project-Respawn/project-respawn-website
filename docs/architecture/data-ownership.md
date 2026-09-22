# Data ownership map

Status: proposed logical ownership only. All 52 schema models currently remain in the shared Amplify data deployment. GLOBAL is a shared platform authority; DOMAIN-OWNED has one product writer; CROSS-DOMAIN still has exactly one owner and exposes contracts to consumers. Referencing userId alone does not make a product model globally owned. Classifications describe intended authority, not current IAM isolation.

| Existing model | Classification | Proposed writer/owner | Declared schema relationships |
| --- | --- | --- | --- |
| [InvestorAccessRequest](../../amplify/data/resource.ts) | DOMAIN-OWNED | Operations / Investors | Identifier-based/custom-operation links; no declared model relation |
| [InvestorAccess](../../amplify/data/resource.ts) | DOMAIN-OWNED | Operations / Investors | Identifier-based/custom-operation links; no declared model relation |
| [InvestorAccessAuditEvent](../../amplify/data/resource.ts) | DOMAIN-OWNED | Operations / Investors | Identifier-based/custom-operation links; no declared model relation |
| [CreatorWorkspaceRecord](../../amplify/data/resource.ts) | DOMAIN-OWNED | Creators / Workspaces | Identifier-based/custom-operation links; no declared model relation |
| [WorkspaceMembership](../../amplify/data/resource.ts) | DOMAIN-OWNED | Creators / Workspaces | Identifier-based/custom-operation links; no declared model relation |
| [WorkspaceMembershipPermission](../../amplify/data/resource.ts) | DOMAIN-OWNED | Creators / Workspaces | Identifier-based/custom-operation links; no declared model relation |
| [WorkspaceMembershipPermissionSet](../../amplify/data/resource.ts) | DOMAIN-OWNED | Creators / Workspaces | Identifier-based/custom-operation links; no declared model relation |
| [PermissionDefinition](../../amplify/data/resource.ts) | GLOBAL | Core / Authorization | Identifier-based/custom-operation links; no declared model relation |
| [GroupPermission](../../amplify/data/resource.ts) | GLOBAL | Core / Authorization | Identifier-based/custom-operation links; no declared model relation |
| [PermissionAuditEvent](../../amplify/data/resource.ts) | GLOBAL | Core / Authorization | Identifier-based/custom-operation links; no declared model relation |
| [ApplicationSubmission](../../amplify/data/resource.ts) | DOMAIN-OWNED | Operations / Applications | hasMany ApplicationAnswer; hasMany ApplicationCreatorProfile; hasMany ApplicationSchedule; hasMany ApplicationAuditEvent |
| [ApplicationAnswer](../../amplify/data/resource.ts) | DOMAIN-OWNED | Operations / Applications | belongsTo ApplicationSubmission |
| [ApplicationCreatorProfile](../../amplify/data/resource.ts) | DOMAIN-OWNED | Operations / Applications | belongsTo ApplicationSubmission |
| [ApplicationSchedule](../../amplify/data/resource.ts) | DOMAIN-OWNED | Operations / Applications | belongsTo ApplicationSubmission |
| [ApplicationAuditEvent](../../amplify/data/resource.ts) | DOMAIN-OWNED | Operations / Applications | belongsTo ApplicationSubmission |
| [ApplicationIdempotency](../../amplify/data/resource.ts) | DOMAIN-OWNED | Operations / Applications | Identifier-based/custom-operation links; no declared model relation |
| [ApplicationPublicRateLimit](../../amplify/data/resource.ts) | DOMAIN-OWNED | Operations / Applications | Identifier-based/custom-operation links; no declared model relation |
| [TwitchCommand](../../amplify/data/resource.ts) | DOMAIN-OWNED | Creators / Twitch | Identifier-based/custom-operation links; no declared model relation |
| [TwitchIntegration](../../amplify/data/resource.ts) | DOMAIN-OWNED | Creators / Twitch | Identifier-based/custom-operation links; no declared model relation |
| [TwitchTokenVault](../../amplify/data/resource.ts) | DOMAIN-OWNED | Creators / Twitch | Identifier-based/custom-operation links; no declared model relation |
| [TwitchOAuthTransaction](../../amplify/data/resource.ts) | DOMAIN-OWNED | Creators / Twitch | Identifier-based/custom-operation links; no declared model relation |
| [TwitchRuntimeHealth](../../amplify/data/resource.ts) | DOMAIN-OWNED | Creators / Twitch | Identifier-based/custom-operation links; no declared model relation |
| [RewardRedemptionEvent](../../amplify/data/resource.ts) | DOMAIN-OWNED | Creators / Twitch | Identifier-based/custom-operation links; no declared model relation |
| [RewardRedemptionEventClaim](../../amplify/data/resource.ts) | DOMAIN-OWNED | Creators / Twitch | Identifier-based/custom-operation links; no declared model relation |
| [AlphaServiceNonce](../../amplify/data/resource.ts) | DOMAIN-OWNED | Creators / Twitch | Identifier-based/custom-operation links; no declared model relation |
| [DiscordBotConfiguration](../../amplify/data/resource.ts) | DOMAIN-OWNED | Creators / Discord | Identifier-based/custom-operation links; no declared model relation |
| [Team](../../amplify/data/resource.ts) | DOMAIN-OWNED | Esports / Team Hub | Identifier-based/custom-operation links; no declared model relation |
| [TeamMembership](../../amplify/data/resource.ts) | DOMAIN-OWNED | Esports / Team Hub | Identifier-based/custom-operation links; no declared model relation |
| [TeamRosterSlot](../../amplify/data/resource.ts) | DOMAIN-OWNED | Esports / Team Hub | Identifier-based/custom-operation links; no declared model relation |
| [PlayerChampionPoolEntry](../../amplify/data/resource.ts) | DOMAIN-OWNED | Esports / Team Hub | Identifier-based/custom-operation links; no declared model relation |
| [UserProfile](../../amplify/data/resource.ts) | GLOBAL | Core / Profile | Identifier-based/custom-operation links; no declared model relation |
| [EventTag](../../amplify/data/resource.ts) | DOMAIN-OWNED | Events | Identifier-based/custom-operation links; no declared model relation |
| [Event](../../amplify/data/resource.ts) | DOMAIN-OWNED | Events | Identifier-based/custom-operation links; no declared model relation |
| [EventSuggestion](../../amplify/data/resource.ts) | DOMAIN-OWNED | Events | Identifier-based/custom-operation links; no declared model relation |
| [ForumCategory](../../amplify/data/resource.ts) | DOMAIN-OWNED | Community / Forums | hasMany ForumBoard |
| [ForumBoard](../../amplify/data/resource.ts) | DOMAIN-OWNED | Community / Forums | belongsTo ForumCategory; hasMany ForumThread; hasMany BoardPermissionRule |
| [ForumThread](../../amplify/data/resource.ts) | DOMAIN-OWNED | Community / Forums | belongsTo ForumBoard; hasMany ForumPost |
| [ForumPost](../../amplify/data/resource.ts) | DOMAIN-OWNED | Community / Forums | belongsTo ForumThread |
| [ForumActivity](../../amplify/data/resource.ts) | DOMAIN-OWNED | Community / Forums | Identifier-based/custom-operation links; no declared model relation |
| [BoardPermissionRule](../../amplify/data/resource.ts) | DOMAIN-OWNED | Community / Forums | belongsTo ForumBoard |
| [Brand](../../amplify/data/resource.ts) | CROSS-DOMAIN | Core / Brand directory | hasMany MerchProductBrand; hasMany BrandAccess |
| [MerchCategory](../../amplify/data/resource.ts) | DOMAIN-OWNED | Commerce | hasMany MerchProductCategory |
| [MerchProduct](../../amplify/data/resource.ts) | DOMAIN-OWNED | Commerce | hasMany MerchProductImage; hasMany MerchProductVariant; hasMany MerchProductBrand; hasMany MerchProductCategory |
| [MerchProductVariant](../../amplify/data/resource.ts) | DOMAIN-OWNED | Commerce | belongsTo MerchProduct |
| [FulfillmentOrder](../../amplify/data/resource.ts) | DOMAIN-OWNED | Commerce | Identifier-based/custom-operation links; no declared model relation |
| [MerchProductBrand](../../amplify/data/resource.ts) | CROSS-DOMAIN | Commerce | belongsTo MerchProduct; belongsTo Brand |
| [MerchProductCategory](../../amplify/data/resource.ts) | DOMAIN-OWNED | Commerce | belongsTo MerchProduct; belongsTo MerchCategory |
| [BrandAccess](../../amplify/data/resource.ts) | CROSS-DOMAIN | Core / Brand directory | belongsTo Brand; hasMany BrandAccessPermission |
| [BrandAccessPermission](../../amplify/data/resource.ts) | CROSS-DOMAIN | Core / Brand directory | belongsTo BrandAccess |
| [MediaCollection](../../amplify/data/resource.ts) | CROSS-DOMAIN | Core / Media | hasMany MediaItem |
| [MediaItem](../../amplify/data/resource.ts) | CROSS-DOMAIN | Core / Media | belongsTo MediaCollection; hasMany MerchProductImage |
| [MerchProductImage](../../amplify/data/resource.ts) | CROSS-DOMAIN | Commerce | belongsTo MerchProduct; belongsTo MediaItem |

## Boundary decisions

Brand is a shared organization/directory authority used by Creators and Commerce; BrandAccess/BrandAccessPermission remain with that authority. Workspace membership is a separate, domain-specific entitlement. Avoid maintaining two unsynchronized sources for the same capability.

MerchProductBrand is owned by Commerce even though it joins a Core Brand. MerchProductImage is owned by Commerce and references a Core media asset. A split API cannot preserve cross-API generated belongsTo/hasMany relationships automatically: replace these joins with stable IDs and owner API/projection contracts before considering extraction. Core media owns metadata/access rules; business modules own their attachments and retention requirements.

Team, roster and champion pool remain together. Tournaments should consume an explicit roster/eligibility snapshot, not write TeamMembership. Current Tournament UI fixtures are not a missing model inventory item. ApplicationCreatorProfile is an application submission record, not the authoritative Creator workspace profile. Investor access and audit records are a separate sensitive workflow, not a global license for all Admin screens.

## Additional state outside the 52 models

| Resource | Owner | Migration significance |
| --- | --- | --- |
| Cognito pool/users/groups/client/triggers | Core Identity | Preserve pool, subject IDs and existing owner; one platform account |
| Identity pool and IAM role attachments | Core identity access integration | Environment/data access boundaries distinct from user login |
| OverlayPublication | Creators / Overlay | Native DynamoDB; retained publication state |
| OverlayConnection | Creators / Overlay | Native DynamoDB; operational state, active connection continuity |
| TwitchEventDeliveryDedupe | Creators / Overlay delivery | Native DynamoDB; replay/duplicate behavior must survive cutover |
| Overlay credential KMS key | Creators / Overlay | Ciphertexts depend on key/grants |
| Twitch vault encryption key | Creators / Twitch | Token decrypt/rotate behavior; never replace for naming |
| Application uploads bucket | Core Media physical custodian; domain business ownership by prefix | Preserve objects, keys, versions, signed URLs and grants |
| Generated schema/code buckets | Legacy data deployment tooling | Distinguish build artifacts from user media; custom deletion providers exist |
| Standalone runtime state/parameters | Creators Runtime, subject to live external ownership review | Conditional/external resources are not automatically owned by current source |
| SWG test EBS/ECR/S3 | Separate SWG test infrastructure | Retained state outside website; no consolidation proposed |


## Extraction constraints

Generated model tables are Custom::AmplifyDynamoDBTable resources, not native table declarations. Removing a model can invoke provider lifecycle behavior. Retaining a custom resource is not a proven native-table ownership transfer. Preserve current table/API ownership until provider support, retention, indexes/streams/TTL/PITR, authorization, output references and rollback have been demonstrated. [External DynamoDB data sources](https://docs.amplify.aws/vue/build-a-backend/data/connect-to-existing-data-sources/connect-external-ddb-table/) offer custom operations over existing tables; they do not transfer CloudFormation ownership or recreate generated model behavior automatically.

No data rows were read, no backup restore was performed, and no data was migrated by this audit. Live backup/PITR and recovery readiness are prerequisites to later stateful work, not assumptions made from a template.

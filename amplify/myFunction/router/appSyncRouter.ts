import { handleCloneEvent, handleCreateManagedEvent, handleCreateRecurringEventSeries, handleGenerateRecurringInstances, handleUpdateManagedEvent } from '../events'
import { handleCreateBrand, handleGetBrandPermissionDetails, handleRemoveBrandHelper, handleSetBrandOwner, handleUpdateBrand, handleUpsertBrandHelper } from '../brands'
import { handleCreateForumReply, handleCreateForumThread, handleRecordForumActivity, handleRecordForumThreadView } from '../forums'
import { handleGetMyAccessContext, handleListPermissionCatalog, handleReplaceGroupPermissions, handleSeedPermissionCatalog } from '../permissions'
import { handleCreateManagedMerchProduct, handleDeleteManagedMerchProductImage, handleListPublicMerchProducts, handleReplaceManagedMerchProductBrands, handleReplaceManagedMerchProductCategories, handleUpdateManagedMerchProduct, handleUpsertManagedMerchProductImage, handleUpsertManagedMerchProductVariant } from '../merch'
import { handleCreateManagedTwitchCommand, handleDeleteManagedTwitchCommand, handleDisconnectTwitchIntegration, handleGetMyTwitchIntegration, handleListManagedTwitchCommands, handleStartTwitchIntegrationOAuth, handleUpdateManagedTwitchCommand } from '../twitch'
import { handleCreateOrUpdateManagedDiscordConfiguration, handleGetManagedDiscordConfiguration } from '../discord'
import { handleCreateManagedMediaCollection, handleCreateManagedMediaItem, handleDeleteManagedMediaItem, handleListManagedMediaLibrary, handleListPublicMerchProductImages, handleUpdateManagedMediaItem } from '../media'
import { handleImportManagedRevolutOrder, handleListManagedOrders, handleListManagedProfiles, handleManageSimpleResource, handleReconcileManagedOrder, handleRecoverManagedOrder } from '../stage9/handlers'
import { handleCleanupApplicationStorageTestRun, handleCleanupPublicApplicationTestRun, handleGetAdminApplication, handleListAdminApplications, handleStoreTrustedApplicationSubmission, handleSubmitPublicApplication } from '../applications'
import { handleAddWorkspaceMember, handleCreateCreatorWorkspace, handleGetCreatorWorkspace, handleGetMyWorkspacePermissions, handleListMyCreatorWorkspaces, handleListWorkspaceMembers, handleRevokeWorkspaceMember, handleSetWorkspaceMemberPermissions } from '../workspaces'
import { handleGetInvestorDocumentUrl, handleGetMyInvestorAccess } from '../investors'

export interface AppSyncEvent { arguments?: unknown; info?: { fieldName?: string }; fieldName?: string; identity?: unknown }

export function isAppSyncResolverEvent(event: AppSyncEvent) {
  return Boolean(event.arguments && (event.info?.fieldName || event.fieldName))
}

export function getResolverFieldName(event: AppSyncEvent) { return event.info?.fieldName || event.fieldName || '' }

export async function routeAppSync(event: AppSyncEvent) {
  switch (getResolverFieldName(event)) {
    case 'getMyInvestorAccess': return handleGetMyInvestorAccess(event)
    case 'getInvestorDocumentUrl': return handleGetInvestorDocumentUrl(event)
    case 'storeTrustedApplicationSubmission': return handleStoreTrustedApplicationSubmission(event)
    case 'submitPublicApplication': return handleSubmitPublicApplication(event)
    case 'listAdminApplications': return handleListAdminApplications(event)
    case 'getAdminApplication': return handleGetAdminApplication(event)
    // Direct Lambda integration-test hook; intentionally not declared in the AppSync schema.
    case 'cleanupApplicationStorageTestRun': return handleCleanupApplicationStorageTestRun(event)
    case 'cleanupPublicApplicationTestRun': return handleCleanupPublicApplicationTestRun(event)
    case 'recordForumThreadView': return handleRecordForumThreadView(event)
    case 'submitForumThread': return handleCreateForumThread(event)
    case 'submitForumReply': return handleCreateForumReply(event)
    case 'recordForumActivity': return handleRecordForumActivity(event)
    case 'listPermissionCatalog': return handleListPermissionCatalog(event)
    case 'seedPermissionCatalog': return handleSeedPermissionCatalog(event)
    case 'replaceGroupPermissions': return handleReplaceGroupPermissions(event)
    case 'getMyAccessContext': return handleGetMyAccessContext(event)
    case 'createCreatorWorkspace': return handleCreateCreatorWorkspace(event)
    case 'getCreatorWorkspace': return handleGetCreatorWorkspace(event)
    case 'listMyCreatorWorkspaces': return handleListMyCreatorWorkspaces(event)
    case 'addWorkspaceMember': return handleAddWorkspaceMember(event)
    case 'listWorkspaceMembers': return handleListWorkspaceMembers(event)
    case 'revokeWorkspaceMember': return handleRevokeWorkspaceMember(event)
    case 'getMyWorkspacePermissions': return handleGetMyWorkspacePermissions(event)
    case 'setWorkspaceMemberPermissions': return handleSetWorkspaceMemberPermissions(event)
    case 'listManagedMediaLibrary': return handleListManagedMediaLibrary(event)
    case 'createManagedMediaItem': return handleCreateManagedMediaItem(event)
    case 'createManagedMediaCollection': return handleCreateManagedMediaCollection(event)
    case 'updateManagedMediaItem': return handleUpdateManagedMediaItem(event)
    case 'deleteManagedMediaItem': return handleDeleteManagedMediaItem(event)
    case 'listPublicMerchProductImages': return handleListPublicMerchProductImages(event)
    case 'listPublicMerchProducts': return handleListPublicMerchProducts(event)
    case 'listManagedOrders': return handleListManagedOrders(event)
    case 'listManagedProfiles': return handleListManagedProfiles(event)
    case 'recoverManagedOrder': return handleRecoverManagedOrder(event)
    case 'reconcileManagedOrder': return handleReconcileManagedOrder(event)
    case 'importManagedRevolutOrder': return handleImportManagedRevolutOrder(event)
    case 'manageMerchCategory':
    case 'manageEventTag':
    case 'reviewEventSuggestion':
    case 'manageForumCategory':
    case 'manageForumBoard':
    case 'moderateForumThread':
    case 'moderateForumPost': return handleManageSimpleResource(event)
    case 'createManagedBrand': return handleCreateBrand(event)
    case 'updateManagedBrand': return handleUpdateBrand(event)
    case 'setBrandOwner': return handleSetBrandOwner(event)
    case 'getBrandPermissionDetails': return handleGetBrandPermissionDetails(event)
    case 'upsertBrandHelper': return handleUpsertBrandHelper(event)
    case 'removeBrandHelper': return handleRemoveBrandHelper(event)
    case 'createManagedEvent': return handleCreateManagedEvent(event)
    case 'updateManagedEvent': return handleUpdateManagedEvent(event)
    case 'updateManagedMerchProduct': return handleUpdateManagedMerchProduct(event)
    case 'createManagedMerchProduct': return handleCreateManagedMerchProduct(event)
    case 'upsertManagedMerchProductVariant': return handleUpsertManagedMerchProductVariant(event)
    case 'upsertManagedMerchProductImage': return handleUpsertManagedMerchProductImage(event)
    case 'deleteManagedMerchProductImage': return handleDeleteManagedMerchProductImage(event)
    case 'replaceManagedMerchProductBrands': return handleReplaceManagedMerchProductBrands(event)
    case 'replaceManagedMerchProductCategories': return handleReplaceManagedMerchProductCategories(event)
    case 'createManagedTwitchCommand': return handleCreateManagedTwitchCommand(event)
    case 'updateManagedTwitchCommand': return handleUpdateManagedTwitchCommand(event)
    case 'deleteManagedTwitchCommand': return handleDeleteManagedTwitchCommand(event)
    case 'listManagedTwitchCommands': return handleListManagedTwitchCommands(event)
    case 'startTwitchIntegrationOAuth': return handleStartTwitchIntegrationOAuth(event)
    case 'getMyTwitchIntegration': return handleGetMyTwitchIntegration(event)
    case 'disconnectTwitchIntegration': return handleDisconnectTwitchIntegration(event)
    case 'getManagedDiscordConfiguration': return handleGetManagedDiscordConfiguration(event)
    case 'createOrUpdateManagedDiscordConfiguration': return handleCreateOrUpdateManagedDiscordConfiguration(event)
    case 'cloneEvent': return handleCloneEvent(event)
    case 'createRecurringEventSeries': return handleCreateRecurringEventSeries(event)
    case 'generateRecurringInstances': return handleGenerateRecurringInstances(event)
    default: return null
  }
}

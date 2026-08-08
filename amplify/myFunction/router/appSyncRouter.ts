import { handleCloneEvent, handleCreateManagedEvent, handleCreateRecurringEventSeries, handleGenerateRecurringInstances, handleUpdateManagedEvent } from '../events'
import { handleCreateBrand, handleGetBrandPermissionDetails, handleRemoveBrandHelper, handleSetBrandOwner, handleUpdateBrand, handleUpsertBrandHelper } from '../brands'
import { handleCreateForumReply, handleCreateForumThread, handleRecordForumActivity, handleRecordForumThreadView } from '../forums'
import { handleGetMyAccessContext, handleListPermissionCatalog, handleReplaceGroupPermissions, handleSeedPermissionCatalog } from '../permissions'
import { handleCreateManagedMerchProduct, handleDeleteManagedMerchProductImage, handleReplaceManagedMerchProductBrands, handleReplaceManagedMerchProductCategories, handleUpdateManagedMerchProduct, handleUpsertManagedMerchProductImage, handleUpsertManagedMerchProductVariant } from '../merch'
import { handleCreateManagedTwitchCommand, handleDeleteManagedTwitchCommand, handleListManagedTwitchCommands, handleUpdateManagedTwitchCommand } from '../twitch'
import { handleCreateOrUpdateManagedDiscordConfiguration, handleGetManagedDiscordConfiguration } from '../discord'
import { handleCreateManagedMediaCollection, handleCreateManagedMediaItem, handleDeleteManagedMediaItem, handleListManagedMediaLibrary, handleListPublicMerchProductImages, handleUpdateManagedMediaItem } from '../media'

export interface AppSyncEvent { arguments?: unknown; info?: { fieldName?: string }; fieldName?: string; identity?: unknown }

export function isAppSyncResolverEvent(event: AppSyncEvent) {
  return Boolean(event.arguments && (event.info?.fieldName || event.fieldName))
}

export function getResolverFieldName(event: AppSyncEvent) { return event.info?.fieldName || event.fieldName || '' }

export async function routeAppSync(event: AppSyncEvent) {
  switch (getResolverFieldName(event)) {
    case 'recordForumThreadView': return handleRecordForumThreadView(event)
    case 'submitForumThread': return handleCreateForumThread(event)
    case 'submitForumReply': return handleCreateForumReply(event)
    case 'recordForumActivity': return handleRecordForumActivity(event)
    case 'listPermissionCatalog': return handleListPermissionCatalog(event)
    case 'seedPermissionCatalog': return handleSeedPermissionCatalog(event)
    case 'replaceGroupPermissions': return handleReplaceGroupPermissions(event)
    case 'getMyAccessContext': return handleGetMyAccessContext(event)
    case 'listManagedMediaLibrary': return handleListManagedMediaLibrary(event)
    case 'createManagedMediaItem': return handleCreateManagedMediaItem(event)
    case 'createManagedMediaCollection': return handleCreateManagedMediaCollection(event)
    case 'updateManagedMediaItem': return handleUpdateManagedMediaItem(event)
    case 'deleteManagedMediaItem': return handleDeleteManagedMediaItem(event)
    case 'listPublicMerchProductImages': return handleListPublicMerchProductImages(event)
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
    case 'getManagedDiscordConfiguration': return handleGetManagedDiscordConfiguration(event)
    case 'createOrUpdateManagedDiscordConfiguration': return handleCreateOrUpdateManagedDiscordConfiguration(event)
    case 'cloneEvent': return handleCloneEvent(event)
    case 'createRecurringEventSeries': return handleCreateRecurringEventSeries(event)
    case 'generateRecurringInstances': return handleGenerateRecurringInstances(event)
    default: return null
  }
}

import { handleCloneEvent, handleCreateRecurringEventSeries, handleGenerateRecurringInstances } from '../events'
import { handleCreateForumReply, handleCreateForumThread, handleRecordForumActivity, handleRecordForumThreadView } from '../forums'

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
    case 'cloneEvent': return handleCloneEvent(event)
    case 'createRecurringEventSeries': return handleCreateRecurringEventSeries(event)
    case 'generateRecurringInstances': return handleGenerateRecurringInstances(event)
    default: return null
  }
}

import { getDataClient } from '../shared/dataClient'
import { getQueryParams, getRequestMethod } from '../shared/http'
import { jsonResponse } from '../shared/responses'
import { logger } from '../shared/logger'

function mapTwitchCommand(command: any) {
  return {
    id: command.id, streamerId: command.streamerId, name: command.name, reply: command.reply,
    enabled: command.enabled, cooldownSeconds: command.cooldownSeconds, isCustom: command.isCustom,
    category: command.category || 'Custom', permissionLevel: command.permissionLevel || 'everyone',
  }
}

export async function handleTwitchCommandsLookup(event: any) {
  const broadcasterId = String(getQueryParams(event)?.broadcasterId || '').trim()
  if (!broadcasterId) return jsonResponse(400, { error: 'Missing broadcasterId' })
  const result = await (await getDataClient()).models.TwitchCommand.list({ filter: { streamerId: { eq: broadcasterId } } })
  if (result.errors?.length) {
    logger.error('TwitchCommand lookup errors:', result.errors)
    return jsonResponse(500, { error: 'Failed to load commands', details: result.errors })
  }
  return jsonResponse(200, { broadcasterId, commands: (result.data || []).map(mapTwitchCommand) })
}

export async function handleTwitchCommandsMe(event: any) {
  const method = getRequestMethod(event)
  if (method === 'GET') return jsonResponse(200, { message: 'GET /twitch/commands/me not implemented yet', commands: [] })
  if (method === 'POST' || method === 'PUT' || method === 'DELETE') return jsonResponse(200, { message: `${method} /twitch/commands/me not implemented yet` })
  return jsonResponse(405, { error: 'Method not allowed' })
}

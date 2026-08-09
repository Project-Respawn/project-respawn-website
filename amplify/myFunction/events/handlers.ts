import { addDays, addMonths, addWeeks, isValidDate } from '../shared/dates'
import { logger } from '../shared/logger'
import { authorizeBrandEventCommand } from './managedHandlers'
import { writePermissionAudit } from '../shared/audit'

function generateSeriesId() { return `series-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }
function buildOccurrenceDates(params: { startAt: string; recurrenceFrequency: string; recurrenceInterval?: number | null; recurrenceEndsAt?: string | null; recurrenceCount?: number | null }) {
  const baseStart = new Date(params.startAt)
  if (Number.isNaN(baseStart.getTime())) throw new Error('Invalid master event startAt')
  const interval = Math.max(Number(params.recurrenceInterval || 1), 1)
  const maxCount = Math.max(Number(params.recurrenceCount || 12), 1)
  const untilDate = params.recurrenceEndsAt && isValidDate(params.recurrenceEndsAt) ? new Date(params.recurrenceEndsAt) : null
  const dates: Date[] = []; let cursor = new Date(baseStart)
  for (let index = 0; index < maxCount; index += 1) {
    if (index > 0) cursor = params.recurrenceFrequency === 'daily' ? addDays(cursor, interval) : params.recurrenceFrequency === 'weekly' ? addWeeks(cursor, interval) : params.recurrenceFrequency === 'monthly' ? addMonths(cursor, interval) : (() => { throw new Error('Unsupported recurrence frequency') })()
    if (untilDate && cursor > untilDate) break
    dates.push(new Date(cursor))
  }
  return dates
}

function eventResult(payload: {
  success: boolean
  message?: string | null
  eventId?: string | null
  seriesId?: string | null
  masterEventId?: string | null
  generatedCount?: number | null
}) {
  return {
    success: payload.success,
    message: payload.message ?? null,
    eventId: payload.eventId ?? null,
    seriesId: payload.seriesId ?? null,
    masterEventId: payload.masterEventId ?? null,
    generatedCount: typeof payload.generatedCount === 'number' ? payload.generatedCount : null,
  }
}

async function getEventById(client: any, eventId: string) {
  const result = await client.models.Event.get({ id: eventId })

  if (result.errors?.length) {
    throw new Error(result.errors[0].message || 'Failed to load event')
  }

  if (!result.data) {
    throw new Error('Event not found')
  }

  return result.data
}

function eventAuditSnapshot(event: any) {
  return {
    id: event.id,
    brandId: event.brandId,
    eventType: event.eventType || null,
    seriesId: event.seriesId || null,
  }
}

async function writeEventAudit(client: any, actorUserId: string, action: string, targetId: string, before: unknown, after: unknown) {
  return writePermissionAudit(client, actorUserId, action, 'Event', targetId, before, after)
}

function copyEventForCreate(event: any) {
  return {
    brandId: event.brandId,
    title: event.title,
    slug: event.slug || null,
    shortDescription: event.shortDescription || null,
    description: event.description,
    longDescription: event.longDescription || null,
    startAt: event.startAt,
    endAt: event.endAt,
    locationType: event.locationType,
    platform: event.platform || null,
    category: event.category || null,
    categories: Array.isArray(event.categories) ? event.categories : [],
    featured: false,
    status: event.status || 'draft',
    host: event.host || null,
    hostUserId: event.hostUserId || null,
    hostDisplayName: event.hostDisplayName || event.host || null,
    rewardText: event.rewardText || null,
    recapText: event.recapText || null,
    ctaLabel: event.ctaLabel || 'View event',
    ctaUrl: event.ctaUrl || null,
    tagIds: Array.isArray(event.tagIds) ? event.tagIds : [],
    ticketMode: event.ticketMode || 'free',
    ticketTiers: Array.isArray(event.ticketTiers) ? event.ticketTiers : [],
    signupMode: event.signupMode || 'internal',
    eventType: event.eventType || 'single',
    isTemplate: !!event.isTemplate,
    isRecurring: !!event.isRecurring,
    seriesId: event.seriesId || null,
    parentEventId: event.parentEventId || null,
    clonedFromEventId: event.clonedFromEventId || null,
    recurrenceRule: event.recurrenceRule || null,
    recurrenceFrequency: event.recurrenceFrequency || null,
    recurrenceInterval: event.recurrenceInterval ?? null,
    recurrenceByWeekday: Array.isArray(event.recurrenceByWeekday) ? event.recurrenceByWeekday : [],
    recurrenceEndsAt: event.recurrenceEndsAt || null,
    recurrenceCount: event.recurrenceCount ?? null,
    createdBy: event.createdBy || null,
    updatedBy: event.updatedBy || null,
  }
}

export async function handleCloneEvent(event: any, injectedClient?: any) {
  const client = injectedClient || await loadDataClient()
  const { eventId, newStartAt, newEndAt, status } = event.arguments || {}

  if (!eventId) {
    return eventResult({ success: false, message: 'Missing eventId' })
  }

  try {
    const sourceEvent = await getEventById(client, eventId)
    const actor = await authorizeBrandEventCommand(client, event, sourceEvent.brandId)
    const payload = copyEventForCreate(sourceEvent)

    payload.startAt = newStartAt && isValidDate(newStartAt) ? new Date(newStartAt).toISOString() : sourceEvent.startAt
    payload.endAt = newEndAt && isValidDate(newEndAt) ? new Date(newEndAt).toISOString() : sourceEvent.endAt
    payload.status = status || 'draft'
    payload.featured = false
    payload.eventType = 'single'
    payload.isRecurring = false
    payload.isTemplate = false
    payload.seriesId = null
    payload.parentEventId = null
    payload.clonedFromEventId = sourceEvent.id
    payload.createdBy = actor.userId
    payload.updatedBy = actor.userId

    const createResult = await client.models.Event.create(payload)

    if (createResult.errors?.length) {
      throw new Error(createResult.errors[0].message || 'Failed to clone event')
    }

    await writeEventAudit(
      client,
      actor.userId,
      'event.clone',
      createResult.data?.id || sourceEvent.id,
      eventAuditSnapshot(sourceEvent),
      eventAuditSnapshot({ ...payload, id: createResult.data?.id || null }),
    )

    return eventResult({
      success: true,
      message: 'Event cloned successfully',
      eventId: createResult.data?.id || null,
    })
  } catch (error: any) {
    logger.error('cloneEvent failed:', error)
    return eventResult({ success: false, message: error?.message || 'Failed to clone event' })
  }
}

export async function handleCreateRecurringEventSeries(event: any, injectedClient?: any) {
  const client = injectedClient || await loadDataClient()
  const {
    eventId,
    recurrenceFrequency,
    recurrenceInterval,
    recurrenceByWeekday,
    recurrenceEndsAt,
    recurrenceCount,
  } = event.arguments || {}

  if (!eventId || !recurrenceFrequency) {
    return eventResult({ success: false, message: 'Missing eventId or recurrenceFrequency' })
  }

  try {
    const sourceEvent = await getEventById(client, eventId)
    const actor = await authorizeBrandEventCommand(client, event, sourceEvent.brandId)
    const seriesId = generateSeriesId()

    const updateMasterResult = await client.models.Event.update({
      id: sourceEvent.id,
      eventType: 'recurring-master',
      isRecurring: true,
      seriesId,
      recurrenceFrequency,
      recurrenceInterval: recurrenceInterval ?? 1,
      recurrenceByWeekday: Array.isArray(recurrenceByWeekday) ? recurrenceByWeekday : [],
      recurrenceEndsAt: recurrenceEndsAt || null,
      recurrenceCount: recurrenceCount ?? 12,
      updatedBy: actor.userId,
    })

    if (updateMasterResult.errors?.length) {
      throw new Error(updateMasterResult.errors[0].message || 'Failed to update recurring master')
    }

    const generatedDates = buildOccurrenceDates({
      startAt: sourceEvent.startAt,
      recurrenceFrequency,
      recurrenceInterval,
      recurrenceEndsAt,
      recurrenceCount,
    })

    let generatedCount = 0

    for (let index = 1; index < generatedDates.length; index += 1) {
      const occurrenceStart = generatedDates[index]
      const originalStart = new Date(sourceEvent.startAt)
      const originalEnd = new Date(sourceEvent.endAt)
      const durationMs = originalEnd.getTime() - originalStart.getTime()
      const occurrenceEnd = new Date(occurrenceStart.getTime() + durationMs)
      const payload = copyEventForCreate(sourceEvent)

      payload.startAt = occurrenceStart.toISOString()
      payload.endAt = occurrenceEnd.toISOString()
      payload.featured = false
      payload.status = 'upcoming'
      payload.eventType = 'recurring-instance'
      payload.isRecurring = true
      payload.isTemplate = false
      payload.seriesId = seriesId
      payload.parentEventId = sourceEvent.id
      payload.clonedFromEventId = sourceEvent.id
      payload.recurrenceFrequency = recurrenceFrequency
      payload.recurrenceInterval = recurrenceInterval ?? 1
      payload.recurrenceByWeekday = Array.isArray(recurrenceByWeekday) ? recurrenceByWeekday : []
      payload.recurrenceEndsAt = recurrenceEndsAt || null
      payload.recurrenceCount = recurrenceCount ?? 12
      payload.createdBy = actor.userId
      payload.updatedBy = actor.userId

      const createResult = await client.models.Event.create(payload)

      if (createResult.errors?.length) {
        throw new Error(createResult.errors[0].message || 'Failed to create recurring instance')
      }

      generatedCount += 1
    }

    await writeEventAudit(
      client,
      actor.userId,
      'event.recurring_series.create',
      sourceEvent.id,
      eventAuditSnapshot(sourceEvent),
      { brandId: sourceEvent.brandId, seriesId, generatedCount },
    )

    return eventResult({
      success: true,
      message: 'Recurring series created successfully',
      seriesId,
      masterEventId: sourceEvent.id,
      generatedCount,
    })
  } catch (error: any) {
    logger.error('createRecurringEventSeries failed:', error)
    return eventResult({ success: false, message: error?.message || 'Failed to create recurring series' })
  }
}

export async function handleGenerateRecurringInstances(event: any, injectedClient?: any) {
  const client = injectedClient || await loadDataClient()
  const { masterEventId, rangeStart, rangeEnd } = event.arguments || {}

  if (!masterEventId) {
    return eventResult({ success: false, message: 'Missing masterEventId' })
  }

  try {
    const masterEvent = await getEventById(client, masterEventId)
    const actor = await authorizeBrandEventCommand(client, event, masterEvent.brandId)

    if (masterEvent.eventType !== 'recurring-master') {
      throw new Error('Event is not a recurring master')
    }

    const recurrenceFrequency = masterEvent.recurrenceFrequency
    const recurrenceInterval = masterEvent.recurrenceInterval ?? 1
    const recurrenceEndsAt = rangeEnd || masterEvent.recurrenceEndsAt || null
    const recurrenceCount = masterEvent.recurrenceCount ?? 12
    const seriesId = masterEvent.seriesId || generateSeriesId()

    const generatedDates = buildOccurrenceDates({
      startAt: masterEvent.startAt,
      recurrenceFrequency,
      recurrenceInterval,
      recurrenceEndsAt,
      recurrenceCount,
    })

    const lowerBound = rangeStart && isValidDate(rangeStart) ? new Date(rangeStart) : null
    const upperBound = rangeEnd && isValidDate(rangeEnd) ? new Date(rangeEnd) : null

    const listResult = await client.models.Event.list({
      filter: {
        parentEventId: { eq: masterEventId },
      },
    })

    if (listResult.errors?.length) {
      throw new Error(listResult.errors[0].message || 'Failed to load existing recurring instances')
    }

    const existingStarts = new Set((listResult.data || []).map((item: any) => String(item.startAt)))

    let generatedCount = 0

    for (let index = 1; index < generatedDates.length; index += 1) {
      const occurrenceStart = generatedDates[index]

      if (lowerBound && occurrenceStart < lowerBound) continue
      if (upperBound && occurrenceStart > upperBound) continue

      const occurrenceStartIso = occurrenceStart.toISOString()
      if (existingStarts.has(occurrenceStartIso)) continue

      const originalStart = new Date(masterEvent.startAt)
      const originalEnd = new Date(masterEvent.endAt)
      const durationMs = originalEnd.getTime() - originalStart.getTime()
      const occurrenceEnd = new Date(occurrenceStart.getTime() + durationMs)
      const payload = copyEventForCreate(masterEvent)

      payload.startAt = occurrenceStartIso
      payload.endAt = occurrenceEnd.toISOString()
      payload.featured = false
      payload.status = 'upcoming'
      payload.eventType = 'recurring-instance'
      payload.isRecurring = true
      payload.seriesId = seriesId
      payload.parentEventId = masterEvent.id
      payload.clonedFromEventId = masterEvent.id
      payload.createdBy = actor.userId
      payload.updatedBy = actor.userId

      const createResult = await client.models.Event.create(payload)

      if (createResult.errors?.length) {
        throw new Error(createResult.errors[0].message || 'Failed to generate recurring instance')
      }

      generatedCount += 1
    }

    await writeEventAudit(
      client,
      actor.userId,
      'event.recurring_instances.generate',
      masterEvent.id,
      eventAuditSnapshot(masterEvent),
      { brandId: masterEvent.brandId, seriesId, generatedCount },
    )

    return eventResult({
      success: true,
      message: 'Recurring instances generated successfully',
      seriesId,
      masterEventId: masterEvent.id,
      generatedCount,
    })
  } catch (error: any) {
    logger.error('generateRecurringInstances failed:', error)
    return eventResult({ success: false, message: error?.message || 'Failed to generate recurring instances' })
  }
}

async function loadDataClient() {
  const { getDataClient } = await import('../shared/dataClient')
  return getDataClient()
}

/* ============================================================================
   Forums: result helpers
============================================================================ */



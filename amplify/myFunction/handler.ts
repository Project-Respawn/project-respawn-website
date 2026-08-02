declare const process: any

import type { Handler } from 'aws-lambda'
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/myFunction-rebuild'
import type { Schema } from '../data/resource'

const REVOLUT_API_SECRET = process.env.REVOLUT_API_SECRET
const REVOLUT_MODE = String(process.env.REVOLUT_MODE || 'sandbox').trim().toLowerCase()
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY

let clientPromise: Promise<any> | null = null

/* ============================================================================
   Shared: data client
============================================================================ */

async function getDataClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env as any)
      Amplify.configure(resourceConfig, libraryOptions)
      return generateClient<Schema>()
    })()
  }

  return clientPromise
}

/* ============================================================================
   Shared: HTTP helpers
============================================================================ */

function jsonResponse(statusCode: number, payload: any) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: JSON.stringify(payload),
  }
}

function getRequestPath(event: any) {
  return event?.rawPath || event?.path || ''
}

function getRequestMethod(event: any) {
  return event?.requestContext?.http?.method || event?.httpMethod || ''
}

function getRequestBody(event: any) {
  if (!event?.body) return null

  try {
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body
  } catch {
    return null
  }
}

function getQueryParams(event: any) {
  return event?.queryStringParameters || {}
}

async function makeRequest(url: string, method: string, body: any = null, authHeader?: string) {
  const response = await fetch(url, {
    method,
    headers: {
      ...(authHeader ? { Authorization: authHeader } : {}),
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await response.text()

  try {
    return {
      statusCode: response.status,
      body: JSON.parse(text),
    }
  } catch {
    return {
      statusCode: response.status,
      body: text,
    }
  }
}

/* ============================================================================
   Shared: resolver helpers
============================================================================ */

function isAppSyncResolverEvent(event: any) {
  return Boolean(event?.arguments && (event?.info?.fieldName || event?.fieldName))
}

function getResolverFieldName(event: any) {
  return event?.info?.fieldName || event?.fieldName || ''
}

function getResolverIdentity(event: any) {
  return event?.identity || {}
}

function getIdentityUsername(identity: any) {
  return (
    identity?.username ||
    identity?.claims?.['cognito:username'] ||
    identity?.claims?.username ||
    identity?.sub ||
    ''
  )
}

function getIdentityGroups(identity: any): string[] {
  const raw = identity?.claims?.['cognito:groups'] || identity?.groups || []
  return Array.isArray(raw) ? raw.map((value: any) => String(value)) : []
}

function hasForumModerationAccess(identity: any) {
  const groups = getIdentityGroups(identity).map((value) => value.toLowerCase())
  return groups.includes('superadmin') || groups.includes('admin') || groups.includes('staff')
}

function hasGroupAccess(requiredGroups: string[] = [], userGroups: string[] = []) {
  if (!Array.isArray(requiredGroups) || requiredGroups.length === 0) {
    return true
  }

  const normalizedRequired = requiredGroups.map((value) => String(value).trim())
  const normalizedActual = userGroups.map((value) => String(value).trim())

  return normalizedRequired.some((group) => normalizedActual.includes(group))
}

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/["']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/* ============================================================================
   Shared: generic date/event helpers
============================================================================ */

function isValidDate(value: any) {
  const date = new Date(value)
  return !Number.isNaN(date.getTime())
}

function addDays(date: Date, amount: number) {
  const clone = new Date(date)
  clone.setUTCDate(clone.getUTCDate() + amount)
  return clone
}

function addWeeks(date: Date, amount: number) {
  return addDays(date, amount * 7)
}

function addMonths(date: Date, amount: number) {
  const clone = new Date(date)
  clone.setUTCMonth(clone.getUTCMonth() + amount)
  return clone
}

function generateSeriesId() {
  return `series-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function buildOccurrenceDates(params: {
  startAt: string
  recurrenceFrequency: string
  recurrenceInterval?: number | null
  recurrenceEndsAt?: string | null
  recurrenceCount?: number | null
}) {
  const { startAt, recurrenceFrequency, recurrenceInterval, recurrenceEndsAt, recurrenceCount } = params
  const dates: Date[] = []
  const baseStart = new Date(startAt)

  if (Number.isNaN(baseStart.getTime())) {
    throw new Error('Invalid master event startAt')
  }

  const interval = Math.max(Number(recurrenceInterval || 1), 1)
  const maxCount = Math.max(Number(recurrenceCount || 12), 1)
  const untilDate = recurrenceEndsAt && isValidDate(recurrenceEndsAt) ? new Date(recurrenceEndsAt) : null

  let cursor = new Date(baseStart)

  for (let index = 0; index < maxCount; index += 1) {
    if (index > 0) {
      if (recurrenceFrequency === 'daily') {
        cursor = addDays(cursor, interval)
      } else if (recurrenceFrequency === 'weekly') {
        cursor = addWeeks(cursor, interval)
      } else if (recurrenceFrequency === 'monthly') {
        cursor = addMonths(cursor, interval)
      } else {
        throw new Error('Unsupported recurrence frequency')
      }
    }

    if (untilDate && cursor > untilDate) {
      break
    }

    dates.push(new Date(cursor))
  }

  return dates
}

/* ============================================================================
   Events: result helpers
============================================================================ */

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

function copyEventForCreate(event: any) {
  return {
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

async function handleCloneEvent(event: any) {
  const client = await getDataClient()
  const identity = getResolverIdentity(event)
  const actor = getIdentityUsername(identity)
  const { eventId, newStartAt, newEndAt, status } = event.arguments || {}

  if (!eventId) {
    return eventResult({ success: false, message: 'Missing eventId' })
  }

  try {
    const sourceEvent = await getEventById(client, eventId)
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
    payload.updatedBy = actor || null

    const createResult = await client.models.Event.create(payload)

    if (createResult.errors?.length) {
      throw new Error(createResult.errors[0].message || 'Failed to clone event')
    }

    return eventResult({
      success: true,
      message: 'Event cloned successfully',
      eventId: createResult.data?.id || null,
    })
  } catch (error: any) {
    console.error('cloneEvent failed:', error)
    return eventResult({ success: false, message: error?.message || 'Failed to clone event' })
  }
}

async function handleCreateRecurringEventSeries(event: any) {
  const client = await getDataClient()
  const identity = getResolverIdentity(event)
  const actor = getIdentityUsername(identity)
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
      updatedBy: actor || null,
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
      payload.updatedBy = actor || null

      const createResult = await client.models.Event.create(payload)

      if (createResult.errors?.length) {
        throw new Error(createResult.errors[0].message || 'Failed to create recurring instance')
      }

      generatedCount += 1
    }

    return eventResult({
      success: true,
      message: 'Recurring series created successfully',
      seriesId,
      masterEventId: sourceEvent.id,
      generatedCount,
    })
  } catch (error: any) {
    console.error('createRecurringEventSeries failed:', error)
    return eventResult({ success: false, message: error?.message || 'Failed to create recurring series' })
  }
}

async function handleGenerateRecurringInstances(event: any) {
  const client = await getDataClient()
  const identity = getResolverIdentity(event)
  const actor = getIdentityUsername(identity)
  const { masterEventId, rangeStart, rangeEnd } = event.arguments || {}

  if (!masterEventId) {
    return eventResult({ success: false, message: 'Missing masterEventId' })
  }

  try {
    const masterEvent = await getEventById(client, masterEventId)

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
      payload.updatedBy = actor || null

      const createResult = await client.models.Event.create(payload)

      if (createResult.errors?.length) {
        throw new Error(createResult.errors[0].message || 'Failed to generate recurring instance')
      }

      generatedCount += 1
    }

    return eventResult({
      success: true,
      message: 'Recurring instances generated successfully',
      seriesId,
      masterEventId: masterEvent.id,
      generatedCount,
    })
  } catch (error: any) {
    console.error('generateRecurringInstances failed:', error)
    return eventResult({ success: false, message: error?.message || 'Failed to generate recurring instances' })
  }
}

/* ============================================================================
   Forums: result helpers
============================================================================ */

function forumResult(payload: {
  success: boolean
  message?: string | null
  threadId?: string | null
  postId?: string | null
  replyCount?: number | null
  viewCount?: number | null
  lastReplyAt?: string | null
}) {
  return {
    success: payload.success,
    message: payload.message ?? null,
    threadId: payload.threadId ?? null,
    postId: payload.postId ?? null,
    replyCount: typeof payload.replyCount === 'number' ? payload.replyCount : null,
    viewCount: typeof payload.viewCount === 'number' ? payload.viewCount : null,
    lastReplyAt: payload.lastReplyAt ?? null,
  }
}

/* ============================================================================
   Forums: data loaders
============================================================================ */

async function getForumBoardById(client: any, boardId: string) {
  const result = await client.models.ForumBoard.get({ id: boardId })

  if (result.errors?.length) {
    throw new Error(result.errors[0].message || 'Failed to load board')
  }

  if (!result.data) {
    throw new Error('Board not found')
  }

  return result.data
}

async function getForumThreadById(client: any, threadId: string) {
  const result = await client.models.ForumThread.get({ id: threadId })

  if (result.errors?.length) {
    throw new Error(result.errors[0].message || 'Failed to load thread')
  }

  if (!result.data) {
    throw new Error('Thread not found')
  }

  return result.data
}

async function listForumPostsByThreadId(client: any, threadId: string) {
  const result = await client.models.ForumPost.list({
    filter: {
      threadId: { eq: threadId },
    },
  })

  if (result.errors?.length) {
    throw new Error(result.errors[0].message || 'Failed to load thread posts')
  }

  return result.data || []
}

/* ============================================================================
   Forums: permission checks
============================================================================ */

function assertUserMatchesAuthorOrModerator(params: {
  identity: any
  owner: string
  authorUserId: string
}) {
  const { identity, owner, authorUserId } = params
  const username = getIdentityUsername(identity)
  const isModerator = hasForumModerationAccess(identity)
  const ownerMatchesIdentity = String(owner) === String(username)
  const authorMatchesIdentity = String(authorUserId) === String(username)

  return {
    username,
    isModerator,
    ownerMatchesIdentity,
    authorMatchesIdentity,
    isAllowed: isModerator || ownerMatchesIdentity || authorMatchesIdentity,
  }
}

function canCreateThreadInBoard(board: any, identity: any) {
  const userGroups = getIdentityGroups(identity)
  const isModerator = hasForumModerationAccess(identity)
  const allowedGroups = Array.isArray(board?.threadCreateGroups) ? board.threadCreateGroups : []

  if (isModerator) {
    return true
  }

  if (!allowedGroups.length) {
    return true
  }

  return hasGroupAccess(allowedGroups, userGroups)
}

/* ============================================================================
   Forums: record thread view
============================================================================ */

async function handleRecordForumThreadView(event: any) {
  const client = await getDataClient()
  const { threadId } = event.arguments || {}

  if (!threadId) {
    return forumResult({ success: false, message: 'Missing threadId' })
  }

  try {
    const thread = await getForumThreadById(client, threadId)
    const nextViewCount = Number(thread.viewCount || 0) + 1

    const updateResult = await client.models.ForumThread.update({
      id: threadId,
      viewCount: nextViewCount,
    })

    if (updateResult.errors?.length) {
      throw new Error(updateResult.errors[0].message || 'Failed to update thread view count')
    }

    return forumResult({
      success: true,
      message: 'Thread view recorded',
      threadId,
      replyCount: typeof thread.replyCount === 'number' ? thread.replyCount : 0,
      viewCount: nextViewCount,
      lastReplyAt: thread.lastReplyAt || null,
    })
  } catch (error: any) {
    console.error('recordForumThreadView failed:', error)
    return forumResult({
      success: false,
      message: error?.message || 'Failed to record thread view',
      threadId,
    })
  }
}

/* ============================================================================
   Forums: create thread
============================================================================ */

async function handleCreateForumThread(event: any) {
  const client = await getDataClient()
  const identity = getResolverIdentity(event)

  const {
    boardId,
    title,
    content,
    authorUserId,
    authorDisplayName,
    owner,
    isFeatured,
  } = event.arguments || {}

  if (!boardId || !title || !content || !authorUserId || !authorDisplayName || !owner) {
    return forumResult({ success: false, message: 'Missing required thread fields' })
  }

  const actorCheck = assertUserMatchesAuthorOrModerator({
    identity,
    owner,
    authorUserId,
  })

  if (!actorCheck.username) {
    return forumResult({ success: false, message: 'Authentication required' })
  }

  if (!actorCheck.isAllowed) {
    return forumResult({
      success: false,
      message: 'You are not allowed to create a thread for another user',
    })
  }

  try {
    const board = await getForumBoardById(client, boardId)

    if (board.isActive === false) {
      return forumResult({ success: false, message: 'This board is not active' })
    }

    if (!canCreateThreadInBoard(board, identity)) {
      return forumResult({
        success: false,
        message: 'You do not have permission to create a thread in this board',
      })
    }

    const nowIso = new Date().toISOString()
    const slugBase = slugify(String(title)) || 'thread'
    const slug = `${slugBase}-${Date.now()}`
    const preview = String(content).trim().slice(0, 180)

    const threadCreateResult = await client.models.ForumThread.create({
      boardId,
      title: String(title).trim(),
      slug,
      owner,
      authorUserId,
      authorDisplayName,
      contentPreview: preview,
      isPinned: false,
      isLocked: false,
      isFeatured: actorCheck.isModerator && isFeatured === true,
      replyCount: 0,
      viewCount: 0,
      lastReplyAt: nowIso,
    })

    if (threadCreateResult.errors?.length) {
      throw new Error(threadCreateResult.errors[0].message || 'Failed to create thread')
    }

    const createdThread = threadCreateResult.data

    if (!createdThread?.id) {
      throw new Error('Thread was created without an id')
    }

    const postCreateResult = await client.models.ForumPost.create({
      threadId: createdThread.id,
      owner,
      authorUserId,
      authorDisplayName,
      content: String(content).trim(),
      editedAt: null,
    })

    if (postCreateResult.errors?.length) {
      throw new Error(postCreateResult.errors[0].message || 'Failed to create opening post')
    }

    return forumResult({
      success: true,
      message: 'Thread created successfully',
      threadId: createdThread.id,
      postId: postCreateResult.data?.id || null,
      replyCount: 0,
      viewCount: 0,
      lastReplyAt: nowIso,
    })
  } catch (error: any) {
    console.error('createForumThread failed:', error)
    return forumResult({ success: false, message: error?.message || 'Failed to create thread' })
  }
}

/* ============================================================================
   Forums: create reply
============================================================================ */

async function handleCreateForumReply(event: any) {
  const client = await getDataClient()
  const identity = getResolverIdentity(event)

  const {
    threadId,
    content,
    authorUserId,
    authorDisplayName,
    owner,
  } = event.arguments || {}

  if (!threadId || !content || !authorUserId || !authorDisplayName || !owner) {
    return forumResult({
      success: false,
      message: 'Missing required reply fields',
      threadId: threadId || null,
    })
  }

  const actorCheck = assertUserMatchesAuthorOrModerator({
    identity,
    owner,
    authorUserId,
  })

  if (!actorCheck.username) {
    return forumResult({
      success: false,
      message: 'Authentication required',
      threadId,
    })
  }

  if (!actorCheck.isAllowed) {
    return forumResult({
      success: false,
      message: 'You are not allowed to create a reply for another user',
      threadId,
    })
  }

  try {
    const thread = await getForumThreadById(client, threadId)

    if (thread.isLocked === true) {
      return forumResult({
        success: false,
        message: 'This thread is locked',
        threadId,
        replyCount: typeof thread.replyCount === 'number' ? thread.replyCount : 0,
        viewCount: typeof thread.viewCount === 'number' ? thread.viewCount : 0,
        lastReplyAt: thread.lastReplyAt || null,
      })
    }

    const nowIso = new Date().toISOString()

    const createResult = await client.models.ForumPost.create({
      threadId,
      owner,
      authorUserId,
      authorDisplayName,
      content: String(content).trim(),
      editedAt: null,
    })

    if (createResult.errors?.length) {
      throw new Error(createResult.errors[0].message || 'Failed to create forum reply')
    }

    const createdPost = createResult.data

    if (!createdPost?.id) {
      throw new Error('Reply was created without an id')
    }

    const posts = await listForumPostsByThreadId(client, threadId)
    const nextReplyCount = Math.max(posts.length - 1, 0)

    const updateThreadResult = await client.models.ForumThread.update({
      id: threadId,
      replyCount: nextReplyCount,
      lastReplyAt: nowIso,
    })

    if (updateThreadResult.errors?.length) {
      throw new Error(updateThreadResult.errors[0].message || 'Reply created but thread update failed')
    }

    const updatedThread = updateThreadResult.data || thread

    return forumResult({
      success: true,
      message: 'Reply created successfully',
      threadId,
      postId: createdPost.id,
      replyCount: typeof updatedThread.replyCount === 'number' ? updatedThread.replyCount : nextReplyCount,
      viewCount: typeof updatedThread.viewCount === 'number' ? updatedThread.viewCount : Number(thread.viewCount || 0),
      lastReplyAt: updatedThread.lastReplyAt || nowIso,
    })
  } catch (error: any) {
    console.error('createForumReply failed:', error)
    return forumResult({
      success: false,
      message: error?.message || 'Failed to create reply',
      threadId,
    })
  }
}

/* ============================================================================
   AppSync resolver router
============================================================================ */

async function handleAppSyncResolvers(event: any) {
  const fieldName = getResolverFieldName(event)

  if (fieldName === 'recordForumThreadView') {
    return handleRecordForumThreadView(event)
  }

  if (fieldName === 'submitForumThread') {
    return handleCreateForumThread(event)
  }

  if (fieldName === 'submitForumReply') {
    return handleCreateForumReply(event)
  }

  if (fieldName === 'cloneEvent') {
    return handleCloneEvent(event)
  }

  if (fieldName === 'createRecurringEventSeries') {
    return handleCreateRecurringEventSeries(event)
  }

  if (fieldName === 'generateRecurringInstances') {
    return handleGenerateRecurringInstances(event)
  }

  return null
}

/* ============================================================================
   Printful: helpers
============================================================================ */

function getPrintfulApiKey() {
  if (!PRINTFUL_API_KEY) {
    throw new Error('Missing PRINTFUL_API_KEY')
  }

  return PRINTFUL_API_KEY
}

function buildPrintfulAuthHeader() {
  return `Bearer ${getPrintfulApiKey()}`
}

function buildPrintfulOrderPayload(body: any) {
  return {
    external_id: body.orderId,
    shipping: body.shippingMethod || 'STANDARD',
    items: body.items,
    recipient: {
      name: body.customerName,
      address1: body.address,
      city: body.city,
      state_code: body.state,
      postcode: body.postcode,
      country_code: body.country || 'GB',
      email: body.email,
    },
  }
}

function normalizePrintfulListItem(product: any) {
  return {
    id: product.id,
    name: product.name,
    thumbnailUrl: product.thumbnail_url || '',
    variantCount: product.variants || 0,
    synced: product.synced ?? true,
  }
}

function normalizePrintfulVariant(variant: any, fallbackImage = '') {
  return {
    id: variant.id,
    name: variant.name,
    retailPrice: variant.retail_price || '',
    currency: variant.currency || '',
    size: variant.size || '',
    color: variant.color || '',
    availabilityStatus: variant.availability_status || '',
    sku: variant.sku || '',
    image: variant.product?.image || variant.files?.[0]?.preview_url || fallbackImage,
  }
}

/* ============================================================================
   Printful: handlers
============================================================================ */

async function handlePrintfulProducts() {
  const result = await makeRequest(
    'https://api.printful.com/store/products',
    'GET',
    null,
    buildPrintfulAuthHeader()
  )

  if (result.statusCode !== 200) {
    return jsonResponse(result.statusCode, result.body)
  }

  const products = (result.body?.result || []).map(normalizePrintfulListItem)
  return jsonResponse(200, { products })
}

async function handlePrintfulProductLookup(path: string) {
  try {
    const productId = path.split('/').pop()

    if (!productId) {
      return jsonResponse(400, { error: 'Missing productId' })
    }

    console.log('Printful product lookup:', productId)
    console.log('Printful key configured:', Boolean(PRINTFUL_API_KEY))

    const result = await makeRequest(
      `https://api.printful.com/store/products/${productId}`,
      'GET',
      null,
      buildPrintfulAuthHeader()
    )

    console.log('Printful product lookup status:', result.statusCode)

    if (result.statusCode !== 200) {
      console.error('Printful product lookup failed:', result.body)
      return jsonResponse(result.statusCode, {
        error: 'Failed to fetch Printful product',
        printful: result.body,
      })
    }

    const product = result.body?.result

    return jsonResponse(200, {
      product: {
        id: product?.sync_product?.id,
        name: product?.sync_product?.name,
        thumbnailUrl: product?.sync_product?.thumbnail_url || '',
        variants: (product?.sync_variants || []).map((variant: any) =>
          normalizePrintfulVariant(
            variant,
            product?.sync_product?.thumbnail_url || ''
          )
        ),
      },
    })
  } catch (error: any) {
    console.error('Printful product lookup error:', error)

    return jsonResponse(500, {
      error: 'Failed to fetch Printful product',
      message: error?.message || 'Unknown error',
    })
  }
}

async function handlePrintfulCreateOrder(body: any) {
  if (!body?.items || !Array.isArray(body.items) || body.items.length === 0) {
    return jsonResponse(400, { error: 'Missing order items' })
  }

  const orderData = buildPrintfulOrderPayload(body)

  const result = await makeRequest(
    'https://api.printful.com/orders',
    'POST',
    orderData,
    buildPrintfulAuthHeader()
  )

  return jsonResponse(result.statusCode, result.body)
}

async function handlePrintfulOrderLookup(path: string) {
  const orderId = path.split('/').pop()

  if (!orderId) {
    return jsonResponse(400, { error: 'Missing orderId' })
  }

  const result = await makeRequest(
    `https://api.printful.com/orders/${orderId}`,
    'GET',
    null,
    buildPrintfulAuthHeader()
  )

  return jsonResponse(result.statusCode, result.body)
}

/* ============================================================================
   Revolut: helpers
============================================================================ */

function getRevolutMode(): 'sandbox' | 'prod' {
  return REVOLUT_MODE === 'prod' ? 'prod' : 'sandbox'
}

function getRevolutSecretKey() {
  if (!REVOLUT_API_SECRET) {
    throw new Error('Missing REVOLUT_API_SECRET')
  }

  return REVOLUT_API_SECRET
}

function buildRevolutAuthHeader() {
  return `Bearer ${getRevolutSecretKey()}`
}

function getRevolutBaseUrl() {
  return getRevolutMode() === 'sandbox'
    ? 'https://sandbox-merchant.revolut.com'
    : 'https://merchant.revolut.com'
}

function getRevolutOrdersUrl() {
  return `${getRevolutBaseUrl()}/api/orders`
}

function normalizeCurrency(value: any) {
  const currency = String(value || 'GBP').trim().toUpperCase()
  return currency || 'GBP'
}

function normalizeAmountToMinorUnits(amount: any) {
  const numericAmount = Number(amount)

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('Invalid amount')
  }

  return Math.round(numericAmount * 100)
}

function buildRevolutOrderPayload(body: any) {
  const amount = normalizeAmountToMinorUnits(body?.amount)

  return {
    amount,
    currency: normalizeCurrency(body?.currency),
    description: body?.description || 'Project Respawn Merch Order',
    capture_mode: 'AUTOMATIC',
    merchant_order_ext_ref: body?.orderId || undefined,
    email: body?.email || undefined,
    metadata: {
      source: 'project-respawn-merch',
      customerEmail: body?.email || '',
      customerName: body?.customerName || '',
    },
  }
}

function sanitizeRevolutCreateResponse(order: any) {
  return {
    id: order?.id || null,
    token: order?.token || null,
    state: order?.state || null,
    amount: order?.amount ?? null,
    currency: order?.currency || null,
    createdAt: order?.created_at || null,
    mode: getRevolutMode(),
  }
}

/* ============================================================================
   Revolut: handlers
============================================================================ */

async function createRevolutMerchantOrder(body: any) {
  const payload = buildRevolutOrderPayload(body)

  console.log('Revolut mode:', getRevolutMode())
  console.log('Revolut orders URL:', getRevolutOrdersUrl())
  console.log('Revolut secret configured:', Boolean(REVOLUT_API_SECRET))
  console.log('Creating Revolut order for amount:', payload.amount, payload.currency)

  return makeRequest(getRevolutOrdersUrl(), 'POST', payload, buildRevolutAuthHeader())
}

async function fetchRevolutMerchantOrder(orderId: string) {
  return makeRequest(
    `${getRevolutOrdersUrl()}/${encodeURIComponent(orderId)}`,
    'GET',
    null,
    buildRevolutAuthHeader()
  )
}

async function handleRevolutCheckout(body: any) {
  if (!body?.amount) {
    return jsonResponse(400, { error: 'Missing amount' })
  }

  try {
    const result = await createRevolutMerchantOrder(body)

    if (result.statusCode < 200 || result.statusCode >= 300) {
      console.error('Revolut create order failed:', {
        statusCode: result.statusCode,
        mode: getRevolutMode(),
        response: result.body,
      })

      return jsonResponse(result.statusCode, {
        error: 'Failed to create Revolut order',
        mode: getRevolutMode(),
        revolut: result.body,
      })
    }

    const order = sanitizeRevolutCreateResponse(result.body)

    if (!order.token) {
      return jsonResponse(502, {
        error: 'Revolut order created but token missing',
        mode: getRevolutMode(),
        revolut: result.body,
      })
    }

    return jsonResponse(200, order)
  } catch (error: any) {
    console.error('Revolut checkout error:', error)

    return jsonResponse(500, {
      error: 'Failed to create Revolut checkout session',
      message: error?.message || 'Unknown error',
      mode: getRevolutMode(),
    })
  }
}

async function handleRevolutOrderLookup(path: string) {
  const orderId = path.split('/').pop()

  if (!orderId) {
    return jsonResponse(400, { error: 'Missing orderId' })
  }

  try {
    const result = await fetchRevolutMerchantOrder(orderId)

    if (result.statusCode < 200 || result.statusCode >= 300) {
      return jsonResponse(result.statusCode, {
        error: 'Failed to retrieve Revolut order',
        mode: getRevolutMode(),
        revolut: result.body,
      })
    }

    return jsonResponse(200, {
      ...result.body,
      mode: getRevolutMode(),
    })
  } catch (error: any) {
    console.error('Revolut order lookup error:', error)

    return jsonResponse(500, {
      error: 'Failed to retrieve Revolut order',
      message: error?.message || 'Unknown error',
      mode: getRevolutMode(),
    })
  }
}

/* ============================================================================
   Twitch
============================================================================ */

function mapTwitchCommand(command: any) {
  return {
    id: command.id,
    streamerId: command.streamerId,
    name: command.name,
    reply: command.reply,
    enabled: command.enabled,
    cooldownSeconds: command.cooldownSeconds,
    isCustom: command.isCustom,
    category: command.category || 'Custom',
    permissionLevel: command.permissionLevel || 'everyone',
  }
}

async function handleTwitchCommandsLookup(event: any) {
  const query = getQueryParams(event)
  const broadcasterId = String(query?.broadcasterId || '').trim()

  if (!broadcasterId) {
    return jsonResponse(400, { error: 'Missing broadcasterId' })
  }

  const client = await getDataClient()
  const result = await client.models.TwitchCommand.list({
    filter: {
      streamerId: { eq: broadcasterId },
    },
  })

  if (result.errors?.length) {
    console.error('TwitchCommand lookup errors:', result.errors)

    return jsonResponse(500, {
      error: 'Failed to load commands',
      details: result.errors,
    })
  }

  const commands = (result.data || []).map(mapTwitchCommand)

  return jsonResponse(200, {
    broadcasterId,
    commands,
  })
}

async function handleTwitchCommandsMe(event: any) {
  const method = getRequestMethod(event)

  if (method === 'GET') {
    return jsonResponse(200, {
      message: 'GET /twitch/commands/me not implemented yet',
      commands: [],
    })
  }

  if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
    return jsonResponse(200, {
      message: `${method} /twitch/commands/me not implemented yet`,
    })
  }

  return jsonResponse(405, { error: 'Method not allowed' })
}

/* ============================================================================
   REST route routers
============================================================================ */

async function handleRevolutRoutes(path: string, method: string, body: any) {
  if (path === '/revolut/checkout' && method === 'POST') {
    return handleRevolutCheckout(body)
  }

  if (path.startsWith('/revolut/orders/') && method === 'GET') {
    return handleRevolutOrderLookup(path)
  }

  return null
}

async function handlePrintfulRoutes(path: string, method: string, body: any) {
  if (path.startsWith('/printful/products/') && method === 'GET') {
    return handlePrintfulProductLookup(path)
  }

  if (path === '/printful/products' && method === 'GET') {
    return handlePrintfulProducts()
  }

  if (path === '/printful/orders' && method === 'POST') {
    return handlePrintfulCreateOrder(body)
  }

  if (path.startsWith('/printful/orders/') && method === 'GET') {
    return handlePrintfulOrderLookup(path)
  }

  return null
}

async function handleTwitchRoutes(path: string, method: string, event: any) {
  if (path === '/twitch/commands/me' || path.startsWith('/twitch/commands/me/')) {
    return handleTwitchCommandsMe(event)
  }

  if (path === '/twitch/commands' && method === 'GET') {
    return handleTwitchCommandsLookup(event)
  }

  return null
}

/* ============================================================================
   Main handler
============================================================================ */

export const handler: Handler = async (event: any) => {
  try {
    if (isAppSyncResolverEvent(event)) {
      const resolverResponse = await handleAppSyncResolvers(event)

      if (resolverResponse) {
        return resolverResponse
      }

      return forumResult({
        success: false,
        message: `Unsupported resolver field: ${getResolverFieldName(event)}`,
      })
    }

    const path = getRequestPath(event)
    const method = getRequestMethod(event)
    const body = getRequestBody(event)

    if (method === 'OPTIONS') {
      return jsonResponse(200, { ok: true })
    }

    const revolutResponse = await handleRevolutRoutes(path, method, body)
    if (revolutResponse) return revolutResponse

    const printfulResponse = await handlePrintfulRoutes(path, method, body)
    if (printfulResponse) return printfulResponse

    const twitchResponse = await handleTwitchRoutes(path, method, event)
    if (twitchResponse) return twitchResponse

    return jsonResponse(404, {
      error: 'Route not found',
      path,
      method,
    })
  } catch (error: any) {
    console.error('API Error:', error)

    if (isAppSyncResolverEvent(event)) {
      return forumResult({
        success: false,
        message: error?.message || 'Unknown resolver error',
      })
    }

    return jsonResponse(500, {
      error: 'Request failed',
      message: error?.message || 'Unknown error',
    })
  }
}

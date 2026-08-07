import { getDataClient } from '../shared/dataClient'
import { getIdentityGroups, getIdentityUsername, getResolverIdentity, hasForumModerationAccess, hasGroupAccess } from '../shared/auth'
import { slugify } from '../shared/strings'
import { logger } from '../shared/logger'

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

async function createForumActivity(
  client: any,
  identity: any,
  activityType: string,
  threadId: string,
  postId?: string,
  recipientUserId?: string
) {
  const actorUserId = getIdentityUsername(identity)
  const userId = recipientUserId || actorUserId

  if (!userId) {
    throw new Error('Authentication required')
  }

  const thread = await getForumThreadById(client, threadId)
  const board = await getForumBoardById(client, thread.boardId)
  const result = await client.models.ForumActivity.create({
    owner: userId,
    userId,
    activityType,
    threadId: thread.id,
    postId: postId || null,
    boardId: board.id,
    threadTitle: thread.title,
    boardName: board.name,
    actorUserId,
    occurredAt: new Date().toISOString(),
  })

  if (result.errors?.length) {
    throw new Error(result.errors[0].message || 'Failed to record forum activity')
  }

  return result.data
}

async function notifyInterestedUsersOfReply(client: any, identity: any, threadId: string, postId: string) {
  const actorUserId = getIdentityUsername(identity)
  const result = await client.models.ForumActivity.list({
    filter: { threadId: { eq: threadId } },
  })

  if (result.errors?.length) {
    throw new Error(result.errors[0].message || 'Failed to load interested forum users')
  }

  const userIds = (result.data || [])
    .map((activity: any) => activity.userId)
    .filter((userId: unknown): userId is string =>
      typeof userId === 'string' && userId.length > 0 && userId !== actorUserId
    )

  const recipients = new Set<string>(userIds)

  await Promise.all(
    [...recipients].map((recipientUserId: string) =>
      createForumActivity(client, identity, 'reply_received', threadId, postId, recipientUserId)
    )
  )
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

export async function handleRecordForumThreadView(event: any) {
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

    if (getIdentityUsername(getResolverIdentity(event))) {
      await createForumActivity(
        client,
        getResolverIdentity(event),
        'thread_viewed',
        threadId
      )
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
    logger.error('recordForumThreadView failed:', error)
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

export async function handleCreateForumThread(event: any) {
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

    await createForumActivity(
      client,
      identity,
      'thread_created',
      createdThread.id
    )

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
    logger.error('createForumThread failed:', error)
    return forumResult({ success: false, message: error?.message || 'Failed to create thread' })
  }
}

/* ============================================================================
   Forums: create reply
============================================================================ */

export async function handleCreateForumReply(event: any) {
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

    await createForumActivity(
      client,
      identity,
      'reply_created',
      threadId,
      createdPost.id
    )

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

    await notifyInterestedUsersOfReply(
      client,
      identity,
      threadId,
      createdPost.id
    )

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
    logger.error('createForumReply failed:', error)
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

export async function handleRecordForumActivity(event: any) {
  const client = await getDataClient()
  const { activityType, threadId, postId } = event.arguments || {}

  if (!activityType || !threadId) {
    return { success: false, message: 'Missing required activity fields', activityId: null }
  }

  try {
    const activity = await createForumActivity(
      client,
      getResolverIdentity(event),
      activityType,
      threadId,
      postId
    )

    return { success: true, message: null, activityId: activity?.id || null }
  } catch (error: any) {
    return { success: false, message: error?.message || 'Failed to record forum activity', activityId: null }
  }
}



// =============================================================================
// Imports
// =============================================================================

import { generateClient } from "aws-amplify/data";

import {
    fetchAuthSession,
    getCurrentUser,
} from "aws-amplify/auth";
import {
    STARTER_BOARDS,
    STARTER_CATEGORIES,
} from "../Constants/forumSeed";

// =============================================================================
// Amplify Clients
// =============================================================================

let userPoolClient = null;

let publicClient = null;

/**
 * Returns the authenticated Amplify client.
 */
function getUserPoolClient() {

    if (!userPoolClient) {

        userPoolClient = generateClient();

    }

    return userPoolClient;

}

/**
 * Returns the API Key Amplify client.
 */
function getPublicClient() {

    if (!publicClient) {

        publicClient = generateClient({

            authMode: "apiKey",

        });

    }

    return publicClient;

}

// =============================================================================
// Client Selection
// =============================================================================

/**
 * Returns the correct client for reading forum data.
 *
 * Signed in users
 *     → User Pool
 *
 * Guests
 *     → API Key
 */
export async function getReadClient() {

    try {

        const session =
            await fetchAuthSession();

        const signedIn = Boolean(

            session?.tokens?.idToken

        );

        return signedIn

            ? getUserPoolClient()

            : getPublicClient();

    }
    catch {

        return getPublicClient();

    }

}

/**
 * Returns the authenticated write client.
 */
export async function getWriteClient() {

    return getUserPoolClient();

}

// =============================================================================
// Current User
// =============================================================================

/**
 * Returns the current forum user.
 *
 * Returns null when the visitor
 * is not signed in.
 */
export async function getCurrentForumUser() {

    try {

        const session =
            await fetchAuthSession();

        const signedIn = Boolean(

            session?.tokens?.idToken

        );

        if (!signedIn) {

            return null;

        }

        const user =
            await getCurrentUser();

        const groups =

            session?.tokens?.accessToken?.payload?.[
                "cognito:groups"
            ] ??

            session?.tokens?.idToken?.payload?.[
                "cognito:groups"
            ] ??

            [];

        return {

            userId:

                user?.userId ??

                user?.username ??

                "",

            username:

                user?.username ??

                "",

            groups:

                Array.isArray(groups)

                    ? groups.map(group =>

                        String(group)

                            .trim()

                            .toLowerCase()

                    )

                    : [],

        };

    }
    catch {

        return null;

    }

}

// =============================================================================
// Error Handling
// =============================================================================

function throwIfErrors(

    result,

    defaultMessage

) {

    if (!result) {

        throw new Error(

            defaultMessage

        );

    }

    if (

        result.errors?.length

    ) {

        throw new Error(

            result.errors[0]?.message ??

            defaultMessage

        );

    }

    return result.data ?? [];

}

// =============================================================================
// GraphQL Selection Sets
// =============================================================================

const CATEGORY_SELECTION = [

    "id",

    "name",

    "slug",

    "description",

    "sortOrder",

    "isActive",

    "createdAt",

    "updatedAt",

];

const BOARD_SELECTION = [

    "id",

    "categoryId",

    "name",

    "slug",

    "description",

    "sortOrder",

    "threadCreateGroups",

    "isActive",

    "createdAt",

    "updatedAt",

];

const THREAD_SELECTION = [

    "id",

    "boardId",

    "title",

    "slug",

    "authorUserId",

    "authorDisplayName",

    "contentPreview",

    "replyCount",

    "viewCount",

    "isPinned",

    "isLocked",

    "isFeatured",

    "lastReplyAt",

    "createdAt",

    "updatedAt",

];

const POST_SELECTION = [

    "id",

    "threadId",

    "authorUserId",

    "authorDisplayName",

    "content",

    "editedAt",

    "createdAt",

    "updatedAt",

];

// =============================================================================
// Sorting Helpers
// =============================================================================

function sortByOrder(items = []) {

    return [...items].sort(

        (a, b) =>

            (a.sortOrder ?? 0) -

            (b.sortOrder ?? 0)

    );

}

function sortByNewest(items = []) {

    return [...items].sort(

        (a, b) => {

            const aDate = new Date(

                a.updatedAt ??

                a.createdAt ??

                0

            ).getTime();

            const bDate = new Date(

                b.updatedAt ??

                b.createdAt ??

                0

            ).getTime();

            return bDate - aDate;

        }

    );

}
// =============================================================================
// Category Operations
// =============================================================================

export async function getCategories() {

    const client = await getReadClient();

    const result =
        await client.models.ForumCategory.list({

            selectionSet: CATEGORY_SELECTION,

        });

    return sortByOrder(

        throwIfErrors(

            result,

            "Failed to load forum categories"

        )

    );

}

export async function getCategory(categoryId) {

    const categories =
        await getCategories();

    return (

        categories.find(

            category =>

                category.id === categoryId

        ) ??

        null

    );

}

export async function getCategoryBySlug(slug) {

    const categories =
        await getCategories();

    return (

        categories.find(

            category =>

                category.slug === slug

        ) ??

        null

    );

}

// =============================================================================
// Board Operations
// =============================================================================

export async function getBoards() {

    const client = await getReadClient();

    const result =
        await client.models.ForumBoard.list({

            selectionSet: BOARD_SELECTION,

        });

    return sortByOrder(

        throwIfErrors(

            result,

            "Failed to load forum boards"

        )

    );

}

export async function getBoard(boardId) {

    const boards =
        await getBoards();

    return (

        boards.find(

            board =>

                board.id === boardId

        ) ??

        null

    );

}

export async function getBoardBySlug(slug) {

    const boards =
        await getBoards();

    return (

        boards.find(

            board =>

                board.slug === slug

        ) ??

        null

    );

}

// =============================================================================
// Thread Operations
// =============================================================================

export async function getThreads() {

    const client =
        await getReadClient();

    const result =
        await client.models.ForumThread.list({

            selectionSet: THREAD_SELECTION,

        });

    return sortByNewest(

        throwIfErrors(

            result,

            "Failed to load forum threads"

        )

    );

}

export async function getThread(threadId) {

    const threads =
        await getThreads();

    return (

        threads.find(

            thread =>

                thread.id === threadId

        ) ??

        null

    );

}

export async function getThreadBySlug(slug) {

    const threads =
        await getThreads();

    return (

        threads.find(

            thread =>

                thread.slug === slug

        ) ??

        null

    );

}

export async function getThreadsForBoard(boardId) {

    const threads =
        await getThreads();

    return threads.filter(

        thread =>

            thread.boardId === boardId

    );

}

// =============================================================================
// Post Operations
// =============================================================================

export async function getPosts() {

    const client =
        await getReadClient();

    const result =
        await client.models.ForumPost.list({

            selectionSet: POST_SELECTION,

        });

    return sortByNewest(

        throwIfErrors(

            result,

            "Failed to load forum posts"

        )

    );

}

export async function getPost(postId) {

    const posts =
        await getPosts();

    return (

        posts.find(

            post =>

                post.id === postId

        ) ??

        null

    );

}

export async function getPostsForThread(threadId) {

    const posts =
        await getPosts();

    return posts.filter(

        post =>

            post.threadId === threadId

    );

}

// =============================================================================
// Forum Page Operations
// =============================================================================

/**
 * Returns everything required for the
 * Forum Index page.
 */
export async function getForumIndexPage() {

    const [

        categories,

        boards,

        threads,

        posts,

    ] = await Promise.all([

        getCategories(),

        getBoards(),

        getThreads(),

        getPosts(),

    ]);

    return {

        categories,

        boards,

        threads,

        posts,

    };

}

/**
 * Returns everything required for
 * ForumBoard.vue
 */
export async function getBoardPage(boardSlug) {

    const [

        boards,

        categories,

        threads,

        posts,

    ] = await Promise.all([

        getBoards(),

        getCategories(),

        getThreads(),

        getPosts(),

    ]);

    const board = boards.find(

        board =>

            board.slug === boardSlug &&
            board.isActive !== false

    );

    if (!board) {

        throw new Error(
            "Board not found."
        );

    }

    const category = categories.find(

        category =>

            category.id === board.categoryId

    ) ?? null;

    const boardThreads = threads.filter(

        thread =>

            thread.boardId === board.id

    );

    const boardPosts = posts.filter(

        post =>

            boardThreads.some(

                thread =>

                    thread.id === post.threadId

            )

    );

    return {

        board,

        category,

        threads: boardThreads,

        posts: boardPosts,

    };

}

/**
 * Returns everything required for
 * ForumThread.vue
 */
export async function getThreadPage(threadSlug) {

    const [

        boards,

        categories,

        threads,

        posts,

    ] = await Promise.all([

        getBoards(),

        getCategories(),

        getThreads(),

        getPosts(),

    ]);

    const thread = threads.find(

        thread =>

            thread.slug === threadSlug

    );

    if (!thread) {

        throw new Error(
            "Thread not found."
        );

    }

    const board = boards.find(

        board =>

            board.id === thread.boardId

    ) ?? null;

    const category = board

        ? categories.find(

            category =>

                category.id === board.categoryId

        )

        : null;

    const threadPosts = posts.filter(

        post =>

            post.threadId === thread.id

    );

    return {

        thread,

        board,

        category,

        posts: threadPosts,

    };

}

// =============================================================================
// User Operations
// =============================================================================

export async function getCurrentForumUserProfile() {

    const user =
        await getCurrentForumUser();

    if (!user) {

        return null;

    }

    const client =
        await getWriteClient();

    const result =
        await client.models.UserProfile.list({

            filter: {

                ownerUserId: {

                    eq: user.userId,

                },

            },

            selectionSet: [

                "id",

                "displayName",

                "ownerUserId",

            ],

        });

    const profiles =
        throwIfErrors(

            result,

            "Unable to load user profile."

        );

    const profile =
        profiles[0] ?? null;

    return {

        ...user,

        displayName:

            profile?.displayName ??

            user.username,

    };

}

export async function recordForumActivity(activityType, threadId, postId) {

    if (!activityType || !threadId) {
        return null;
    }

    const client =
        await getWriteClient();

    const result =
        await client.mutations.recordForumActivity({
            activityType,
            threadId,
            postId: postId || undefined,
        });

    const payload =
        throwIfErrors(
            result,
            "Failed to record forum activity."
        );

    if (!payload.success) {
        throw new Error(payload.message || "Failed to record forum activity.");
    }

    return payload;

}

export async function getRecentForumActivity(limit = 5) {

    const user =
        await getCurrentForumUser();

    if (!user?.username) {
        return [];
    }

    const client =
        await getWriteClient();

    const result =
        await client.models.ForumActivity.list({
            filter: {
                userId: { eq: user.username },
            },
        });

    return throwIfErrors(
        result,
        "Failed to load recent forum activity."
    )
        .sort(
            (a, b) => new Date(b.occurredAt || 0).getTime() - new Date(a.occurredAt || 0).getTime()
        )
        .slice(0, limit);

}

// =============================================================================
// Thread Creation
// =============================================================================

export async function createThread(input) {

    const client =
        await getWriteClient();

    const author =
        await getCurrentForumUserProfile();

    if (!author) {

        throw new Error(
            "You must be signed in."
        );

    }

    const result =
        await client.mutations.submitForumThread({

            boardId:
                input.boardId,

            title:
                input.title,

            content:
                input.content,

            authorUserId:
                author.userId,

            authorDisplayName:
                author.displayName,

            owner:
                author.userId,

            isFeatured:
                input.isFeatured === true,

        });

    const payload =
        throwIfErrors(

            result,

            "Failed to create thread."

        );

    if (!payload.success) {

        throw new Error(

            payload.message ??

            "Failed to create thread."

        );

    }

    return getThread(

        payload.threadId

    );

}
// =============================================================================
// Thread Moderation
// =============================================================================

export async function updateThread(threadId, input = {}) {

    if (!threadId) {

        throw new Error("Invalid thread.");

    }

    const client =
        await getWriteClient();

    const result =
        await client.models.ForumThread.update({

            id: threadId,

            ...input,

        });

    return throwIfErrors(

        result,

        "Failed to update thread."

    );

}

export async function deleteThread(threadId) {

    if (!threadId) {

        throw new Error("Invalid thread.");

    }

    const client =
        await getWriteClient();

    const result =
        await client.models.ForumThread.delete({

            id: threadId,

        });

    return throwIfErrors(

        result,

        "Failed to delete thread."

    );

}

export async function updatePost(postId, input = {}) {

    if (!postId) {

        throw new Error("Invalid post.");

    }

    const client =
        await getWriteClient();

    const post =
        await getPost(postId);

    const result =
        await client.models.ForumPost.update({

            id: postId,

            ...input,

        });

    const updatedPost = throwIfErrors(

        result,

        "Failed to update post."

    );

    if (post?.threadId) {
        await recordForumActivity(
            "post_edited",
            post.threadId,
            postId
        );
    }

    return updatedPost;

}

export async function deletePost(postId) {

    if (!postId) {

        throw new Error("Invalid post.");

    }

    const client =
        await getWriteClient();

    const result =
        await client.models.ForumPost.delete({

            id: postId,

        });

    return throwIfErrors(

        result,

        "Failed to delete post."

    );

}

export async function togglePinned(thread) {

    if (!thread?.id) {
        throw new Error("Invalid thread.");
    }

    const updatedThread = await updateThread(thread.id, {
        isPinned: !thread.isPinned,
    });

    await recordForumActivity(
        thread.isPinned ? "thread_unpinned" : "thread_pinned",
        thread.id
    );

    return updatedThread;

}

export async function toggleFeatured(thread) {

    if (!thread?.id) {
        throw new Error("Invalid thread.");
    }

    const updatedThread = await updateThread(thread.id, {
        isFeatured: !thread.isFeatured,
    });

    await recordForumActivity(
        thread.isFeatured ? "thread_unfeatured" : "thread_featured",
        thread.id
    );

    return updatedThread;

}

export async function lockThread(thread) {

    if (!thread?.id) {
        throw new Error("Invalid thread.");
    }

    const updatedThread = await updateThread(thread.id, {
        isLocked: true,
    });

    await recordForumActivity("thread_locked", thread.id);

    return updatedThread;

}

export async function unlockThread(thread) {

    if (!thread?.id) {
        throw new Error("Invalid thread.");
    }

    const updatedThread = await updateThread(thread.id, {
        isLocked: false,
    });

    await recordForumActivity("thread_unlocked", thread.id);

    return updatedThread;

}

// =============================================================================
// Reply Operations
// =============================================================================

export async function createReply(input) {

    const author =
        await getCurrentForumUserProfile();

    if (!author) {

        throw new Error(
            "You must be signed in."
        );

    }

    const client =
        await getWriteClient();

    const result =
        await client.mutations.submitForumReply({
            threadId: input.threadId,
            content: input.content,
            authorUserId: author.userId,
            authorDisplayName: author.displayName,
            owner: author.userId,
        });

    const payload =
        throwIfErrors(
            result,
            "Failed to create reply."
        );

    if (!payload.success || !payload.postId) {
        throw new Error(payload.message || "Failed to create reply.");
    }

    return getPost(payload.postId);

}

// =============================================================================
// Delete Operations
// =============================================================================

export async function deleteThreadAndPosts(threadId) {

    const thread =
        await getThread(threadId);

    if (thread) {
        await recordForumActivity("thread_deleted", thread.id);
    }

    const posts =
        await getPostsForThread(threadId);

    for (const post of posts) {

        await deletePost(post.id);

    }

    await deleteThread(threadId);

}

export async function deleteReply(postId) {

    const post =
        await getPost(postId);

    if (post?.threadId) {
        await recordForumActivity(
            "post_deleted",
            post.threadId,
            postId
        );
    }

    await deletePost(postId);

}

// =============================================================================
// Statistics
// =============================================================================

export async function recordThreadView(thread) {

    if (!thread?.id) {
        return;
    }

    await updateThread(

        thread.id,

        {

            viewCount:
                Number(thread.viewCount ?? 0) + 1,

        }

    );

    await recordForumActivity(
        "thread_viewed",
        thread.id
    );

}

// =============================================================================
// Refresh
// =============================================================================

export async function seedForumStructure() {

    const client =
        await getWriteClient();

    const categoryResult =
        await client.models.ForumCategory.list();

    const categories =
        throwIfErrors(
            categoryResult,
            "Failed to check existing forum categories."
        );

    const categoryBySlug =
        new Map(
            categories.map(
                category => [category.slug, category]
            )
        );

    const legacyRealWorld =
        categoryBySlug.get("real-world-progress");

    if (legacyRealWorld && !categoryBySlug.has("real-world")) {

        const migration =
            await client.models.ForumCategory.update({
                id: legacyRealWorld.id,
                ...STARTER_CATEGORIES.find(
                    category => category.slug === "real-world"
                ),
            });

        const migratedCategory =
            throwIfErrors(
                migration,
                "Failed to migrate Real World category."
            );

        categoryBySlug.delete("real-world-progress");
        categoryBySlug.set("real-world", migratedCategory);

    }

    for (const category of STARTER_CATEGORIES) {

        if (categoryBySlug.has(category.slug)) continue;

        const createResult =
            await client.models.ForumCategory.create(category);

        const createdCategory =
            throwIfErrors(
                createResult,
                `Failed to create category: ${category.name}`
            );

        categoryBySlug.set(category.slug, createdCategory);

    }

    const boardResult =
        await client.models.ForumBoard.list();

    const boards =
        throwIfErrors(
            boardResult,
            "Failed to check existing forum boards."
        );

    const boardBySlug =
        new Map(
            boards.map(board => [board.slug, board])
        );

    const legacyAchievements =
        boardBySlug.get("irl-achievements");

    if (legacyAchievements && !boardBySlug.has("achievements")) {

        const realWorldCategory =
            categoryBySlug.get("real-world");

        const { categorySlug, ...achievementInput } =
            STARTER_BOARDS.find(
                board => board.slug === "achievements"
            );

        if (realWorldCategory?.id) {

            const migration =
                await client.models.ForumBoard.update({
                    id: legacyAchievements.id,
                    categoryId: realWorldCategory.id,
                    ...achievementInput,
                });

            const migratedBoard =
                throwIfErrors(
                    migration,
                    "Failed to migrate Achievements board."
                );

            boardBySlug.delete("irl-achievements");
            boardBySlug.set("achievements", migratedBoard);

        }

    }

    for (const board of STARTER_BOARDS) {

        if (boardBySlug.has(board.slug)) continue;

        const category =
            categoryBySlug.get(board.categorySlug);

        if (!category?.id) {
            throw new Error(
                `Missing category for board: ${board.name}`
            );
        }

        const { categorySlug, ...boardInput } = board;

        const createResult =
            await client.models.ForumBoard.create({
                ...boardInput,
                categoryId: category.id,
            });

        const createdBoard =
            throwIfErrors(
                createResult,
                `Failed to create board: ${board.name}`
            );

        boardBySlug.set(board.slug, createdBoard);

    }

}

export async function refreshForum() {

    return getForumIndexPage();

}

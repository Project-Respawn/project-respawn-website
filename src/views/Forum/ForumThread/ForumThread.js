// =============================================================================
// Imports
// =============================================================================

import {

    getCurrentForumUser,
    getCurrentForumUserProfile,

    getThreadPage,

    createReply,

    updatePost,

    deleteReply,

    deleteThreadAndPosts,

    lockThread,

    unlockThread,

    recordThreadView,

} from "../Services/forumApi";

import {

    canEditPost,
    canDeletePost,
    canDeleteThread,
    hasModerationAccess,
    isSignedIn as isForumSignedIn,

} from "../Services/forumPermissions";

import {

    formatRelativeTime,

} from "../Helpers/dateHelpers";

// =============================================================================
// Local Helpers
// =============================================================================

const DEFAULT_THREAD = {

    id: "",

    dbId: "",

    boardSlug: "",

    boardName: "",

    title: "",

    excerpt: "",

    isPinned: false,

    isFeatured: false,

    isLocked: false,

    replyCount: 0,

    viewCount: 0,

    participantCount: 0,

    lastActivity: "",

    posts: [],

};

function sortByOldest(items = []) {

    return [...items].sort(

        (a, b) =>

            new Date(a.createdAt ?? a.updatedAt ?? 0).getTime() -

            new Date(b.createdAt ?? b.updatedAt ?? 0).getTime()

    );

}

function splitParagraphs(value = "") {

    return String(value)

        .split(/\n\s*\n/g)

        .map(part => part.trim())

        .filter(Boolean);

}

// =============================================================================
// Component
// =============================================================================

export default {

    name: "ForumThread",

    props: {

        threadSlug: {

            type: String,

            default: "",

        },

    },

    // =========================================================================
    // State
    // =========================================================================

    data() {

        return {

            // -------------------------------------------------------------
            // Loading
            // -------------------------------------------------------------

            loading: true,

            loadError: "",

            replyError: "",

            // -------------------------------------------------------------
            // Current User
            // -------------------------------------------------------------

            currentUser: null,

            // -------------------------------------------------------------
            // Thread
            // -------------------------------------------------------------

            threadRecord: null,

            boardRecord: null,

            categoryRecord: null,

            threadPosts: [],

            // -------------------------------------------------------------
            // Reply
            // -------------------------------------------------------------

            postingReply: false,

            replyPreview: false,

            showExpandedReply: false,

            replyForm: {

                title: "",

                content: "",

            },

            // -------------------------------------------------------------
            // Editing
            // -------------------------------------------------------------

            editingPostId: "",

            savingEditPostId: "",

            editForm: {

                content: "",

            },

            // -------------------------------------------------------------
            // Moderation
            // -------------------------------------------------------------

            deletingPostId: "",

            deletingThread: false,

            updatingThreadLock: false,

            // -------------------------------------------------------------
            // Join Prompt
            // -------------------------------------------------------------

            showJoinPrompt: false,

            joinPageUrl: "/join",

            signInPageUrl: "/join",

        };

    },

    // =========================================================================
    // Computed
    // =========================================================================

    computed: {

        thread() {

            if (!this.threadRecord) {

                return DEFAULT_THREAD;

            }

            const participants = new Set(

                this.threadPosts

                    .map(post =>

                        post.authorUserId

                    )

                    .filter(Boolean)

            );

            return {

                id: this.threadRecord.slug,

                dbId: this.threadRecord.id,

                boardSlug:

                    this.boardRecord?.slug ?? "",

                boardName:

                    this.boardRecord?.name ?? "",

                title:

                    this.threadRecord.title,

                excerpt:

                    this.threadRecord.contentPreview,

                isPinned:

                    this.threadRecord.isPinned,

                isFeatured:

                    this.threadRecord.isFeatured,

                isLocked:

                    this.threadRecord.isLocked,

                replyCount:

                    this.threadRecord.replyCount ??

                    Math.max(

                        this.threadPosts.length - 1,

                        0

                    ),

                viewCount:

                    this.threadRecord.viewCount ?? 0,

                participantCount:

                    participants.size,

                lastActivity:

                    formatRelativeTime(

                        this.threadRecord.lastReplyAt ??

                        this.threadRecord.updatedAt ??

                        this.threadRecord.createdAt

                    ),

                posts:

                    this.mappedPosts,

            };

        },

        mappedPosts() {

            return sortByOldest(

                this.threadPosts

            ).map(

                (post, index) => ({

                    ...post,

                    postedAt:

                        formatRelativeTime(

                            post.editedAt ??

                            post.updatedAt ??

                            post.createdAt

                        ),

                    isOriginalPost:

                        index === 0,

                    content:

                        splitParagraphs(

                            post.content

                        ),

                    canEdit:

                        canEditPost(

                            this.currentUser,

                            post

                        ),

                    canDelete:

                        canDeletePost(

                            this.currentUser,

                            post

                        ),

                    isEditing:

                        this.editingPostId === post.id,

                })

            );

        },

        canDeleteCurrentThread() {

            return canDeleteThread(

                this.currentUser,

                this.threadRecord

            );

        },

        isModerator() {

            return hasModerationAccess(

                this.currentUser

            );

        },

        isSignedIn() {

            return isForumSignedIn(

                this.currentUser

            );

        },

        replyPreviewParagraphs() {

            return splitParagraphs(

                this.replyForm.content

            );

        },

    },
        // =========================================================================
    // Lifecycle
    // =========================================================================

    async mounted() {

        window.addEventListener(

            "keydown",

            this.handleEscapeKey

        );

        await this.bootstrapThreadPage();

    },

    unmounted() {

        window.removeEventListener(

            "keydown",

            this.handleEscapeKey

        );

    },

    // =========================================================================
    // Watch
    // =========================================================================

    watch: {

        async threadSlug() {

            this.cancelEditingPost();

            this.showExpandedReply = false;

            this.replyPreview = false;

            await this.bootstrapThreadPage();

        },

    },

    // =========================================================================
    // Methods
    // =========================================================================

    methods: {

        // ==============================================================
        // Loading
        // ==============================================================

        async bootstrapThreadPage() {

            this.loading = true;

            this.loadError = "";

            try {

                await Promise.all([

                    this.loadCurrentUser(),

                    this.loadThread(),

                ]);

            }
            catch (error) {

                console.error(error);

                this.loadError =

                    error?.message ??

                    "Unable to load thread.";

            }
            finally {

                this.loading = false;

            }

        },

        async loadCurrentUser() {

            this.currentUser =

                await getCurrentForumUserProfile();

        },

        async loadThread() {

            const page =

                await getThreadPage(

                    this.threadSlug

                );

            this.threadRecord =

                page.thread;

            this.boardRecord =

                page.board;

            this.categoryRecord =

                page.category;

            this.threadPosts =

                page.posts;

            await recordThreadView(

                this.threadRecord

            );

        },

        async refreshThread() {

            await this.loadThread();

        },

        // ==============================================================
        // Navigation
        // ==============================================================

        goToJoinPage() {

            this.$router.push(

                this.joinPageUrl

            );

        },

        goToSignInPage() {

            this.$router.push(

                this.signInPageUrl

            );

        },

        goToBoard() {

            if (

                !this.boardRecord?.slug

            ) {

                return;

            }

            this.$router.push({

                name: "ForumBoard",

                params: {

                    boardSlug:

                        this.boardRecord.slug,

                },

            });

        },

        // ==============================================================
        // UI
        // ==============================================================

        scrollToReplyBox() {

            this.$refs.replySection?.scrollIntoView({

                behavior: "smooth",

                block: "start",

            });

        },

        openReplyBox() {

            if (!this.currentUser) {

                this.showJoinPrompt = true;

                return;

            }

            if (

                this.thread.isLocked

            ) {

                this.replyError =

                    "This thread is locked.";

                return;

            }

            this.replyPreview = false;

            this.showExpandedReply = false;

            this.replyError = "";

            this.scrollToReplyBox();

        },

        openExpandedReply() {

            if (!this.currentUser) {

                this.showJoinPrompt = true;

                return;

            }

            if (

                this.thread.isLocked

            ) {

                this.replyError =

                    "This thread is locked.";

                return;

            }

            this.replyPreview = false;

            this.replyError = "";

            this.showExpandedReply = true;

        },

        closeExpandedReply() {

            this.showExpandedReply = false;

        },

        closeJoinPrompt() {

            this.showJoinPrompt = false;

        },
                // ==============================================================
        // Reply Actions
        // ==============================================================

        quotePost(post) {

            if (this.thread.isLocked) {

                return;

            }

            if (!this.currentUser) {

                this.showJoinPrompt = true;

                return;

            }

            const quotedText =

                (post.content || [])

                    .map(

                        paragraph => `> ${paragraph}`

                    )

                    .join("\n\n");

            this.replyForm.content =

                this.replyForm.content

                    ? `${this.replyForm.content}\n\n${quotedText}\n\n`

                    : `${quotedText}\n\n`;

            this.replyPreview = false;

            this.showExpandedReply = true;

        },

        previewReply() {

            this.replyError = "";

            if (

                !this.replyForm.content.trim()

            ) {

                this.replyError =

                    "Write your reply before previewing it.";

                this.replyPreview = false;

                return;

            }

            this.replyPreview = true;

        },

        async submitReply() {

            this.replyError = "";

            if (

                this.thread.isLocked

            ) {

                this.replyError =

                    "This thread is locked.";

                return;

            }

            if (!this.currentUser) {

                this.showJoinPrompt = true;

                this.replyError =

                    "Sign in to post a reply.";

                return;

            }

            const title =

                this.replyForm.title.trim();

            const content =

                this.replyForm.content.trim();

            if (!content) {

                this.replyError =

                    "Please write a reply.";

                return;

            }

            this.postingReply = true;

            try {

                await createReply({

                    threadId:

                        this.threadRecord.id,

                    title,

                    content,

                });

                this.replyForm = {

                    title: "",

                    content: "",

                };

                this.replyPreview = false;

                this.showExpandedReply = false;

                await this.refreshThread();

                this.scrollToReplyBox();

            }
            catch (error) {

                console.error(error);

                this.replyError =

                    error?.message ??

                    "Unable to submit reply.";

            }
            finally {

                this.postingReply = false;

            }

        },

        // ==============================================================
        // Edit Posts
        // ==============================================================

        startEditingPost(post) {

            if (

                !canEditPost(

                    this.currentUser,

                    post

                )

            ) {

                return;

            }

            this.replyError = "";

            this.editingPostId = post.id;

            this.editForm.content =

                post.contentRaw ??

                "";

        },

        cancelEditingPost() {

            this.editingPostId = "";

            this.editForm.content = "";

        },

        async saveEditedPost(post) {

            if (!post?.id) {

                return;

            }

            const content =

                this.editForm.content.trim();

            if (!content) {

                this.replyError =

                    "Edited post cannot be empty.";

                return;

            }

            this.savingEditPostId =

                post.id;

            this.replyError = "";

            try {

                await updatePost(

                    post.id,

                    {

                        content,

                        editedAt:

                            new Date()

                                .toISOString(),

                    }

                );

                this.cancelEditingPost();

                await this.refreshThread();

            }
            catch (error) {

                console.error(error);

                this.replyError =

                    error?.message ??

                    "Unable to save changes.";

            }
            finally {

                this.savingEditPostId = "";

            }

        },
                // ==============================================================
        // Moderation
        // ==============================================================

        async toggleThreadLock() {

            if (!this.isModerator) {

                return;

            }

            this.replyError = "";
            this.loadError = "";

            this.updatingThreadLock = true;

            try {

                if (this.thread.isLocked) {

                    await unlockThread(
                        this.threadRecord
                    );

                } else {

                    await lockThread(
                        this.threadRecord
                    );

                    this.showExpandedReply = false;

                }

                await this.refreshThread();

            }
            catch (error) {

                console.error(error);

                this.loadError =

                    error?.message ??

                    "Unable to update thread.";

            }
            finally {

                this.updatingThreadLock = false;

            }

        },

        async deleteThread() {

            if (!this.canDeleteCurrentThread) {

                return;

            }

            const confirmed =

                window.confirm(

                    "Delete this thread and all replies?"

                );

            if (!confirmed) {

                return;

            }

            this.deletingThread = true;

            this.replyError = "";
            this.loadError = "";

            try {

                await deleteThreadAndPosts(

                    this.threadRecord.id

                );

                this.$router.push({

                    name: "ForumBoard",

                    params: {

                        boardSlug:

                            this.board.boardSlug,

                    },

                });

            }
            catch (error) {

                console.error(error);

                this.loadError =

                    error?.message ??

                    "Unable to delete thread.";

            }
            finally {

                this.deletingThread = false;

            }

        },

        async deletePost(post) {

            if (

                !canDeletePost(

                    this.currentUser,

                    post

                )

            ) {

                return;

            }

            const confirmed =

                window.confirm(

                    "Delete this reply?"

                );

            if (!confirmed) {

                return;

            }

            this.deletingPostId =

                post.id;

            try {

                await deleteReply(

                    post.id

                );

                await this.refreshThread();

            }
            catch (error) {

                console.error(error);

                this.replyError =

                    error?.message ??

                    "Unable to delete reply.";

            }
            finally {

                this.deletingPostId = "";

            }

        },

        // ==============================================================
        // Display Helpers
        // ==============================================================

        getAuthorRole(authorName = "") {

            const value =

                String(authorName)

                    .toLowerCase();

            if (

                value.includes("founder")

            ) {

                return "Project Lead";

            }

            if (

                value.includes("admin")

            ) {

                return "Administrator";

            }

            if (

                value.includes("moderator")

            ) {

                return "Moderator";

            }

            return "Member";

        },

        isStaffAuthor(authorName = "") {

            const value =

                String(authorName)

                    .toLowerCase();

            return (

                value.includes("founder") ||

                value.includes("admin") ||

                value.includes("moderator")

            );

        },

        getAuthorPostCount(authorUserId) {

            if (!authorUserId) {

                return 1;

            }

            return this.threadPosts.filter(

                post =>

                    post.authorUserId ===

                    authorUserId

            ).length;

        },

        // ==============================================================
        // Keyboard
        // ==============================================================

        handleEscapeKey(event) {

            if (

                event.key !== "Escape"

            ) {

                return;

            }

            if (

                this.showJoinPrompt

            ) {

                this.closeJoinPrompt();

                return;

            }

            if (

                this.showExpandedReply

            ) {

                this.closeExpandedReply();

                return;

            }

            if (

                this.editingPostId

            ) {

                this.cancelEditingPost();

            }

        },

    },

};

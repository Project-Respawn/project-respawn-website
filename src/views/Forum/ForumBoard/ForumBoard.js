// =============================================================================
// Imports
// =============================================================================

import {
    getCurrentForumUser,
    getBoardPage,
    createThread,
    updateThread,
} from "../Services/forumApi";

import {
    canCreateThread,
    canManageForum,
} from "../Services/forumPermissions";

import {
    formatRelativeTime,
} from "../Helpers/dateHelpers";

import {
    getBoardRules,
    getBoardTags,
} from "../Constants/forumBoards";

// =============================================================================
// Component
// =============================================================================

export default {

    name: "ForumBoard",

    // =========================================================================
    // Props
    // =========================================================================

    props: {

        boardSlug: {

            type: String,

            default: "",

        },

    },

    // =========================================================================
    // Data
    // =========================================================================

    data() {

        return {

            // -----------------------------------------------------------------
            // Loading
            // -----------------------------------------------------------------

            loading: true,

            loadError: "",

            // -----------------------------------------------------------------
            // Current User
            // -----------------------------------------------------------------

            currentUser: null,

            // -----------------------------------------------------------------
            // Board Data
            // -----------------------------------------------------------------

            boardRecord: null,

            boardCategory: null,

            boardThreads: [],

            boardPosts: [],

            // -----------------------------------------------------------------
            // Accessibility
            // -----------------------------------------------------------------

            textSize:

                localStorage.getItem("forumTextSize") ??

                "default",

            // -----------------------------------------------------------------
            // Thread Creation
            // -----------------------------------------------------------------

            showCreateThreadForm: false,

            creatingThread: false,

            createThreadError: "",

            newThreadForm: {

                title: "",

                content: "",

                isFeatured: false,

            },

            // -----------------------------------------------------------------
            // Join Prompt
            // -----------------------------------------------------------------

            showJoinPrompt: false,

            joinPageUrl: "/join",

            signInPageUrl: "/join",

            // -----------------------------------------------------------------
            // Moderation
            // -----------------------------------------------------------------

            updatingPinnedThreadId: "",

            updatingFeaturedThreadId: "",

        };

    },

    // =========================================================================
    // Computed
    // =========================================================================

    computed: {

        board() {

            if (!this.boardRecord) {

                return null;

            }

            return {

                id: this.boardRecord.id,

                slug: this.boardRecord.slug,

                name: this.boardRecord.name,

                description: this.boardRecord.description,

                rules: getBoardRules(
                    this.boardRecord.slug
                ),

                tags: getBoardTags(
                    this.boardRecord.slug
                ),

                threadCount:
                    this.boardThreads.length,

                postCount:
                    this.boardPosts.length,

                watchers: 0,

                sortLabel:
                    "Pinned • Featured • Latest",

                threads: this.mappedThreads,

            };

        },

        mappedThreads() {

            return this.boardThreads.map(thread => ({

                ...thread,

                createdAt:

                    formatRelativeTime(
                        thread.createdAt
                    ),

            }));

        },

        featuredThreadsForBoard() {

            return this.mappedThreads.filter(

                thread =>

                    thread.isFeatured &&
                    !thread.isPinned

            );

        },

        pinnedThreadsForBoard() {

            return this.mappedThreads.filter(

                thread =>

                    thread.isPinned

            );

        },

        regularThreads() {

            return this.mappedThreads.filter(

                thread =>

                    !thread.isPinned &&
                    !thread.isFeatured

            );

        },

        scrollingFeaturedThreads() {

            if (

                this.featuredThreadsForBoard.length <= 1

            ) {

                return [

                    ...this.featuredThreadsForBoard,

                    ...this.featuredThreadsForBoard,

                    ...this.featuredThreadsForBoard,

                ];

            }

            return this.featuredThreadsForBoard;

        },

        showNewThreadButton() {

            return canCreateThread(

                this.currentUser,

                this.boardRecord

            );

        },

        hasModerationAccess() {

            return canManageForum(

                this.currentUser

            );

        },

        canManageThreadFlags() {

            return this.hasModerationAccess;

        },

        boardTextSizeClass() {

            return `forum-text-size-${this.textSize}`;

        },

    },
        // =========================================================================
    // Watch
    // =========================================================================

    watch: {

        async boardSlug() {

            await this.bootstrapBoardPage();

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

        await this.bootstrapBoardPage();

    },

    unmounted() {

        window.removeEventListener(

            "keydown",

            this.handleEscapeKey

        );

    },

    // =========================================================================
    // Methods
    // =========================================================================

    methods: {

        // ==============================================================
        // Page Loading
        // ==============================================================

        async bootstrapBoardPage() {

            this.loading = true;

            this.loadError = "";

            try {

                await Promise.all([

                    this.loadCurrentUser(),

                    this.loadBoard(),

                ]);

            }
            catch (error) {

                console.error(error);

                this.loadError =

                    error?.message ??

                    "Unable to load forum board.";

            }
            finally {

                this.loading = false;

            }

        },

        async loadCurrentUser() {

            this.currentUser =

                await getCurrentForumUser();

        },

        async loadBoard() {

            const page = await getBoardPage(

                this.boardSlug

            );

            this.boardRecord =

                page.board;

            this.boardCategory =

                page.category;

            this.boardThreads =

                page.threads;

            this.boardPosts =

                page.posts;

        },

        async refreshBoard() {

            await this.loadBoard();

        },

        // ==============================================================
        // Navigation
        // ==============================================================

        goToThread(threadSlug) {

            this.$router.push({

                name: "ForumThread",

                params: {

                    slug: threadSlug,

                },

            });

        },

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

        scrollToFeatured() {

            this.$refs.featuredSection?.scrollIntoView({

                behavior: "smooth",

                block: "start",

            });

        },

        // ==============================================================
        // Accessibility
        // ==============================================================

        setTextSize(size = "default") {

            const allowed = [

                "default",

                "large",

                "xlarge",

            ];

            if (

                !allowed.includes(size)

            ) {

                size = "default";

            }

            this.textSize = size;

            localStorage.setItem(

                "forumTextSize",

                size

            );

        },
                // ==============================================================
        // Thread Creation
        // ==============================================================

        openCreateThread() {

            if (!this.currentUser) {

                this.showJoinPrompt = true;

                this.createThreadError = "";

                return;

            }

            if (!this.showNewThreadButton) {

                this.createThreadError =
                    "You do not have permission to create threads in this board.";

                return;

            }

            this.newThreadForm = {

                title: "",

                content: "",

                isFeatured: false,

            };

            this.createThreadError = "";

            this.showCreateThreadForm = true;

        },

        cancelCreateThread() {

            if (this.creatingThread) {

                return;

            }

            this.showCreateThreadForm = false;

            this.createThreadError = "";

            this.newThreadForm = {

                title: "",

                content: "",

                isFeatured: false,

            };

        },

        async submitThread() {

            this.createThreadError = "";

            const title =
                this.newThreadForm.title.trim();

            const content =
                this.newThreadForm.content.trim();

            if (!title) {

                this.createThreadError =
                    "Please enter a thread title.";

                return;

            }

            if (!content) {

                this.createThreadError =
                    "Please write your opening post.";

                return;

            }

            if (!this.boardRecord?.id) {

                this.createThreadError =
                    "This board has not finished loading.";

                return;

            }

            this.creatingThread = true;

            try {

                const thread = await createThread({

                    boardId:
                        this.boardRecord.id,

                    title,

                    content,

                    isFeatured:
                        this.canManageThreadFlags &&
                        this.newThreadForm.isFeatured,

                });

                this.cancelCreateThread();

                await this.refreshBoard();

                if (thread?.slug) {

                    this.goToThread(thread.slug);

                }

            }
            catch (error) {

                console.error(error);

                this.createThreadError =

                    error?.message ??

                    "Unable to publish thread.";

            }
            finally {

                this.creatingThread = false;

            }

        },

        // ==============================================================
        // Join Prompt
        // ==============================================================

        closeJoinPrompt() {

            this.showJoinPrompt = false;

        },
                // ==============================================================
        // Thread Moderation
        // ==============================================================

        async togglePinned(thread) {

            if (

                !thread?.id ||

                !this.canManageThreadFlags

            ) {

                return;

            }

            this.updatingPinnedThreadId = thread.id;

            this.loadError = "";

            try {

                await updateThread(

                    thread.id,

                    {

                        isPinned: !thread.isPinned,

                    }

                );

                await this.refreshBoard();

            }
            catch (error) {

                console.error(error);

                this.loadError =

                    error?.message ??

                    "Unable to update pinned state.";

            }
            finally {

                this.updatingPinnedThreadId = "";

            }

        },

        async toggleFeatured(thread) {

            if (

                !thread?.id ||

                !this.canManageThreadFlags

            ) {

                return;

            }

            this.updatingFeaturedThreadId = thread.id;

            this.loadError = "";

            try {

                await updateThread(

                    thread.id,

                    {

                        isFeatured: !thread.isFeatured,

                    }

                );

                await this.refreshBoard();

            }
            catch (error) {

                console.error(error);

                this.loadError =

                    error?.message ??

                    "Unable to update featured state.";

            }
            finally {

                this.updatingFeaturedThreadId = "";

            }

        },

        isUpdatingPinned(thread) {

            return (

                this.updatingPinnedThreadId ===

                thread.id

            );

        },

        isUpdatingFeatured(thread) {

            return (

                this.updatingFeaturedThreadId ===

                thread.id

            );

        },

        // ==============================================================
        // Helpers
        // ==============================================================

        buildLatestReplyTitle(content = "") {

            if (!content.trim()) {

                return "Latest Reply";

            }

            const clean =

                content

                    .replace(/\s+/g, " ")

                    .trim();

            if (clean.length <= 60) {

                return clean;

            }

            return `${clean.slice(0, 57)}...`;

        },

        handleEscapeKey(event) {

            if (event.key !== "Escape") {

                return;

            }

            if (this.showJoinPrompt) {

                this.closeJoinPrompt();

                return;

            }

            if (this.showCreateThreadForm) {

                this.cancelCreateThread();

            }

        },

    },

};
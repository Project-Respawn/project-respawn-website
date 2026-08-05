// =============================================================================
// Imports
// =============================================================================

import {

    getForumIndexPage,

    seedForumStructure as seedForumData,

} from "../Services/forumApi";

import {

    formatRelativeTime,

} from "../Helpers/dateHelpers";

import {

    getBoardIcon,

    getBoardTags,

} from "../Constants/forumBoards";

// =============================================================================
// Local Helpers
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

        (a, b) =>

            new Date(

                b.lastReplyAt ??

                b.updatedAt ??

                b.createdAt ??

                0

            ).getTime()

            -

            new Date(

                a.lastReplyAt ??

                a.updatedAt ??

                a.createdAt ??

                0

            ).getTime()

    );

}

// =============================================================================
// Component
// =============================================================================

export default {

    name: "ForumIndex",

    // =========================================================================
    // Data
    // =========================================================================

    data() {

        return {

            loading: true,

            loadError: "",

            seedingForum: false,

            showSeedButton: false,

            forumCategories: [],

            forumThreads: [],

            boardLookup: {},

            featuredScrollDuration: "36s",

        };

    },

    // =========================================================================
    // Computed
    // =========================================================================

    computed: {

        totalBoards() {

            return this.forumCategories.reduce(

                (total, category) =>

                    total +

                    (category.boards?.length ?? 0),

                0

            );

        },

        totalThreads() {

            return this.forumCategories.reduce(

                (total, category) =>

                    total +

                    category.boards.reduce(

                        (boardTotal, board) =>

                            boardTotal +

                            board.threadCount,

                        0

                    ),

                0

            );

        },

        totalPosts() {

            return this.forumCategories.reduce(

                (total, category) =>

                    total +

                    category.boards.reduce(

                        (boardTotal, board) =>

                            boardTotal +

                            board.postCount,

                        0

                    ),

                0

            );

        },

        latestActivityLabel() {

            const boards =

                this.forumCategories.flatMap(

                    category =>

                        category.boards

                );

            const latest =

                boards.find(

                    board =>

                        board.latestPost?.time &&

                        board.latestPost.time !==

                        "No activity yet"

                );

            return (

                latest?.latestPost?.time ??

                "No activity yet"

            );

        },

        featuredThreads() {

            return sortByNewest(

                this.forumThreads.filter(

                    thread =>

                        thread.isFeatured

                )

            ).map(

                (thread, index) => ({

                    id: thread.id,

                    renderId:

                        `${thread.id}-${index}`,

                    threadSlug:

                        thread.slug,

                    title:

                        thread.title,

                    excerpt:

                        thread.contentPreview ??

                        "Join the discussion.",

                    board:

                        this.boardLookup[

                            thread.boardId

                        ]?.name ??

                        "Community",

                    author:

                        thread.authorDisplayName ??

                        "Unknown",

                    time:

                        formatRelativeTime(

                            thread.lastReplyAt ??

                            thread.updatedAt ??

                            thread.createdAt

                        ),

                    isPinned:

                        thread.isPinned,

                    isFeatured:

                        thread.isFeatured,

                })

            );

        },
                orderedFeaturedThreads() {

            const threads = [

                ...this.featuredThreads,

            ];

            const prioritySlug =

                "beginning-of-the-end";

            const priorityIndex =

                threads.findIndex(

                    thread =>

                        thread.threadSlug ===

                        prioritySlug

                );

            if (priorityIndex > -1) {

                const [priorityThread] =

                    threads.splice(

                        priorityIndex,

                        1

                    );

                threads.unshift(

                    priorityThread

                );

            }

            return threads;

        },

        scrollingFeaturedThreads() {

            const threads =

                this.orderedFeaturedThreads;

            if (!threads.length) {

                return [];

            }

            if (threads.length === 1) {

                return [

                    ...threads,

                    ...threads,

                    ...threads,

                    ...threads,

                ].map(

                    (thread, index) => ({

                        ...thread,

                        renderId:

                            `${thread.id}-${index}`,

                    })

                );

            }

            if (threads.length === 2) {

                return [

                    ...threads,

                    ...threads,

                    ...threads,

                ].map(

                    (thread, index) => ({

                        ...thread,

                        renderId:

                            `${thread.id}-${index}`,

                    })

                );

            }

            if (threads.length === 3) {

                return [

                    ...threads,

                    ...threads,

                ].map(

                    (thread, index) => ({

                        ...thread,

                        renderId:

                            `${thread.id}-${index}`,

                    })

                );

            }

            return threads.map(

                (thread, index) => ({

                    ...thread,

                    renderId:

                        `${thread.id}-${index}`,

                })

            );

        },

        hasFeaturedThreads() {

            return (

                this.scrollingFeaturedThreads.length >

                0

            );

        },

    },

    // =========================================================================
    // Lifecycle
    // =========================================================================

    async mounted() {

        await this.fetchForumIndex();

    },

    // =========================================================================
    // Methods
    // =========================================================================

    methods: {

        // ==============================================================
        // Loading
        // ==============================================================

        async fetchForumIndex() {

            this.loading = true;

            this.loadError = "";

            try {

                const forum =

                    await getForumIndexPage();

                this.forumThreads =

                    forum.threads;

                this.boardLookup =

                    forum.boards.reduce(

                        (

                            lookup,

                            board

                        ) => {

                            lookup[board.id] =

                                board;

                            return lookup;

                        },

                        {}

                    );

                this.forumCategories =

                    sortByOrder(

                        forum.categories

                    )

                        .filter(

                            category =>

                                category.isActive !==

                                false

                        )

                        .map(

                            category => {

                                const boards =

                                    sortByOrder(

                                        forum.boards.filter(

                                            board =>

                                                board.categoryId ===

                                                    category.id &&

                                                board.isActive !==

                                                    false

                                        )

                                    );

                                return {

                                    id:

                                        category.slug,

                                    dbId:

                                        category.id,

                                    slug:

                                        category.slug,

                                    name:

                                        category.name,

                                    description:

                                        category.description,

                                    boards:

                                        boards.map(

                                            board => {

                                                const boardThreads =

                                                    forum.threads.filter(

                                                        thread =>

                                                            thread.boardId ===

                                                            board.id

                                                    );

                                                const boardPosts =

                                                    forum.posts.filter(

                                                        post =>

                                                            boardThreads.some(

                                                                thread =>

                                                                    thread.id ===

                                                                    post.threadId

                                                            )

                                                    );

                                                const latestThread =

                                                    sortByNewest(

                                                        boardThreads

                                                    )[0];

                                                return {

                                                    id:

                                                        board.slug,

                                                    dbId:

                                                        board.id,

                                                    slug:

                                                        board.slug,

                                                    icon:

                                                        getBoardIcon(

                                                            board.slug

                                                        ),

                                                    name:

                                                        board.name,

                                                    description:

                                                        board.description,

                                                    tags:

                                                        getBoardTags(

                                                            board.slug,

                                                            "index"

                                                        ),

                                                    threadCount:

                                                        boardThreads.length,

                                                    postCount:

                                                        boardPosts.length,

                                                    latestPost:

                                                        latestThread

                                                            ? {

                                                                  title:

                                                                      latestThread.title,

                                                                  author:

                                                                      latestThread.authorDisplayName,

                                                                  time:

                                                                      formatRelativeTime(

                                                                          latestThread.lastReplyAt ??

                                                                              latestThread.updatedAt ??

                                                                              latestThread.createdAt

                                                                      ),

                                                              }

                                                            : {

                                                                  title:

                                                                      "No posts yet",

                                                                  author:

                                                                      "System",

                                                                  time:

                                                                      "No activity yet",

                                                              },

                                                };

                                            }

                                        ),

                                };

                            }

                        )

                        .filter(

                            category =>

                                category.boards.length >

                                0

                        );

                this.updateFeaturedScrollDuration();

            }
            catch (error) {

                console.error(error);

                this.loadError =

                    error?.message ??

                    "Unable to load forum.";

            }
            finally {

                this.loading = false;

            }

        },
        // ==============================================================
        // Featured Carousel
        // ==============================================================

        async seedForumStructure() {

            this.seedingForum = true;

            this.loadError = "";

            try {

                await seedForumData();

                await this.fetchForumIndex();

            }
            catch (error) {

                console.error(error);

                this.loadError =
                    error?.message ??
                    "Failed to create starter forum structure.";

            }
            finally {

                this.seedingForum = false;

            }

        },

        updateFeaturedScrollDuration() {

            const count =

                this.scrollingFeaturedThreads.length;

            if (count <= 2) {

                this.featuredScrollDuration = "20s";

                return;

            }

            if (count <= 4) {

                this.featuredScrollDuration = "28s";

                return;

            }

            if (count <= 6) {

                this.featuredScrollDuration = "36s";

                return;

            }

            this.featuredScrollDuration = "44s";

        },

        // ==============================================================
        // Navigation
        // ==============================================================

        goToBoard(boardSlug) {

            this.$router.push({

                name: "ForumBoard",

                params: {

                    boardSlug,

                },

            });

        },

        goToThread(threadSlug) {

            this.$router.push({

                name: "ForumThread",

                params: {

                    threadSlug,

                },

            });

        },

        // ==============================================================
        // Scrolling
        // ==============================================================

        scrollToFeatured() {

            this.$refs.featuredSection?.scrollIntoView({

                behavior: "smooth",

                block: "start",

            });

        },

        scrollToCategories() {

            const section =

                this.$refs.categoriesSection;

            if (

                Array.isArray(section)

            ) {

                section[0]?.scrollIntoView({

                    behavior: "smooth",

                    block: "start",

                });

                return;

            }

         section?.scrollIntoView({

    behavior: "smooth",

    block: "start",

});

        },

    },
};

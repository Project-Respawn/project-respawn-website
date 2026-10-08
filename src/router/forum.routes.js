// src/router/forum.routes.js

const ForumLayout = () => import('../views/Forum/ForumLayout/ForumLayout.vue');
const ForumIndex = () => import('../views/Forum/ForumIndex/ForumIndex.vue');
const ForumBoard = () => import('../views/Forum/ForumBoard/ForumBoard.vue');
const ForumThread = () => import('../views/Forum/ForumThread/ForumThread.vue');

export default [

    {
        path: '/forum',
        component: ForumLayout,
        children: [
            {
                path: '',
                name: 'ForumIndex',
                component: ForumIndex
            },
            {
                path: 'board/:boardSlug',
                name: 'ForumBoard',
                component: ForumBoard,
                props: true
            },
            {
                path: 'thread/:threadSlug',
                name: 'ForumThread',
                component: ForumThread,
                props: true
            }
        ]
    }

];
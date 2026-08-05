// src/router/forum.routes.js

import ForumLayout from '../views/Forum/ForumLayout/ForumLayout.vue';
import ForumIndex from '../views/Forum/ForumIndex/ForumIndex.vue';
import ForumBoard from '../views/Forum/ForumBoard/ForumBoard.vue';
import ForumThread from '../views/Forum/ForumThread/ForumThread.vue';

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
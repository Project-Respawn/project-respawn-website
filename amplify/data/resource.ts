import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { adminUserManagement } from '../functions/admin-user-management/resource';
import { myFunction } from '../myFunction/resource';

const schema = a
  .schema({
    // =========================================================================
    // Admin user types
    // =========================================================================

    AdminUser: a.customType({
      id: a.string().required(),
      username: a.string().required(),
      email: a.string(),
      name: a.string(),
      joined: a.string(),
      online: a.boolean(),
      status: a.string(),
      enabled: a.boolean(),
      roles: a.string().array().required(),
    }),

    UpdateUserRolesResult: a.customType({
      success: a.boolean().required(),
      username: a.string().required(),
      roles: a.string().array().required(),
    }),

    // =========================================================================
    // Twitch command model
    // =========================================================================

    TwitchCommand: a
      .model({
        streamerId: a.string().required(),
        name: a.string().required(),
        reply: a.string().required(),
        enabled: a.boolean().required(),
        cooldownSeconds: a.integer().required(),
        isCustom: a.boolean().required(),
        category: a.string().required(),
        permissionLevel: a.string().required(),
      })
      .authorization((allow) => [allow.authenticated()]),

    // =========================================================================
    // User profile model
    // =========================================================================

      UserProfile: a
      .model({
        ownerUserId: a.string().required(),
        displayName: a.string().required(),
        bio: a.string(),
        avatarUrl: a.string(),
      })
      .authorization((allow) => [allow.owner()]),

    // =========================================================================
    // Forum models
    // =========================================================================

    ForumCategory: a
      .model({
        name: a.string().required(),
        slug: a.string().required(),
        description: a.string(),
        sortOrder: a.integer().required(),
        isActive: a.boolean().required(),
        boards: a.hasMany('ForumBoard', 'categoryId'),
      })
      .authorization((allow) => [allow.authenticated()]),

    ForumBoard: a
      .model({
        categoryId: a.id().required(),
        category: a.belongsTo('ForumCategory', 'categoryId'),
        name: a.string().required(),
        slug: a.string().required(),
        description: a.string(),
        sortOrder: a.integer().required(),
        isActive: a.boolean().required(),
        threads: a.hasMany('ForumThread', 'boardId'),
        permissionRules: a.hasMany('BoardPermissionRule', 'boardId'),
      })
      .authorization((allow) => [allow.authenticated()]),

    ForumThread: a
      .model({
        boardId: a.id().required(),
        board: a.belongsTo('ForumBoard', 'boardId'),
        title: a.string().required(),
        slug: a.string().required(),
        authorUserId: a.string().required(),
        authorDisplayName: a.string().required(),
        contentPreview: a.string(),
        isPinned: a.boolean().required(),
        isLocked: a.boolean().required(),
        isFeatured: a.boolean().required(),
        replyCount: a.integer().required(),
        viewCount: a.integer().required(),
        lastReplyAt: a.datetime(),
        posts: a.hasMany('ForumPost', 'threadId'),
      })
      .authorization((allow) => [allow.authenticated()]),

    ForumPost: a
      .model({
        threadId: a.id().required(),
        thread: a.belongsTo('ForumThread', 'threadId'),
        authorUserId: a.string().required(),
        authorDisplayName: a.string().required(),
        content: a.string().required(),
        editedAt: a.datetime(),
      })
      .authorization((allow) => [allow.authenticated()]),

    BoardPermissionRule: a
      .model({
        boardId: a.id().required(),
        board: a.belongsTo('ForumBoard', 'boardId'),
        subjectType: a.string().required(),
        subjectKey: a.string().required(),
        canView: a.boolean().required(),
        canCreateThread: a.boolean().required(),
        canReply: a.boolean().required(),
        canModerate: a.boolean().required(),
        canAdmin: a.boolean().required(),
      })
      .authorization((allow) => [
        allow.groups(['SuperAdmin', 'Admin']),
      ]),

    // =========================================================================
    // Admin user operations
    // =========================================================================

    listAdminUsers: a
      .query()
      .returns(a.ref('AdminUser').array().required())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(adminUserManagement)),

    updateUserRoles: a
      .mutation()
      .arguments({
        username: a.string().required(),
        roles: a.string().array().required(),
      })
      .returns(a.ref('UpdateUserRolesResult').required())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(adminUserManagement)),
  })
  .authorization((allow) => [
    allow.resource(myFunction).to(['query', 'mutate']),
  ]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
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
    owner: a
      .string()
      .authorization((allow) => [allow.owner().to(['read'])]),
    ownerUserId: a.string().required(),
    displayName: a.string().required(),
    bio: a.string(),
    avatarUrl: a.string(),
  })
  .authorization((allow) => [
    allow.owner(),
    allow.groups(['SuperAdmin', 'Admin', 'Staff']).to(['read']),
  ]),

    // =========================================================================
    // Forum types
    // =========================================================================

    ForumMutationResult: a.customType({
      success: a.boolean().required(),
      message: a.string(),
      threadId: a.id(),
      postId: a.id(),
      replyCount: a.integer(),
      viewCount: a.integer(),
      lastReplyAt: a.datetime(),
    }),

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
  .authorization((allow) => [
    allow.publicApiKey().to(['read']),
    allow.authenticated().to(['read']),
    allow.groups(['SuperAdmin']).to(['create', 'read', 'update', 'delete']),
  ]),

ForumBoard: a
  .model({
    categoryId: a.id().required(),
    category: a.belongsTo('ForumCategory', 'categoryId'),
    name: a.string().required(),
    slug: a.string().required(),
    description: a.string(),
    sortOrder: a.integer().required(),
    isActive: a.boolean().required(),
    allowedGroups: a.string().array(),
    threadCreateGroups: a.string().array(), // NEW: restrict who can create top-level threads
    threads: a.hasMany('ForumThread', 'boardId'),
    permissionRules: a.hasMany('BoardPermissionRule', 'boardId'),
  })
  .authorization((allow) => [
    allow.publicApiKey().to(['read']),
    allow.authenticated().to(['read']),
    allow.groups(['SuperAdmin']).to(['create', 'read', 'update', 'delete']),
  ]),

ForumThread: a
  .model({
    boardId: a.id().required(),
    board: a.belongsTo('ForumBoard', 'boardId'),
    title: a.string().required(),
    slug: a.string().required(),
    owner: a.string(),
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
  .authorization((allow) => [
    allow.publicApiKey().to(['read']),
    allow.authenticated().to(['read']),
    allow.ownerDefinedIn('owner').to(['read', 'update', 'delete']),
    allow.groups(['SuperAdmin', 'Admin', 'Staff']).to(['create', 'read', 'update', 'delete']),
  ]),

ForumPost: a
  .model({
    threadId: a.id().required(),
    thread: a.belongsTo('ForumThread', 'threadId'),
    owner: a.string(),
    authorUserId: a.string().required(),
    authorDisplayName: a.string().required(),
    content: a.string().required(),
    editedAt: a.datetime(),
  })
  .authorization((allow) => [
    allow.publicApiKey().to(['read']),
    allow.authenticated().to(['read', 'create']),
    allow.ownerDefinedIn('owner').to(['read', 'update', 'delete']),
    allow.groups(['SuperAdmin', 'Admin', 'Staff']).to(['read', 'update', 'delete']),
  ]),

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
    allow.groups(['SuperAdmin']).to(['create', 'read', 'update', 'delete']),
  ]),

// =========================================================================
// Forum backend-managed mutations
// =========================================================================

submitForumThread: a
  .mutation()
  .arguments({
    boardId: a.id().required(),
    title: a.string().required(),
    content: a.string().required(),
    authorUserId: a.string().required(),
    authorDisplayName: a.string().required(),
    owner: a.string().required(),
    isFeatured: a.boolean(),
  })
  .returns(a.ref('ForumMutationResult').required())
  .authorization((allow) => [
    allow.authenticated(),
  ])
  .handler(a.handler.function(myFunction)),

recordForumThreadView: a
  .mutation()
  .arguments({
    threadId: a.id().required(),
  })
  .returns(a.ref('ForumMutationResult').required())
  .authorization((allow) => [
    allow.publicApiKey(),
    allow.authenticated(),
  ])
  .handler(a.handler.function(myFunction)),

submitForumReply: a
  .mutation()
  .arguments({
    threadId: a.id().required(),
    content: a.string().required(),
    authorUserId: a.string().required(),
    authorDisplayName: a.string().required(),
    owner: a.string().required(),
  })
  .returns(a.ref('ForumMutationResult').required())
  .authorization((allow) => [
    allow.authenticated(),
  ])
  .handler(a.handler.function(myFunction)),

    // =========================================================================
    // Merch models
    // =========================================================================

    Brand: a
      .model({
        name: a.string().required(),
        slug: a.string().required(),
        description: a.string(),
        status: a.string().required(),
        logoUrl: a.string(),
        productLinks: a.hasMany('MerchProductBrand', 'brandId'),
        assignments: a.hasMany('BrandAssignment', 'brandId'),
      })
      .authorization((allow) => [
        allow.groups(['SuperAdmin', 'Admin']),
        allow.authenticated().to(['read']),
      ]),

    MerchCategory: a
      .model({
        name: a.string().required(),
        slug: a.string().required(),
        description: a.string(),
        sortOrder: a.integer().required(),
        isActive: a.boolean().required(),
        showInMenu: a.boolean().required(),
        status: a.string().required(),
        productLinks: a.hasMany('MerchProductCategory', 'categoryId'),
      })
      .authorization((allow) => [
        allow.groups(['SuperAdmin', 'Admin']),
        allow.authenticated().to(['read']),
      ]),

    MerchProduct: a
      .model({
        title: a.string().required(),
        slug: a.string().required(),
        description: a.string(),
        imageUrl: a.string(),
        sourceType: a.string().required(),
        externalProductId: a.string(),
        externalVariantGroupId: a.string(),
        sku: a.string(),
        displayPrice: a.string(),
        productUrl: a.string(),
        variantCount: a.integer(),
        status: a.string().required(),
        isVisible: a.boolean().required(),
        sortOrder: a.integer(),
        brandLinks: a.hasMany('MerchProductBrand', 'productId'),
        categoryLinks: a.hasMany('MerchProductCategory', 'productId'),
      })
      .authorization((allow) => [
        allow.groups(['SuperAdmin', 'Admin', 'Staff']),
        allow.authenticated().to(['read']),
      ]),

    MerchProductBrand: a
      .model({
        productId: a.id().required(),
        brandId: a.id().required(),
        product: a.belongsTo('MerchProduct', 'productId'),
        brand: a.belongsTo('Brand', 'brandId'),
      })
      .authorization((allow) => [
        allow.groups(['SuperAdmin', 'Admin', 'Staff']),
        allow.authenticated().to(['read']),
      ]),

    MerchProductCategory: a
      .model({
        productId: a.id().required(),
        categoryId: a.id().required(),
        product: a.belongsTo('MerchProduct', 'productId'),
        category: a.belongsTo('MerchCategory', 'categoryId'),
      })
      .authorization((allow) => [
        allow.groups(['SuperAdmin', 'Admin', 'Staff']),
        allow.authenticated().to(['read']),
      ]),

    BrandAssignment: a
      .model({
        brandId: a.id().required(),
        brand: a.belongsTo('Brand', 'brandId'),
        userId: a.string().required(),
        username: a.string(),
        email: a.string(),
        displayName: a.string(),
        accessLevel: a.string().required(),
        assignedBy: a.string(),
      })
      .authorization((allow) => [
        allow.groups(['SuperAdmin', 'Admin']),
        allow.authenticated().to(['read']),
      ]),

    // =========================================================================
    // Admin user operations
    // =========================================================================

    listAdminUsers: a
      .query()
      .returns(a.ref('AdminUser').array().required())
      .authorization((allow) => [
        allow.groups(['SuperAdmin', 'Admin']),
      ])
      .handler(a.handler.function(adminUserManagement)),

    updateUserRoles: a
      .mutation()
      .arguments({
        username: a.string().required(),
        roles: a.string().array().required(),
      })
      .returns(a.ref('UpdateUserRolesResult').required())
      .authorization((allow) => [
        allow.groups(['SuperAdmin', 'Admin']),
      ])
      .handler(a.handler.function(adminUserManagement)),
  })
  .authorization((allow) => [
    allow.resource(myFunction).to(['query', 'mutate']),
    allow.resource(adminUserManagement).to(['query', 'mutate']),
  ]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
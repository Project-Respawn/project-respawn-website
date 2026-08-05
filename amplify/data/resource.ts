/*
amplify/data/resource.ts

TABLE OF CONTENTS (SECTION NUMBERS)
1. Imports
2. Admin user management types & operations
3. Twitch & user profile models
4. Event system (events, suggestions, mutations)
5. Forum system (categories, boards, threads, posts, permissions)
6. Merch system (brands, categories, products, variants, assignments)
7. Media library (collections, items) and merch-media join
8. Global schema authorization (functions)
9. defineData configuration
*/

import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { adminUserManagement } from '../functions/admin-user-management/resource';
import { myFunction } from '../myFunction/resource';

/*
 * 2. ADMIN USER MANAGEMENT TYPES & OPERATIONS
 *    - AdminUser, UpdateUserRolesResult
 *    - listAdminUsers, updateUserRoles
 */
const schema = a
  .schema({
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

    listAdminUsers: a
      .query()
      .returns(a.ref('AdminUser').array().required())
      .authorization((allow) => [allow.groups(['SuperAdmin', 'Admin'])])
      .handler(a.handler.function(adminUserManagement)),

    updateUserRoles: a
      .mutation()
      .arguments({
        username: a.string().required(),
        roles: a.string().array().required(),
      })
      .returns(a.ref('UpdateUserRolesResult').required())
      .authorization((allow) => [allow.groups(['SuperAdmin'])])
      .handler(a.handler.function(adminUserManagement)),

    /*
     * 3. TWITCH & USER PROFILE MODELS
     *    - TwitchCommand
     *    - UserProfile
     */

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

    UserProfile: a
      .model({
        owner: a
          .string()
          .authorization((allow) => [allow.owner().to(['read', 'delete'])]),
        ownerUserId: a.string().required(),
        displayName: a.string().required(),
        bio: a.string(),
        avatarUrl: a.string(),
        canHostEvents: a.boolean(),
        hostTitle: a.string(),
      })
      .authorization((allow) => [
        allow.owner(),
        allow.groups(['SuperAdmin', 'Admin', 'Staff']).to(['read']),
      ]),

    /*
     * 4. EVENT SYSTEM
     *    - EventTicketTier, CloneEventResult, RecurringEventSeriesResult
     *    - EventTag, Event, EventSuggestion
     *    - cloneEvent, createRecurringEventSeries, generateRecurringInstances
     */

    EventTicketTier: a.customType({
      name: a.string().required(),
      price: a.float().required(),
      perks: a.string(),
      quantityAvailable: a.integer(),
    }),

    CloneEventResult: a.customType({
      success: a.boolean().required(),
      message: a.string(),
      eventId: a.id(),
    }),

    RecurringEventSeriesResult: a.customType({
      success: a.boolean().required(),
      message: a.string(),
      seriesId: a.string(),
      masterEventId: a.id(),
      generatedCount: a.integer(),
    }),

    EventTag: a
      .model({
        name: a.string().required(),
        slug: a.string().required(),
        type: a.string().required(),
        visibleOnEventCard: a.boolean().required(),
        isActive: a.boolean().required(),
      })
      .authorization((allow) => [
        allow.publicApiKey().to(['read']),
        allow.authenticated().to(['read']),
        allow.groups(['SuperAdmin', 'Admin', 'Staff']).to([
          'create',
          'read',
          'update',
          'delete',
        ]),
      ]),

    Event: a
      .model({
        title: a.string().required(),
        slug: a.string(),
        shortDescription: a.string(),
        description: a.string().required(),
        longDescription: a.string(),
        startAt: a.datetime().required(),
        endAt: a.datetime().required(),
        locationType: a.string().required(),
        platform: a.string(),
        category: a.string(),
        categories: a.string().array(),
        featured: a.boolean(),
        status: a.string().required(),
        host: a.string(),
        hostUserId: a.string(),
        hostDisplayName: a.string(),
        brandId: a.id(),
        rewardText: a.string(),
        recapText: a.string(),
        ctaLabel: a.string(),
        ctaUrl: a.string(),
        tagIds: a.string().array(),
        ticketMode: a.string(),
        ticketTiers: a.ref('EventTicketTier').array(),
        signupMode: a.string(),
        eventType: a.string(),
        isTemplate: a.boolean(),
        isRecurring: a.boolean(),
        seriesId: a.string(),
        parentEventId: a.string(),
        clonedFromEventId: a.string(),
        recurrenceRule: a.string(),
        recurrenceFrequency: a.string(),
        recurrenceInterval: a.integer(),
        recurrenceByWeekday: a.string().array(),
        recurrenceEndsAt: a.datetime(),
        recurrenceCount: a.integer(),
        createdBy: a.string(),
        updatedBy: a.string(),
      })
      .authorization((allow) => [
        allow.publicApiKey().to(['read']),
        allow.authenticated().to(['read']),
        allow.groups(['SuperAdmin', 'Admin', 'Staff']).to([
          'create',
          'read',
          'update',
          'delete',
        ]),
      ]),

    EventSuggestion: a
      .model({
        title: a.string().required(),
        description: a.string().required(),
        shortDescription: a.string(),
        longDescription: a.string(),
        startAt: a.datetime(),
        endAt: a.datetime(),
        locationType: a.string(),
        platform: a.string(),
        category: a.string(),
        categories: a.string().array(),
        host: a.string(),
        hostUserId: a.string(),
        hostDisplayName: a.string(),
        rewardText: a.string(),
        notes: a.string(),
        status: a.string().required(),
        reviewNotes: a.string(),
        owner: a
          .string()
          .authorization((allow) => [allow.owner().to(['read', 'delete'])]),
        ownerUserId: a.string(),
        ownerDisplayName: a.string(),
        reviewedBy: a.string(),
      })
      .authorization((allow) => [
        allow.authenticated().to(['create']),
        allow.ownerDefinedIn('owner').to(['read']),
        allow.groups(['SuperAdmin', 'Admin', 'Staff']).to([
          'read',
          'update',
          'delete',
        ]),
      ]),

    cloneEvent: a
      .mutation()
      .arguments({
        eventId: a.id().required(),
        newStartAt: a.datetime(),
        newEndAt: a.datetime(),
        status: a.string(),
      })
      .returns(a.ref('CloneEventResult').required())
      .authorization((allow) => [allow.groups(['SuperAdmin', 'Admin', 'Staff'])])
      .handler(a.handler.function(myFunction)),

    createRecurringEventSeries: a
      .mutation()
      .arguments({
        eventId: a.id().required(),
        recurrenceFrequency: a.string().required(),
        recurrenceInterval: a.integer(),
        recurrenceByWeekday: a.string().array(),
        recurrenceEndsAt: a.datetime(),
        recurrenceCount: a.integer(),
      })
      .returns(a.ref('RecurringEventSeriesResult').required())
      .authorization((allow) => [allow.groups(['SuperAdmin', 'Admin', 'Staff'])])
      .handler(a.handler.function(myFunction)),

    generateRecurringInstances: a
      .mutation()
      .arguments({
        masterEventId: a.id().required(),
        rangeStart: a.datetime(),
        rangeEnd: a.datetime(),
      })
      .returns(a.ref('RecurringEventSeriesResult').required())
      .authorization((allow) => [allow.groups(['SuperAdmin', 'Admin', 'Staff'])])
      .handler(a.handler.function(myFunction)),

    /*
     * 5. FORUM SYSTEM
     *    - ForumMutationResult
     *    - ForumCategory, ForumBoard, ForumThread, ForumPost, BoardPermissionRule
     *    - submitForumThread, submitForumReply, recordForumThreadView
     */

    ForumMutationResult: a.customType({
      success: a.boolean().required(),
      message: a.string(),
      threadId: a.id(),
      postId: a.id(),
      replyCount: a.integer(),
      viewCount: a.integer(),
      lastReplyAt: a.datetime(),
    }),

    ForumActivityResult: a.customType({
      success: a.boolean().required(),
      message: a.string(),
      activityId: a.id(),
    }),

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
        threadCreateGroups: a.string().array(),
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
        owner: a
          .string()
          .authorization((allow) => [allow.owner().to(['read', 'delete'])]),
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
        allow.groups(['SuperAdmin', 'Admin', 'Staff']).to([
          'create',
          'read',
          'update',
          'delete',
        ]),
      ]),

    ForumPost: a
      .model({
        threadId: a.id().required(),
        thread: a.belongsTo('ForumThread', 'threadId'),
        owner: a
          .string()
          .authorization((allow) => [allow.owner().to(['read', 'delete'])]),
        authorUserId: a.string().required(),
        authorDisplayName: a.string().required(),
        content: a.string().required(),
        editedAt: a.datetime(),
      })
      .authorization((allow) => [
        allow.publicApiKey().to(['read']),
        allow.authenticated().to(['read', 'create']),
        allow.ownerDefinedIn('owner').to(['read', 'update', 'delete']),
        allow.groups(['SuperAdmin', 'Admin', 'Staff']).to([
          'read',
          'update',
          'delete',
        ]),
      ]),

    ForumActivity: a
      .model({
        owner: a
          .string()
          .authorization((allow) => [allow.owner().to(['read', 'delete'])]),
        userId: a.string().required(),
        activityType: a.string().required(),
        threadId: a.id(),
        postId: a.id(),
        boardId: a.id(),
        threadTitle: a.string(),
        boardName: a.string(),
        actorUserId: a.string(),
        actorDisplayName: a.string(),
        occurredAt: a.datetime().required(),
      })
      .authorization((allow) => [
        allow.ownerDefinedIn('owner').to(['read']),
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
      .authorization((allow) => [allow.authenticated()])
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
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(myFunction)),

    recordForumThreadView: a
      .mutation()
      .arguments({
        threadId: a.id().required(),
      })
      .returns(a.ref('ForumMutationResult').required())
      .authorization((allow) => [allow.publicApiKey(), allow.authenticated()])
      .handler(a.handler.function(myFunction)),

    recordForumActivity: a
      .mutation()
      .arguments({
        activityType: a.string().required(),
        threadId: a.id().required(),
        postId: a.id(),
      })
      .returns(a.ref('ForumActivityResult').required())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(myFunction)),

    /*
     * 6. MERCH SYSTEM
     *    - Brand, MerchCategory, MerchProduct
     *    - MerchProductVariant, MerchProductBrand, MerchProductCategory
     *    - BrandAccess
     */

    Brand: a
      .model({
        name: a.string().required(),
        slug: a.string().required(),
        description: a.string(),
        sortOrder: a.integer(),
        isActive: a.boolean(),
        productBrandLinks: a.hasMany('MerchProductBrand', 'brandId'),
        brandAccesses: a.hasMany('BrandAccess', 'brandId'),
      })
      .authorization((allow) => [
        allow.publicApiKey().to(['read']),
        allow.authenticated().to(['read']),
        allow.groups(['SuperAdmin', 'Admin', 'Staff']).to([
          'create',
          'read',
          'update',
          'delete',
        ]),
      ]),

    MerchCategory: a
      .model({
        name: a.string().required(),
        slug: a.string().required(),
        description: a.string(),
        sortOrder: a.integer(),
        isActive: a.boolean(),
        productCategoryLinks: a.hasMany('MerchProductCategory', 'categoryId'),
      })
      .authorization((allow) => [
        allow.publicApiKey().to(['read']),
        allow.authenticated().to(['read']),
        allow.groups(['SuperAdmin', 'Admin', 'Staff']).to([
          'create',
          'read',
          'update',
          'delete',
        ]),
      ]),

    MerchProduct: a
      .model({
        title: a.string().required(),
        slug: a.string().required(),
        shortDescription: a.string(),
        description: a.string(),
        thumbnailUrl: a.string(),
        imageUrl: a.string(),
        sourceType: a.string().required(),
        externalProductId: a.string(),
        externalVariantGroupId: a.string(),
        sku: a.string(),
        displayPrice: a.string(),
        basePrice: a.float(),
        currency: a.string(),
        productUrl: a.string(),
        variantCount: a.integer(),
        materials: a.string(),
        sizeGuide: a.string(),
        shippingReturns: a.string(),
        whatsIncluded: a.string(),
        careInstructions: a.string(),
        fitNotes: a.string(),
        status: a.string().required(),
        isVisible: a.boolean().required(),
        sortOrder: a.integer(),
        imageRecords: a.hasMany('MerchProductImage', 'productId'),
        variants: a.hasMany('MerchProductVariant', 'productId'),
        brandLinks: a.hasMany('MerchProductBrand', 'productId'),
        categoryLinks: a.hasMany('MerchProductCategory', 'productId'),
      })
      .authorization((allow) => [
        allow.publicApiKey().to(['read']),
        allow.groups(['SuperAdmin', 'Admin', 'Staff']).to([
          'create',
          'read',
          'update',
          'delete',
        ]),
      ]),

    MerchProductVariant: a
      .model({
        productId: a.id().required(),
        product: a.belongsTo('MerchProduct', 'productId'),
        externalVariantId: a.string(),
        sku: a.string(),
        name: a.string(),
        color: a.string(),
        colorHex: a.string(),
        size: a.string(),
        displayPrice: a.string(),
        retailPrice: a.float(),
        currency: a.string(),
        availabilityStatus: a.string(),
        imageUrl: a.string(),
        sortOrder: a.integer(),
        status: a.string(),
      })
      .authorization((allow) => [
        allow.publicApiKey().to(['read']),
        allow.groups(['SuperAdmin', 'Admin', 'Staff']).to([
          'create',
          'read',
          'update',
          'delete',
        ]),
      ]),

    MerchProductBrand: a
      .model({
        productId: a.id().required(),
        brandId: a.id().required(),
        product: a.belongsTo('MerchProduct', 'productId'),
        brand: a.belongsTo('Brand', 'brandId'),
      })
      .authorization((allow) => [
        allow.publicApiKey().to(['read']),
        allow.groups(['SuperAdmin', 'Admin', 'Staff']).to([
          'create',
          'read',
          'update',
          'delete',
        ]),
      ]),

    MerchProductCategory: a
      .model({
        productId: a.id().required(),
        categoryId: a.id().required(),
        product: a.belongsTo('MerchProduct', 'productId'),
        category: a.belongsTo('MerchCategory', 'categoryId'),
      })
      .authorization((allow) => [
        allow.publicApiKey().to(['read']),
        allow.groups(['SuperAdmin', 'Admin', 'Staff']).to([
          'create',
          'read',
          'update',
          'delete',
        ]),
      ]),

    BrandAccess: a
      .model({
        brandId: a.id().required(),
        brand: a.belongsTo('Brand', 'brandId'),
        userId: a.string().required(),
        username: a.string(),
        email: a.string(),
        displayName: a.string(),
        accessLevel: a.string().required(),
        assignedBy: a.string(),
        canManageMerch: a.boolean(),
        canHostEvents: a.boolean(),
      })
      .authorization((allow) => [
        allow.groups(['SuperAdmin', 'Admin']).to([
          'create',
          'read',
          'update',
          'delete',
        ]),
        allow.groups(['Staff']).to(['read']),
      ]),

    /*
     * 7. MEDIA LIBRARY
     *    - MediaCollection: logical folders
     *    - MediaItem: global assets
     *    - MerchProductImage: product–media join
     */

MediaCollection: a
  .model({
    name: a.string().required(),
    slug: a.string().required(),
    type: a.string(),
    // Parent collection reference for nesting (optional)
    parentId: a.id(),
    sortOrder: a.integer(),
    isActive: a.boolean(),
    mediaItems: a.hasMany('MediaItem', 'collectionId'),
  })
  .authorization((allow) => [
    allow.authenticated().to(['read']),
    allow.groups(['SuperAdmin', 'Admin', 'Staff']).to([
      'create',
      'read',
      'update',
      'delete',
    ]),
  ]),

MediaItem: a
  .model({
    collectionId: a.id(),
    collection: a.belongsTo('MediaCollection', 'collectionId'),

    url: a.string().required(),
    title: a.string(),
    altText: a.string(),

    type: a.string(),
    tags: a.string().array(),

    color: a.string(),
    colorHex: a.string(),

    sourceType: a.string(),
    externalImageId: a.string(),

    status: a.string(),
    createdBy: a.string(),
    createdAt: a.datetime(),

    // Link back to product image assignments
    productImageLinks: a.hasMany('MerchProductImage', 'mediaItemId'),
  })
  .authorization((allow) => [
    allow.publicApiKey().to(['read']),
    allow.authenticated().to(['read']),
    allow.groups(['SuperAdmin', 'Admin', 'Staff']).to([
      'create',
      'read',
      'update',
      'delete',
    ]),
  ]),
  
    MerchProductImage: a
      .model({
        productId: a.id().required(),
        product: a.belongsTo('MerchProduct', 'productId'),

        mediaItemId: a.id().required(),
        mediaItem: a.belongsTo('MediaItem', 'mediaItemId'),

        sortOrder: a.integer(),
        isPrimary: a.boolean(),
        isMockup: a.boolean(),
        isVisible: a.boolean(),
        isFeatured: a.boolean(),

        altTextOverride: a.string(),
        colorOverride: a.string(),
        colorHexOverride: a.string(),

        status: a.string(),
      })
      .authorization((allow) => [
        allow.publicApiKey().to(['read']),
        allow.groups(['SuperAdmin', 'Admin', 'Staff']).to([
          'create',
          'read',
          'update',
          'delete',
        ]),
      ]),
  })
  /*
   * 8. GLOBAL SCHEMA AUTHORIZATION
   *    - Allow functions to call queries/mutations internally
   */
  .authorization((allow) => [
    allow.resource(myFunction).to(['query', 'mutate']),
    allow.resource(adminUserManagement).to(['query', 'mutate']),
  ]);

/*
 * 9. DEFINE DATA CONFIGURATION
 */

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

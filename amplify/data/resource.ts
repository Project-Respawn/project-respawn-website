import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { adminUserManagement } from '../functions/admin-user-management/resource';
import { myFunction } from '../myFunction/resource';

const schema = a
  .schema({
    // =========================================================================
    //  Admin user types
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
    //  Twitch command model
    // =========================================================================

    TwitchCommand: a
      .model({
        streamerId: a.string().required(),
        name: a.string().required(),
        reply: a.string().required(),
        enabled: a.boolean().required(),
        cooldownSeconds: a.integer().required(),
        isCustom: a.boolean().required(),
      })
      .authorization((allow) => [
        allow.authenticated(),
      ]),

    // =========================================================================
    //  Admin user operations
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
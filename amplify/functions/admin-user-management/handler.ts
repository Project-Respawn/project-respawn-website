import type { AppSyncResolverHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminListGroupsForUserCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient({});

const USER_POOL_ID = process.env.AMPLIFY_AUTH_USERPOOL_ID as string;
const ALLOWED_ADMIN_GROUPS = ['SuperAdmin', 'Admin', 'Staff'];
const MANAGED_GROUPS = [
  'SuperAdmin',
  'Admin',
  'Staff',
  'Moderator',
  'Trainer',
  'Therapist',
  'StreamingPartner',
  'AffiliatePartner',
  'Member',
  'BetaMember',
];

function getCallerGroups(event: any): string[] {
  const groups =
    event.identity?.claims?.['cognito:groups'] ||
    event.identity?.resolverContext?.groups ||
    [];
  return Array.isArray(groups) ? groups : [groups].filter(Boolean);
}

function assertAdminAccess(event: any) {
  const callerGroups = getCallerGroups(event);
  const allowed = callerGroups.some((group) => ALLOWED_ADMIN_GROUPS.includes(group));

  if (!allowed) {
    throw new Error('Unauthorized');
  }
}

function getAttribute(user: any, name: string): string {
  return user.Attributes?.find((attr: any) => attr.Name === name)?.Value ?? '';
}

async function listAdminUsers() {
  const result = await client.send(
    new ListUsersCommand({
      UserPoolId: USER_POOL_ID,
      Limit: 60,
    })
  );

  const users = await Promise.all(
    (result.Users ?? []).map(async (user) => {
      const username = user.Username ?? '';
      const email = getAttribute(user, 'email');
      const name =
        getAttribute(user, 'name') ||
        getAttribute(user, 'preferred_username') ||
        email ||
        username;

      const groupsResult = await client.send(
        new AdminListGroupsForUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
        })
      );

      const roles = (groupsResult.Groups ?? []).map((group) => group.GroupName!).filter(Boolean);
      const finalRoles = roles.length ? roles : ['Member'];

      return {
        id: username,
        username,
        email,
        name,
        joined: user.UserCreateDate ? new Date(user.UserCreateDate).toLocaleDateString('en-GB') : '',
        online: false,
        roles: finalRoles,
        status: user.UserStatus ?? 'UNKNOWN',
        enabled: user.Enabled ?? true,
      };
    })
  );

  return users;
}

async function updateUserRoles(username: string, roles: string[]) {
  const desiredRoles = [...new Set(roles.filter((role) => MANAGED_GROUPS.includes(role)))];

  if (!desiredRoles.includes('Member')) {
    desiredRoles.push('Member');
  }

  const existingGroupsResult = await client.send(
    new AdminListGroupsForUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
    })
  );

  const existingRoles = (existingGroupsResult.Groups ?? [])
    .map((group) => group.GroupName!)
    .filter(Boolean)
    .filter((role) => MANAGED_GROUPS.includes(role));

  const rolesToAdd = desiredRoles.filter((role) => !existingRoles.includes(role));
  const rolesToRemove = existingRoles.filter((role) => !desiredRoles.includes(role));

  await Promise.all([
    ...rolesToAdd.map((role) =>
      client.send(
        new AdminAddUserToGroupCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
          GroupName: role,
        })
      )
    ),
    ...rolesToRemove.map((role) =>
      client.send(
        new AdminRemoveUserFromGroupCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
          GroupName: role,
        })
      )
    ),
  ]);

  return {
    success: true,
    username,
    roles: desiredRoles,
  };
}

export const handler: AppSyncResolverHandler<any, any> = async (event) => {
  assertAdminAccess(event);

  switch (event.fieldName) {
    case 'listAdminUsers':
      return await listAdminUsers();

    case 'updateUserRoles':
      return await updateUserRoles(event.arguments.username, event.arguments.roles);

    default:
      throw new Error(`Unknown field: ${event.fieldName}`);
  }
};
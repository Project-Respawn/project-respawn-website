import type { AppSyncResolverHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminListGroupsForUserCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient({});

const USER_POOL_ID = process.env.AMPLIFY_AUTH_USERPOOL_ID;
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

function formatDate(value?: Date): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-GB');
}

async function listAllUsers() {
  if (!USER_POOL_ID) {
    throw new Error('Missing AMPLIFY_AUTH_USERPOOL_ID');
  }

  const allUsers: any[] = [];
  let paginationToken: string | undefined = undefined;

  do {
    const result = await client.send(
      new ListUsersCommand({
        UserPoolId: USER_POOL_ID,
        Limit: 60,
        PaginationToken: paginationToken,
      })
    );

    console.log('Fetched Cognito page', {
      count: result.Users?.length ?? 0,
      nextToken: result.PaginationToken ?? null,
    });

    allUsers.push(...(result.Users ?? []));
    paginationToken = result.PaginationToken;
  } while (paginationToken);

  const users = await Promise.all(
    allUsers.map(async (user) => {
      const username = user.Username ?? '';
      const email = getAttribute(user, 'email');
      const name =
        getAttribute(user, 'name') ||
        getAttribute(user, 'preferred_username') ||
        [getAttribute(user, 'given_name'), getAttribute(user, 'family_name')]
          .filter(Boolean)
          .join(' ') ||
        email ||
        username;

      const groupsResult = await client.send(
        new AdminListGroupsForUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
        })
      );

      const roles = (groupsResult.Groups ?? [])
        .map((group) => group.GroupName)
        .filter(Boolean);

      return {
        id: username,
        username,
        email,
        name,
        joined: formatDate(user.UserCreateDate),
        online: false,
        status: user.UserStatus ?? 'UNKNOWN',
        enabled: user.Enabled ?? true,
        roles: roles.length ? roles : ['Member'],
      };
    })
  );

  console.log('Total users returned to dashboard:', users.length);

  return users;
}

async function updateUserRoles(username: string, roles: string[]) {
  if (!USER_POOL_ID) {
    throw new Error('Missing AMPLIFY_AUTH_USERPOOL_ID');
  }

  if (!username) {
    throw new Error('Username is required');
  }

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
    .map((group) => group.GroupName)
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
  console.log('Admin user management invoked', {
    fieldName: event.info?.fieldName,
    callerGroups: getCallerGroups(event),
  });

  assertAdminAccess(event);

  switch (event.info.fieldName) {
    case 'listAdminUsers':
      return await listAllUsers();

    case 'updateUserRoles':
      return await updateUserRoles(event.arguments.username, event.arguments.roles);

    default:
      throw new Error(`Unknown field: ${event.info.fieldName}`);
  }
};
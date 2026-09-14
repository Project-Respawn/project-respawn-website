export function normalizeAdminUser(user = {}) {
  return {
    cognitoSub: String(user.cognitoSub || ''),
    username: String(user.username || ''),
    displayName: String(user.name || user.username || user.email || 'Unknown user'),
    email: String(user.email || ''),
    status: String(user.status || (user.enabled === false ? 'Disabled' : 'Enabled')),
    enabled: user.enabled !== false,
  };
}

export function filterAdminUsers(users, searchQuery) {
  const query = String(searchQuery || '').trim().toLowerCase();
  if (!query) return [];
  return (Array.isArray(users) ? users : [])
    .map(normalizeAdminUser)
    .filter((user) => user.cognitoSub && [user.displayName, user.username, user.email]
      .some((value) => value.toLowerCase().includes(query)));
}

export function helperFormForUser(user, helpers = []) {
  const selected = normalizeAdminUser(user);
  const existing = (Array.isArray(helpers) ? helpers : [])
    .find((helper) => helper.userId === selected.cognitoSub);
  return {
    userId: selected.cognitoSub,
    displayName: existing?.displayName || selected.displayName,
    email: existing?.email || selected.email,
    permissionKeys: [...(existing?.permissionKeys || [])],
  };
}

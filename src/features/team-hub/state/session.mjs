// Constructed only on domain entry. Shell must call reset on logout/account switch.
export function createTeamHubState() {
  let identity = null;
  const values = new Map();
  return Object.freeze({
    selectIdentity(next) { if (next !== identity) values.clear(); identity = next; },
    set(key, value) { if (!identity) throw new Error('UNAUTHENTICATED'); values.set(key, structuredClone(value)); },
    get(key) { return structuredClone(values.get(key)); },
    reset() { identity = null; values.clear(); },
  });
}

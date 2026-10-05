export async function createTeamHubSession(options) {
  const [{ createTeamHubClient }, { createTeamHubState }] = await Promise.all([import('../api/client.mjs'), import('../state/session.mjs')]);
  return { client: createTeamHubClient(options), state: createTeamHubState() };
}

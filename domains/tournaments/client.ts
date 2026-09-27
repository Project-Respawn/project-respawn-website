import {assertPreview, type Preview} from './preview/contract.js';
export interface TournamentEndpoint {
  domainOwner: 'Tournaments'; environment: 'Ntgre'; account: '058264289478'; region: 'eu-north-1';
  stackName: 'ProjectRespawn-Tournaments-Ntgre'; status: 'DEPLOYED'; endpoint: string;
  authMode: 'COGNITO_JWT_ACCESS_TOKEN'; contractVersion: 'tournament-preview.v1'; deploymentRevision: string;
}
// Call this only when the future lazy Tournament domain loads. No global SDK/config side effects.
export function createTournamentClient(config: TournamentEndpoint, getAccessToken: () => Promise<string>, fetcher: typeof fetch = fetch) {
  if (config.domainOwner !== 'Tournaments' || config.environment !== 'Ntgre' || config.account !== '058264289478' || config.region !== 'eu-north-1' || config.stackName !== 'ProjectRespawn-Tournaments-Ntgre' || config.status !== 'DEPLOYED' || config.authMode !== 'COGNITO_JWT_ACCESS_TOKEN' || config.contractVersion !== 'tournament-preview.v1' || !/^[a-f0-9]{64}$/.test(config.deploymentRevision) || !/^https:\/\/[a-z0-9]+\.execute-api\.eu-north-1\.amazonaws\.com$/.test(config.endpoint)) throw new Error('Invalid Tournament endpoint');
  return {async preview(): Promise<Preview> {
    const token = await getAccessToken(); if (!token) throw new Error('Access token required');
    const response = await fetcher(`${config.endpoint}/v1/tournaments/preview`, {method: 'GET', headers: {Authorization: `Bearer ${token}`}});
    if (!response.ok) throw new Error(`Tournament request failed (${response.status})`);
    const body: unknown = await response.json(); assertPreview(body);
    if (body.revision !== config.deploymentRevision) throw new Error('Tournament revision mismatch');
    return body;
  }};
}

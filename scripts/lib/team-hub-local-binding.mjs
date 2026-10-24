import { resolve } from 'node:path';

// Only the development server may restore the previously accepted Ntgre client.
// Hosted builds retain their existing adapter and never inherit this binding.
export function localTeamHubAliases({ command, outputs, core, manifest, activation, root }) {
  if (command !== 'serve') return [];
  const environment = core?.environmentContract;
  if (environment?.environment !== 'Ntgre' || environment.account !== '058264289478' || environment.region !== 'eu-north-1'
    || environment.poolId !== 'eu-north-1_n24iLL7QE' || environment.clientId !== '1iq7ovjaf7d16imdvbqgfgvf86'
    || outputs?.auth?.user_pool_id !== environment.poolId || outputs.auth.user_pool_client_id !== environment.clientId
    || manifest?.environment !== 'Ntgre' || manifest.account !== environment.account || manifest.region !== environment.region
    || manifest.status !== 'DEPLOYED' || manifest.apiId !== 't54b88casf'
    || manifest.endpoint !== 'https://t54b88casf.execute-api.eu-north-1.amazonaws.com'
    || activation?.mode !== 'TARGET_WRITER' || activation.epoch !== 5 || activation.reviewed !== true
    || activation.acceptedManifestSha256 !== '3c4a04c630636d11a3235314c87699aa406b2451fd15a29e1d7be1cd5ba01bdf') {
    throw new Error('Local Team Hub environment does not match the accepted Ntgre cutover. Do not reopen Legacy or change sandbox outputs.');
  }
  const service = resolve(root, 'src/features/team-hub/services/independent-service.mjs');
  return [
    { find: /^(?:.*\/)?teamHub\.service\.js$/, replacement: service },
    { find: /^(?:.*\/)?migration-mode\.mjs$/, replacement: service },
    { find: /^(?:.*\/)?frontend-cutover\.PROPOSAL\.json$/, replacement: resolve(root, 'config/domains/team-hub/frontend-development.Ntgre.json') },
  ];
}

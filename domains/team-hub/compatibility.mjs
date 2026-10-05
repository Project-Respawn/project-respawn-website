import { operations, fail } from './contracts.mjs';
// Mapping only: it never calls Legacy or turns Legacy identity/payload JSON into authority.
export const legacyMapping = Object.freeze(Object.fromEntries(Object.entries(operations).map(([action, spec]) => [action, { gateway: spec.runtime === 'read' ? 'readTeamHub' : 'mutateTeamHub', method: spec.method, path: spec.path }])));
export function teamIdForSlug(slug) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 48) fail('INVALID_INPUT');
  return `team:${slug}`;
}
export const approvedDifferences = Object.freeze([
  'Player responses exclude all Coach fields',
  'Manager responses exclude Coach-private notes; only the authoring active Coach sees them',
  'Inactive target Players cannot receive competitive mutations',
  'Required expected versions, authorization epoch and idempotency key on commands',
  'Local-only approval, overall feedback, recommendations and flex confirmation excluded',
  'Directory contract replaces Cognito administration; no raw account email in results',
  'Logo intent/commit are synthetic only; no upload URL or storage until separately reviewed',
]);

import { createHash } from 'node:crypto';
import { fail } from './contracts.mjs';
const issuerHash = issuer => createHash('sha256').update(issuer).digest('hex');
/** Offline physical-key model, not a DynamoDB adapter or migration script. */
export function operationalItems(aggregate) {
  if (!aggregate) return new Map();
  const { team } = aggregate;
  const pk = `TEAM#${team.id}`;
  const result = new Map();
  const put = (PK, SK, value) => result.set(`${PK}|${SK}`, { PK, SK, ...structuredClone(value) });
  put(pk, 'META', { ...team, StatusPK: `STATUS#${team.status}`, StatusSK: `TEAM#${team.id}` });
  put(`SLUG#${team.slug}`, 'TEAM', { teamId: team.id });
  for (const member of Object.values(aggregate.memberships)) put(pk, `MEMBER#${member.subject}`, { ...member, SubjectPK: `SUBJECT#${issuerHash(member.issuer)}#${member.subject}`, SubjectSK: `TEAM#${team.id}` });
  for (const slot of aggregate.roster) {
    if (slot.slotType === 'STARTER') { put(pk, `STARTER#${slot.gameRoleKey}`, slot); put(pk, `STARTER_PLAYER#${slot.membershipId}`, slot); }
    else put(pk, `SUB#${slot.membershipId}#${slot.gameRoleKey}`, slot);
  }
  for (const entry of Object.values(aggregate.entries)) put(pk, `POOL#${entry.membershipId}#${entry.championId}`, entry);
  for (const entry of Object.values(aggregate.assessments)) put(pk, `ASSESSMENT#${entry.membershipId}#${entry.championId}`, entry);
  for (const entry of Object.values(aggregate.privateNotes)) put(pk, `COACH_PRIVATE#${entry.membershipId}#${entry.championId}`, entry);
  for (const [id, intent] of Object.entries(aggregate.intents ?? {})) put(pk, `INTENT#${id}`, intent);
  return result;
}
export function transactionShape(before, after, conditions) {
  const previous = operationalItems(before); const next = operationalItems(after);
  const writes = [...new Set([...previous.keys(), ...next.keys()])].filter(key => JSON.stringify(previous.get(key)) !== JSON.stringify(next.get(key))).map(key => ({ key, action: next.has(key) ? 'Put' : 'Delete' }));
  const actorKey = `TEAM#${conditions.teamId}|MEMBER#${conditions.actor.subject}`;
  // Aggregate version/epoch check is coalesced into META write; actor condition into its write
  // when modified. Audit and idempotency are separate journal items in the same transaction.
  const conditionChecks = writes.some(w => w.key === actorKey) ? [] : [actorKey];
  const count = writes.length + conditionChecks.length + 2;
  if (count > 25 || Buffer.byteLength(JSON.stringify([...next.values()])) > 4 * 1024 * 1024) fail('LIMIT_EXCEEDED');
  return { writes, conditionChecks, journalWrites: 2, count, coalescedMetaCondition: { teamVersion: conditions.teamVersion, authorizationEpoch: conditions.epoch }, membershipVersion: conditions.membershipVersion };
}

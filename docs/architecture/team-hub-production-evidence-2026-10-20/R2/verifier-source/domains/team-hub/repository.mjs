import { fail } from './contracts.mjs';
import { transactionShape } from './storage-plan.mjs';
export const identityKey = actor => `${actor.issuer}|${actor.subject}`;
export const membershipId = (teamId, subject) => `team-membership:${teamId}:${subject}`;
export const entryKey = (memberId, champion) => `${memberId}|${champion}`;
export const activeMembership = (aggregate, actor) => {
  const member = aggregate?.memberships[membershipId(aggregate.team.id, actor.subject)];
  return member?.issuer === actor.issuer && member.status === 'ACTIVE' ? member : undefined;
};
export class MemoryRepository {
  #state;
  constructor(state = { teams: {}, journal: {}, audit: [] }) { this.#state = structuredClone(state); this.beforeCommit = undefined; this.candidates = undefined; }
  snapshot() { return structuredClone(this.#state); }
  readTeamStrong(id) { return structuredClone(this.#state.teams[id]); }
  readMembershipStrong(id, actor) { return structuredClone(activeMembership(this.#state.teams[id], actor)); }
  readRosterStrong(id) { return structuredClone(this.#state.teams[id]?.roster ?? []); }
  readChampionsStrong(id) { return structuredClone(Object.values(this.#state.teams[id]?.entries ?? {})); }
  readAssessmentsStrong(id) { return structuredClone(Object.values(this.#state.teams[id]?.assessments ?? {})); }
  listCandidateTeamIds() { return this.candidates ?? Object.keys(this.#state.teams).sort(); }
  // Explicit test-only race fixture; never exported by a deployed entrypoint.
  injectRace(mutator) { const draft = this.snapshot(); mutator(draft); this.#state = draft; }
  async transact(c, authorize, mutate) {
    if (this.beforeCommit) { const hook = this.beforeCommit; this.beforeCommit = undefined; await hook(); }
    // No await between authority recheck and atomic publication.
    authorize(this.#state);
    const journalKey = `${identityKey(c.actor)}|${c.operation}|${c.key}`;
    const previous = this.#state.journal[journalKey];
    if (previous && previous.expiresAt > c.now) {
      if (previous.digest !== c.digest) fail('CONFLICT');
      return structuredClone(previous.response);
    }
    const current = this.#state.teams[c.teamId];
    if ((current?.team.version ?? 0) !== c.teamVersion || (current?.team.authorizationEpoch ?? 0) !== c.epoch || (activeMembership(current, c.actor)?.version ?? 0) !== c.membershipVersion) fail('CONFLICT');
    const draft = this.snapshot();
    const response = mutate(draft);
    // Prove the offline mutation fits the reviewed bounded transaction shape before publication.
    this.lastTransaction = transactionShape(current, draft.teams[c.teamId], c);
    draft.journal[journalKey] = { actor: c.actor, operation: c.operation, digest: c.digest, response: structuredClone(response), expiresAt: c.now + 86400 };
    draft.audit.push({ actor: c.actor, operation: c.operation, teamId: c.teamId, requestId: c.requestId, resultingVersion: draft.teams[c.teamId].team.version, at: c.now });
    this.#state = draft;
    return structuredClone(response);
  }
}

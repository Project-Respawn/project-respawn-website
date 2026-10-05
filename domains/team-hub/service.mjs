import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { fail, operations, validateRequest, validateResponse, teamDTO, playerDTO, membershipDTO, rosterDTO, assessmentDTO, privateNoteDTO } from './contracts.mjs';
import { activeMembership, membershipId, entryKey, identityKey } from './repository.mjs';
import { authenticate } from './core.mjs';
const project = (schema, entity) => Object.fromEntries(Object.keys(schema.properties).filter(k => Object.hasOwn(entity, k)).map(k => [k, schema.properties[k].type === 'object' ? project(schema.properties[k], entity[k]) : structuredClone(entity[k])]));
const canonical = value => JSON.stringify(value && typeof value === 'object' ? Array.isArray(value) ? value.map(v => JSON.parse(canonical(v))) : Object.fromEntries(Object.keys(value).sort().map(k => [k, JSON.parse(canonical(value[k]))])) : value);
const digest = value => createHash('sha256').update(canonical(value)).digest('hex');
const adminOps = new Set(['CREATE_TEAM', 'UPDATE_TEAM', 'SET_MANAGER', 'SET_TEAM_PLAN']);
const brandingOps = new Set(['REQUEST_TEAM_LOGO_UPLOAD', 'COMMIT_TEAM_LOGO', 'REMOVE_TEAM_LOGO']);
const memberOps = { MANAGE_MEMBER: ['MANAGER'], SET_ROSTER_SLOT: ['MANAGER'], LIST_MY_CHAMPION_POOL: ['PLAYER'], UPSERT_MY_CHAMPION: ['PLAYER'], DELETE_MY_CHAMPION: ['PLAYER'], LIST_TEAM_CHAMPION_POOLS: ['MANAGER', 'COACH'], GET_PLAYER_COMPETITIVE_DETAIL: ['MANAGER', 'COACH'], UPSERT_COACH_ASSESSMENT: ['COACH'] };
export class TeamService {
  constructor({ repository, core, environment, cursorSecret, clock = () => Math.floor(Date.now() / 1000) }) {
    if (!cursorSecret || cursorSecret.length < 32) throw new Error('Explicit cursor signing material required (synthetic for offline tests)');
    Object.assign(this, { repository, core, environment, cursorSecret, clock });
  }
  authorize(op, actor, aggregate) {
    const member = activeMembership(aggregate, actor);
    if (adminOps.has(op)) { if (!this.core.allows(actor, 'teams.admin')) fail('FORBIDDEN'); return member; }
    if (brandingOps.has(op)) { if (!this.core.allows(actor, 'teams.branding.manage')) fail('FORBIDDEN'); if (!aggregate) fail('NOT_FOUND'); return member; }
    if (op === 'LIST_MY_TEAMS') return member;
    if (op === 'SEARCH_TEAM_ASSIGNABLE_USERS' && this.core.allows(actor, 'teams.admin')) { if (!aggregate) fail('NOT_FOUND'); return member; }
    if (op === 'GET_TEAM_HUB' && (this.core.allows(actor, 'teams.admin') || this.core.allows(actor, 'teams.branding.manage'))) { if (!aggregate) fail('NOT_FOUND'); return member; }
    if (!member || !aggregate || aggregate.team.status !== 'ACTIVE') fail('FORBIDDEN');
    const roles = op === 'SEARCH_TEAM_ASSIGNABLE_USERS' ? ['MANAGER'] : memberOps[op];
    if (roles && !roles.includes(member.role)) fail('FORBIDDEN');
    return member;
  }
  page(items, op, actor, req) {
    const scope = digest({ op, actor, teamId: req.teamId ?? '', status: req.status ?? '', limit: req.limit ?? 25 });
    let offset = 0;
    if (req.nextToken) {
      try {
        const [encoded, signature, extra] = req.nextToken.split('.');
        const expected = createHmac('sha256', this.cursorSecret).update(encoded).digest('hex');
        if (extra || signature?.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) fail('INVALID_INPUT');
        const cursor = JSON.parse(Buffer.from(encoded, 'base64url').toString());
        if (cursor.scope !== scope || cursor.expiresAt <= this.clock() || !Number.isSafeInteger(cursor.offset) || cursor.offset < 0) fail('INVALID_INPUT');
        offset = cursor.offset;
      } catch { fail('INVALID_INPUT'); }
    }
    const limit = req.limit ?? 25;
    const result = { items: items.slice(offset, offset + limit) };
    if (offset + limit < items.length) {
      const encoded = Buffer.from(JSON.stringify({ scope, offset: offset + limit, expiresAt: this.clock() + 300 })).toString('base64url');
      result.nextToken = `${encoded}.${createHmac('sha256', this.cursorSecret).update(encoded).digest('hex')}`;
    }
    return result;
  }
  competitive(aggregate, member, viewer) {
    if (!member || member.status !== 'ACTIVE' || member.role !== 'PLAYER') fail('NOT_FOUND');
    const result = { membershipId: member.id, entries: Object.values(aggregate.entries).filter(e => e.membershipId === member.id).map(e => project(playerDTO, e)), assessments: Object.values(aggregate.assessments).filter(e => e.membershipId === member.id).map(e => project(assessmentDTO, e)) };
    if (viewer.role === 'COACH') result.privateNotes = Object.values(aggregate.privateNotes).filter(e => e.membershipId === member.id && identityKey(e.author) === identityKey(viewer)).map(e => project(privateNoteDTO, e));
    return result;
  }
  async execute(op, request, claims, requestId = 'offline-request') {
    const req = validateRequest(op, request);
    const actor = authenticate(claims, this.environment, this.clock());
    const teamId = op === 'CREATE_TEAM' ? `team:${req.slug}` : req.teamId;
    // Slugs map deterministically to stable legacy team IDs; no second caller identity source.
    const aggregate = teamId ? await this.repository.readTeamStrong(teamId) : undefined;
    const member = this.authorize(op, actor, aggregate);
    if (operations[op].runtime === 'read') {
      let response;
      if (op === 'LIST_MY_TEAMS') {
        const admin = this.core.allows(actor, 'teams.admin');
        const candidates = await this.repository.listCandidateTeamIds(actor);
        const snapshots = await Promise.all(candidates.map(id => this.repository.readTeamStrong(id)));
        const items = snapshots.filter(a => a && (admin || activeMembership(a, actor)) && (!req.status || a.team.status === req.status)).map(a => project(teamDTO, a.team));
        response = this.page(items, op, actor, req);
        // Recheck returned candidates after asynchronous repository reads. No GSI authorizes access.
        for (const item of response.items) {
          const current = await this.repository.readTeamStrong(item.id);
          if (!current || (!admin && !activeMembership(current, actor))) fail('FORBIDDEN');
          if (current.team.version !== item.version) fail('CONFLICT');
        }
        if (admin && !this.core.allows(actor, 'teams.admin')) fail('FORBIDDEN');
      } else if (op === 'GET_TEAM_HUB') response = { team: project(teamDTO, aggregate.team), memberships: Object.values(aggregate.memberships).filter(m => m.status === 'ACTIVE').map(m => project(membershipDTO, m)), roster: aggregate.roster.map(r => project(rosterDTO, r)) };
      else if (op === 'LIST_MY_CHAMPION_POOL') response = this.page(Object.values(aggregate.entries).filter(e => e.membershipId === member.id).map(e => project(playerDTO, e)), op, actor, req);
      else if (op === 'LIST_TEAM_CHAMPION_POOLS') response = this.page(Object.values(aggregate.memberships).filter(m => m.role === 'PLAYER' && m.status === 'ACTIVE').map(m => this.competitive(aggregate, m, member)), op, actor, req);
      else if (op === 'GET_PLAYER_COMPETITIVE_DETAIL') response = this.competitive(aggregate, aggregate.memberships[req.membershipId], member);
      else response = { items: this.core.search(actor, req.query, req.limit).map(item => ({ subject: item.subject, displayName: item.displayName })) };
      // No async gap between final authoritative check and projection return.
      if (teamId) {
        const current = await this.repository.readTeamStrong(teamId);
        const latestMember = this.authorize(op, actor, current);
        if (current.team.authorizationEpoch !== aggregate.team.authorizationEpoch || current.team.version !== aggregate.team.version || latestMember?.version !== member?.version) fail('CONFLICT');
      }
      return validateResponse(op, response);
    }
    let target;
    if (['SET_MANAGER', 'MANAGE_MEMBER'].includes(op) && req.action === 'ASSIGN') target = this.core.resolve(actor, req.targetAccount);
    const conditions = { teamId, teamVersion: req.expectedTeamVersion ?? 0, epoch: req.expectedAuthorizationEpoch ?? 0, membershipVersion: req.expectedMembershipVersion ?? 0, actor, operation: op, key: req.idempotencyKey, digest: digest(req), now: this.clock(), requestId };
    return this.repository.transact(conditions, state => {
      this.authorize(op, actor, state.teams[teamId]);
      if (target && this.core.resolve(actor, req.targetAccount).subject !== target.subject) fail('CONFLICT');
    }, state => {
      if (op === 'CREATE_TEAM') {
        if (state.teams[teamId]) fail('CONFLICT');
        state.teams[teamId] = { team: { id: teamId, slug: req.slug, name: req.name, gameKey: req.gameKey, status: 'ACTIVE', version: 1, authorizationEpoch: 0, rosterVersion: 0, settings: { plan: 'FREE', logoAssetId: '' } }, memberships: {}, roster: [], entries: {}, assessments: {}, privateNotes: {}, intents: {} };
        return validateResponse(op, { team: project(teamDTO, state.teams[teamId].team) });
      }
      const a = state.teams[teamId];
      if (!a) fail('NOT_FOUND');
      const m = activeMembership(a, actor);
      const version = (actual, expected) => { if (actual !== expected) fail('CONFLICT'); };
      const clearRoster = id => { const before = a.roster.length; a.roster = a.roster.filter(r => r.membershipId !== id); if (before !== a.roster.length) a.team.rosterVersion++; };
      let extra = {};
      if (op === 'UPDATE_TEAM') { a.team.name = req.name; a.team.status = req.status; }
      if (['SET_MANAGER', 'MANAGE_MEMBER'].includes(op)) {
        const id = req.action === 'ASSIGN' ? membershipId(teamId, target.subject) : req.targetMembershipId;
        const previous = a.memberships[id];
        version(previous?.version ?? 0, req.expectedTargetMembershipVersion);
        const role = op === 'SET_MANAGER' ? 'MANAGER' : req.role;
        if (req.action === 'REVOKE') {
          if (!previous || previous.role !== role || previous.status !== 'ACTIVE') fail('NOT_FOUND');
          previous.status = 'INACTIVE'; previous.version++; clearRoster(id);
        } else {
          if (previous?.status === 'ACTIVE' && previous.role !== 'PLAYER' && previous.role !== role) fail('CONFLICT');
          if (role !== 'PLAYER') {
            for (const old of Object.values(a.memberships).filter(v => v.role === role && v.status === 'ACTIVE' && v.id !== id)) { old.status = 'INACTIVE'; old.version++; clearRoster(old.id); }
            clearRoster(id);
          }
          if (!previous && Object.keys(a.memberships).length >= 50) fail('LIMIT_EXCEEDED');
          a.memberships[id] = { id, teamId, issuer: actor.issuer, subject: target.subject, displayName: target.displayName, role, status: 'ACTIVE', version: (previous?.version ?? 0) + 1 };
        }
        a.team.authorizationEpoch++;
        extra = { membership: project(membershipDTO, a.memberships[id]) };
      }
      if (op === 'SET_ROSTER_SLOT') {
        const player = a.memberships[req.membershipId];
        if (!player || player.status !== 'ACTIVE' || player.role !== 'PLAYER') fail('FORBIDDEN');
        version(player.version, req.expectedTargetMembershipVersion); version(a.team.rosterVersion, req.expectedRosterVersion);
        if (req.action === 'ASSIGN') {
          if (a.roster.some(r => r.slotType === req.slotType && ((req.slotType === 'STARTER' && (r.gameRoleKey === req.gameRoleKey || r.membershipId === req.membershipId)) || (r.gameRoleKey === req.gameRoleKey && r.membershipId === req.membershipId)))) fail('CONFLICT');
          if (a.roster.length >= 20) fail('LIMIT_EXCEEDED');
          a.roster.push(project(rosterDTO, req));
        } else a.roster = a.roster.filter(r => !(r.membershipId === req.membershipId && r.gameRoleKey === req.gameRoleKey && r.slotType === req.slotType));
        a.team.rosterVersion++; extra = { roster: a.roster.map(r => project(rosterDTO, r)) };
      }
      if (['UPSERT_MY_CHAMPION', 'DELETE_MY_CHAMPION'].includes(op)) {
        const key = entryKey(m.id, req.championId); const previous = a.entries[key];
        version(previous?.version ?? 0, req.expectedEntryVersion);
        if (op === 'UPSERT_MY_CHAMPION') {
          if (!previous && Object.values(a.entries).filter(e => e.membershipId === m.id).length >= 50) fail('LIMIT_EXCEEDED');
          a.entries[key] = project(playerDTO, { ...req, membershipId: m.id, version: (previous?.version ?? 0) + 1 }); extra = { entry: project(playerDTO, a.entries[key]) };
        } else { delete a.entries[key]; delete a.assessments[key]; delete a.privateNotes[key]; extra = { deleted: true, championId: req.championId }; }
      }
      if (op === 'UPSERT_COACH_ASSESSMENT') {
        const player = a.memberships[req.membershipId];
        if (!player || player.status !== 'ACTIVE' || player.role !== 'PLAYER') fail('FORBIDDEN');
        version(player.version, req.expectedTargetMembershipVersion);
        const key = entryKey(player.id, req.championId); if (!a.entries[key]) fail('NOT_FOUND');
        version(a.assessments[key]?.version ?? 0, req.expectedAssessmentVersion);
        const next = (a.assessments[key]?.version ?? 0) + 1;
        a.assessments[key] = { teamId, membershipId: player.id, championId: req.championId, teamVisible: req.teamVisible, version: next };
        a.privateNotes[key] = { teamId, membershipId: player.id, championId: req.championId, author: actor, privateNote: req.privateNote, version: next };
        extra = { assessment: project(assessmentDTO, a.assessments[key]), privateNote: project(privateNoteDTO, a.privateNotes[key]) };
      }
      if (op === 'SET_TEAM_PLAN') a.team.settings.plan = req.plan;
      if (op === 'REQUEST_TEAM_LOGO_UPLOAD') {
        // Synthetic intent only. There is no upload URL, bucket or external side effect.
        const intentId = `synthetic:${digest({ actor, teamId, key: req.idempotencyKey }).slice(0, 32)}`;
        a.intents ??= {}; a.intents[intentId] = { actor: identityKey(actor), teamId, expiresAt: this.clock() + 300, verified: false };
        extra = { intentId, expiresAt: a.intents[intentId].expiresAt };
      }
      if (op === 'COMMIT_TEAM_LOGO') {
        const intent = a.intents?.[req.intentId];
        if (!intent || intent.actor !== identityKey(actor) || intent.teamId !== teamId || intent.expiresAt <= this.clock() || !intent.verified) fail('FORBIDDEN');
        a.team.settings.logoAssetId = req.intentId; delete a.intents[req.intentId];
      }
      if (op === 'REMOVE_TEAM_LOGO') a.team.settings.logoAssetId = '';
      a.team.version++;
      return validateResponse(op, { ...extra, team: project(teamDTO, a.team) });
    });
  }
}

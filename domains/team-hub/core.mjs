import { fail } from './contracts.mjs';
import { identityKey } from './repository.mjs';
export { authenticate } from './auth.mjs';
/** Deterministic offline Core contract adapter. Contains synthetic accounts only. */
export class SyntheticCore {
  constructor(environment, accounts = []) { this.environment = environment; this.accounts = structuredClone(accounts); this.grants = new Map(); this.available = true; this.decisionVersion = 0; }
  check(actor) { if (!this.available) fail('DEPENDENCY_UNAVAILABLE'); if (actor.issuer !== this.environment.issuer) fail('UNAUTHENTICATED'); }
  grant(actor, capabilities) { this.grants.set(identityKey(actor), new Set(capabilities)); this.decisionVersion++; }
  allows(actor, capability) { this.check(actor); return this.grants.get(identityKey(actor))?.has(capability) ?? false; }
  decision(actor, capability, now) { return { allowed: this.allows(actor, capability), decisionVersion: this.decisionVersion, evaluatedAt: now, expiresAt: now }; }
  search(actor, query, limit = 10) {
    this.check(actor);
    return this.accounts.filter(a => a.active && (a.account.toLowerCase().includes(query.toLowerCase()) || a.displayName.toLowerCase().includes(query.toLowerCase()))).slice(0, Math.min(limit, 10)).map(a => ({ subject: a.subject, displayName: a.displayName }));
  }
  resolve(actor, account) {
    this.check(actor);
    const match = this.accounts.find(a => a.active && a.account.toLowerCase() === account.toLowerCase());
    if (!match) fail('NOT_FOUND');
    return { subject: match.subject, displayName: match.displayName };
  }
  summary(actor, subject) { this.check(actor); const a = this.accounts.find(a => a.active && a.subject === subject); if (!a) fail('NOT_FOUND'); return { subject: a.subject, displayName: a.displayName }; }
}

/** Canonical identity is issuer + subject; email is only an exact directory lookup intent. */
export type Identity = { issuer: string; subject: string };
export type Awaitable<T> = T | Promise<T>;
export type Role = 'MANAGER' | 'COACH' | 'PLAYER';
export type GameRole = 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';
export type Provenance = { source: string; sourceId: string; importedAt: number }; // never public
export interface TeamSettings { plan: 'FREE' | 'PRO'; logoAssetId: string }
export interface Team { id: string; slug: string; name: string; gameKey: 'LEAGUE_OF_LEGENDS'; status: 'ACTIVE' | 'INACTIVE'; version: number; authorizationEpoch: number; rosterVersion: number; settings: TeamSettings; provenance?: Provenance }
export interface Membership extends Identity { id: string; teamId: string; displayName: string; role: Role; status: 'ACTIVE' | 'INACTIVE'; version: number; provenance?: Provenance }
export interface Roster { membershipId: string; gameRoleKey: GameRole; slotType: 'STARTER' | 'SUBSTITUTE' }
export interface ChampionPoolEntry { teamId: string; membershipId: string; championId: string; gameRoleKey: GameRole; comfortLevel: 'S' | 'A' | 'B' | 'C' | 'D'; priority: 'LOW' | 'NORMAL' | 'HIGH'; competitiveReady: boolean; playerNotes: string; version: number; provenance?: Provenance }
export interface CoachAssessment { teamId: string; membershipId: string; championId: string; teamVisible: string; version: number }
export interface CoachPrivateNote { teamId: string; membershipId: string; championId: string; author: Identity; privateNote: string; version: number }
export interface AuditEvent { actor: Identity; operation: string; teamId: string; requestId: string; resultingVersion: number; at: number }
export interface IdempotencyRecord { actor: Identity; operation: string; digest: string; response: unknown; expiresAt: number }
export interface Aggregate { team: Team; memberships: Record<string, Membership>; roster: Roster[]; entries: Record<string, ChampionPoolEntry>; assessments: Record<string, CoachAssessment>; privateNotes: Record<string, CoachPrivateNote> }
export interface State { teams: Record<string, Aggregate>; journal: Record<string, IdempotencyRecord>; audit: AuditEvent[] }
export interface TransactionConditions { teamId: string; teamVersion: number; epoch: number; actor: Identity; membershipVersion: number; operation: string; key: string; digest: string; now: number; requestId: string }
/** Implementations MUST check all conditions and commit domain writes, audit and idempotency atomically.
 * The offline callback is synchronous and pure. A future DynamoDB adapter must compile a bounded
 * write plan, coalescing checks with updates of the same item; this is NOT a live adapter. */
export interface TeamRepository {
  readTeamStrong(teamId: string): Awaitable<Aggregate | undefined>;
  readMembershipStrong(teamId: string, actor: Identity): Awaitable<Membership | undefined>;
  readRosterStrong(teamId: string): Awaitable<Roster[]>;
  readChampionsStrong(teamId: string): Awaitable<ChampionPoolEntry[]>;
  readAssessmentsStrong(teamId: string): Awaitable<CoachAssessment[]>;
  listCandidateTeamIds(actor: Identity): Awaitable<string[]>; // locator only, never authority
  transact(conditions: TransactionConditions, authorize: (state: State) => void, mutate: (state: State) => unknown): Promise<unknown>;
}
export interface CoreDirectory { search(actor: Identity, query: string, limit: number): Array<{ subject: string; displayName: string }>; resolve(actor: Identity, account: string): { subject: string; displayName: string } }
export interface CoreAuthorization { allows(actor: Identity, capability: 'teams.admin' | 'teams.branding.manage'): boolean }
export interface CoreProfile { summary(actor: Identity, subject: string): { subject: string; displayName: string } }

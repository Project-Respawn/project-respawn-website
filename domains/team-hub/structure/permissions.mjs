// Proposed v2 server policy. Never trust these inputs directly from a browser.
// Call against the current aggregate inside the authority-checked transaction.
import {validPermissionList} from './feature-permissions.mjs';
export const delegatedPermissions = Object.freeze([
  'roster.manage', 'members.manage', 'pools.read', 'reviews.read', 'reviews.write',
  'settings.manage', 'staff.manage', 'permissions.manage',
]);
const reserved = new Set(['team.delete', 'manager.replace', 'ownership.transfer']);
const known = new Set([...delegatedPermissions, ...reserved, 'team.read']);
const active = (state, id) => state.memberships.find(m => m.id === id && m.status === 'ACTIVE');
const head = (state, id) => state.assignments.some(a => a.membershipId === id && a.positionKey === 'HEAD_COACH' && a.status === 'ACTIVE');
const manager = (state, id) => state.managerMembershipId === id;

export function permits(state, {actorMembershipId, platformAdmin = false}, action, targetMembershipId) {
  if (!known.has(action) || state.status !== 'ACTIVE') return false;
  // platformAdmin must be a fresh, server-verified Core decision.
  if (platformAdmin === true) return true;
  const actor = active(state, actorMembershipId);
  if (!actor) return false;
  if (action === 'team.delete') return false; // explicitly reserved for global Admins
  if (manager(state, actor.id)) return true;
  if (reserved.has(action)) return false;
  // A coach/delegate cannot remove, demote or change the Manager's grants.
  if (targetMembershipId && manager(state, targetMembershipId) && action !== 'team.read') return false;
  if (action === 'team.read') return true;
  if (head(state, actor.id)) return true;
  if (targetMembershipId && head(state, targetMembershipId)) return false;
  // Governance capabilities cannot be delegated to assistants or support staff.
  if (action === 'permissions.manage') return false;
  return (state.grants?.[actor.id] ?? []).includes(action);
}

export function setMemberPermissions(state, actor, targetMembershipId, permissions) {
  if (!permits(state, actor, 'permissions.manage', targetMembershipId)) throw Error('FORBIDDEN');
  if (!active(state, targetMembershipId)) throw Error('INACTIVE_MEMBER');
  if (!validPermissionList(permissions)) throw Error('INVALID_PERMISSION');
  // Protected Manager/Head Coach powers are inherent; cannot be downgraded by grants.
  if (manager(state, targetMembershipId) || head(state, targetMembershipId)) throw Error('PROTECTED_ROLE');
  return {...state, grants:{...state.grants, [targetMembershipId]:[...new Set(permissions)].sort()}};
}

export function revokeMember(state, actor, targetMembershipId) {
  if (!permits(state, actor, 'members.manage', targetMembershipId)) throw Error('FORBIDDEN');
  // Replacing/transferring the Manager is a distinct atomic operation.
  if (manager(state, targetMembershipId)) throw Error('TRANSFER_REQUIRED');
  if (!active(state, targetMembershipId)) throw Error('INACTIVE_MEMBER');
  const grants = {...state.grants}; delete grants[targetMembershipId];
  return {...state, grants,
    memberships:state.memberships.map(m => m.id === targetMembershipId ? {...m, status:'INACTIVE'} : m),
    assignments:state.assignments.map(a => a.membershipId === targetMembershipId ? {...a,status:'INACTIVE'} : a),
    roster:state.roster.filter(r => r.membershipId !== targetMembershipId),
    // Personal pools are retained. Every team read must independently authorize membership.
  };
}

export function transferOwnership(state, actor, targetMembershipId) {
  if (!permits(state, actor, 'ownership.transfer')) throw Error('FORBIDDEN');
  if (!active(state, targetMembershipId)) throw Error('INACTIVE_MEMBER');
  if (targetMembershipId === state.managerMembershipId) throw Error('ALREADY_MANAGER');
  // Single authoritative pointer: never two concurrent owners. The previous
  // Manager stays a member but loses inherent Manager powers immediately.
  return {...state, managerMembershipId:targetMembershipId};
}

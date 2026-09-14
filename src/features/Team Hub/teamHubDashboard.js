export function buildTeamHubShortcuts(memberships = []) {
  return memberships.flatMap((membership) => {
    const slug = membership.slug;
    const role = membership.context?.teamRole;
    if (!slug || !role) return [];
    if (role === 'PLAYER') return [{ icon: '⚔', title: `Update champion pool — ${membership.name}`, description: membership.assignedPosition ? `Active Player · ${membership.assignedPosition}` : 'Active Player', to: `/team-hub/${slug}/champion-pool` }];
    if (role === 'COACH') return [{ icon: '◆', title: `Review champion pools — ${membership.name}`, description: 'Active Coach', to: `/team-hub/${slug}/coach-review` }];
    if (role === 'MANAGER') return [
      { icon: '◆', title: `Manage team — ${membership.name}`, description: 'Active Manager', to: `/team-hub/${slug}/manage` },
      { icon: '◫', title: `View champion pools — ${membership.name}`, description: 'Read Player pools and Coach assessments', to: `/team-hub/${slug}/coach-review` },
    ];
    return [];
  });
}

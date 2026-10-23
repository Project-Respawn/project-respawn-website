// Deployment adapter: only these reviewed Team Hub actions use the new module.
// All unrelated protocols, fields and actions retain the original handler.
export const readActions = Object.freeze(['GET_TEAM_HUB','LIST_MY_TEAMS','LIST_TEAM_CHAMPION_POOLS','GET_PLAYER_COMPETITIVE_DETAIL']);
export const mutationActions = Object.freeze(['SET_MY_ROLES','SET_ROSTER_SLOT','CREATE_TEAM','SET_MANAGER','MANAGE_MEMBER']);
export function createDispatch({original,loadPatch}) {
  return async (...args) => {
    const [event,context] = args, field = event?.info?.fieldName || event?.fieldName;
    const action = event?.arguments?.action;
    const read = field === 'readTeamHub' && readActions.includes(action);
    const mutation = field === 'mutateTeamHub' && mutationActions.includes(action);
    if (!event?.arguments || (!read && !mutation)) return original(...args);
    try {const patch=await loadPatch();return await (read?patch.routeTeamHubRead(event):patch.routeTeamHubMutation(event));}
    catch(error) {
      const message=error instanceof Error?error.message:'';
      const safe=/^(Team Hub |Invalid |Player already |An active |Active )/.test(message)?message:'Team Hub request failed';
      const requestId=/^[A-Za-z0-9-]{8,128}$/.test(context?.awsRequestId??'')?context.awsRequestId:'';
      throw new Error(safe+(requestId?` (request ${requestId})`:''));
    }
  };
}

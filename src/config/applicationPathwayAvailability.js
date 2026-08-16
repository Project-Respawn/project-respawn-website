export const PATHWAY_AVAILABILITY = Object.freeze({
  ACTIVE: 'ACTIVE', COMING_SOON: 'COMING_SOON', CLOSED: 'CLOSED',
});

export const APPLICATION_PATHWAY_AVAILABILITY = Object.freeze({
  creator: PATHWAY_AVAILABILITY.ACTIVE,
  'competitive-streamer': PATHWAY_AVAILABILITY.CLOSED,
  'competitive-player': PATHWAY_AVAILABILITY.CLOSED,
  'competitive-coaching': PATHWAY_AVAILABILITY.CLOSED,
  'competitive-analysis': PATHWAY_AVAILABILITY.CLOSED,
  therapist: PATHWAY_AVAILABILITY.COMING_SOON,
  trainer: PATHWAY_AVAILABILITY.COMING_SOON,
});

export const APPLICATION_PATHWAY_LABELS = Object.freeze({
  creator: 'Creator Programme', 'competitive-streamer': 'Competitive streamer',
  'competitive-player': 'Competitive player/esports roster', 'competitive-coaching': 'Competitive coaching',
  'competitive-analysis': 'Competitive analysis/support', therapist: 'Therapist', trainer: 'Personal Trainer',
});

export const COMPETITIVE_PATHWAYS = Object.freeze(['competitive-streamer', 'competitive-player', 'competitive-coaching', 'competitive-analysis']);
export const getPathwayAvailability = (pathway, config = APPLICATION_PATHWAY_AVAILABILITY) => config[pathway] || null;
export const canEnterApplicationPathway = (pathway, config = APPLICATION_PATHWAY_AVAILABILITY) => getPathwayAvailability(pathway, config) === PATHWAY_AVAILABILITY.ACTIVE;

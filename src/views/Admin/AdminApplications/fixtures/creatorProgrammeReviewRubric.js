// Frontend-only Creator Programme rubric contract. Internal weights and
// calculations are exposed only in authorised Admin analysis, never reviewer UI.
export const REVIEWER_CONFIRMATIONS = Object.freeze([
  { id: 'not-applicant', label: 'I am not the applicant.' },
  { id: 'no-conflict', label: 'I have no conflict of interest that prevents an impartial review.' },
  { id: 'legitimate-evidence', label: 'I will assess only the application and legitimate public evidence supplied by the applicant.' },
  { id: 'confidentiality', label: 'I will keep the application and review confidential.' },
  { id: 'impartiality', label: 'I understand that personal preferences about games, accents, presentation style or creator popularity must not influence the assessment.' },
]);

export const ELIGIBILITY_CHECKS = Object.freeze([
  { id: 'sections-complete', label: 'Required application sections are complete.' },
  { id: 'links-accessible', label: 'Supplied creator or channel links are accessible.' },
  { id: 'correct-pathway', label: 'The application is for the correct pathway.' },
  { id: 'consent-provided', label: 'Required declarations and consent have been provided.' },
  { id: 'identity-consistent', label: 'Supplied identity and creator information appear internally consistent.' },
  { id: 'no-impersonation', label: 'There is no obvious impersonation or deliberately false information.' },
  { id: 'programme-eligibility', label: 'Currently defined programme eligibility requirements appear to be met.' },
]);

export const ELIGIBILITY_OPTIONS = Object.freeze([
  { value: 'meets', label: 'Meets requirement' },
  { value: 'clarification', label: 'Needs clarification' },
  { value: 'does-not-meet', label: 'Does not meet requirement' },
]);

export const SHARED_SCORE_ANCHORS = Object.freeze([
  { range: '1–2', label: 'Serious deficiency, serious concern or no supporting evidence' },
  { range: '3–4', label: 'Substantially below the expected standard' },
  { range: '5–6', label: 'Partially meets the expected standard' },
  { range: '7–8', label: 'Clearly meets the expected standard' },
  { range: '9', label: 'Strongly exceeds the expected standard' },
  { range: '10', label: 'Exceptional and compelling evidence' },
]);

const criterion = (id, label, description, question, weight, order, answerKeys, examples) => Object.freeze({
  id, label, description, reviewerQuestion: question, weight, order, pathway: 'creator', minScore: 1, maxScore: 10,
  scoreAnchors: SHARED_SCORE_ANCHORS, answerKeys, examples,
});

export const CREATOR_PROGRAMME_CRITERIA = Object.freeze([
  criterion('mission-values', 'Mission and values alignment', 'Assess confidence building, inclusion, supportive communities and positive participation.', 'How strongly does the application demonstrate genuine alignment with Project Respawn’s mission and values?', 20, 1, ['why_apply','confidence_fit','fit_reason'], { 3: 'Little specific alignment evidence.', 5: 'Some relevant intent with limited examples.', 7: 'Clear alignment supported by practical examples.', 9: 'Compelling, sustained mission alignment.' }),
  criterion('community-safety', 'Community safety and conduct', 'Assess respectful conduct, inclusion, responsible moderation, awareness and willingness to improve.', 'How suitable is the applicant to represent and maintain a respectful, inclusive and safer community environment?', 20, 2, ['community_experience','terms_accepted'], { 3: 'Limited safety awareness or concerning gaps.', 5: 'Basic awareness with developing practice.', 7: 'Clear respectful conduct and responsible approach.', 9: 'Strong proactive safety leadership.' }),
  criterion('community-engagement', 'Community engagement', 'Assess meaningful communication, involvement and support; follower count alone is not evidence of quality.', 'How effectively does the applicant demonstrate meaningful and positive engagement with their community?', 15, 3, ['community_experience','audience_information','previous_work'], { 3: 'Little evidence of meaningful interaction.', 5: 'Some positive engagement evidence.', 7: 'Consistent, community-centred engagement.', 9: 'Outstanding inclusive community involvement.' }),
  criterion('creator-readiness', 'Creator readiness', 'Assess supplied content evidence and programme readiness without rewarding expensive equipment, graphics or budget by themselves.', 'How ready is the applicant to participate as a Project Respawn creator based on the evidence supplied?', 15, 4, ['creator_platforms','channel_link','profile_links','creator_experience'], { 3: 'Insufficient evidence of current readiness.', 5: 'Developing evidence with some gaps.', 7: 'Clear evidence of practical readiness.', 9: 'Strong, relevant and sustained creator evidence.' }),
  criterion('reliability-commitment', 'Reliability and commitment', 'Assess realistic availability, consistency, communication and follow-through without penalising limited but clear availability.', 'How much confidence does the application provide that the applicant will communicate, follow through and participate reliably?', 15, 5, ['stream_schedule','availability','goals'], { 3: 'Commitment or availability is unclear.', 5: 'Plausible commitment with limited evidence.', 7: 'Realistic, consistent commitment is evident.', 9: 'Exceptionally clear and credible reliability.' }),
  criterion('collaboration-contribution', 'Collaboration and contribution', 'Assess willingness to work with staff, creators and the wider community.', 'How strongly does the applicant demonstrate a collaborative attitude and willingness to contribute to the wider Project Respawn community?', 10, 6, ['creator_role','goals','relevant_skills'], { 3: 'Little collaboration evidence.', 5: 'Some willingness with limited examples.', 7: 'Clear collaborative attitude and contribution ideas.', 9: 'Compelling record and plans for contribution.' }),
  criterion('growth-potential', 'Growth potential', 'Assess openness to feedback, learning and development; limited current experience is not automatic evidence of low potential.', 'How much potential does the applicant demonstrate to learn, develop and benefit from the programme?', 5, 7, ['confidence_fit','goals','fit_reason'], { 3: 'Limited openness or development evidence.', 5: 'Some capacity and willingness to grow.', 7: 'Clear reflective learning potential.', 9: 'Exceptional openness and development potential.' }),
]);

export const INCLUSION_GUIDANCE = Object.freeze([
  'Spelling or grammar, unless an answer genuinely cannot be understood', 'Disability', 'Neurodivergence', 'Social anxiety', 'Accent',
  'Presentation style', 'Current follower count by itself', 'Expensive equipment', 'Production budget',
  'Personal preference for the applicant’s games', 'Existing personal relationships with Project Respawn staff',
  'Whether the applicant communicates in the same style as the reviewer',
]);

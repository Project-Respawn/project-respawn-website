// Fixed, fictional historical reviews for frontend-only calibration demonstrations.
const REVIEWERS = [
  { id: 'jordan-review', name: 'Jordan Review', offset: 1, comments: 0.9, status: 'Active' },
  { id: 'casey-review', name: 'Casey Review', offset: 9, comments: 0.75, status: 'Active' },
  { id: 'morgan-review', name: 'Morgan Review', offset: -10, comments: 0.25, status: 'Active' },
];
const BASE_SCORES = [88, 72, 61, 46, 82, 91, 67, 54, 78, 33, 86, 70];
const submittedAt = (index, reviewerIndex) => `2026-${String(1 + Math.floor(index / 4)).padStart(2, '0')}-${String(5 + (index % 4) * 5).padStart(2, '0')}T${String(12 + reviewerIndex).padStart(2, '0')}:00:00.000Z`;
const records = BASE_SCORES.flatMap((base, applicationIndex) => REVIEWERS.map((reviewer, reviewerIndex) => {
  const percentage = Math.max(18, Math.min(98, base + reviewer.offset + ((applicationIndex + reviewerIndex) % 3) - 1));
  const submitted = submittedAt(applicationIndex, reviewerIndex); const claimed = new Date(new Date(submitted).getTime() - (18 + reviewerIndex * 7 + applicationIndex % 5) * 3600000).toISOString();
  const criterionComments = Array.from({ length: 7 }, (_, criterionIndex) => criterionIndex / 7 < reviewer.comments ? `Fictional evidence note ${criterionIndex + 1}.` : '');
  return { id: `HIST-${applicationIndex + 1}-${reviewer.id}`, applicationId: `APP-HIST-${String(applicationIndex + 1).padStart(3, '0')}`, applicationReference: `APP-HIST-${String(applicationIndex + 1).padStart(3, '0')}`, pathway: 'creator', pathwayLabel: 'Creator Programme', rubricVersion: 'creator-demo-v1', reviewerId: reviewer.id, reviewerName: reviewer.name, reviewerStatus: reviewer.status, state: 'submitted', reviewLabel: reviewerIndex === 1 && applicationIndex === 11 ? 'Informed admin review' : reviewerIndex === 1 ? 'Independent admin review' : 'Independent review', claimedAt: claimed, startedAt: new Date(new Date(claimed).getTime() + 3600000).toISOString(), submittedAt: submitted, percentage, seriousConcern: reviewerIndex === 2 && [2, 7].includes(applicationIndex), concernExplanation: reviewerIndex === 2 && [2, 7].includes(applicationIndex) ? 'Fictional concern explanation.' : '', clarification: reviewerIndex === 1 && [3, 8].includes(applicationIndex), clarificationExplanation: reviewerIndex === 1 && [3, 8].includes(applicationIndex) ? 'Fictional clarification explanation.' : '', criterionComments };
}));

records.push({ ...records[0], id: 'HIST-LIMITED-1', reviewerId: 'riley-limited', reviewerName: 'Riley Limited Sample', reviewerStatus: 'Active', applicationId: 'APP-HIST-001', applicationReference: 'APP-HIST-001', percentage: 87, reviewLabel: 'Independent review' });
records.push({ id: 'HIST-RELEASED-1', applicationId: 'APP-HIST-013', applicationReference: 'APP-HIST-013', pathway: 'creator', pathwayLabel: 'Creator Programme', rubricVersion: 'creator-demo-v1', reviewerId: 'riley-limited', reviewerName: 'Riley Limited Sample', reviewerStatus: 'Active', state: 'released', reviewLabel: 'Independent review', claimedAt: '2026-04-02T10:00:00.000Z', startedAt: null, submittedAt: null, percentage: null, seriousConcern: false, clarification: false, criterionComments: [] });

export const DEMO_REVIEWER_PERFORMANCE_RECORDS = Object.freeze(records.map(Object.freeze));

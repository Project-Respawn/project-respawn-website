import { APPLICATION_PATHWAY_AVAILABILITY, APPLICATION_PATHWAY_LABELS, PATHWAY_AVAILABILITY } from '../../../config/applicationPathwayAvailability.js';

export const APPLICATION_PATHWAYS = Object.freeze(Object.entries(APPLICATION_PATHWAY_LABELS).map(([value, label]) => ({ value, label, active: APPLICATION_PATHWAY_AVAILABILITY[value] === PATHWAY_AVAILABILITY.ACTIVE })));

export const APPLICATION_STATUSES = Object.freeze([
  { value: 'awaiting-review', label: 'Awaiting review' },
  { value: 'under-review', label: 'Under review' },
  { value: 'awaiting-admin-decision', label: 'Awaiting admin decision' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'accepted-induction', label: 'Accepted — induction required' },
  { value: 'automatically-declined', label: 'Automatically declined' },
  { value: 'admin-response-required', label: 'Admin response required' },
  { value: 'induction-paused', label: 'Induction paused — admin review required' },
  { value: 'induction-completed', label: 'Induction completed' },
]);

export const EMPTY_REVIEWER_SLOTS = Object.freeze([
  { slot: 1, state: 'not-assigned' },
  { slot: 2, state: 'not-assigned' },
  { slot: 3, state: 'not-assigned' },
]);

// Frontend view-model contracts only. These are not the future Amplify schema.
// ApplicationSummary: id, reference, applicantName, pathway, submittedAt, status, completedReviews.
// ApplicationDetail: ApplicationSummary plus identity, contact, answers, metadata, and reviewerSlots.
// SubmittedAnswer: key, label, section, order, type, value, optional displayValue.
// ReviewerSlot: slot (1..3), state, with future review data supplied only when authorised.

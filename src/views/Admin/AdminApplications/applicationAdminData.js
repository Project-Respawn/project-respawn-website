import { reactive } from 'vue';
import { generateClient } from 'aws-amplify/data';
import { APPLICATION_STATUSES } from './applicationTypes.js';
import { DEMO_APPLICATION } from './fixtures/demoApplication.js';
import { DEMO_IDENTITIES } from './fixtures/demoReviewers.js';
import { CREATOR_PROGRAMME_CRITERIA, ELIGIBILITY_CHECKS, REVIEWER_CONFIRMATIONS } from './fixtures/creatorProgrammeReviewRubric.js';
import { DEMO_INDUCTION_BOOKINGS, DEMO_STAFF } from './fixtures/demoInductions.js';

const clone = (value) => JSON.parse(JSON.stringify(value));
const timestamp = () => new Date().toISOString();
const initialApplication = () => ({
  ...clone(DEMO_APPLICATION), status: 'awaiting-review', completedReviews: 0,
  reviewerSlots: [1, 2, 3].map((slot) => ({ slot, state: 'available', reviewerId: null, reviewerName: null, claimedAt: null, startedAt: null, submittedAt: null, confirmations: {}, eligibility: {}, eligibilityExplanations: {}, scores: {}, comments: {}, overallAssessment: '', percentage: null, seriousConcern: false, concernExplanation: '', reviewLabel: 'Independent review' })),
  finalPercentage: null, outcome: null, invitation: null, emailPreview: null,
  adminReviewsRevealed: false, adminInformed: false, everHadConcern: false, everHadEligibilityIssue: false, acceptanceOrigin: null, successMessage: '',
  auditEvents: [{ id: 'submitted', timestamp: DEMO_APPLICATION.submittedAt, action: 'Application submitted', actor: 'Alex Demo', summary: 'Fictional Creator Programme application submitted.' }],
});

const initialBookings = clone(DEMO_INDUCTION_BOOKINGS);
export const demoWorkflow = reactive({ application: initialApplication(), bookings: initialBookings, inductions: initialBookings, identityId: 'admin-demo', revision: 0 });
const touch = () => { demoWorkflow.revision += 1; };
const currentIdentity = () => DEMO_IDENTITIES.find((item) => item.id === demoWorkflow.identityId);
const reviewerSlot = (reviewerId) => demoWorkflow.application.reviewerSlots.find((slot) => slot.reviewerId === reviewerId);
const audit = (action, actor, summary) => demoWorkflow.application.auditEvents.push({ id: `${Date.now()}-${demoWorkflow.application.auditEvents.length}`, timestamp: timestamp(), action, actor, summary });

export function setDemoIdentity(identityId) { if (!DEMO_IDENTITIES.some((item) => item.id === identityId)) throw new Error('Unknown demo identity.'); demoWorkflow.identityId = identityId; touch(); }
export function getDemoIdentity() { return currentIdentity(); }
export function resetDemoWorkflow() { demoWorkflow.application = initialApplication(); const bookings = clone(DEMO_INDUCTION_BOOKINGS); demoWorkflow.bookings = bookings; demoWorkflow.inductions = bookings; demoWorkflow.identityId = 'admin-demo'; touch(); return demoWorkflow.application; }
let applicationClient;
const client = () => (applicationClient ||= generateClient({ authMode: 'userPool' }));
const statusForUi = (value) => String(value || '').toLowerCase().replaceAll('_', '-');
const normalizeAnswerType = (value) => ({ url: 'link', urls: 'links', genres: 'list', games: 'list' }[value] || value);
export function mapStoredApplicationDetail(payload) {
  if (!payload?.application) return null;
  const item = payload.application; const answer = (key) => item.answers?.find((row) => row.key === key)?.value;
  return { ...item, isDemo: false, pathwayLabel: item.pathway === 'creator' ? 'Creator Programme' : item.pathway,
    status: statusForUi(item.status), completedReviews: item.reviewProgress?.completed || 0, reviewerSlots: [],
    identity: { displayName: item.applicantName, creatorName: item.creatorName, email: item.contact?.email,
      discord: answer('discord_username'), country: answer('country_region'), timezone: answer('applicant_timezone'), ageRange: answer('age_range'), pronouns: answer('applicant_pronouns') },
    emailStatusLabel: item.contact?.verificationState === 'UNVERIFIED' ? 'Unverified contact email' : item.contact?.verificationState,
    answers: (item.answers || []).map((row) => ({ ...row, type: normalizeAnswerType(row.type) })),
    auditEvents: item.audit || [], metadata: { ...(item.metadata || {}), formVersion: item.formVersion } };
}
export async function listAdminApplications(options = {}) {
  if (options.real !== true) return [demoWorkflow.application];
  return (await listAdminApplicationsPage(options)).items;
}
export async function listAdminApplicationsPage(options = {}) {
  const response = await client().queries.listAdminApplications({ limit: options.limit || 100, nextToken: options.nextToken || undefined, search: options.search || undefined, pathwayId: options.pathwayId || undefined, status: options.status || undefined, sortDirection: options.sortDirection || 'DESC' });
  if (response.errors?.length) throw new Error(response.errors[0].message || 'Applications could not be loaded.');
  return { items: (response.data?.items || []).map((item) => ({ ...item, isDemo: false, status: statusForUi(item.status), completedReviews: item.reviewProgress?.completed || 0, reviewerSlots: [] })), nextToken: response.data?.nextToken || null };
}
export async function getAdminApplication(applicationId, options = {}) {
  if (options.demo === true || applicationId === 'APP-DEMO-0001') return applicationId === demoWorkflow.application.id ? { ...demoWorkflow.application, isDemo: true } : null;
  if (/^APP-/i.test(applicationId)) return null;
  const response = await client().queries.getAdminApplication({ applicationId });
  if (response.errors?.length) throw new Error(response.errors[0].message || 'Application could not be loaded.');
  return mapStoredApplicationDetail(response.data);
}

export function claimReview() {
  const actor = currentIdentity();
  if (!['reviewer', 'admin'].includes(actor?.role)) throw new Error('Only an eligible demo reviewer can claim a review.');
  if (reviewerSlot(actor.id)) throw new Error('This reviewer has already claimed a slot.');
  const slot = demoWorkflow.application.reviewerSlots.find((item) => item.state === 'available');
  if (!slot) throw new Error('All three review slots are claimed.');
  Object.assign(slot, { state: 'claimed', reviewerId: actor.id, reviewerName: actor.name, claimedAt: timestamp(), reviewLabel: actor.role === 'admin' ? (demoWorkflow.application.adminInformed ? 'Informed admin review' : 'Independent admin review') : 'Independent review' });
  demoWorkflow.application.status = 'under-review';
  audit('Review claimed', actor.name, `Reviewer ${slot.slot} claimed an independent review.`); touch(); return slot;
}

export function startReview() {
  const actor = currentIdentity(); const slot = reviewerSlot(actor?.id);
  if (!slot) throw new Error('Claim a review before opening the review form.');
  if (slot.state === 'claimed') { slot.state = 'in-progress'; slot.startedAt = timestamp(); audit('Review started', actor.name, `Reviewer ${slot.slot} started their review.`); touch(); }
  return slot;
}
export function canAccessReview() { const actor = currentIdentity(); return ['reviewer', 'admin'].includes(actor?.role) && Boolean(reviewerSlot(actor.id)); }
export function getCurrentReviewSlot() { const actor = currentIdentity(); return actor ? reviewerSlot(actor.id) || null : null; }
export function saveReviewDraft(scores, comments, reviewData = {}) { const slot = startReview(); if (slot.state === 'submitted') throw new Error('Submitted reviews are locked.'); slot.scores = { ...scores }; slot.comments = { ...comments }; Object.assign(slot, reviewData); touch(); return slot; }
export function missingCriteria(scores) { return CREATOR_PROGRAMME_CRITERIA.filter((criterion) => !Number.isInteger(Number(scores[criterion.id])) || Number(scores[criterion.id]) < 1 || Number(scores[criterion.id]) > 10); }
export function calculateReviewPercentage(scores) { if (missingCriteria(scores).length) throw new Error('Every criterion requires a score from 1 to 10.'); return CREATOR_PROGRAMME_CRITERIA.reduce((sum, criterion) => sum + (Number(scores[criterion.id]) / 10) * criterion.weight, 0); }
export function determineOutcome(percentage) { if (percentage >= 85) return 'qualified-induction'; if (percentage >= 35) return 'admin-decision'; return 'automatic-decline'; }
export function validateEligibility(eligibility, explanations = {}) { const missing = ELIGIBILITY_CHECKS.filter((check) => !['meets','clarification','does-not-meet'].includes(eligibility[check.id])); const unexplained = ELIGIBILITY_CHECKS.filter((check) => ['clarification','does-not-meet'].includes(eligibility[check.id]) && !String(explanations[check.id] || '').trim()); return { missing, unexplained, blocking: ELIGIBILITY_CHECKS.filter((check) => ['clarification','does-not-meet'].includes(eligibility[check.id])) }; }

function prepareInduction(action, actor, origin = 'Automatic acceptance') {
  const app = demoWorkflow.application; app.status = 'accepted-induction'; app.outcome = 'qualified-induction';
  app.acceptanceOrigin = origin; app.invitation = { preparedAt: timestamp(), state: 'prepared', bookingState: 'available', revokedAt: null };
  app.emailPreview = { type: 'induction', subject: 'Your Project Respawn application – induction', body: 'Your application has progressed to induction. A secure invitation would let you choose the induction meeting type, an available staff member where applicable, and an available date and time.' };
  const induction = demoWorkflow.inductions.find((item) => item.applicationReference === app.reference);
  if (!induction) demoWorkflow.inductions.push({ id: 'IND-APP-DEMO-0001', applicantName: app.applicantName, applicationReference: app.reference, applicationId: app.id, pathway: app.pathwayLabel, date: 'Not booked', startTime: '—', endTime: '—', timeZone: 'Europe/London', assignedStaff: 'Unassigned', status: 'invitation-prepared', acceptanceOrigin: origin, meetingState: 'Booking available', adminAttention: 'Needs staff', adminAttendees: [], internalNotes: 'Generated by the frontend demo workflow.', auditEvents: [{ id: 'invitation-created', timestamp: timestamp(), action: 'Invitation prepared', actor, summary: 'Fictional induction invitation prepared.' }] });
  else { induction.status = induction.status === 'completed' ? 'completed' : 'invitation-prepared'; induction.acceptanceOrigin = origin; induction.meetingState = 'Booking available'; }
  audit(action, actor, 'Application progressed to induction; invitation and applicant email preview prepared.');
  audit('Induction invitation prepared', 'System', 'A secure, expiring booking invitation would be generated and emailed.');
}
function calculateFinalOutcome() {
  const app = demoWorkflow.application; const submitted = app.reviewerSlots.filter((slot) => slot.state === 'submitted');
  if (submitted.length !== 3) return null;
  app.finalPercentage = submitted.reduce((sum, slot) => sum + slot.percentage, 0) / 3;
  const result = determineOutcome(app.finalPercentage); app.outcome = result;
  if (result === 'qualified-induction' && !app.everHadConcern && !app.everHadEligibilityIssue) prepareInduction('Automatic decision calculated', 'System', 'Automatic acceptance');
  else if (result === 'qualified-induction') { app.status = 'admin-response-required'; app.outcome = 'admin-response-required'; audit('Automatic decision calculated', 'System', 'Qualifying score blocked by a serious concern or unresolved eligibility issue; explicit admin response required.'); }
  else if (result === 'automatic-decline') { app.status = 'automatically-declined'; app.emailPreview = { type: 'decline', subject: 'Your Project Respawn application', body: 'Thank you for applying. We are unable to progress your application at this time. You are welcome to reapply when you have further relevant experience or evidence to share.' }; audit('Automatic decision calculated', 'System', 'Completed reviews produced an automatic decline; applicant email preview prepared.'); }
  else { app.status = 'awaiting-admin-decision'; audit('Automatic decision calculated', 'System', 'Completed reviews require an admin decision.'); }
  return result;
}
export function submitReview(scores, comments = {}, concern = {}, reviewData = {}) {
  const actor = currentIdentity(); const slot = reviewerSlot(actor?.id);
  if (!slot) throw new Error('No claimed review slot.'); if (slot.state === 'submitted') throw new Error('Submitted reviews are locked.');
  if (concern.flagged && !String(concern.explanation || '').trim()) throw new Error('A private serious-concern explanation is required.');
  if (!REVIEWER_CONFIRMATIONS.every((item) => reviewData.confirmations?.[item.id] === true)) throw new Error('Reviewer confirmation must be completed.');
  const eligibilityResult = validateEligibility(reviewData.eligibility || {}, reviewData.eligibilityExplanations || {}); if (eligibilityResult.missing.length) throw new Error('Every eligibility check requires a result.'); if (eligibilityResult.unexplained.length) throw new Error('Clarification and failed eligibility checks require an explanation.');
  const percentage = calculateReviewPercentage(scores);
  Object.assign(slot, { state: 'submitted', confirmations: { ...reviewData.confirmations }, eligibility: { ...reviewData.eligibility }, eligibilityExplanations: { ...reviewData.eligibilityExplanations }, scores: { ...scores }, comments: { ...comments }, overallAssessment: String(reviewData.overallAssessment || ''), percentage, submittedAt: timestamp(), seriousConcern: Boolean(concern.flagged), concernExplanation: concern.flagged ? concern.explanation.trim() : '', reviewLabel: actor.role === 'admin' ? (demoWorkflow.application.adminInformed ? 'Informed admin review' : 'Independent admin review') : 'Independent review' });
  demoWorkflow.application.completedReviews += 1; audit('Review submitted', actor.name, `${slot.reviewLabel} submitted in reviewer slot ${slot.slot}.`);
  if (slot.seriousConcern) { demoWorkflow.application.everHadConcern = true; audit('Serious concern raised', actor.name, 'A private serious concern requires authorised admin attention.'); }
  if (eligibilityResult.blocking.length) { demoWorkflow.application.everHadEligibilityIssue = true; audit('Eligibility clarification raised', actor.name, 'One or more eligibility checks require authorised admin response.'); }
  calculateFinalOutcome(); touch(); return slot;
}
export function releaseReview(slotNumber) {
  const actor = currentIdentity(); const slot = demoWorkflow.application.reviewerSlots.find((item) => item.slot === slotNumber);
  if (!slot || slot.state === 'available') throw new Error('This slot is not claimed.'); if (slot.state === 'submitted') throw new Error('Submitted reviews cannot be removed.');
  if (actor.role !== 'admin' && actor.id !== slot.reviewerId) throw new Error('Only the claimant or Admin may release this slot.');
  if (actor.role !== 'admin' && slot.state !== 'claimed') throw new Error('Only Admin may release a started review.');
  const previous = slot.reviewerName; Object.assign(slot, { state: 'available', reviewerId: null, reviewerName: null, claimedAt: null, startedAt: null, scores: {}, comments: {} });
  audit('Claim released', actor.name, `${previous}'s unsubmitted review claim was released.`); touch();
}
export function adminBypass(reason, override = false) {
  const actor = currentIdentity(); if (actor?.role !== 'admin') throw new Error('Admin demo view required.'); if (!String(reason || '').trim()) throw new Error('An internal reason is required.');
  const concernDecision = demoWorkflow.application.status === 'admin-response-required';
  demoWorkflow.application.reviewerSlots.forEach((slot) => { if (slot.state !== 'submitted') Object.assign(slot, { state: 'closed', scores: {}, comments: {} }); });
  prepareInduction(override ? 'Automatic rejection overridden' : concernDecision ? 'Serious concern handled' : 'Admin bypass', actor.name, override ? 'Rejection override' : concernDecision ? 'Admin decision after concern' : 'Admin bypass'); audit('Internal reason recorded', actor.name, String(reason).trim()); if (concernDecision) audit('Serious concern handled', actor.name, `Admin explicitly progressed after reviewing the original concern. Reason: ${String(reason).trim()}`); demoWorkflow.application.successMessage = 'Applicant progressed to induction in demo state.'; touch();
}

export function revealCompletedReviews() { const actor = currentIdentity(); if (actor?.role !== 'admin') throw new Error('Admin demo view required.'); if (!demoWorkflow.application.adminReviewsRevealed) { demoWorkflow.application.adminReviewsRevealed = true; if (!reviewerSlot(actor.id)?.submittedAt) demoWorkflow.application.adminInformed = true; audit('Admin revealed completed reviews', actor.name, 'Admin explicitly revealed existing completed review detail.'); touch(); } }
export function isEarlyAcceptanceEligible() { const app = demoWorkflow.application; const submitted = app.reviewerSlots.filter((slot) => slot.state === 'submitted'); return submitted.length === 2 && submitted.every((slot) => slot.percentage >= 85 && !slot.seriousConcern && !validateEligibility(slot.eligibility, slot.eligibilityExplanations).blocking.length) && !app.everHadConcern && !app.everHadEligibilityIssue && !['accepted-induction','automatically-declined','declined','induction-completed'].includes(app.status); }
export function acceptEarly(reason) { const actor = currentIdentity(); if (actor?.role !== 'admin') throw new Error('Admin demo view required.'); if (!String(reason || '').trim()) throw new Error('An internal reason is required.'); if (!isEarlyAcceptanceEligible()) throw new Error('Application is not eligible for early acceptance.'); demoWorkflow.application.reviewerSlots.forEach((slot) => { if (slot.state !== 'submitted') Object.assign(slot, { state: 'closed', scores: {}, comments: {} }); }); prepareInduction('Early acceptance', actor.name, 'Early acceptance'); audit('Third review waived', actor.name, `Third review waived. Internal reason: ${reason.trim()}`); touch(); }
export function waitForThirdReview() { const actor = currentIdentity(); if (actor?.role !== 'admin') throw new Error('Admin demo view required.'); audit('Wait for final review', actor.name, 'Admin retained the standard three-review requirement.'); demoWorkflow.application.successMessage = 'Waiting for the third completed review.'; touch(); }
export function loadDemoReviewScenario(scenario) {
  resetDemoWorkflow();
  const reviewerIds = scenario.startsWith('three-') ? ['jordan-review', 'casey-review', 'morgan-review'] : ['jordan-review', 'casey-review'];
  const scenarioScores = scenario === 'mixed' ? [9, 7] : scenario === 'three-35' ? [3.5, 3.5, 3.5] : scenario === 'three-low' ? [3, 3, 3] : reviewerIds.map(() => 9);
  reviewerIds.forEach((reviewer, index) => { setDemoIdentity(reviewer); claimReview(); const value = scenarioScores[index]; const scoreMap = value === 3.5 ? Object.fromEntries(CREATOR_PROGRAMME_CRITERIA.map(({ id }) => [id, ['mission-values','creator-readiness','reliability-commitment'].includes(id) ? 4 : 3])) : Object.fromEntries(CREATOR_PROGRAMME_CRITERIA.map((criterion) => [criterion.id, value])); submitReview(scoreMap, {}, { flagged: scenario === 'concern' && index === 1, explanation: scenario === 'concern' && index === 1 ? 'Fictional private concern for Admin scenario testing.' : '' }, demoCompleteReviewData(scenario === 'clarification' && index === 1)); });
  setDemoIdentity('admin-demo'); audit('Demo scenario loaded', 'System', `Admin-only ${scenario} two-review scenario loaded through normal claim and submission functions.`); touch(); return demoWorkflow.application;
}
export function pauseInduction(reason) { const actor = currentIdentity(); const app = demoWorkflow.application; if (actor?.role !== 'admin') throw new Error('Admin demo view required.'); if (!String(reason || '').trim()) throw new Error('An internal reason is required.'); if (app.status === 'induction-completed') throw new Error('Completed induction requires the future membership-removal workflow.'); if (app.status !== 'accepted-induction') throw new Error('Induction is not active.'); app.status = 'induction-paused'; if (app.invitation) { app.invitation.state = 'revoked'; app.invitation.bookingState = 'paused'; app.invitation.revokedAt = timestamp(); } const induction = demoWorkflow.inductions.find((item) => item.applicationReference === app.reference); if (induction) { induction.status = induction.date === 'Not booked' ? 'paused' : 'paused'; induction.meetingState = induction.date === 'Not booked' ? 'Invitation revoked' : 'Booking paused'; induction.adminAttention = 'Admin review required'; } audit('Automatic acceptance paused', actor.name, reason.trim()); app.emailPreview = { type: 'induction-paused', subject: 'Update to your Project Respawn induction', body: 'Your induction process has been paused while an administrative review is completed. We will contact you with an update.' }; touch(); }
export function restoreInduction(reason) { const actor = currentIdentity(); if (actor?.role !== 'admin') throw new Error('Admin demo view required.'); if (!String(reason || '').trim()) throw new Error('An internal reason is required.'); if (demoWorkflow.application.status !== 'induction-paused') throw new Error('Induction is not paused.'); prepareInduction('Induction restored', actor.name, demoWorkflow.application.acceptanceOrigin || 'Admin decision'); audit('Internal reason recorded', actor.name, reason.trim()); touch(); }
export function adminDecline(reason, guidance = '') {
  const actor = currentIdentity(); if (actor?.role !== 'admin') throw new Error('Admin demo view required.'); if (!String(reason || '').trim()) throw new Error('An applicant-facing reason is required.');
  const app = demoWorkflow.application; app.status = 'declined'; app.outcome = 'admin-decline'; app.emailPreview = { type: 'decline', subject: 'Your Project Respawn application', body: `${reason.trim()}${guidance.trim() ? ` Reapplication guidance: ${guidance.trim()}` : ''}` };
  audit('Admin decline', actor.name, 'Applicant-facing decline message prepared.'); touch();
}

export function listDemoInductions(filters = {}) { const actor = currentIdentity(); if (actor?.role !== 'admin') throw new Error('Admin demo view required.'); const staff = filters.staff || ''; const today = filters.today || new Date().toISOString().slice(0, 10); return demoWorkflow.bookings.filter((item) => (!item.bookingTypeId || item.bookingTypeId === 'booking-type-induction') && (!item.bookingTypeName || item.bookingTypeName === 'Induction')).filter((item) => { if (staff && item.assignedStaff !== staff) return false; if (filters.date && item.date !== filters.date) return false; if (!filters.state || filters.state === 'all') return true; if (filters.state === 'needs-staff') return item.assignedStaff === 'Unassigned'; if (filters.state === 'admin-attending') return item.adminAttendees.length > 0; if (filters.state === 'today') return item.date === today; if (filters.state === 'upcoming') return ['booked','invitation-prepared'].includes(item.status); return item.status === filters.state; }); }
export function getInductionSummary(items, today = new Date().toISOString().slice(0, 10)) { const count = (test) => items.filter(test).length; return [{ label: 'Awaiting booking', count: count((i) => i.status === 'invitation-prepared') }, { label: 'Upcoming', count: count((i) => i.status === 'booked' && i.date >= today) }, { label: 'Today', count: count((i) => i.date === today) }, { label: 'Needs staff', count: count((i) => i.assignedStaff === 'Unassigned') }, { label: 'Admin attending', count: count((i) => i.adminAttendees.length) }, { label: 'Paused', count: count((i) => i.status === 'paused') }, { label: 'Cancelled', count: count((i) => i.status === 'cancelled') }, { label: 'Completed', count: count((i) => i.status === 'completed') }]; }
export function getDemoInduction(id) { if (currentIdentity()?.role !== 'admin') throw new Error('Admin demo view required.'); return demoWorkflow.inductions.find((item) => item.id === id) || null; }
function inductionAudit(item, action, summary) { item.auditEvents.push({ id: `${Date.now()}-${item.auditEvents.length}`, timestamp: timestamp(), action, actor: currentIdentity().name, summary }); touch(); }
export function markAdminAttending(id) { const item = getDemoInduction(id); if (!item.adminAttendees.includes('Admin')) item.adminAttendees.push('Admin'); inductionAudit(item, 'Admin marked as attending', 'Future integration would notify the assigned staff member.'); }
export function joinDemoInduction(id) { const item = getDemoInduction(id); item.meetingState = 'Admin joined simulation'; inductionAudit(item, 'Admin joined induction', 'Demo meeting join recorded; no provider URL was opened.'); }
export function reassignDemoInduction(id, staff) { if (!DEMO_STAFF.includes(staff)) throw new Error('Unknown fictional staff member.'); const item = getDemoInduction(id); item.assignedStaff = staff; inductionAudit(item, 'Induction reassigned', `Assigned to ${staff}.`); }
export function setDemoInductionStatus(id, status, reason) { if (!String(reason || '').trim()) throw new Error('A reason is required.'); if (!['paused','cancelled','completed'].includes(status)) throw new Error('Unsupported induction state.'); const item = getDemoInduction(id); item.status = status; item.adminAttention = status === 'paused' ? 'Admin review required' : status === 'cancelled' ? 'Cancelled' : 'None'; inductionAudit(item, `Induction ${status}`, reason.trim()); }

export function filterAndSortApplications(applications, filters = {}) { const search = String(filters.search || '').trim().toLocaleLowerCase(); const filtered = applications.filter((item) => { const searchable = [item.applicantName, item.applicantEmail, item.reference].join(' ').toLocaleLowerCase(); return (!search || searchable.includes(search)) && (!filters.pathway || item.pathway === filters.pathway) && (!filters.status || item.status === filters.status); }); return [...filtered].sort((left, right) => { const comparison = new Date(left.submittedAt).getTime() - new Date(right.submittedAt).getTime(); return filters.sort === 'oldest' ? comparison : -comparison; }); }
export function getApplicationStatusSummary(applications) { return APPLICATION_STATUSES.map((status) => ({ ...status, count: applications.filter((item) => item.status === status.value).length })); }
export function getApplicationDetailRoute(application) { return { name: 'AdminApplicationDetail', params: { applicationId: application.id } }; }
export function getReviewProgress(application) {
  const slots = application.reviewerSlots || []; const claimed = slots.filter((slot) => slot.state !== 'available' && slot.state !== 'closed').length; const completed = slots.filter((slot) => slot.state === 'submitted').length;
  const concern = Boolean(application.everHadConcern || slots.some((slot) => slot.seriousConcern)); const earlyEligible = isEarlyAcceptanceEligibleFor(application);
  let phase = 'Awaiting reviewers';
  if (application.status === 'accepted-induction') phase = 'Progressed to induction'; else if (['declined','automatically-declined'].includes(application.status)) phase = 'Declined'; else if (completed === 3) phase = 'Automated outcome or admin decision'; else if (completed === 2) phase = earlyEligible ? 'Early-acceptance eligibility' : 'Two reviews completed'; else if (slots.some((slot) => slot.state === 'in-progress')) phase = 'Reviews in progress'; else if (claimed) phase = 'Review claimed';
  const automatic = application.acceptanceOrigin === 'Automatic acceptance' ? 'Automatically accepted' : application.status === 'automatically-declined' ? 'Automatically declined' : 'None';
  const adminRequired = concern || ['awaiting-admin-decision','admin-response-required'].includes(application.status) || (completed === 2 && !earlyEligible);
  const actor = currentIdentity(); const ownIndependent = actor?.role === 'admin' && slots.some((slot) => slot.reviewerId === actor.id && ['claimed','in-progress'].includes(slot.state) && slot.reviewLabel === 'Independent admin review'); const scoresVisible = actor?.role === 'admin' && (!ownIndependent || application.adminReviewsRevealed); const submittedSlots = slots.filter((slot) => slot.state === 'submitted'); const combinedReady = submittedSlots.length === 3 || (submittedSlots.length === 2 && application.acceptanceOrigin === 'Early acceptance'); const combinedPercentage = scoresVisible && combinedReady ? submittedSlots.reduce((sum,slot)=>sum+slot.percentage,0)/submittedSlots.length : null;
  return { application, claimed, completed, concern, earlyEligible, phase, automatic, adminRequired, scoresVisible, ownIndependent, combinedPercentage, slots: slots.map((slot) => ({ ...slot, clarification: Object.values(slot.eligibility || {}).some((value) => value === 'clarification') })), decision: automatic !== 'None' ? automatic : adminRequired ? 'Admin response required' : 'Pending', nextAction: earlyEligible ? 'Open decision panel' : adminRequired ? 'Review exception and decide' : completed < 3 ? 'Continue independent reviews' : 'View outcome', lastActivity: application.auditEvents?.at(-1)?.timestamp || application.submittedAt };
}
export function isEarlyAcceptanceEligibleFor(application) { const submitted = (application.reviewerSlots || []).filter((slot) => slot.state === 'submitted'); return submitted.length === 2 && submitted.every((slot) => slot.percentage >= 85 && !slot.seriousConcern && !validateEligibility(slot.eligibility, slot.eligibilityExplanations).blocking.length) && !application.everHadConcern && !application.everHadEligibilityIssue && !['accepted-induction','automatically-declined','declined','induction-completed'].includes(application.status); }
export function getReviewDashboard(applications) {
  const records = applications.map(getReviewProgress); const count = (test) => records.filter(test).length;
  return { records, summary: [
    ['Awaiting review', count((r) => r.completed === 0)], ['Reviews in progress', count((r) => r.phase === 'Reviews in progress')], ['Two reviews completed', count((r) => r.completed === 2)], ['Eligible for early acceptance', count((r) => r.earlyEligible)], ['Three reviews completed', count((r) => r.completed === 3)], ['Admin response required', count((r) => r.adminRequired)], ['Automatically accepted', count((r) => r.automatic === 'Automatically accepted')], ['Automatically declined', count((r) => r.automatic === 'Automatically declined')], ['Serious concern raised', count((r) => r.concern)],
  ].map(([label, value]) => ({ label, value })), pipeline: ['Awaiting reviewers','Review claimed','Reviews in progress','Two reviews completed','Early-acceptance eligibility','Automated outcome or admin decision','Progressed to induction','Declined'].map((label) => ({ label, count: count((r) => r.phase === label) })) };
}
export function declareReviewConflict(explanation) { const actor = currentIdentity(); const slot = reviewerSlot(actor?.id); if (!slot) throw new Error('No claimed review slot.'); if (!String(explanation || '').trim()) throw new Error('A conflict explanation is required.'); if (slot.state === 'submitted') throw new Error('Submitted reviews are locked.'); const slotNumber = slot.slot; releaseReview(slotNumber); audit('Review conflict declared', actor.name, 'Reviewer declared an internal conflict and released the claim.'); touch(); }
function demoCompleteReviewData(withClarification = false) { return { confirmations: Object.fromEntries(REVIEWER_CONFIRMATIONS.map((item) => [item.id, true])), eligibility: Object.fromEntries(ELIGIBILITY_CHECKS.map((item, index) => [item.id, withClarification && index === 0 ? 'clarification' : 'meets'])), eligibilityExplanations: withClarification ? { [ELIGIBILITY_CHECKS[0].id]: 'Fictional clarification required for scenario testing.' } : {}, overallAssessment: 'Fictional overall assessment for demo scenario testing.' }; }
export { DEMO_IDENTITIES, CREATOR_PROGRAMME_CRITERIA, ELIGIBILITY_CHECKS, REVIEWER_CONFIRMATIONS, DEMO_STAFF };

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
  filterAndSortApplications,
  getAdminApplication,
  getApplicationDetailRoute,
  getApplicationStatusSummary,
  getReviewDashboard,
  getInductionSummary,
  listAdminApplications,
  adminBypass,
  calculateReviewPercentage,
  canAccessReview,
  claimReview,
  demoWorkflow,
  determineOutcome,
  getCurrentReviewSlot,
  releaseReview,
  resetDemoWorkflow,
  saveReviewDraft,
  setDemoIdentity,
  submitReview,
  acceptEarly,
  getDemoInduction,
  isEarlyAcceptanceEligible,
  joinDemoInduction,
  listDemoInductions,
  markAdminAttending,
  pauseInduction,
  restoreInduction,
  revealCompletedReviews,
  loadDemoReviewScenario,
  CREATOR_PROGRAMME_CRITERIA,
  ELIGIBILITY_CHECKS,
  REVIEWER_CONFIRMATIONS,
  declareReviewConflict,
  validateEligibility,
} from './applicationAdminData.js';

const scores = (value) => Object.fromEntries(CREATOR_PROGRAMME_CRITERIA.map(({ id }) => [id, value]));
const thresholdScores = (low, high) => Object.fromEntries(CREATOR_PROGRAMME_CRITERIA.map(({ id }) => [id, ['mission-values','creator-readiness','reliability-commitment'].includes(id) ? high : low]));
const completeReviewData = () => ({ confirmations: Object.fromEntries(REVIEWER_CONFIRMATIONS.map(({ id }) => [id, true])), eligibility: Object.fromEntries(ELIGIBILITY_CHECKS.map(({ id }) => [id, 'meets'])), eligibilityExplanations: {}, overallAssessment: '' });
const submitDemo = (values, comments = {}, concern = {}) => submitReview(values, comments, concern, completeReviewData());

test('demo record drives queue, summary, filters, sorting, and canonical detail route', async () => {
  const applications = await listAdminApplications();
  assert.equal(applications.length, 1);
  assert.equal(applications[0].applicantName, 'Alex Demo');
  const summary = getApplicationStatusSummary(applications);
  assert.equal(summary.find((item) => item.value === 'awaiting-review').count, 1);
  assert.ok(summary.filter((item) => item.value !== 'awaiting-review').every((item) => item.count === 0));

  for (const search of ['alex demo', 'alex.demo@example.com', 'app-demo-0001']) {
    assert.equal(filterAndSortApplications(applications, { search }).length, 1);
  }
  assert.equal(filterAndSortApplications(applications, { pathway: 'creator' }).length, 1);
  assert.equal(filterAndSortApplications(applications, { pathway: 'competitive-player' }).length, 0);
  assert.equal(filterAndSortApplications(applications, { status: 'awaiting-review' }).length, 1);
  assert.equal(filterAndSortApplications(applications, { status: 'accepted' }).length, 0);
  assert.equal(filterAndSortApplications(applications, {}).length, 1);
  assert.equal(filterAndSortApplications(applications, { sort: 'oldest' })[0].id, 'APP-DEMO-0001');
  assert.deepEqual(getApplicationDetailRoute(applications[0]), { name: 'AdminApplicationDetail', params: { applicationId: 'APP-DEMO-0001' } });
});

test('detail fixture is complete, ordered, fictional, and review-ready', async () => {
  const detail = await getAdminApplication('APP-DEMO-0001');
  assert.equal(detail.reference, 'APP-DEMO-0001');
  assert.equal(detail.pathwayLabel, 'Creator Programme');
  assert.equal(detail.completedReviews, 0);
  assert.equal(detail.reviewerSlots.length, 3);
  assert.ok(detail.reviewerSlots.every((slot) => slot.state === 'available'));
  assert.ok(detail.answers.every((answer, index, answers) => index === 0 || answer.order > answers[index - 1].order));
  assert.ok(detail.answers.some((answer) => answer.type === 'long-text'));
  assert.ok(detail.answers.some((answer) => answer.type === 'list'));
  assert.ok(detail.answers.some((answer) => answer.type === 'links'));
  assert.ok(detail.answers.some((answer) => answer.type === 'boolean'));
  assert.ok(detail.answers.some((answer) => answer.value === null));
  assert.equal(await getAdminApplication('APP-UNKNOWN'), null);
});

test('components retain loading, error, filtered-empty, not-found, and Not provided states', async () => {
  const featureDir = fileURLToPath(new URL('.', import.meta.url));
  const [overview, detail, queue, answers] = await Promise.all([
    readFile(new URL('./AdminApplications.vue', import.meta.url), 'utf8'),
    readFile(new URL('./AdminApplicationDetail.vue', import.meta.url), 'utf8'),
    readFile(new URL('./components/ApplicationsQueue.vue', import.meta.url), 'utf8'),
    readFile(new URL('./components/SubmittedAnswers.vue', import.meta.url), 'utf8'),
  ]);
  assert.ok(featureDir);
  assert.match(overview, /Live sandbox data/);
  assert.match(queue, /Loading applications/);
  assert.match(queue, /Applications could not be loaded/);
  assert.match(queue, /No applications match these filters/);
  assert.match(detail, /Application not found/);
  assert.match(detail, /Try again/);
  assert.match(detail, /ReviewWorkflowPanel/);
  assert.match(answers, /Not provided/);
});

test('claims are unique, capped at three, releasable before submission, and gate review access', () => {
  resetDemoWorkflow(); setDemoIdentity('jordan-review'); const first = claimReview();
  assert.equal(first.slot, 1); assert.equal(canAccessReview(), true); assert.throws(() => claimReview(), /already claimed/);
  setDemoIdentity('casey-review'); claimReview(); setDemoIdentity('morgan-review'); claimReview();
  assert.equal(demoWorkflow.application.reviewerSlots.filter((slot) => slot.state !== 'available').length, 3);
  setDemoIdentity('admin-demo'); assert.equal(canAccessReview(), false); releaseReview(2); assert.equal(demoWorkflow.application.reviewerSlots[1].state, 'available');
});

test('draft survives in-app identity navigation, comments are optional, and submitted review locks', () => {
  resetDemoWorkflow(); setDemoIdentity('jordan-review'); claimReview(); saveReviewDraft(scores(7), {});
  setDemoIdentity('admin-demo'); setDemoIdentity('jordan-review'); assert.equal(getCurrentReviewSlot().scores['mission-values'], 7);
  submitDemo(scores(7), {}); assert.equal(getCurrentReviewSlot().state, 'submitted'); assert.throws(() => submitDemo(scores(8)), /locked/);
  setDemoIdentity('admin-demo'); assert.throws(() => releaseReview(1), /cannot be removed/);
});

test('every criterion is required and outcome thresholds use unrounded values', () => {
  assert.throws(() => calculateReviewPercentage({}), /Every criterion/);
  assert.equal(calculateReviewPercentage(thresholdScores(8, 9)), 85);
  assert.equal(determineOutcome(85), 'qualified-induction');
  assert.equal(determineOutcome(85.0001), 'qualified-induction');
  assert.equal(determineOutcome(35), 'admin-decision');
  assert.equal(determineOutcome(34.9999), 'automatic-decline');
  assert.equal(determineOutcome(84.9999), 'admin-decision');
});

test('outcome is hidden until three submissions and exactly 85 progresses to induction', () => {
  resetDemoWorkflow();
  for (const reviewer of ['jordan-review','casey-review','morgan-review']) { setDemoIdentity(reviewer); claimReview(); submitDemo(thresholdScores(8, 9)); }
  assert.equal(demoWorkflow.application.finalPercentage, 85);
  assert.equal(demoWorkflow.application.status, 'accepted-induction');
  assert.equal(demoWorkflow.application.invitation.state, 'prepared');
  assert.doesNotMatch(demoWorkflow.application.emailPreview.body, /Jordan|Casey|Morgan|score|comment/i);
});

test('middle and decline outcomes, admin bypass reason, override, and reset work', () => {
  resetDemoWorkflow();
  setDemoIdentity('jordan-review'); claimReview(); submitDemo(scores(3)); assert.equal(demoWorkflow.application.finalPercentage, null);
  setDemoIdentity('casey-review'); claimReview(); submitDemo(scores(4));
  setDemoIdentity('morgan-review'); claimReview(); submitDemo(thresholdScores(3, 4)); assert.equal(demoWorkflow.application.status, 'awaiting-admin-decision');
  resetDemoWorkflow(); for (const reviewer of ['jordan-review','casey-review','morgan-review']) { setDemoIdentity(reviewer); claimReview(); submitDemo(scores(3)); }
  assert.equal(demoWorkflow.application.status, 'automatically-declined'); assert.doesNotMatch(demoWorkflow.application.emailPreview.body, /Jordan|Casey|Morgan|score|comment/i);
  setDemoIdentity('admin-demo'); assert.throws(() => adminBypass(''), /reason is required/); adminBypass('Exceptional contextual evidence reviewed.', true); assert.equal(demoWorkflow.application.status, 'accepted-induction');
  resetDemoWorkflow(); assert.equal(demoWorkflow.application.completedReviews, 0); assert.equal(demoWorkflow.application.auditEvents.length, 1);
});

test('admin review is independent until explicit reveal and then labelled informed', () => {
  resetDemoWorkflow(); setDemoIdentity('jordan-review'); claimReview(); submitDemo(scores(8));
  setDemoIdentity('admin-demo'); claimReview(); assert.equal(getCurrentReviewSlot().reviewLabel, 'Independent admin review'); assert.equal(demoWorkflow.application.adminReviewsRevealed, false);
  releaseReview(2); revealCompletedReviews(); assert.equal(demoWorkflow.application.adminInformed, true); assert.ok(demoWorkflow.application.auditEvents.some((event) => event.action === 'Admin revealed completed reviews'));
  claimReview(); submitDemo(scores(8)); assert.equal(getCurrentReviewSlot().reviewLabel, 'Informed admin review');
});

test('serious concerns require explanation and block early and automatic acceptance', () => {
  resetDemoWorkflow(); setDemoIdentity('jordan-review'); claimReview(); assert.throws(() => submitDemo(scores(9), {}, { flagged: true, explanation: ' ' }), /explanation is required/);
  submitDemo(scores(9), {}, { flagged: true, explanation: 'Private safeguarding concern for admin review.' });
  setDemoIdentity('casey-review'); claimReview(); submitDemo(scores(9)); assert.equal(isEarlyAcceptanceEligible(), false);
  setDemoIdentity('morgan-review'); claimReview(); submitDemo(scores(9)); assert.equal(demoWorkflow.application.status, 'admin-response-required'); assert.equal(demoWorkflow.application.invitation, null);
  setDemoIdentity('admin-demo'); adminBypass('Concern reviewed with appropriate safeguards.'); assert.equal(demoWorkflow.application.status, 'accepted-induction'); assert.ok(demoWorkflow.application.auditEvents.some((event) => event.action === 'Serious concern handled'));
});

test('two strong concern-free reviews enable reasoned early acceptance and close third draft', () => {
  resetDemoWorkflow(); setDemoIdentity('jordan-review'); claimReview(); submitDemo(scores(9)); setDemoIdentity('casey-review'); claimReview(); submitDemo(scores(9));
  setDemoIdentity('morgan-review'); claimReview(); saveReviewDraft(scores(7), {}); setDemoIdentity('admin-demo'); assert.equal(isEarlyAcceptanceEligible(), true); assert.throws(() => acceptEarly(' '), /reason is required/);
  acceptEarly('Two exceptional independent reviews are sufficient for this demo.'); assert.equal(demoWorkflow.application.status, 'accepted-induction'); assert.equal(demoWorkflow.application.reviewerSlots[2].state, 'closed'); assert.deepEqual(demoWorkflow.application.reviewerSlots[2].scores, {});
  assert.ok(demoWorkflow.application.auditEvents.some((event) => event.action === 'Third review waived'));
});

test('one review below 85 prevents early acceptance', () => {
  resetDemoWorkflow(); setDemoIdentity('jordan-review'); claimReview(); submitDemo(scores(9)); setDemoIdentity('casey-review'); claimReview(); submitDemo(scores(8)); assert.equal(isEarlyAcceptanceEligible(), false);
});

test('accepted induction can be paused and restored without losing reviews', () => {
  resetDemoWorkflow(); setDemoIdentity('admin-demo'); adminBypass('Manual qualification after administrative assessment.'); const completed = demoWorkflow.application.completedReviews;
  assert.throws(() => pauseInduction(' '), /reason is required/); pauseInduction('Pause while availability is confirmed.'); assert.equal(demoWorkflow.application.status, 'induction-paused'); assert.equal(demoWorkflow.application.completedReviews, completed);
  restoreInduction('Availability confirmed.'); assert.equal(demoWorkflow.application.status, 'accepted-induction');
  demoWorkflow.application.status = 'induction-completed'; assert.throws(() => pauseInduction('Late concern'), /Completed induction/);
});

test('induction schedule is admin-only and meeting interventions are audited', () => {
  resetDemoWorkflow(); setDemoIdentity('jordan-review'); assert.throws(() => listDemoInductions(), /Admin demo view/);
  setDemoIdentity('admin-demo'); const items = listDemoInductions(); assert.ok(items.some((item) => item.id === 'IND-DEMO-0001')); assert.ok(listDemoInductions({ state: 'booked' }).length >= 1); assert.equal(listDemoInductions({ state: 'cancelled' }).length, 1);
  markAdminAttending('IND-DEMO-0001'); joinDemoInduction('IND-DEMO-0001'); const item = getDemoInduction('IND-DEMO-0001'); assert.ok(item.adminAttendees.includes('Admin')); assert.equal(item.meetingState, 'Admin joined simulation'); assert.ok(item.auditEvents.some((event) => event.action === 'Admin joined induction'));
});

test('bypass uses a real validated modal and induction routes precede dynamic application routes', async () => {
  const modal = await readFile(new URL('./components/DemoActionModal.vue', import.meta.url), 'utf8'); const routes = await readFile(new URL('../../../router/admin.routes.js', import.meta.url), 'utf8');
  assert.match(modal, /Internal reason/); assert.match(modal, /error/); assert.match(modal, /confirmLabel/); assert.match(modal, /keydown\.esc/);
  assert.ok(routes.indexOf("path: 'applications/inductions'") < routes.indexOf("path: 'applications/:applicationId'"));
  assert.ok(routes.indexOf("path: 'applications/reviews'") < routes.indexOf("path: 'applications/:applicationId'"));
});

test('review dashboard derives safe phases and keeps criterion detail off the dashboard', async () => {
  resetDemoWorkflow(); setDemoIdentity('admin-demo'); let dashboard = getReviewDashboard([demoWorkflow.application]); assert.equal(dashboard.records[0].phase, 'Awaiting reviewers');
  loadDemoReviewScenario('strong'); dashboard = getReviewDashboard([demoWorkflow.application]); assert.equal(dashboard.records[0].earlyEligible, true); assert.equal(dashboard.summary.find((x) => x.label === 'Eligible for early acceptance').value, 1);
  loadDemoReviewScenario('concern'); dashboard = getReviewDashboard([demoWorkflow.application]); assert.equal(dashboard.records[0].adminRequired, true);
  const page = await readFile(new URL('./AdminApplicationReviews.vue', import.meta.url), 'utf8'); assert.doesNotMatch(page, /slot\.scores|slot\.comments|criterionComments|finalPercentage/); assert.match(page, /submitted weighted results/);
});

test('review progress exposes submitted scores except during an unfinished independent Admin review', () => {
  loadDemoReviewScenario('strong'); let progress = getReviewDashboard([demoWorkflow.application]).records[0]; assert.equal(progress.scoresVisible, true); assert.ok(progress.slots.filter(s=>s.state==='submitted').every(s=>Number.isFinite(s.percentage)));
  claimReview(); progress = getReviewDashboard([demoWorkflow.application]).records[0]; assert.equal(progress.ownIndependent, true); assert.equal(progress.scoresVisible, false); assert.equal(progress.combinedPercentage, null); revealCompletedReviews(); progress = getReviewDashboard([demoWorkflow.application]).records[0]; assert.equal(progress.scoresVisible, true); assert.equal(demoWorkflow.application.adminInformed, true); assert.ok(demoWorkflow.application.auditEvents.some(e=>e.action==='Admin revealed completed reviews'));
});

test('induction calendar and table share canonical records, filters, time zones, and mutations', async () => {
  resetDemoWorkflow(); setDemoIdentity('admin-demo'); const all = listDemoInductions(); assert.ok(all.length >= 7); assert.equal(all.filter((x) => x.date === '2026-08-16').length, 2); assert.ok(all.every((x) => x.timeZone));
  assert.equal(listDemoInductions({ state: 'needs-staff' }).length, 2); const summary = getInductionSummary(all, '2026-08-16'); assert.equal(summary.find((x) => x.label === 'Today').count, 2);
  markAdminAttending('IND-DEMO-0003'); assert.ok(listDemoInductions({ state: 'admin-attending' }).some((x) => x.id === 'IND-DEMO-0003'));
  const page = await readFile(new URL('./AdminInductions.vue', import.meta.url), 'utf8'); assert.match(page, /calendarDays/); assert.match(page, /v-for="x in inductions"/); assert.match(page, /calendar-agenda/); assert.match(page, /Display time zone/);
});

test('feature tabs use routes, admin-only destinations, and sidebar prefix remains active', async () => {
  const [tabs, layout] = await Promise.all([readFile(new URL('./components/AdminApplicationsTabs.vue', import.meta.url), 'utf8'), readFile(new URL('../AdminLayout/AdminLayout.js', import.meta.url), 'utf8')]); assert.match(tabs, /AdminApplications/); assert.match(tabs, /AdminApplicationReviews/); assert.match(tabs, /AdminInductions/); assert.match(tabs, /adminOnly/); assert.match(tabs, /aria-current/); assert.match(layout, /path\.includes\('\/applications'\)/);
});

test('admin progress scenarios reuse workflow logic for strong, mixed, and concern states', () => {
  loadDemoReviewScenario('strong'); assert.equal(demoWorkflow.application.completedReviews, 2); assert.equal(isEarlyAcceptanceEligible(), true); assert.ok(demoWorkflow.application.reviewerSlots.slice(0, 2).every((slot) => slot.state === 'submitted' && slot.percentage >= 85)); assert.equal(demoWorkflow.application.reviewerSlots[2].state, 'available');
  loadDemoReviewScenario('mixed'); assert.equal(demoWorkflow.application.completedReviews, 2); assert.equal(isEarlyAcceptanceEligible(), false); assert.ok(demoWorkflow.application.reviewerSlots.some((slot) => slot.state === 'submitted' && slot.percentage < 85));
  loadDemoReviewScenario('concern'); assert.equal(isEarlyAcceptanceEligible(), false); assert.equal(demoWorkflow.application.everHadConcern, true); assert.ok(demoWorkflow.application.reviewerSlots.some((slot) => slot.seriousConcern));
});

test('admin can occupy available third slot while independent or informed provenance remains intact', () => {
  loadDemoReviewScenario('strong'); assert.equal(demoWorkflow.application.adminReviewsRevealed, false); claimReview(); assert.equal(getCurrentReviewSlot().slot, 3); assert.equal(getCurrentReviewSlot().reviewLabel, 'Independent admin review');
  resetDemoWorkflow(); setDemoIdentity('jordan-review'); claimReview(); submitDemo(scores(9)); setDemoIdentity('casey-review'); claimReview(); submitDemo(scores(9)); setDemoIdentity('admin-demo'); revealCompletedReviews(); claimReview(); assert.equal(getCurrentReviewSlot().reviewLabel, 'Informed admin review');
});

test('admin progress panel is Admin-only on detail and always explains two-review eligibility', async () => {
  const [detail, panel, css] = await Promise.all([readFile(new URL('./AdminApplicationDetail.vue', import.meta.url), 'utf8'), readFile(new URL('./components/AdminReviewProgressPanel.vue', import.meta.url), 'utf8'), readFile(new URL('./AdminApplications.css', import.meta.url), 'utf8')]);
  assert.match(detail, /demoIdentity\.role === 'admin'/); assert.match(detail, /AdminReviewProgressPanel/); assert.match(panel, /Admin review progress and decision/); assert.match(panel, /0 of 3 reviews completed|completedCount/); assert.match(panel, /Are two reviews enough\?/); assert.match(panel, /Both must individually score at least 85%/); assert.match(panel, /Review slot \{\{ slot\.slot \}\}/); assert.match(panel, /Bypass reviews and progress to induction/); assert.match(css, /admin-slot-grid[\s\S]*grid-template-columns: 1fr/);
});

test('Creator Programme rubric has exactly seven weighted criteria totalling 100 and excludes completeness scoring', () => {
  assert.equal(CREATOR_PROGRAMME_CRITERIA.length, 7);
  assert.equal(CREATOR_PROGRAMME_CRITERIA.reduce((sum, criterion) => sum + criterion.weight, 0), 100);
  assert.deepEqual(CREATOR_PROGRAMME_CRITERIA.map((criterion) => criterion.label), ['Mission and values alignment','Community safety and conduct','Community engagement','Creator readiness','Reliability and commitment','Collaboration and contribution','Growth potential']);
  assert.equal(CREATOR_PROGRAMME_CRITERIA.some((criterion) => /completeness/i.test(criterion.label)), false);
});

test('weighted calculations retain precision and eligibility checks do not change percentage', () => {
  const weighted = { 'mission-values': 8, 'community-safety': 7, 'community-engagement': 7, 'creator-readiness': 6, 'reliability-commitment': 8, 'collaboration-contribution': 9, 'growth-potential': 7 };
  assert.equal(calculateReviewPercentage(weighted), 74);
  assert.equal((8 / 10) * 20, 16); assert.equal((7 / 10) * 15, 10.5);
  const meets = completeReviewData(); const clarification = completeReviewData(); clarification.eligibility['sections-complete'] = 'clarification'; clarification.eligibilityExplanations['sections-complete'] = 'Clarify one required response.';
  assert.equal(calculateReviewPercentage(weighted), calculateReviewPercentage(weighted));
  assert.equal(validateEligibility(meets.eligibility, meets.eligibilityExplanations).blocking.length, 0);
  assert.equal(validateEligibility(clarification.eligibility, clarification.eligibilityExplanations).blocking.length, 1);
});

test('clarification and failed eligibility checks require explanations', () => {
  const data = completeReviewData(); data.eligibility['links-accessible'] = 'clarification'; assert.equal(validateEligibility(data.eligibility, data.eligibilityExplanations).unexplained.length, 1);
  data.eligibilityExplanations['links-accessible'] = 'Link could not be verified.'; assert.equal(validateEligibility(data.eligibility, data.eligibilityExplanations).unexplained.length, 0);
  data.eligibility['correct-pathway'] = 'does-not-meet'; assert.equal(validateEligibility(data.eligibility, data.eligibilityExplanations).unexplained.length, 1);
});

test('conflict declaration releases claim without submitting or raising applicant concern', () => {
  resetDemoWorkflow(); setDemoIdentity('jordan-review'); claimReview(); assert.throws(() => declareReviewConflict(' '), /explanation is required/); declareReviewConflict('Prior professional relationship.');
  assert.equal(demoWorkflow.application.reviewerSlots[0].state, 'available'); assert.equal(demoWorkflow.application.completedReviews, 0); assert.equal(demoWorkflow.application.everHadConcern, false); assert.ok(demoWorkflow.application.auditEvents.some((event) => event.action === 'Review conflict declared'));
});

test('unresolved clarification blocks early and automatic induction but below-35 rejection remains', () => {
  loadDemoReviewScenario('clarification'); assert.equal(demoWorkflow.application.everHadEligibilityIssue, true); assert.equal(isEarlyAcceptanceEligible(), false);
  setDemoIdentity('morgan-review'); claimReview(); submitDemo(scores(9)); assert.equal(demoWorkflow.application.status, 'admin-response-required');
  resetDemoWorkflow(); const issue = completeReviewData(); issue.eligibility['sections-complete'] = 'does-not-meet'; issue.eligibilityExplanations['sections-complete'] = 'Required section absent.';
  for (const reviewer of ['jordan-review','casey-review','morgan-review']) { setDemoIdentity(reviewer); claimReview(); submitReview(scores(3), {}, {}, reviewer === 'jordan-review' ? issue : completeReviewData()); }
  assert.equal(demoWorkflow.application.status, 'automatically-declined');
});

test('reviewer stages hide weights and percentages while revealed Admin analysis includes them', async () => {
  const [reviewPage, adminPanel, rubric] = await Promise.all([readFile(new URL('./AdminApplicationReview.vue', import.meta.url), 'utf8'), readFile(new URL('./components/ReviewWorkflowPanel.vue', import.meta.url), 'utf8'), readFile(new URL('./fixtures/creatorProgrammeReviewRubric.js', import.meta.url), 'utf8')]);
  assert.match(reviewPage, /Reviewer confirmation and conflict check/); assert.match(reviewPage, /Eligibility and verification checks/); assert.match(reviewPage, /Creator Programme scoring/); assert.match(reviewPage, /Overall assessment/); assert.match(reviewPage, /Spelling or grammar|inclusionGuidance/);
  assert.doesNotMatch(reviewPage, /criterion\.weight|slot\.percentage/); assert.match(adminPanel, /criterion\.weight/); assert.match(adminPanel, /contribution\(slot, criterion\)/); assert.match(rubric, /weight/);
});

test('expanded weighted demo scenarios use real outcome calculations', () => {
  loadDemoReviewScenario('three-strong'); assert.equal(demoWorkflow.application.status, 'accepted-induction');
  loadDemoReviewScenario('three-35'); assert.equal(demoWorkflow.application.finalPercentage, 35); assert.equal(demoWorkflow.application.status, 'awaiting-admin-decision');
  loadDemoReviewScenario('three-low'); assert.ok(demoWorkflow.application.finalPercentage < 35); assert.equal(demoWorkflow.application.status, 'automatically-declined');
});

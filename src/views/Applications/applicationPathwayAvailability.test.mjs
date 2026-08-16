import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { APPLICATION_PATHWAY_AVAILABILITY, APPLICATION_PATHWAY_LABELS, COMPETITIVE_PATHWAYS, PATHWAY_AVAILABILITY, canEnterApplicationPathway, getPathwayAvailability } from '../../config/applicationPathwayAvailability.js';
import { APPLICATION_PATHWAYS } from '../Admin/AdminApplications/applicationTypes.js';
import { DEMO_APPLICATION } from '../Admin/AdminApplications/fixtures/demoApplication.js';

test('only Creator Programme is publicly active and professional pathways remain Coming Soon', () => {
  assert.equal(getPathwayAvailability('creator'), PATHWAY_AVAILABILITY.ACTIVE);
  assert.ok(COMPETITIVE_PATHWAYS.every((pathway) => getPathwayAvailability(pathway) === PATHWAY_AVAILABILITY.CLOSED));
  assert.equal(getPathwayAvailability('therapist'), PATHWAY_AVAILABILITY.COMING_SOON);
  assert.equal(getPathwayAvailability('trainer'), PATHWAY_AVAILABILITY.COMING_SOON);
  assert.deepEqual(APPLICATION_PATHWAYS.filter((item) => item.active).map((item) => item.value), ['creator']);
  assert.ok(COMPETITIVE_PATHWAYS.every((pathway) => APPLICATION_PATHWAY_LABELS[pathway]));
});

test('entry gate blocks closed pathways but supports deliberate future reactivation', () => {
  assert.ok(COMPETITIVE_PATHWAYS.every((pathway) => !canEnterApplicationPathway(pathway)));
  const futureConfig = { ...APPLICATION_PATHWAY_AVAILABILITY, 'competitive-player': PATHWAY_AVAILABILITY.ACTIVE };
  assert.equal(canEnterApplicationPathway('competitive-player', futureConfig), true);
});

test('public form preserves requested closed identity and gates Next and submit at entry', async () => {
  const [controller, template] = await Promise.all([readFile(new URL('./Applications.js', import.meta.url), 'utf8'), readFile(new URL('./Applications.vue', import.meta.url), 'utf8')]);
  assert.match(controller, /KNOWN_TYPES\.has\(requestedType\)/);
  assert.match(controller, /canEnterApplicationPathway\(applicationType\.value\)/);
  assert.match(controller, /if \(!canEnterApplicationPathway\(applicationType\.value\)\) return/);
  assert.match(template, /Competitive applications are currently closed/);
  assert.match(template, /Apply to the Creator Programme/);
  assert.match(template, /Return to application pathways/);
  assert.match(template, /v-if="isActivePathway"/);
  assert.equal((template.match(/pathway-status">Closed/g) || []).length, 4);
});

test('competitive implementation remains code-complete behind the availability gate', async () => {
  const [controller, template] = await Promise.all([readFile(new URL('./Applications.js', import.meta.url), 'utf8'), readFile(new URL('./Applications.vue', import.meta.url), 'utf8')]);
  for (const token of ['League of Legends','Top','Jungle','Mid','Bot or ADC','Support','Valorant','Counter-Strike 2','Rocket League','rankOptions','positionOptions']) assert.match(controller, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  for (const token of ['Competitive experience','Coaching, analysis, or support experience','How do you help players or teams improve?','Primary competitive game','Choose up to three favourite games']) assert.match(template, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('Creator alternative clears competitive-only state and canonical demo remains unchanged', async () => {
  const controller = await readFile(new URL('./Applications.js', import.meta.url), 'utf8');
  assert.match(controller, /competitiveProfile\.value = createCompetitiveProfile\(\)/);
  assert.match(controller, /applicationType\.value = 'creator'/);
  assert.equal(DEMO_APPLICATION.id, 'APP-DEMO-0001'); assert.equal(DEMO_APPLICATION.pathway, 'creator');
});

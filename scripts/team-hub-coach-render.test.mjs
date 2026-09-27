import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { parse } from '@vue/compiler-sfc';
import { compile } from '@vue/compiler-dom';
import * as Vue from 'vue';
import { renderToString } from 'vue/server-renderer';

const source = readFileSync(new URL('../src/features/Team Hub/champion-pool/CoachPoolReview.vue', import.meta.url), 'utf8');
const { descriptor } = parse(source);
const { code } = compile(descriptor.template.content, { mode: 'function', prefixIdentifiers: true });
const render = new Function('Vue', code)(Vue);
async function renderState(state) {
  const context = { teamContext: null, canEditAssessments: false, selectedPlayer: undefined, loading: false, loadError: '', ...state };
  const app = Vue.createSSRApp({ render: () => render(context, []) });
  app.component('TeamHubSidebar', { render: () => null });
  app.component('TeamLogo', { render: () => null });
  return renderToString(app);
}

test('Coach Review renders before the asynchronous player list arrives', async () => {
  const html = await renderState({ loading: true });
  assert.match(html, /Loading League champions/);
  assert.doesNotMatch(html, /review-controls|upper-workspace/);
});

test('Coach Review tolerates the gap between catalogue and membership responses', async () => {
  const html = await renderState({ loading: false });
  assert.match(html, /Competitive Overview/);
  assert.doesNotMatch(html, /review-controls|upper-workspace/);
});

test('Coach Review renders an empty or denied team without dereferencing a player', async () => {
  for (const loadError of ['No active players are assigned to this team.', 'Team Hub access denied']) {
    const html = await renderState({ loadError });
    assert(html.includes(loadError));
    assert.doesNotMatch(html, /review-controls|upper-workspace/);
  }
});

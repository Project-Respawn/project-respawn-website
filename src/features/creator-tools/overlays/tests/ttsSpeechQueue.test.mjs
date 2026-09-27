import test from 'node:test';
import assert from 'node:assert/strict';
import { createTtsSpeechQueue } from '../ttsSpeechQueue.js';
import { ttsDeliveryStatus } from '../ttsDeliveryStatus.js';
import { readFile } from 'node:fs/promises';
import { parse, compileScript } from '@vue/compiler-sfc';
import { runInNewContext } from 'node:vm';
import * as Vue from 'vue';

function fixture() {
  const spoken = [], logs = []; let cancels = 0;
  const engine = { getVoices: () => [{ name: 'Voice' }], speak: utterance => spoken.push(utterance), cancel: () => { cancels++; } };
  const queue = createTtsSpeechQueue({ synthesis: () => engine, createUtterance: text => ({ text }), log: entry => logs.push(entry) });
  return { queue, engine, spoken, logs, get cancels() { return cancels; } };
}
const event = (id, text = 'Hello stream') => ({ id, payload: { text } });

test('speech is ordered, configured, deduplicated across widgets and never cancels the preceding event', () => {
  const f = fixture();
  assert.equal(f.queue.enqueue(event('one'), { voice: 'Voice', rate: 1.5, pitch: .8, volume: .4, maxLength: 5 }), true);
  assert.equal(f.queue.enqueue(event('one')), false);
  f.queue.enqueue(event('two'));
  assert.equal(f.spoken.length, 1); assert.equal(f.cancels, 0);
  assert.deepEqual([f.spoken[0].text, f.spoken[0].voice.name, f.spoken[0].rate, f.spoken[0].pitch, f.spoken[0].volume], ['Hello', 'Voice', 1.5, .8, .4]);
  f.spoken[0].onstart(); f.spoken[0].onend();
  assert.equal(f.spoken.length, 2); assert.equal(f.spoken[1].text, 'Hello stream');
  f.spoken[1].onerror({ error: 'not-allowed' });
  assert.ok(f.logs.some(log => log.stage === 'speech_failed' && log.errorCode === 'not-allowed'));
  assert.equal(JSON.stringify(f.logs).includes('Hello'), false);
});

test('disabled settings/widgets, hidden widgets, empty text and malformed IDs never speak', () => {
  const f = fixture();
  assert.equal(f.queue.enqueue(event('one'), { enabled: false }), false);
  assert.equal(f.queue.enqueue(event('one'), {}, { enabled: false }), false);
  assert.equal(f.queue.enqueue(event('one'), {}, { hidden: true }), false);
  assert.equal(f.queue.enqueue(event('one', ' ')), false);
  assert.equal(f.queue.enqueue(event('')), false); assert.equal(f.spoken.length, 0);
  f.queue.enqueue(event('one'), { volume: 0, pitch: 0 });
  assert.equal(f.spoken[0].volume, 0); assert.equal(f.spoken[0].pitch, 0);
});

test('voices resolve at playback, missing voices fall back, stopping clears queue and ignores late completion', () => {
  const f = fixture(); f.engine.getVoices = () => [];
  f.queue.enqueue(event('one'), { voice: 'Voice' }); f.queue.enqueue(event('two'), { voice: 'Voice' });
  assert.equal(f.spoken[0].voice, undefined);
  f.engine.getVoices = () => [{ name: 'Voice' }]; f.spoken[0].onend();
  assert.equal(f.spoken[1].voice.name, 'Voice');
  f.queue.enqueue(event('three')); const late = f.spoken[1].onend;
  f.queue.stop(); late();
  assert.equal(f.cancels, 1); assert.equal(f.spoken.length, 2);
});

test('unavailable or throwing engines report failure rather than claiming playback', () => {
  const logs = [];
  createTtsSpeechQueue({ synthesis: () => null, log: entry => logs.push(entry) }).enqueue(event('unsupported'));
  const f = fixture(); f.engine.speak = () => { throw new Error('engine failed'); }; f.queue.enqueue(event('throw'));
  assert.equal(logs[0].stage, 'speech_queued'); assert.equal(logs[1].errorCode, 'unsupported');
  assert.equal(f.logs.at(-1).errorCode, 'engine_error');
});

test('TTS widget executes the shared queue only in Browser Source mode', async () => {
  const source = await readFile(new URL('../../widgets/tts-audio/tts/TtsWidget.vue', import.meta.url), 'utf8');
  const { content } = compileScript(parse(source).descriptor, { id: 'tts-runtime', inlineTemplate: true, genDefaultAs: 'component' });
  const code = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]vue['"];?/g, (_, names) => `const {${names.replace(/\bas\b/g, ':')}} = Vue;`).replace(/^import .*$/gm, '');
  for (const runtimeMode of ['browser-source', 'editor-preview']) {
    const f = fixture(), received = Vue.ref(null);
    const component = runInNewContext(code + '\ncomponent', { Vue, useWidgetEvents: () => received, widgetStyle: () => ({}), browserTtsQueue: f.queue });
    const scope = Vue.effectScope();
    const props = Vue.reactive({ runtimeMode, widget: { enabled: true, settings: {} }, runtimeConfig: { tts: { rate: 1.4 } } });
    scope.run(() => component.setup(props, { expose() {} }));
    received.value = event('component'); await Vue.nextTick();
    assert.equal(f.spoken.length, runtimeMode === 'browser-source' ? 1 : 0);
    if (f.spoken.length) assert.equal(f.spoken[0].rate, 1.4);
    received.value = event('rapid-one'); received.value = event('rapid-two');
    if (f.spoken.length) {
      f.spoken[0].onend(); f.spoken[1].onend();
      assert.equal(f.spoken.length, 3, 'same-tick events both reach the speech queue');
    }
    props.widget.hidden = true; received.value = event('hidden'); await Vue.nextTick();
    assert.equal(f.spoken.length, runtimeMode === 'browser-source' ? 3 : 0);
    scope.stop(); f.queue.stop();
  }
});

test('test delivery feedback separates zero listeners, send failures and sends from playback', () => {
  assert.match(ttsDeliveryStatus({ delivered: 0 }).message, /No active Browser Source/);
  assert.equal(ttsDeliveryStatus({ delivered: 1, failed: 1 }).type, 'error');
  assert.match(ttsDeliveryStatus({ delivered: 1 }).message, /confirm playback/);
});

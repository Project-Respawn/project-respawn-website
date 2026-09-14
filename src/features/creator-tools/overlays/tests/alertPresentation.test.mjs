import assert from 'node:assert/strict'
import test from 'node:test'
import { interpolateAlertTemplate, normalizeAlertConfiguration, previewEventForKind, resolveAlertPresentation } from '../alertPresentation.js'
import { createAlertAudioLifecycle } from '../alertAudioLifecycle.js'

test('shared presentation resolves identical title, message and media for one event and config', () => {
  const event=previewEventForKind('raid'),config={enabled:true,titleTemplate:'{user} raided!',messageTemplate:'{viewers} viewers · {unknown}',mediaUrl:'https://cdn.example/raid.gif',soundUrl:'',volume:.5,duration:8,entryAnimation:'scale',exitAnimation:'fade'}
  const resolved=resolveAlertPresentation(event,config)
  assert.equal(resolved.title,'RespawnTestRaider raided!');assert.equal(resolved.message,'42 viewers · {unknown}');assert.equal(resolved.config.mediaUrl,'https://cdn.example/raid.gif')
  assert.equal(interpolateAlertTemplate('{bits} {reward}',previewEventForKind('cheer')),'100 a reward')
})

test('defensive frontend normalization preserves safe values and neutralizes malformed responses', () => {
  const valid=normalizeAlertConfiguration({enabled:true,titleTemplate:'Title',messageTemplate:'Message',mediaUrl:'https://cdn.example/no-extension',soundUrl:'https://cdn.example/a.mp3',volume:.7,duration:10,entryAnimation:'slide-up',exitAnimation:'fade'})
  assert.equal(valid.mediaUrl,'https://cdn.example/no-extension');assert.equal(valid.volume,.7)
  const invalid=normalizeAlertConfiguration({enabled:'yes',mediaUrl:'http://bad',soundUrl:'https://user:pass@example.com/a',volume:Infinity,duration:NaN,entryAnimation:'spin'})
  assert.equal(invalid.enabled,false);assert.equal(invalid.mediaUrl,'');assert.equal(invalid.soundUrl,'');assert.equal(invalid.entryAnimation,'none')
})

test('audio lifecycle maps volume, attempts playback, and cleans up on stop and rejection', async () => {
  const calls=[];class AudioFake{constructor(url){this.url=url;calls.push(['create',url])}play(){calls.push(['play',this.volume]);return Promise.resolve()}pause(){calls.push(['pause'])}removeAttribute(){calls.push(['remove'])}load(){calls.push(['load'])}}
  const audio=createAlertAudioLifecycle({AudioImpl:AudioFake,onError:(error)=>calls.push(['error',error.message])});assert.equal(await audio.play('https://cdn.example/a.ogg',.45),true);audio.stop();assert.deepEqual(calls.map(item=>item[0]),['create','play','pause','remove','load'])
  class RejectingAudio extends AudioFake{play(){return Promise.reject(new Error('blocked'))}}
  const rejected=createAlertAudioLifecycle({AudioImpl:RejectingAudio,onError:(error)=>calls.push(['error',error.message])});assert.equal(await rejected.play('https://cdn.example/a.ogg',1),false);assert.ok(calls.some(item=>item[0]==='error'&&item[1]==='blocked'))
})

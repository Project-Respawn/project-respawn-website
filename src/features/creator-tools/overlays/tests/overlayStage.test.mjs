import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateOverlayStage } from '../overlayStage.js';

test('1920x1080 scene is unchanged in a matching OBS viewport', () => {
  assert.deepEqual(calculateOverlayStage(1920, 1080, 1920, 1080), { scale: 1, x: 0, y: 0 });
});

test('1920x1080 scene scales uniformly to 1280x720 without coordinate drift', () => {
  const stage = calculateOverlayStage(1920, 1080, 1280, 720);
  assert.equal(stage.scale, 2 / 3);
  assert.equal(stage.x, 0);
  assert.equal(stage.y, 0);
  assert.equal(300 * stage.scale + stage.x, 200);
});

test('mismatched viewport letterboxes and centers rather than stretching', () => {
  assert.deepEqual(calculateOverlayStage(1920, 1080, 1000, 1000), {
    scale: 1000 / 1920,
    x: 0,
    y: 218.75,
  });
});

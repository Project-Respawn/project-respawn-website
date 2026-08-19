import test from 'node:test'
import assert from 'node:assert/strict'
import { CARD_STATES, createDemoState, dashboardCards, nextActionableStep, presets, progress, resolveCard } from './creatorDashboardDemoState.js'

const card = (key) => dashboardCards.find((item) => item.key === key)

test('presets are deterministic and calculate their progress', () => {
  assert.equal(progress(createDemoState('fresh')), 10)
  assert.equal(progress(createDemoState('partial')), 60)
  assert.equal(progress(createDemoState('full')), 100)
  assert.deepEqual(createDemoState('fresh').completed, presets.fresh.completed)
})

test('cards resolve locked, empty and active from the same state model', () => {
  assert.equal(resolveCard(card('rewards'), createDemoState('fresh')).state, CARD_STATES.LOCKED)
  const empty = createDemoState('partial')
  assert.equal(resolveCard(card('rewards'), empty).state, CARD_STATES.EMPTY)
  assert.equal(resolveCard(card('rewards'), createDemoState('full')).state, CARD_STATES.ACTIVE)
})

test('only the next dependency is offered', () => {
  const fresh = createDemoState('fresh')
  assert.equal(nextActionableStep(fresh, card('rewards').requires).id, 'discord')
  fresh.completed.push('discord')
  assert.equal(nextActionableStep(fresh, card('rewards').requires).id, 'community')
})

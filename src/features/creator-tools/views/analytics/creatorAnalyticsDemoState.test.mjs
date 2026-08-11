import test from 'node:test'
import assert from 'node:assert/strict'
import { analyticsPresets, audienceOptions, communityScoreInputs, createAnalyticsState, getPresetData, memberships, selectHistory, sourcePlatforms, visibleMilestones } from './creatorAnalyticsDemoState.js'

test('Fresh, Partial, Full and Reset defaults are deterministic', () => {
  assert.equal(getPresetData('fresh'), null)
  assert.equal(getPresetData('partial').platforms.length, 2)
  assert.equal(getPresetData('full').platforms.length, 4)
  assert.deepEqual(createAnalyticsState('fresh'), { preset: 'fresh', time: '30 Days', source: 'All Creator Data', audience: 'All Members', chartMetric: 'Respawn Members' })
  assert.deepEqual(Object.keys(analyticsPresets), ['fresh', 'partial', 'full'])
})

test('long-term ranges provide visibly different history horizons', () => {
  assert.equal(selectHistory('Respawn Members', '30 Days').length, 12)
  assert.equal(selectHistory('Respawn Members', '1 Year').length, 30)
  assert.equal(selectHistory('Respawn Members', '3 Years').length, 48)
  assert.ok(visibleMilestones('3 Years').length > visibleMilestones('30 Days').length)
})

test('platform filters preserve independent external platform totals', () => {
  const data = getPresetData('full')
  assert.equal(sourcePlatforms(data, 'Twitch').length, 1)
  assert.equal(sourcePlatforms(data, 'Twitch')[0].name, 'Twitch')
  assert.equal(data.connected.total, '1,284')
  assert.notEqual(data.connected.total, data.platforms.map(item => Number(item.total.replaceAll(',', ''))).reduce((a,b)=>a+b,0).toLocaleString())
})

test('Community Score inputs are engagement rates and exclude size, spend and tier', () => {
  const inputs = communityScoreInputs()
  assert.ok(inputs.every(item => item.endsWith('Rate')))
  assert.ok(!inputs.some(item => /audience|spend|tier|supporter/i.test(item)))
})

test('support membership model reconciles and remains separately structured', () => {
  assert.equal(memberships.metrics.find(item => item[0] === 'Supporter Retention')[1], '82%')
  assert.equal(memberships.insights.find(item => item[0] === 'Most common tier')[1], 'Bronze')
  assert.ok(audienceOptions.includes('Gold Supporters'))
  assert.equal('tiers' in memberships, false)
  assert.equal('breakdown' in memberships, false)
  assert.equal('compensation' in memberships, false)
  assert.equal('affiliates' in memberships, false)
  assert.equal('internalRespawnAttribution' in memberships, false)
})

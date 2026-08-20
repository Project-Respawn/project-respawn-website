import test from 'node:test'
import assert from 'node:assert/strict'
import { canAccessInvestorDocument, canManageInvestorAccess, classifyAccessChange, effectiveInvestorAccess, isNdaStatus } from './policy'

const active = (accessLevel: string, overrides = {}) => ({ isActive: true, accessLevel, ndaStatus: 'NOT_SIGNED', ...overrides })

test('Admin and SuperAdmin automatically receive full diligence access', () => {
  for (const group of ['Admin', 'SuperAdmin']) {
    const access = effectiveInvestorAccess([group])
    assert.equal(access.hasAccess, true); assert.equal(access.accessLevel, 'DILIGENCE'); assert.equal(access.isPlatformAdmin, true)
  }
})

test('normal members, revoked investors, and expired investors are denied', () => {
  assert.equal(effectiveInvestorAccess(['Member']).hasAccess, false)
  assert.equal(effectiveInvestorAccess(['Member'], active('DILIGENCE', { isActive: false })).hasAccess, false)
  assert.equal(effectiveInvestorAccess(['Member'], active('DILIGENCE', { expiresAt: '2025-01-01T00:00:00.000Z' }), new Date('2026-01-01')).hasAccess, false)
})

test('PRE_NDA, NDA, and DILIGENCE document restrictions are ordered', () => {
  assert.equal(canAccessInvestorDocument('PRE_NDA', 'PRE_NDA'), true)
  assert.equal(canAccessInvestorDocument('PRE_NDA', 'NDA'), false)
  assert.equal(canAccessInvestorDocument('NDA', 'PRE_NDA'), true)
  assert.equal(canAccessInvestorDocument('NDA', 'DILIGENCE'), false)
  assert.equal(canAccessInvestorDocument('DILIGENCE', 'DILIGENCE'), true)
})

test('active investor access resolves at every tier and preserves NDA state', () => {
  for (const level of ['PRE_NDA', 'NDA', 'DILIGENCE']) {
    const access = effectiveInvestorAccess(['Member'], active(level, { ndaStatus: 'SIGNED' }))
    assert.equal(access.hasAccess, true); assert.equal(access.accessLevel, level); assert.equal(access.ndaStatus, 'SIGNED')
  }
})

test('upgrade and downgrade actions are classified for audit', () => {
  assert.equal(classifyAccessChange('PRE_NDA', 'NDA'), 'investor.access.upgraded')
  assert.equal(classifyAccessChange('DILIGENCE', 'NDA'), 'investor.access.downgraded')
})

test('NDA state changes accept only the defined workflow states', () => {
  for (const status of ['NOT_REQUIRED', 'NOT_SIGNED', 'SIGNED']) assert.equal(isNdaStatus(status), true)
  assert.equal(isNdaStatus('PENDING'), false)
})

test('only Admin and SuperAdmin can mutate investor access', () => {
  assert.equal(canManageInvestorAccess(['Admin']), true)
  assert.equal(canManageInvestorAccess(['SuperAdmin']), true)
  assert.equal(canManageInvestorAccess(['Staff']), false)
  assert.equal(canManageInvestorAccess(['Member']), false)
  assert.equal(canManageInvestorAccess([]), false)
})

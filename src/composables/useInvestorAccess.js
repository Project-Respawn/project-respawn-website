import { ref } from 'vue'
import { generateClient } from 'aws-amplify/data'

const EMPTY = Object.freeze({ hasAccess: false, accessLevel: null, ndaStatus: null, isPlatformAdmin: false, expiresAt: null })
const investorAccess = ref(EMPTY)
let client

function getClient() { return client ||= generateClient() }

export async function refreshInvestorAccess() {
  const operation = getClient()?.queries?.getMyInvestorAccess
  if (typeof operation !== 'function') throw new Error('Investor access backend is unavailable. Regenerate Amplify outputs from the updated backend.')
  const result = await operation()
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Investor access could not be loaded')
  investorAccess.value = result.data ? { ...EMPTY, ...result.data } : EMPTY
  return investorAccess.value
}

export function clearInvestorAccess() { investorAccess.value = EMPTY }
export function useInvestorAccess() { return { investorAccess, refreshInvestorAccess, clearInvestorAccess } }

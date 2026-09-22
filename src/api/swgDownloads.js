import { fetchAuthSession } from 'aws-amplify/auth'
import { swgEofRelease } from '../config/swgEofRelease.js'

export async function downloadRequest(path, body) {
  const base = swgEofRelease.downloadApiBase
  if (!base || !base.startsWith('https://')) throw new Error('Protected download hosting is not ready yet.')
  const session = await fetchAuthSession()
  const token = session.tokens?.idToken?.toString()
  if (!token) throw new Error('Sign in to your Beta Member account first.')
  const result = await fetch(new URL(path, base.endsWith('/') ? base : base + '/'), {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body), redirect: 'error', signal: AbortSignal.timeout(25000),
  })
  if (!result.ok) throw new Error(result.status === 403 || result.status === 401
    ? 'Beta access could not be verified. Check your account or installer code.'
    : 'The download service is unavailable. Please try again.')
  return result.json()
}

export async function downloadInstaller() {
  const result = await downloadRequest('downloads/ticket', {
    version: swgEofRelease.version, key: 'ProjectRespawn-SWG-EOF-Test-Setup.exe',
  })
  const url = new URL(result.url)
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid download address.')
  window.location.assign(url.href)
}

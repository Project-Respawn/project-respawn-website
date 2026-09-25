// Enable only after hosting, installer and tester-service release gates pass.
export const swgEofRelease = Object.freeze({
  published: true,
  installerUrl: '', // No public static URL: request an authenticated ticket.
  downloadApiBase: 'https://7sqhe1oq7f.execute-api.eu-north-1.amazonaws.com/', // Filled from reviewed download stack outputs after deployment.
  version: '0.2.0-city-preview.2',
  installerBytes: 61440,
  payloadBytes: 8177228758,
  sha256: '5f4d906db50fbb3d82a973bddcbbecfb10c84dcb919e56ed98219abe85cf6539',
})

export function canDownload(release) {
  if (!release.published || !/^[a-f0-9]{64}$/i.test(release.sha256 || '')) return false
  try {
    const url = new URL(release.downloadApiBase)
    return url.protocol === 'https:' && !url.username && !url.password &&
      !url.hostname.endsWith('.invalid') && url.hostname !== 'localhost'
  } catch { return false }
}

// Only the beta route may override the existing post-sign-in destination.
export function swgSignInDestination(value) {
  return typeof value === 'string' && /^\/SWG-EOF-test(?:\?device=[a-f0-9]{32}(?:#launcher=[a-f0-9]{64})?)?$/i.test(value)
    ? value : '/home'
}

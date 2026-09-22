// Enable only after hosting, installer and tester-service release gates pass.
export const swgEofRelease = Object.freeze({
  published: true,
  installerUrl: '', // No public static URL: request an authenticated ticket.
  downloadApiBase: 'https://7sqhe1oq7f.execute-api.eu-north-1.amazonaws.com/', // Filled from reviewed download stack outputs after deployment.
  version: '0.1.0-stage1-preview.3',
  installerBytes: 53760,
  payloadBytes: 8177225039,
  sha256: 'd695c09f54226f52ec30aabbf57cb1594b9cc6e2288cb0cc961d687f185e7135',
})

export function canDownload(release) {
  if (!release.published || !/^[a-f0-9]{64}$/i.test(release.sha256 || '')) return false
  try {
    const url = new URL(release.downloadApiBase)
    return url.protocol === 'https:' && !url.username && !url.password &&
      !url.hostname.endsWith('.invalid') && url.hostname !== 'localhost'
  } catch { return false }
}

const STAGE_PLACEHOLDER_PATTERN = /<\s*stage\s*>|%3Cstage%3E/i

function trimTrailingSlashes(value) {
  return String(value || '').trim().replace(/\/+$/, '')
}

function ensureValidApiBaseUrl(value, sourceLabel) {
  const normalized = trimTrailingSlashes(value)

  if (!normalized) {
    throw new Error(
      `Missing VITE_API_BASE_URL for ${sourceLabel}. Set VITE_API_BASE_URL in your environment.`
    )
  }

  if (STAGE_PLACEHOLDER_PATTERN.test(normalized)) {
    throw new Error(
      `Invalid VITE_API_BASE_URL for ${sourceLabel}. The value contains a stage placeholder. Set VITE_API_BASE_URL to your real API Gateway base URL.`
    )
  }

  if (!/^https?:\/\//i.test(normalized)) {
    throw new Error(
      `Invalid VITE_API_BASE_URL for ${sourceLabel}. Use an absolute URL starting with http:// or https://.`
    )
  }

  return normalized
}

export function getApiBaseUrl(sourceLabel = 'API requests') {
  if (import.meta.env.DEV) {
    return '/api'
  }

  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL
  return ensureValidApiBaseUrl(configuredBaseUrl, sourceLabel)
}

export function joinApiUrl(baseUrl, path) {
  const normalizedBase = trimTrailingSlashes(baseUrl)
  const safePath = String(path || '').replace(/^\/+/, '')
  return `${normalizedBase}/${safePath}`
}

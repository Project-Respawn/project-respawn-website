/** Centralised runtime configuration for the Lambda. */
export const APP_ENV = process.env.APP_ENV ?? ''
export const REVOLUT_API_KEY = process.env.REVOLUT_API_KEY ?? ''
export const REVOLUT_API_SECRET = process.env.REVOLUT_API_SECRET ?? ''
export const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY ?? ''

const configuredMode = (process.env.REVOLUT_MODE ?? '').trim().toLowerCase()
const appEnvironment = APP_ENV.trim().toLowerCase()

/** Explicit Revolut mode wins; production app environments otherwise use production. */
export const REVOLUT_MODE: 'sandbox' | 'prod' =
  configuredMode === 'prod' || configuredMode === 'production'
    ? 'prod'
    : configuredMode === 'sandbox'
      ? 'sandbox'
      : appEnvironment === 'prod' || appEnvironment === 'production' || appEnvironment === 'live'
        ? 'prod'
        : 'sandbox'

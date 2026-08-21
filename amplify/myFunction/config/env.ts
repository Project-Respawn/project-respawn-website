/** Centralised runtime configuration for the Lambda. */
export const APP_ENV = process.env.APP_ENV ?? ''
export const REVOLUT_API_KEY = process.env.REVOLUT_API_KEY ?? ''
export const REVOLUT_API_SECRET = process.env.REVOLUT_API_SECRET ?? ''
export const REVOLUT_WEBHOOK_SIGNING_SECRET = process.env.REVOLUT_WEBHOOK_SIGNING_SECRET ?? ''
export const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY ?? ''

const configuredMode = (process.env.REVOLUT_MODE ?? '').trim().toLowerCase()
const appEnvironment = APP_ENV.trim().toLowerCase()

/** Explicit Revolut mode wins; production app environments otherwise use production. */
export const REVOLUT_MODE: 'sandbox' | 'prod' =
  configuredMode === 'prod' || configuredMode === 'production' || configuredMode === 'live'
    ? 'prod'
    : configuredMode === 'sandbox'
      ? 'sandbox'
      : appEnvironment === 'prod' || appEnvironment === 'production' || appEnvironment === 'live'
        ? 'prod'
        : 'sandbox'

/** Printful order creation fails closed unless both app and payment modes are explicitly production. */
export function isPrintfulFulfillmentEnabled(
  appEnv: string = APP_ENV,
  revolutMode: string = REVOLUT_MODE,
) {
  const normalizedAppEnv = String(appEnv || '').trim().toLowerCase()
  const normalizedRevolutMode = String(revolutMode || '').trim().toLowerCase()

  return ['prod', 'production', 'live'].includes(normalizedAppEnv)
    && ['prod', 'production', 'live'].includes(normalizedRevolutMode)
}

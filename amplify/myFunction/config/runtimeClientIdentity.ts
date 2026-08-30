export const DEFAULT_TWITCH_RUNTIME_CLIENT_ID = 'respawn-twitch-bot'
export const PRODUCTION_TWITCH_RUNTIME_CLIENT_ID = 'respawn-twitch-bot-production'

export function twitchRuntimeClientId(awsBranch = process.env.AWS_BRANCH) {
  return awsBranch === 'master' ? PRODUCTION_TWITCH_RUNTIME_CLIENT_ID : DEFAULT_TWITCH_RUNTIME_CLIENT_ID
}

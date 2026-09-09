// Paths are served unchanged by the site's existing Amplify Hosting deployment.
// Change this catalogue to version built-in assets; never copy resolved URLs into Brand records.
const assets = (folder, titleTemplate, messageTemplate) => Object.freeze({
  mediaUrl: `/twitch-alerts/${folder}/image.jpg`,
  soundUrl: `/twitch-alerts/${folder}/audio.mp3`,
  titleTemplate, messageTemplate, duration: 20,
})

export const FIRST_PARTY_ALERT_DEFAULTS = Object.freeze({
  follow: assets('follow', '{user} followed!', 'Welcome to the Respawn!'),
  subscription: assets('subscription', '{user} subscribed!', 'Ready to grow with us, I see!'),
  cheer: assets('bits', '{user} cheered {bits} bits', 'Thanks for helping us grow!'),
  raid: assets('raid', '{user} brought {viewers} viewers', 'Whoa! More spawns into the community!'),
})

export function resetAlertPresentationOverrides(kind, configuration) {
  if (!FIRST_PARTY_ALERT_DEFAULTS[kind]) return configuration
  return { ...configuration, mediaUrl: '', soundUrl: '', titleTemplate: '', messageTemplate: '', duration: FIRST_PARTY_ALERT_DEFAULTS[kind].duration }
}

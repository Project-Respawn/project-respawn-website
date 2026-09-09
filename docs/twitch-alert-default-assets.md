# First-party Twitch alert assets

The approved JPG/MP3 files are copied byte-for-byte to the existing Vite public directory. Amplify Hosting publishes that directory with the site through its existing CDN. No new S3 bucket, policy, public listing, upload endpoint or anonymous write permission is needed. The application's Amplify Storage resource remains unchanged; its guest read access is identity-based and is not used to create permanent public media URLs.

## Public paths

Each path below is relative to `public/` and to the deployed site's origin:

| Alert | Image | Audio |
| --- | --- | --- |
| Follow | `twitch-alerts/follow/image.jpg` | `twitch-alerts/follow/audio.mp3` |
| Subscription | `twitch-alerts/subscription/image.jpg` | `twitch-alerts/subscription/audio.mp3` |
| Bits/Cheer | `twitch-alerts/bits/image.jpg` | `twitch-alerts/bits/audio.mp3` |
| Raid | `twitch-alerts/raid/image.jpg` | `twitch-alerts/raid/audio.mp3` |

Production URL example: `https://www.projectrespawn.com/twitch-alerts/follow/image.jpg`. No signed URLs are used. Local development uses the local site origin so previews can load the same files before deployment. `customHttp.yml` limits explicit `image/jpeg` and `audio/mpeg` response headers to these asset paths.

## Defaults and overrides

`src/features/creator-tools/overlays/firstPartyAlertDefaults.js` is the single built-in media/text catalogue. `resolveAlertPresentation` in `alertPresentation.js` applies it inside the shared `AlertPresentation` component used by Tools, Builder, generic legacy alerts, and dedicated live widgets.

Brand records continue to contain raw overrides. Empty/null/missing media fields and empty text inherit built-in presentation; valid custom values win independently. Normalization does not materialize built-in URLs into stored drafts. Reset to Default clears image, sound, title and message fields; users then save through the existing Brand API. Enabled, duration, volume, and animation settings are preserved.

The backend returns empty inherited presentation fields for new Follow/Subscription/Bits/Raid configurations. New Bits configs default to enabled; an existing explicit `enabled: false` remains false. Redemption defaults and behaviour are unchanged. Existing stored text, including historically saved defaults, is preserved because the records do not identify whether a nonempty value was entered manually. Reset explicitly opts such records into the new defaults; no records are migrated.

Audio plays only on an alert/preview trigger, not on settings load or URL edits. Existing alert duration and volume controls apply; the supplied tracks are 20 seconds long, but shorter configured alert durations may stop live playback earlier. Image failure retains text/animation; audio failure is caught without an automatic retry loop.

For future asset changes, preferably add a versioned path and update the catalogue, then update the integrity tests to the newly approved bytes. Creators with empty overrides inherit the new version; custom URLs remain untouched. No new publication or credential is required.

## Release, only after approval

No commit, push or deployment was performed for this task. The eight URLs will not be available from production until these files are deployed.

After the reviewed changes are committed and pushed to `master` with explicit approval, the existing Amplify auto-build is the normal release path. If auto-build has not started a release, the equivalent manual trigger is:

```powershell
aws amplify start-job --app-id d2cux232bpa951 --branch-name master --job-type RELEASE --region eu-north-1 --profile default
```

This runs the existing `amplify.yml` pipeline, including:

```sh
npx ampx pipeline-deploy --branch "$AWS_BRANCH" --app-id d2cux232bpa951
npx ampx generate outputs --branch "$AWS_BRANCH" --app-id d2cux232bpa951 --format json --out-dir .
npm run build
```

Expected changes are the existing Hosting release (assets, application bundles and scoped response headers) and function bundles consuming the updated overlay domain defaults. There are no schema, storage, auth, EventSub, publication identity, credential, or infrastructure definition changes; no infrastructure synthesis is necessary for this patch. Do not deploy or replace the protected local sandbox.

Before release, inspect existing hosted rewrite rules with the command below. This session could not inspect them because the AWS `default` profile was unavailable. Ensure `.mp3`/`.jpg` requests are not rewritten to the SPA; preserve every unrelated rule. Do not blindly replace app rules.

```powershell
aws amplify get-app --app-id d2cux232bpa951 --region eu-north-1 --profile default --query app.customRules --output json
```

After the approved deployment, check all eight URLs for HTTP 200, the expected MIME type, and asset bytes (not `index.html`). Then use Preview and the existing Send Test flow. Browser autoplay policy can still block sound; no bypass is introduced.

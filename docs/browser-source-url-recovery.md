# Browser Source URL recovery and alert timing

Normal saves still update the same publication snapshot and revision. They do not replace the active Brand lock, credential hash, URL, WebSocket connection or Twitch EventSub registrations. The existing 30-second revision refresh is unchanged.

Previously the URL existed only in editor memory: the backend stored a one-way hash. New sources now also store KMS ciphertext in the existing publication record. The dedicated rotating key is retained, and only the overlay handler receives encryption/decryption permission. Ciphertext is bound to the Brand and publication through KMS encryption context. Authenticated owner/Workspace/Brand checks precede URL retrieval and import; responses are not cacheable and omit raw credential fields. Source authentication still uses the existing hash index.

Existing hash-only publications cannot be reversed. Copy the existing URL from OBS and use **Restore existing URL** once. The server verifies the same website origin and exact credential hash before encrypting it. This does not rotate or replace anything. If the URL is lost everywhere, recovery is impossible; explicit rotation remains available but requires updating OBS. Never rotate merely to reopen the editor.

The panel masks the recovered URL until Show URL is selected, while Copy URL copies the complete usable URL. Lookup failures show Status unavailable rather than Not published. First creation remains explicit; local Preview never publishes.

Follow, Subscription, Bits/Cheer and Raid now default to 20 seconds. Existing explicit durations remain unchanged, including previously saved 6/8-second values whose provenance cannot be distinguished from custom durations. Reset to Default sets duration to 20 and clears the media/text overrides. Redemption retains its existing defaults. No audio files or timers were added or altered.

Production inspection found the four MP3 URLs serving index.html with audio/mpeg headers. The Amplify app's existing regex rewrite excluded JPG but not MP3. The repair adds only `mp3|` to its existing static-extension exclusions; the apex redirect and 404 fallback remain intact. All eight responses must be checked for byte equality as well as HTTP status and MIME after Hosting propagation.

Infrastructure changes are additive: one retained KMS key, its scoped handler permissions/environment, and one JWT-authorized import route. No existing Cognito, AppSync, DynamoDB, API or sandbox identity is replaced. No credentials belong in logs, analytics, local storage or test fixtures containing real user data.

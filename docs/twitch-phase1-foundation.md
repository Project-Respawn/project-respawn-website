# Twitch Phase 1 secure integration foundation

Phase 1A is implemented behind `VITE_TWITCH_SECURE_INTEGRATION=false`. It must
remain disabled until the additive Amplify resources are deployed and the
Phase 1B migration has been verified.

Broadcaster tokens are encrypted with a dedicated rotating KMS key before they
are stored in the backend-only `TwitchTokenVault` model. Safe integration and
health DTOs never include token ciphertext or plaintext. The bot authenticates
runtime lease requests with a timestamped, nonce-bearing HMAC signature and
uses short-lived integration-scoped leases for manifests, snapshots, access
tokens, and heartbeats.

The existing local connection store and command REST path remain active while
the secure feature flag is disabled. Do not delete the local connection file,
enable secure runtime, or rotate credentials before the approved Phase 1B
migration checkpoint.

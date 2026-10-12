# Immutable accepted recovery and rollback inputs

These nine exact artifacts are intentionally tracked because accepted manifests referenced ignored local .build paths. They are the minimum accepted runtime/template/candidate and prior rollback inputs, not a generated CDK assembly or disposable deployment cache. Original manifests and hashes are unchanged. The archive manifest maps original locations to content-addressed copies; this is provenance, not authorization to redeploy.

Run `node scripts/migration/verify-checkpoint.mjs` from the repository root (or `--staged` before committing) to verify archive, source and security pins without AWS access. Runtime ZIPs contain compiled code, not environment secrets or cursor material. No secret was retrieved to create this archive. Do not regenerate these binaries as a substitute for accepted bytes.

Historical runners may require their original local cache layout. Restore only an explicitly selected archived file to its recorded local path after verifying SHA-256 if a separately authorized task needs it. Do not replay historical commands/windows/revisions. The successful recovery consumed the original revisions; future live work requires a new gate.

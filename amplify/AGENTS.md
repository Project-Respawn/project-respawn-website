# Amplify-Specific Agent Instructions

The repository-root `AGENTS.md` protected-sandbox rules apply to this entire tree. Changes under `amplify/` require the compatibility procedure in `docs/local-amplify-development.md`.

Never use sandbox recreation as a metadata-refresh technique. Inspect the existing `Ntgrestage8` stack, type-check first, assess replacement risk, preserve auth/data identity, and stop before deployment if the CLI would select a different root stack. Deletion of a sandbox, CloudFormation stack, Cognito pool, table, bucket, or hosted environment always requires explicit target-specific user authorization.

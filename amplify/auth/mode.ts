/** Shared auth is opt-in until existing branch auth resources are safely retained. */
export function resolveAuthMode(environment: Record<string, string | undefined> = process.env): 'managed' | 'shared' {
  const mode = environment.RESPAWN_AUTH_MODE || 'managed';
  if (mode !== 'managed' && mode !== 'shared') {
    throw new Error('RESPAWN_AUTH_MODE must be managed or shared.');
  }
  if (mode === 'shared') {
    if (!environment.AWS_BRANCH) {
      throw new Error('Shared auth is not enabled for the protected local sandbox. A reviewed sandbox migration is required.');
    }
    if (environment.AWS_BRANCH === 'master') {
      throw new Error('master owns the shared Cognito resources and must keep managed auth.');
    }
  }
  return mode;
}

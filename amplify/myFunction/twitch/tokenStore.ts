import { DecryptCommand, EncryptCommand, KMSClient } from '@aws-sdk/client-kms'

export interface TwitchTokenBundle { accessToken: string; refreshToken: string; expiresAt: string | null; scopes: string[] }
const kms = new KMSClient({})
function context(integrationId: string) { return { service: 'project-respawn-twitch', integrationId } }

export async function encryptTokenBundle(integrationId: string, bundle: TwitchTokenBundle, keyId = process.env.TWITCH_TOKEN_KMS_KEY_ID || '', client = kms) {
  if (!keyId) throw new Error('Twitch token KMS key is not configured')
  const result = await client.send(new EncryptCommand({ KeyId: keyId, Plaintext: Buffer.from(JSON.stringify(bundle)), EncryptionContext: context(integrationId) }))
  if (!result.CiphertextBlob) throw new Error('KMS did not return token ciphertext')
  return Buffer.from(result.CiphertextBlob).toString('base64')
}
export async function decryptTokenBundle(integrationId: string, ciphertext: string, client = kms): Promise<TwitchTokenBundle> {
  const result = await client.send(new DecryptCommand({ CiphertextBlob: Buffer.from(ciphertext, 'base64'), EncryptionContext: context(integrationId) }))
  if (!result.Plaintext) throw new Error('KMS did not return token plaintext')
  return JSON.parse(Buffer.from(result.Plaintext).toString('utf8')) as TwitchTokenBundle
}

export async function putTokenBundle(client: any, integrationId: string, bundle: TwitchTokenBundle) {
  const encryptedTokenBundle = await encryptTokenBundle(integrationId, bundle)
  const existing = await client.models.TwitchTokenVault.get({ integrationId })
  const input = { integrationId, encryptedTokenBundle, tokenExpiresAt: bundle.expiresAt, scopes: bundle.scopes, tokenVersion: Number(existing.data?.tokenVersion || 0) + 1, updatedAt: new Date().toISOString() }
  const result = existing.data ? await client.models.TwitchTokenVault.update(input) : await client.models.TwitchTokenVault.create(input)
  if (result.errors?.length) throw new Error('Failed to store Twitch token bundle')
  return { tokenExpiresAt: input.tokenExpiresAt, scopes: input.scopes, tokenVersion: input.tokenVersion }
}

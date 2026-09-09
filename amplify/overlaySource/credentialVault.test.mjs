import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

const read = name => readFile(new URL(name, import.meta.url), 'utf8');
const moduleUrl = code => `data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(code)).toString('base64')}`;
const domain = await import(moduleUrl(await read('domain.ts')));
const origin = 'https://www.projectrespawn.com', credential = 'test-only-existing-credential';
const publication = { publicationId: 'publication', brandId: 'brand', credentialHash: domain.hashOverlayCredential(credential) };
const sealed = new Map();
class EncryptCommand { constructor(input) { this.input = input; } }
class DecryptCommand { constructor(input) { this.input = input; } }
class KMSClient {
  async send(command) {
    const input = command.input, context = JSON.stringify(input.EncryptionContext);
    if (command instanceof EncryptCommand) {
      const key = `encrypted-${sealed.size}`;
      sealed.set(key, { context, plaintext: input.Plaintext });
      return { CiphertextBlob: Buffer.from(key) };
    }
    const value = sealed.get(input.CiphertextBlob.toString());
    assert.equal(context, value.context, 'ciphertext is bound to publication and Brand');
    return { Plaintext: value.plaintext };
  }
}
const vault = runInNewContext(stripTypeScriptTypes(await read('credentialVault.ts')).replace(/^import .*$/gm, '').replace(/export /g, '') + '\n({browserSourceUrl, importedCredential, encryptCredential, decryptCredential})', { ...domain, Buffer, URL, process: { env: { OVERLAY_CREDENTIAL_KEY_ID: 'test-key' } }, KMSClient, EncryptCommand, DecryptCommand });

test('encrypted credential round trips to the same usable URL without changing its hash', async () => {
  const encrypted = await vault.encryptCredential(publication, credential);
  assert.ok(!encrypted.includes(credential));
  const recovered = await vault.decryptCredential({ ...publication, credentialCiphertext: encrypted });
  assert.equal(recovered, credential);
  assert.equal(vault.browserSourceUrl(origin, recovered), `${origin}/overlay-source/${credential}`);
  assert.equal(await vault.decryptCredential(publication), undefined, 'legacy hashes are not silently rotated');
  await assert.rejects(vault.decryptCredential({ ...publication, brandId: 'other', credentialCiphertext: encrypted }));
  await assert.rejects(vault.decryptCredential({ ...publication, credentialHash: domain.hashOverlayCredential('rotated'), credentialCiphertext: encrypted }));
});

test('existing URL import only accepts the exact origin and credential of this publication', () => {
  assert.equal(vault.importedCredential(`${origin}/overlay-source/${credential}`, origin, publication), credential);
  for (const url of [`https://evil.example/overlay-source/${credential}`, `${origin}/overlay-source/other`, `${origin}/overlay-source/${credential}?x=1`, `${origin}/overlay-source/${credential}#secret`, `https://user:pass@www.projectrespawn.com/overlay-source/${credential}`, 'not a URL']) {
    assert.throws(() => vault.importedCredential(url, origin, publication), /existing OBS URL/);
  }
});

test('owner lookup, import and creation use encrypted retrieval while normal saves never change credentials', async () => {
  const handler = await read('handler.ts');
  const importPath = handler.slice(handler.indexOf('async function importSourceUrl'), handler.indexOf('async function sourceConfig'));
  assert.match(importPath, /await authorizeActivePublication\(publication, sub\)/);
  assert.match(importPath, /importedCredential/);
  assert.match(importPath, /SET credentialCiphertext = :ciphertext/);
  assert.match(importPath, /credentialHash = :hash AND attribute_not_exists\(revokedAt\)/);
  assert.doesNotMatch(importPath, /issueOverlayCredential|rotatePublicationCredential|SET credentialHash|sceneSnapshot/);
  const update = handler.slice(handler.indexOf('async function updatePublication'), handler.indexOf('async function revokePublication'));
  assert.doesNotMatch(update, /credential|TransactWriteCommand/);
  assert.match(handler, /credentialCiphertext: await encryptCredential\(record, issued.credential\)/);
  assert.match(handler, /credential: await decryptCredential\(publication\)/);
  assert.match(handler, /'cache-control': 'no-store'/);
  assert.match(handler, /const \{ credential, \.\.\.metadata \} = extra/);
});

test('authenticated import and editor reload round trip the same publication and reject another owner', async () => {
  const stored = { ...publication, workspaceId: 'workspace', ownerUserId: 'owner', revision: 4, sceneSnapshot: { widgets: [] } };
  const updates = [];
  class Command { constructor(input) { this.input = input; } }
  class GetCommand extends Command {}
  class QueryCommand extends Command {}
  class UpdateCommand extends Command {}
  const db = { async send(command) {
    const input = command.input;
    if (command instanceof QueryCommand) return { Items: [] };
    if (command instanceof UpdateCommand) {
      updates.push(input);
      stored.credentialCiphertext = input.ExpressionAttributeValues[':ciphertext'];
      return {};
    }
    if (input.TableName === 'workspace') return { Item: { id: 'workspace', ownerUserId: 'owner' } };
    if (input.TableName === 'brand') return { Item: { id: 'brand', workspaceId: 'workspace', ownerUserId: 'owner' } };
    return { Item: input.Key.publicationId === domain.activePublicationLockId('brand') ? { activePublicationId: stored.publicationId } : stored };
  } };
  const source = stripTypeScriptTypes(await read('handler.ts')).replace(/^import .*$/gm, '').replace(/export /g, '');
  const api = runInNewContext(source + '\n({importSourceUrl, activePublication})', {
    ...domain, ...vault, GetCommand, QueryCommand, UpdateCommand,
    DynamoDBClient: class {}, DynamoDBDocumentClient: { from: () => db },
    process: { env: { PUBLICATION_TABLE: 'publications', CONNECTION_TABLE: 'connections', WORKSPACE_TABLE: 'workspace', BRAND_TABLE: 'brand', FRONTEND_ORIGIN: origin } },
  });
  const event = { requestContext: { authorizer: { jwt: { claims: { sub: 'owner' } } } }, queryStringParameters: { workspaceId: 'workspace', brandId: 'brand' }, body: JSON.stringify({ browserSourceUrl: `${origin}/overlay-source/${credential}` }) };
  await assert.rejects(api.importSourceUrl({ ...event, requestContext: { authorizer: { jwt: { claims: { sub: 'intruder' } } } } }, stored.publicationId), /access is denied/);
  assert.equal(updates.length, 0);
  const imported = JSON.parse((await api.importSourceUrl(event, stored.publicationId)).body);
  const reopened = JSON.parse((await api.activePublication(event)).body).publication;
  assert.equal(reopened.publicationId, stored.publicationId);
  assert.equal(reopened.browserSourceUrl, imported.browserSourceUrl);
  assert.equal(stored.credentialHash, publication.credentialHash);
  assert.equal(stored.revision, 4);
  assert.equal('credential' in reopened, false);
  assert.equal('credentialCiphertext' in reopened, false);
  assert.equal(updates.length, 1);
});

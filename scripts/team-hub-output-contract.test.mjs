import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { compareOperations, frontendOperations, hasContractErrors, outputOperations, schemaOperations } from './lib/amplify-contract.mjs';

const schema = schemaOperations(readFileSync(new URL('../amplify/data/resource.ts', import.meta.url), 'utf8'));
const frontend = frontendOperations([readFileSync(new URL('../src/features/Team Hub/teamHub.service.js', import.meta.url), 'utf8')]);
const outputs = () => ({ data: { model_introspection: Object.fromEntries(
  Object.entries(schema).map(([kind, names]) => [kind, Object.fromEntries([...names].map(name => [name, {}]))]),
) } });
const compare = fixture => compareOperations(schema, frontend, outputOperations(fixture));

test('Team Hub service and authoritative schema retain the query and mutation contract', () => {
  assert(schema.queries.has('readTeamHub'));
  assert(schema.mutations.has('mutateTeamHub'));
  assert(frontend.queries.has('readTeamHub'));
  assert(frontend.mutations.has('mutateTeamHub'));
  assert.equal(hasContractErrors(compare(outputs())), false);
});

for (const [kind, operation] of [['queries', 'readTeamHub'], ['mutations', 'mutateTeamHub']]) {
  test(`missing generated ${operation} fails both schema and frontend validation`, () => {
    const fixture = outputs();
    delete fixture.data.model_introspection[kind][operation];
    const result = compare(fixture);
    assert.deepEqual(result[kind].schemaMissingFromOutputs, [operation]);
    assert.deepEqual(result[kind].frontendMissingFromOutputs, [operation]);
    assert.equal(hasContractErrors(result), true);
  });

  test(`wrong casing of generated ${operation} cannot satisfy the contract`, () => {
    const fixture = outputs();
    delete fixture.data.model_introspection[kind][operation];
    fixture.data.model_introspection[kind][operation.toLowerCase()] = {};
    const result = compare(fixture);
    assert.deepEqual(result[kind].frontendMissingFromOutputs, [operation]);
    assert.deepEqual(result[kind].staleOutputs, [operation.toLowerCase()]);
    assert.equal(hasContractErrors(result), true);
  });
}

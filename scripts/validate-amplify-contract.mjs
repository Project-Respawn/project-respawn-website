import fs from 'node:fs'
import path from 'node:path'
import {
  compareOperations, counts, frontendOperations, hasContractErrors,
  outputOperations, readFrontendSources, schemaOperations,
} from './lib/amplify-contract.mjs'

const root = process.cwd()
const outputsPath = path.resolve(root, process.env.AMPLIFY_OUTPUTS_PATH || 'amplify_outputs.json')
const schema = schemaOperations(fs.readFileSync(path.join(root, 'amplify/data/resource.ts'), 'utf8'))
const frontend = frontendOperations(readFrontendSources(root))
const outputs = outputOperations(JSON.parse(fs.readFileSync(outputsPath, 'utf8')))
const comparison = compareOperations(schema, frontend, outputs)

if (hasContractErrors(comparison)) {
  console.error('Amplify custom-operation contract validation failed.')
  for (const [kind, groups] of Object.entries(comparison)) {
    for (const [label, names] of Object.entries(groups)) if (names.length) console.error(`${kind}.${label}: ${names.join(', ')}`)
  }
  process.exit(1)
}

const schemaCount = counts(schema)
const frontendCount = counts(frontend)
console.log(`Amplify contract verified: ${schemaCount.queries} queries, ${schemaCount.mutations} mutations, ${schemaCount.subscriptions} subscriptions.`)
console.log(`Frontend contract verified: ${frontendCount.queries + frontendCount.mutations + frontendCount.subscriptions} operations; 0 missing.`)

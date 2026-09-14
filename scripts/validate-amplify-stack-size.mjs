import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const DEFAULT_TEMPLATE_DIR = '.amplify/artifacts/cdk.out'
const DEFAULT_MAX_RESOURCES = 480

const templateDir = resolve(process.argv[2] || DEFAULT_TEMPLATE_DIR)
const maxResources = Number(process.env.AMPLIFY_STACK_RESOURCE_LIMIT || DEFAULT_MAX_RESOURCES)

if (!Number.isInteger(maxResources) || maxResources < 1 || maxResources > 500) {
  throw new Error('AMPLIFY_STACK_RESOURCE_LIMIT must be an integer between 1 and 500')
}

const templateFiles = readdirSync(templateDir, { recursive: true })
  .filter((file) => file.endsWith('.template.json'))

if (templateFiles.length === 0) {
  throw new Error(`No CloudFormation templates found in ${templateDir}. Run Amplify synthesis first.`)
}

const stacks = templateFiles.map((file) => {
  const template = JSON.parse(readFileSync(resolve(templateDir, file), 'utf8'))
  return { file, resources: Object.keys(template.Resources || {}).length }
}).sort((left, right) => right.resources - left.resources)

for (const stack of stacks.slice(0, 10)) {
  console.log(`${stack.resources}\t${stack.file}`)
}

const oversized = stacks.filter((stack) => stack.resources > maxResources)
if (oversized.length > 0) {
  console.error(`Amplify stack resource guard failed: ${oversized.length} template(s) exceed ${maxResources} resources.`)
  process.exitCode = 1
} else {
  console.log(`Amplify stack resource guard passed: ${stacks.length} template(s), maximum ${stacks[0].resources}/${maxResources}.`)
}

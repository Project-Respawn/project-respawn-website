import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { EXPECTED_SANDBOX_IDENTIFIER, assertProtectedSandboxRoot, deploymentPrefix } from './lib/local-amplify-environment.mjs'

const aws = process.platform === 'win32' ? 'aws.exe' : 'aws'
const outputs = JSON.parse(fs.readFileSync('amplify_outputs.json', 'utf8'))
const pool = JSON.parse(execFileSync(aws, ['cognito-idp', 'describe-user-pool', '--user-pool-id', outputs.auth.user_pool_id, '--region', outputs.auth.aws_region, '--query', 'UserPool.Arn', '--output', 'json'], { encoding: 'utf8' }))
const tags = JSON.parse(execFileSync(aws, ['cognito-idp', 'list-tags-for-resource', '--resource-arn', pool, '--region', outputs.auth.aws_region, '--query', 'Tags', '--output', 'json'], { encoding: 'utf8' }))
const prefix = deploymentPrefix(String(tags['aws:cloudformation:stack-name'] || ''), 'Current outputs')
if (tags['amplify:deployment-type'] !== 'sandbox') throw new Error('Current outputs do not target a sandbox.')
assertProtectedSandboxRoot(prefix)
console.log(`Protected sandbox preflight passed for ${EXPECTED_SANDBOX_IDENTIFIER}: ${prefix}`)
console.log('This preflight validates the current target but cannot guarantee CDK will not propose replacement. Stop if ampx prints a different root stack.')

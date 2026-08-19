import assert from 'node:assert/strict'
import fs from 'node:fs'

const schema = fs.readFileSync(new URL('./resource.ts', import.meta.url), 'utf8')
const router = fs.readFileSync(new URL('../myFunction/router/appSyncRouter.ts', import.meta.url), 'utf8')
const section = schema.slice(schema.indexOf('ApplicationSubmission: a.model'), schema.indexOf('/*\n     * 3. TWITCH'))

for (const model of ['ApplicationSubmission', 'ApplicationAnswer', 'ApplicationCreatorProfile', 'ApplicationSchedule', 'ApplicationAuditEvent', 'ApplicationIdempotency', 'ApplicationPublicRateLimit']) {
  assert.match(section, new RegExp(`${model}: a\\.model`), `${model} model exists`)
}
for (const relation of ["a.hasMany('ApplicationAnswer', 'applicationId')", "a.hasMany('ApplicationCreatorProfile', 'applicationId')", "a.hasMany('ApplicationSchedule', 'applicationId')", "a.hasMany('ApplicationAuditEvent', 'applicationId')"]) assert.ok(section.includes(relation))
assert.doesNotMatch(section, /allow\.(publicApiKey|guest|authenticated|owner)\(/)
assert.equal((section.match(/allow\.groups\(\['SuperAdmin'\]\)\.to\(\[\]\)/g) || []).length, 7, 'all model client operation sets are empty')
assert.match(schema, /\.authorization\(\(allow\) => \[[\s\S]*allow\.resource\(myFunction\)\.to\(\['query', 'mutate'\]\)/)
assert.match(schema, /storeTrustedApplicationSubmission:[\s\S]*?allow\.groups\(\['SuperAdmin'\]\)/)
assert.match(schema, /listAdminApplications:[\s\S]*?allow\.authenticated\(\)/)
assert.match(schema, /getAdminApplication:[\s\S]*?allow\.authenticated\(\)/)
for (const operation of ['storeTrustedApplicationSubmission', 'listAdminApplications', 'getAdminApplication']) assert.match(router, new RegExp(`case '${operation}'`))
assert.match(schema, /submitPublicApplication:[\s\S]*?allow\.publicApiKey\(\)/)
assert.match(router, /case 'submitPublicApplication'/)

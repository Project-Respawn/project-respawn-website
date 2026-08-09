import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const restRouterSource = readFileSync(new URL('./restRouter.ts', import.meta.url), 'utf8')
const backendSource = readFileSync(new URL('../../backend.ts', import.meta.url), 'utf8')

assert.match(restRouterSource, /handleTwitchCommandsLookup/)
assert.match(restRouterSource, /path === '\/twitch\/commands'/)
assert.match(restRouterSource, /twitch\/commands\/me/)
assert.match(backendSource, /path:\s*'\/twitch\/commands'/)

console.log('legacy Twitch command REST compatibility test passed')

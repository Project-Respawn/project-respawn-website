import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const restRouterSource = readFileSync(new URL('./restRouter.ts', import.meta.url), 'utf8')
const backendSource = readFileSync(new URL('../../backend.ts', import.meta.url), 'utf8')

assert.doesNotMatch(restRouterSource, /handleTwitchCommandsLookup/)
assert.doesNotMatch(restRouterSource, /path === '\/twitch\/commands'/)
assert.doesNotMatch(restRouterSource, /twitch\/commands\/me/)
assert.doesNotMatch(backendSource, /path:\s*'\/twitch\/commands'/)

console.log('legacy Twitch command REST route removal test passed')

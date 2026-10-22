import './offline-guard.mjs'
import { registerHooks } from 'node:module'
registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('$amplify/env/')) return {url:'data:text/javascript,export const env={}',shortCircuit:true}
  return next(specifier,context)
} })
process.env.REVOLUT_MODE=process.env.COMMERCE_TEST_MODE==='production'?'prod':'sandbox'
process.env.APP_ENV=process.env.REVOLUT_MODE==='prod'?'prod':'sandbox'
const {register}=await import('tsx/esm/api')
register()

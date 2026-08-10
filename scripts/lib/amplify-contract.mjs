import fs from 'node:fs'
import path from 'node:path'

const KINDS = ['queries', 'mutations', 'subscriptions']
const SCHEMA_KIND = { query: 'queries', mutation: 'mutations', subscription: 'subscriptions' }

export function schemaOperations(schemaText) {
  const result = { queries: new Set(), mutations: new Set(), subscriptions: new Set() }
  const pattern = /^\s{4}([A-Za-z_][A-Za-z0-9_]*):\s*a\s*(?:\.\s*)?(query|mutation|subscription)\s*\(/gm
  for (const match of schemaText.matchAll(pattern)) result[SCHEMA_KIND[match[2]]].add(match[1])
  return result
}

export function frontendOperations(sourceTexts) {
  const result = { queries: new Set(), mutations: new Set(), subscriptions: new Set() }
  const pattern = /\.\s*(queries|mutations|subscriptions)\s*(?:\.\s*([A-Za-z_][A-Za-z0-9_]*)|\[\s*['"]([^'"]+)['"]\s*\])/g
  for (const text of sourceTexts) {
    for (const match of text.matchAll(pattern)) result[match[1]].add(match[2] || match[3])
  }
  return result
}

export function outputOperations(outputs) {
  const introspection = outputs?.data?.model_introspection || {}
  return Object.fromEntries(KINDS.map((kind) => [kind, new Set(Object.keys(introspection[kind] || {}))]))
}

export function compareOperations(schema, frontend, outputs) {
  const result = {}
  for (const kind of KINDS) {
    result[kind] = {
      schemaMissingFromOutputs: [...schema[kind]].filter((name) => !outputs[kind].has(name)).sort(),
      frontendMissingFromSchema: [...frontend[kind]].filter((name) => !schema[kind].has(name)).sort(),
      frontendMissingFromOutputs: [...frontend[kind]].filter((name) => !outputs[kind].has(name)).sort(),
      staleOutputs: [...outputs[kind]].filter((name) => !schema[kind].has(name)).sort(),
    }
  }
  return result
}

export function hasContractErrors(comparison) {
  return Object.values(comparison).some((entry) => Object.values(entry).some((items) => items.length))
}

export function readFrontendSources(rootDir) {
  const sources = []
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) visit(fullPath)
      else if (/\.(?:js|ts|vue)$/.test(entry.name)) sources.push(fs.readFileSync(fullPath, 'utf8'))
    }
  }
  visit(path.join(rootDir, 'src'))
  return sources
}

export function counts(operations) {
  return Object.fromEntries(KINDS.map((kind) => [kind, operations[kind].size]))
}

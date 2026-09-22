import assert from 'node:assert/strict'
import ts from 'typescript'
import { parse } from 'vue/compiler-sfc'
import { parse as parseTemplate } from '@vue/compiler-dom'

// Execute narrowly selected, trusted repository expressions, never external input.
// AST selection makes these contracts independent of whitespace and quote style.
export function evaluate(expression, bindings) {
  return Function(...Object.keys(bindings), `return (${expression})`)(...Object.values(bindings))
}

export function declaration(source, name) {
  const script = source.includes('<script') ? parse(source).descriptor.scriptSetup.content : source
  const file = ts.createSourceFile('contract.js', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
  const matches = []
  function visit(node) {
    if ((ts.isVariableDeclaration(node) || ts.isFunctionDeclaration(node)) && node.name?.getText(file) === name) matches.push(node)
    ts.forEachChild(node, visit)
  }
  visit(file)
  assert.equal(matches.length, 1, `Expected one declaration of ${name}`)
  const node = matches[0]
  return ts.isFunctionDeclaration(node) ? node.getText(file) : node.initializer.getText(file)
}

export function templateNodes(source, predicate) {
  const template = parse(source).descriptor.template
  assert.ok(template, 'Expected Vue template')
  const matches = []
  function visit(node) {
    if (predicate(node)) matches.push(node)
    for (const child of node.children || []) visit(child)
  }
  visit(parseTemplate(template.content))
  return matches
}

export function componentCondition(source, tag) {
  const nodes = templateNodes(source, node => node.type === 1 && node.tag === tag)
  assert.equal(nodes.length, 1, `Expected one ${tag}`)
  const condition = nodes[0].props.find(prop => prop.type === 7 && prop.name === 'if')
  assert.ok(condition?.exp, `Expected v-if on ${tag}`)
  return condition.exp.content
}

export function routeRecords(source) {
  const file = ts.createSourceFile('routes.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
  const imports = file.statements.filter(ts.isImportDeclaration)
  const bindings = Object.fromEntries(imports.map(node => [node.importClause.name.text, node.moduleSpecifier.text]))
  const exportNode = file.statements.find(ts.isExportAssignment)
  assert.ok(exportNode, 'Expected route export')
  // Retain actual route metadata declarations; substitute component imports with paths.
  const declarations = file.statements.filter(node => !ts.isImportDeclaration(node) && !ts.isExportAssignment(node)).map(node => node.getText(file)).join('\n')
  return Function(...Object.keys(bindings), `${declarations}\nreturn (${exportNode.expression.getText(file)})`)(...Object.values(bindings))
}

// Record the actual CommonJS library files loaded by the synthesized app.
const Module = require('node:module'), fs = require('node:fs'), path = require('node:path');
const original = Module._resolveFilename, loaded = new Set();
Module._resolveFilename = function (...args) {
  const value = original.apply(this, args);
  if (typeof value === 'string' && path.isAbsolute(value)) loaded.add(value);
  return value;
};
process.on('exit', () => fs.writeFileSync(process.env.TOURNAMENT_TRACE, JSON.stringify([...loaded].sort(), null, 2)));

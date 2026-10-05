// Executed only by the local synthesis subprocess. Refuse network and subprocess execution.
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const loaded = new Set();
const original = Module._load;
Module._load = function (request, parent, isMain) {
  const resolved = Module._resolveFilename(request, parent, isMain);
  if (path.isAbsolute(resolved)) loaded.add(resolved);
  return original.apply(this, arguments);
};
const deny = () => { throw new Error('Network/subprocess prohibited during Team Hub offline synthesis'); };
for (const [name, methods] of Object.entries({ 'node:http': ['request', 'get'], 'node:https': ['request', 'get'], 'node:net': ['connect', 'createConnection'], 'node:tls': ['connect'], 'node:dns': ['lookup', 'resolve'], 'node:child_process': ['spawn', 'spawnSync', 'exec', 'execSync', 'execFile', 'execFileSync', 'fork'] })) {
  const module = require(name); for (const method of methods) module[method] = deny;
}
require('node:net').Socket.prototype.connect = deny;
globalThis.fetch = deny;
process.on('exit', () => fs.writeFileSync(process.env.TEAM_HUB_TRACE, JSON.stringify([...loaded].sort(), null, 2)));

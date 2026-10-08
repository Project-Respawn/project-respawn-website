// Explicit offline candidate configuration. Never selected by ordinary npm build/dev.
// The proposal activation remains reviewed:false and cannot call the live API.
import {defineConfig,mergeConfig} from 'vite';
import path from 'node:path';
import normalConfig from '../../vite.config.js';
export default defineConfig(env=>mergeConfig(normalConfig(env),{
 plugins:[{name:'team-hub-future-cutover',enforce:'pre',resolveId(source){
  if(source.endsWith('teamHub.service.js')||source.endsWith('migration-mode.mjs'))
   return path.resolve('src/features/team-hub/services/independent-service.mjs');
 }}],
 server:{open:false},
 build:{outDir:'.tmp/team-hub-2b5b/independent-website',emptyOutDir:true}
}));

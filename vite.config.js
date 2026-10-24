import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import { localTeamHubAliases } from './scripts/lib/team-hub-local-binding.mjs';

function getAmplifyApiGatewayUrl() {
  try {
    const outputsPath = resolve(__dirname, './amplify_outputs.json');
    if (!existsSync(outputsPath)) return '';
    const outputs = JSON.parse(readFileSync(outputsPath, 'utf8'));
    return outputs?.custom?.API?.projectRespawnApi?.endpoint?.replace(/\/+$/, '') || '';
  } catch {
    return '';
  }
}

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const readJson = file => JSON.parse(readFileSync(resolve(__dirname, file), 'utf8'));
  const teamAliases = command === 'serve' ? localTeamHubAliases({
    command, root: __dirname,
    outputs: readJson('amplify_outputs.json'),
    core: readJson('config/domains/core/domain-endpoints.Ntgre.json'),
    manifest: readJson('config/domains/team-hub/domain-endpoints.Ntgre.json'),
    activation: readJson('config/domains/team-hub/frontend-development.Ntgre.json'),
  }) : [];
  const apiGatewayUrl =
    env.VITE_API_PROXY_TARGET || env.VITE_API_BASE_URL || getAmplifyApiGatewayUrl();

  return {
    plugins: [vue()],
    // Only the real application is a dependency-scan entry. Archived release
    // and synthetic preview HTML under .tmp must not initialize extra apps.
    optimizeDeps: { entries: ['index.html'] },
    resolve: {
      alias: [...teamAliases, { find: '@', replacement: resolve(__dirname, './src') }],
    },
    server: {
      port: 5174,
      open: true,
      ...(apiGatewayUrl
        ? {
            proxy: {
              '/api': {
                target: apiGatewayUrl,
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
              },
            },
          }
        : {}),
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          error: resolve(__dirname, 'public/error.html'),
        },
      },
    },
  };
});

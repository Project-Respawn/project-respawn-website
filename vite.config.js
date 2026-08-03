import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiGatewayUrl =
    env.VITE_API_PROXY_TARGET || env.VITE_API_BASE_URL || getAmplifyApiGatewayUrl();

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
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
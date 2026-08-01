import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { readFileSync } from 'fs';

function getAmplifyApiGatewayUrl() {
  try {
    const outputsPath = resolve(__dirname, './amplify_outputs.json');
    const outputs = JSON.parse(readFileSync(outputsPath, 'utf8'));
    return outputs?.custom?.API?.projectRespawnApi?.endpoint?.replace(/\/+$/, '') || '';
  } catch {
    return '';
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiGatewayUrl = env.VITE_API_PROXY_TARGET || getAmplifyApiGatewayUrl();

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
      proxy: {
        '/api': {
          target: apiGatewayUrl,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
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
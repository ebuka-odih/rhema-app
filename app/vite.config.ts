import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react({
          include: [/\.[jt]sx?$/, /node_modules\/@expo\/vector-icons\/.*\.js$/],
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        extensions: ['.web.tsx', '.tsx', '.web.ts', '.ts', '.web.jsx', '.jsx', '.web.js', '.js', '.json'],
        alias: {
          'expo-audio': path.resolve(__dirname, './shims/expo-audio.web.ts'),
          'expo-apple-authentication': path.resolve(__dirname, './shims/expo-apple-authentication.web.tsx'),
          'expo-clipboard': path.resolve(__dirname, './shims/expo-clipboard.web.ts'),
          'expo-device': path.resolve(__dirname, './shims/expo-device.web.ts'),
          'expo-haptics': path.resolve(__dirname, './shims/expo-haptics.web.ts'),
          'expo-keep-awake': path.resolve(__dirname, './shims/expo-keep-awake.web.ts'),
          'expo-media-library': path.resolve(__dirname, './shims/expo-media-library.web.ts'),
          'expo-notifications': path.resolve(__dirname, './shims/expo-notifications.web.ts'),
          'expo-secure-store': path.resolve(__dirname, './shims/expo-secure-store.web.ts'),
          'expo-sharing': path.resolve(__dirname, './shims/expo-sharing.web.ts'),
          'expo-sqlite': path.resolve(__dirname, './shims/expo-sqlite.web.ts'),
          '@react-native-community/datetimepicker': path.resolve(__dirname, './shims/react-native-datetimepicker.web.tsx'),
          'react-native-qrcode-svg': path.resolve(__dirname, './shims/react-native-qrcode-svg.web.tsx'),
          'react-native-view-shot': path.resolve(__dirname, './shims/react-native-view-shot.web.tsx'),
          'react-native': 'react-native-web',
          '@': path.resolve(__dirname, '.'),
        }
      },
      optimizeDeps: {
        esbuildOptions: {
          resolveExtensions: ['.web.tsx', '.tsx', '.web.ts', '.ts', '.web.jsx', '.jsx', '.web.js', '.js', '.json'],
          loader: {
            '.js': 'jsx',
          },
        },
      },
      build: {
        commonjsOptions: {
          transformMixedEsModules: true,
        },
      },
    };
});

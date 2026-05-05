import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GROQ_API_KEY': JSON.stringify(env.VITE_GROQ_API_KEY || env.GROQ_API_KEY || process.env.GROQ_API_KEY || ""),
      'process.env.APP_URL': JSON.stringify(env.APP_URL || process.env.APP_URL || ""),
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), './src'),
      },
    },
    server: {
      port: 3000,
      host: true,
      allowedHosts: true,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-groq': ['groq-sdk'],
            'vendor-utils': ['lucide-react', 'recharts', 'motion/react'],
          },
        },
      },
    }

  };
});

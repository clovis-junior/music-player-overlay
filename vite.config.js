import { defineConfig } from 'vite'
import netlify from '@netlify/vite-plugin'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true
  },
  plugins: [
    netlify(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})

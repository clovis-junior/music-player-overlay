import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import netlify from '@netlify/vite-plugin'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isLocal = (command === 'serve')

  return {
    server: {
      host: true,
      https: true
    },
    plugins: [
      netlify(),
      react(),
      isLocal && mkcert(),
      babel({ presets: [reactCompilerPreset()] })
    ].filter(Boolean)
  }
})
import { defineConfig } from 'vite'
import type { UserConfig } from 'vite'

export default defineConfig((): UserConfig => {
  return {
    // Set base to relative path for GitHub Pages
    base: './',
    
    build: {
      // Ensure assets are referenced relatively
      assetsDir: 'assets',
      // Minify output
      minify: 'terser',
    },
  }
})

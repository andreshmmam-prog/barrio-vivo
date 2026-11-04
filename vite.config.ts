import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` genera la app normal (carpeta dist).
// `npm run build:single` genera un único index.html autocontenido,
// útil para publicarlo como página o enviarlo por correo.
export default defineConfig(({ mode }) => ({
  plugins: mode === 'single' ? [react(), viteSingleFile()] : [react()],
  base: './',
  build: mode === 'single' ? { outDir: 'dist-single' } : undefined,
}))

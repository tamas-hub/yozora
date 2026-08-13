import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' — GitHub Pages（サブパス）でもローカルでもそのまま動く相対パス構成
export default defineConfig({
  base: './',
  plugins: [react()],
})

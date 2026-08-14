import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource/ibm-plex-mono/400.css'
import './index.css'
import App from './App.tsx'
import { isNativeApp } from './lib/native.ts'

const nativeApp = isNativeApp()
document.documentElement.classList.toggle('native-app', nativeApp)

if (import.meta.env.PROD && !nativeApp && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(new URL('sw.js', document.baseURI), { updateViaCache: 'none' })
      .catch((error: unknown) => console.error('Service worker registration failed', error))
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { useEffect, useRef, useState } from 'react'
import { t, type Lang } from '../lib/i18n'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true
  )
}

function isIos(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

function InstallIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true">
      <path d="M9 1.5v9m-3-3 3 3 3-3M3 11.5v4h12v-4" fill="none" stroke="currentColor" strokeLinecap="square" />
    </svg>
  )
}

export function InstallApp({ lang }: { lang: Lang }) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosGuide, setShowIosGuide] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const ios = isIos()
  const standalone = isStandalone()

  useEffect(() => {
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
    }
    const handleInstalled = () => setPromptEvent(null)
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  useEffect(() => {
    if (!showIosGuide) return
    closeButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowIosGuide(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showIosGuide])

  if (standalone || (!ios && !promptEvent)) return null

  const handleInstall = async () => {
    if (ios) {
      setShowIosGuide(true)
      return
    }
    if (!promptEvent) return
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome !== 'dismissed') setPromptEvent(null)
  }

  return (
    <>
      <button className="page-link install-button" type="button" onClick={handleInstall}>
        <InstallIcon />
        {t(lang, 'pwa.install')}
      </button>
      {showIosGuide && (
        <div className="install-guide-backdrop" onMouseDown={() => setShowIosGuide(false)}>
          <section
            className="install-guide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-guide-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <p className="install-guide-kicker">YOZORA / HOME SCREEN</p>
            <h2 id="install-guide-title">{t(lang, 'pwa.iosTitle')}</h2>
            <ol>
              <li>{t(lang, 'pwa.iosStep1')}</li>
              <li>{t(lang, 'pwa.iosStep2')}</li>
              <li>{t(lang, 'pwa.iosStep3')}</li>
            </ol>
            <p>{t(lang, 'pwa.iosNote')}</p>
            <button ref={closeButtonRef} className="install-guide-close" type="button" onClick={() => setShowIosGuide(false)}>
              {t(lang, 'pwa.close')}
            </button>
          </section>
        </div>
      )}
    </>
  )
}

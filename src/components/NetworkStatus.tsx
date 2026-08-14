import { useEffect, useState } from 'react'
import { t, type Lang } from '../lib/i18n'

export function NetworkStatus({ lang }: { lang: Lang }) {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (online) return null
  return (
    <p className="offline-notice" role="status">
      <span aria-hidden="true">●</span>
      {t(lang, 'pwa.offline')}
    </p>
  )
}

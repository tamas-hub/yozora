import { useState } from 'react'
import { t, type Lang } from '../lib/i18n'
import { impactLight, isNativeApp, shareText } from '../lib/native'

interface Props {
  lang: Lang
  updatedAt: Date | null
  cached: boolean
  shareMessage: string | null
  refreshing: boolean
  onRefresh: () => void
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true">
      <path d="M14.8 6.2A6 6 0 1 0 15 11" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="m11.7 2.7 3.4 3.5 1.4-4.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true">
      <path d="M9 11V1.5m-3 3L9 1.5l3 3M3 8.5v7h12v-7" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

export function NativeToolbar({
  lang,
  updatedAt,
  cached,
  shareMessage,
  refreshing,
  onRefresh,
}: Props) {
  const [sharing, setSharing] = useState(false)
  if (!isNativeApp()) return null

  const updatedLabel = updatedAt
    ? t(lang, cached ? 'native.cachedAt' : 'native.updatedAt', {
        time: updatedAt.toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
    : t(lang, 'native.notUpdated')

  return (
    <aside className={`native-toolbar ${cached ? 'native-toolbar-cached' : ''}`} aria-label={t(lang, 'native.tools')}>
      <div className="native-update-state" role="status">
        <span aria-hidden="true" />
        <div>
          <strong>{cached ? t(lang, 'native.offlineSnapshot') : t(lang, 'native.liveForecast')}</strong>
          <small>{updatedLabel}</small>
        </div>
      </div>
      <div className="native-actions">
        <button
          type="button"
          disabled={refreshing}
          onClick={() => {
            void impactLight()
            onRefresh()
          }}
        >
          <RefreshIcon />
          {refreshing ? t(lang, 'native.refreshing') : t(lang, 'native.refresh')}
        </button>
        <button
          type="button"
          disabled={!shareMessage || sharing}
          onClick={() => {
            if (!shareMessage) return
            setSharing(true)
            void impactLight()
            void shareText('YOZORA', shareMessage).finally(() => setSharing(false))
          }}
        >
          <ShareIcon />
          {t(lang, 'native.share')}
        </button>
      </div>
    </aside>
  )
}

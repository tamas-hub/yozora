import { useState } from 'react'
import { CITIES, cityLabel, type City } from '../lib/geo'
import { t, type Lang } from '../lib/i18n'

/** 十字照準（現在地）アイコン */
function CrosshairIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
      <line x1="8" y1="0" x2="8" y2="4" stroke="currentColor" strokeWidth="1" />
      <line x1="8" y1="12" x2="8" y2="16" stroke="currentColor" strokeWidth="1" />
      <line x1="0" y1="8" x2="4" y2="8" stroke="currentColor" strokeWidth="1" />
      <line x1="12" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

interface Props {
  lang: Lang
  location: City
  onChange: (c: City) => void
}

export function LocationPicker({ lang, location, onChange }: Props) {
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState(false)

  const useGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError(true)
      return
    }
    setLocating(true)
    setGeoError(false)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        onChange({
          name: '現在地',
          en: 'Current location',
          lat: Math.round(pos.coords.latitude * 1000) / 1000,
          lon: Math.round(pos.coords.longitude * 1000) / 1000,
        })
      },
      () => {
        setLocating(false)
        setGeoError(true)
      },
      { timeout: 10000 },
    )
  }

  const isCurrent = location.name === '現在地'

  return (
    <div className="location-picker">
      <span className="select-wrap">
        <select
          className="city-select"
          value={isCurrent ? '' : location.name}
          onChange={(e) => {
            const city = CITIES.find((c) => c.name === e.target.value)
            if (city) onChange(city)
          }}
          aria-label={t(lang, 'loc.selectAria')}
        >
          {isCurrent && <option value="">{t(lang, 'loc.current')}</option>}
          {CITIES.map((c) => (
            <option key={c.name} value={c.name}>
              {cityLabel(c, lang)}
            </option>
          ))}
        </select>
        <svg viewBox="0 0 10 6" width="10" height="6" className="select-chevron" aria-hidden="true">
          <path d="M0 0L5 6L10 0" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </span>
      <button
        className="geo-button"
        onClick={useGeolocation}
        disabled={locating}
        title={t(lang, 'loc.useCurrent')}
      >
        <CrosshairIcon />
        {locating ? t(lang, 'loc.locating') : t(lang, 'loc.current')}
      </button>
      {geoError && (
        <span className="geo-error" role="alert">
          {t(lang, 'loc.error')}
        </span>
      )}
    </div>
  )
}

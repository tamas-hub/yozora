import { useState } from 'react'
import { CITIES, cityLabel, type City } from '../lib/geo'
import { t, type Lang } from '../lib/i18n'

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
      <button
        className="geo-button"
        onClick={useGeolocation}
        disabled={locating}
        title={t(lang, 'loc.useCurrent')}
      >
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

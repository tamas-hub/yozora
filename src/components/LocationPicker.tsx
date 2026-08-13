import { useState } from 'react'
import { CITIES, type City } from '../lib/geo'

interface Props {
  location: City
  onChange: (c: City) => void
}

export function LocationPicker({ location, onChange }: Props) {
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

  return (
    <div className="location-picker">
      <select
        className="city-select"
        value={location.name === '現在地' ? '' : location.name}
        onChange={(e) => {
          const city = CITIES.find((c) => c.name === e.target.value)
          if (city) onChange(city)
        }}
        aria-label="都市を選択"
      >
        {location.name === '現在地' && <option value="">現在地</option>}
        {CITIES.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
      <button className="geo-button" onClick={useGeolocation} disabled={locating}>
        {locating ? '取得中…' : '📍 現在地'}
      </button>
      {geoError && <span className="geo-error">位置情報を取得できませんでした</span>}
    </div>
  )
}

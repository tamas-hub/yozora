import { useEffect, useMemo, useState } from 'react'
import { Body } from 'astronomy-engine'
import {
  moonForScore,
  moonInfo,
  planetsTonight,
  searchRiseSet,
  sunAltitude,
  tonightHours,
} from './lib/astro'
import { computeScore, verdict } from './lib/score'
import { fetchWeather, weatherAt, type HourWeather } from './lib/weather'
import { fetchIssTle, findVisiblePasses, type TLE } from './lib/iss'
import { activeShowers, nextPeak } from './lib/meteors'
import { CITIES, type City } from './lib/geo'
import { LocationPicker } from './components/LocationPicker'
import { ScoreCard } from './components/ScoreCard'
import { HourlyChart, type HourScore } from './components/HourlyChart'
import { MoonCard } from './components/MoonCard'
import { PlanetsCard } from './components/PlanetsCard'
import { IssCard } from './components/IssCard'
import { MeteorCard } from './components/MeteorCard'

const STORAGE_KEY = 'yozora.location'

function loadLocation(): City {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const c = JSON.parse(raw) as City
      if (typeof c.lat === 'number' && typeof c.lon === 'number' && c.name) return c
    }
  } catch {
    /* fall through */
  }
  return CITIES.find((c) => c.name === '東京')!
}

export default function App() {
  const [location, setLocation] = useState<City>(loadLocation)
  const [weather, setWeather] = useState<HourWeather[] | null>(null)
  const [weatherError, setWeatherError] = useState(false)
  const [tle, setTle] = useState<TLE | null>(null)
  const [tleError, setTleError] = useState(false)

  const now = useMemo(() => new Date(), [])
  const hours = useMemo(() => tonightHours(now), [now])
  const { lat, lon } = location

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location))
    setWeather(null)
    setWeatherError(false)
    fetchWeather(lat, lon)
      .then(setWeather)
      .catch(() => setWeatherError(true))
  }, [location, lat, lon])

  useEffect(() => {
    fetchIssTle()
      .then(setTle)
      .catch(() => setTleError(true))
  }, [])

  // 太陽: 日の入り（当日15時から探索）・日の出（翌0時から探索)
  const sun = useMemo(() => {
    const base = new Date(hours[0])
    base.setHours(15, 0, 0, 0)
    const midnight = new Date(hours[0])
    midnight.setDate(midnight.getDate() + 1)
    midnight.setHours(0, 0, 0, 0)
    return {
      sunset: searchRiseSet(Body.Sun, base, lat, lon, -1),
      sunrise: searchRiseSet(Body.Sun, midnight, lat, lon, 1),
    }
  }, [hours, lat, lon])

  const moon = useMemo(() => moonInfo(hours[3], lat, lon), [hours, lat, lon])

  const planets = useMemo(
    () => planetsTonight(hours[0], hours[hours.length - 1], lat, lon),
    [hours, lat, lon],
  )

  const hourScores: HourScore[] = useMemo(() => {
    return hours.map((h) => {
      const w = weather ? weatherAt(weather, h) : null
      const dark = sunAltitude(h, lat, lon) < -6
      const m = moonForScore(h, lat, lon)
      const score = w
        ? computeScore({
            cloud: w.cloud,
            visibilityM: w.visibilityM,
            moonAltDeg: m.altDeg,
            moonIllum: m.illum,
          })
        : null
      return { time: h, cloud: w?.cloud ?? null, score, dark }
    })
  }, [hours, weather, lat, lon])

  const best = useMemo(() => {
    const candidates = hourScores.filter((h) => h.dark && h.score !== null)
    if (candidates.length === 0) return null
    return candidates.reduce((a, b) => (b.score! > a.score! ? b : a))
  }, [hourScores])

  const overallVerdict = best ? verdict(best.score!) : null

  const passes = useMemo(() => {
    if (!tle) return null
    try {
      return findVisiblePasses(tle, lat, lon, now, 3)
    } catch {
      return null
    }
  }, [tle, lat, lon, now])

  const showers = useMemo(() => activeShowers(hours[0]), [hours])
  const upcoming = useMemo(() => nextPeak(hours[0]), [hours])

  return (
    <div className="app">
      <div className="stars" aria-hidden="true" />
      <header className="header">
        <div>
          <h1 className="title">ヨゾラ</h1>
          <p className="subtitle">今夜、星は見える？</p>
        </div>
        <LocationPicker location={location} onChange={setLocation} />
      </header>

      <main className="grid">
        <ScoreCard
          verdict={overallVerdict}
          score={best?.score ?? null}
          bestTime={best?.time ?? null}
          sunset={sun.sunset}
          sunrise={sun.sunrise}
          date={hours[0]}
          loading={!weather && !weatherError}
          error={weatherError}
        />
        <HourlyChart hours={hourScores} />
        <MoonCard moon={moon} />
        <PlanetsCard planets={planets} />
        <MeteorCard showers={showers} upcoming={upcoming} date={hours[0]} />
        <IssCard passes={passes} loading={!tle && !tleError} error={tleError} />
      </main>

      <footer className="footer">
        <p>
          計算: astronomy-engine / satellite.js ・ 天気: Open-Meteo ・ TLE: WhereTheISS.at
        </p>
        <p>予報は目安です。標高・光害・地形により実際の見え方は変わります。</p>
      </footer>
    </div>
  )
}

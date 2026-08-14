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
import { detectLang, saveLang, t, type Lang } from './lib/i18n'
import { ScoreCard } from './components/ScoreCard'
import { HourlyChart, type HourScore } from './components/HourlyChart'
import { MoonCard } from './components/MoonCard'
import { PlanetsCard } from './components/PlanetsCard'
import { IssCard } from './components/IssCard'
import { MeteorCard } from './components/MeteorCard'
import { Masthead } from './components/Masthead'
import { JapanMapPage } from './components/JapanMapPage'
import { NetworkStatus } from './components/NetworkStatus'

const STORAGE_KEY = 'yozora.location'
const THEME_KEY = 'yozora.theme'

export type ThemeMode = 'night' | 'day' | 'aurora'
type Page = 'bulletin' | 'map'

function pageFromHash(): Page {
  return window.location.hash === '#/map' ? 'map' : 'bulletin'
}

function detectTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'night' || saved === 'day' || saved === 'aurora') return saved
  } catch {
    /* ignore */
  }
  return 'night'
}

function loadLocation(): City {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const c = JSON.parse(raw) as Partial<City>
      if (typeof c.lat === 'number' && typeof c.lon === 'number' && c.name) {
        const preset = CITIES.find((p) => p.name === c.name)
        if (preset) return preset
        return { name: '現在地', en: 'Current location', lat: c.lat, lon: c.lon }
      }
    }
  } catch {
    /* fall through */
  }
  return CITIES.find((c) => c.name === '東京')!
}

export default function App() {
  const [lang, setLang] = useState<Lang>(detectLang)
  const [theme, setTheme] = useState<ThemeMode>(detectTheme)
  const [location, setLocation] = useState<City>(loadLocation)
  const [page, setPage] = useState<Page>(pageFromHash)
  const [weather, setWeather] = useState<HourWeather[] | null>(null)
  const [weatherError, setWeatherError] = useState(false)
  const [tle, setTle] = useState<TLE | null>(null)
  const [tleError, setTleError] = useState(false)

  const now = useMemo(() => new Date(), [])
  const hours = useMemo(() => tonightHours(now), [now])
  const { lat, lon } = location

  useEffect(() => {
    const handleHashChange = () => setPage(pageFromHash())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    saveLang(lang)
    document.documentElement.lang = lang
    document.title = t(lang, page === 'map' ? 'app.mapTitle' : 'app.title')
  }, [lang, page])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    const themeColors: Record<ThemeMode, string> = {
      night: '#101014',
      day: '#f4f1e8',
      aurora: '#0a0f26',
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColors[theme])
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* storage不可でも動作継続 */
    }
  }, [theme])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(location))
    } catch {
      /* プライベートモード等でstorage不可でも動作継続 */
    }
    if (page === 'map') return
    setWeather(null)
    setWeatherError(false)
    let stale = false // 都市連続切替時に旧レスポンスの後着上書きを防ぐ
    fetchWeather(lat, lon)
      .then((w) => {
        if (!stale) setWeather(w)
      })
      .catch(() => {
        if (!stale) setWeatherError(true)
      })
    return () => {
      stale = true
    }
  }, [location, lat, lon, page])

  useEffect(() => {
    if (page === 'map') return
    fetchIssTle()
      .then(setTle)
      .catch(() => setTleError(true))
  }, [page])

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

  const footer = (
    <footer className="footer">
      <div>
        <p className="footer-sources">{t(lang, 'footer.credits')}</p>
        <p className="footer-disclaimer">{t(lang, 'footer.disclaimer')}</p>
      </div>
      <span className="footer-colophon">YOZORA — NIGHT SKY BULLETIN</span>
    </footer>
  )

  if (page === 'map') {
    return (
      <div className="app map-app">
        <Masthead
          date={hours[0]}
          lang={lang}
          theme={theme}
          page="map"
          location={location}
          onLocationChange={setLocation}
          onLangChange={setLang}
          onThemeChange={setTheme}
        />
        <NetworkStatus lang={lang} />
        <JapanMapPage
          lang={lang}
          now={now}
          onOpenCity={(city) => {
            setLocation(city)
            window.location.hash = '#/'
          }}
        />
        {footer}
      </div>
    )
  }

  return (
    <div className="app" data-night={overallVerdict?.rank === 4 ? 'red' : undefined}>
      <Masthead
        date={hours[0]}
        lang={lang}
        theme={theme}
        page="bulletin"
        location={location}
        onLocationChange={setLocation}
        onLangChange={setLang}
        onThemeChange={setTheme}
      />
      <NetworkStatus lang={lang} />

      <main>
        <ScoreCard
          lang={lang}
          verdict={overallVerdict}
          score={best?.score ?? null}
          bestTime={best?.time ?? null}
          sunset={sun.sunset}
          sunrise={sun.sunrise}
          loading={!weather && !weatherError}
          error={weatherError}
        />
        <HourlyChart lang={lang} hours={hourScores} bestTime={best?.time ?? null} />
        <MoonCard lang={lang} moon={moon} />
        <PlanetsCard lang={lang} planets={planets} />
        <MeteorCard lang={lang} showers={showers} upcoming={upcoming} />
        <IssCard lang={lang} passes={passes} loading={!tle && !tleError} error={tleError} />
      </main>

      {footer}
    </div>
  )
}

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
import { fmtBulletinDate } from './lib/format'
import { detectLang, saveLang, t, type Lang } from './lib/i18n'
import { LocationPicker } from './components/LocationPicker'
import { ScoreCard } from './components/ScoreCard'
import { HourlyChart, type HourScore } from './components/HourlyChart'
import { MoonCard } from './components/MoonCard'
import { PlanetsCard } from './components/PlanetsCard'
import { IssCard } from './components/IssCard'
import { MeteorCard } from './components/MeteorCard'

const STORAGE_KEY = 'yozora.location'
const THEME_KEY = 'yozora.theme'

export type ThemeMode = 'night' | 'day' | 'aurora'
const THEMES: ThemeMode[] = ['night', 'day', 'aurora']

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
  const [weather, setWeather] = useState<HourWeather[] | null>(null)
  const [weatherError, setWeatherError] = useState(false)
  const [tle, setTle] = useState<TLE | null>(null)
  const [tleError, setTleError] = useState(false)

  const now = useMemo(() => new Date(), [])
  const hours = useMemo(() => tonightHours(now), [now])
  const { lat, lon } = location

  useEffect(() => {
    saveLang(lang)
    document.documentElement.lang = lang
    document.title = t(lang, 'app.title')
  }, [lang])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
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
    <div className="app" data-night={overallVerdict?.rank === 4 ? 'red' : undefined}>
      <header className="masthead">
        <div className="masthead-top">
          <div className="brand">
            <h1 className="brand-name">YOZORA</h1>
            <p className="brand-tag">{t(lang, 'tagline')}</p>
          </div>
          <div className="masthead-date">{fmtBulletinDate(hours[0])}</div>
        </div>
        <div className="masthead-controls">
          <LocationPicker lang={lang} location={location} onChange={setLocation} />
          <div className="lang-toggle theme-toggle" role="group" aria-label={t(lang, 'theme.groupAria')}>
            {THEMES.map((m, i) => (
              <span key={m} className="theme-toggle-item">
                {i > 0 && (
                  <span className="lang-sep" aria-hidden="true">
                    /
                  </span>
                )}
                <button
                  className={`lang-button ${theme === m ? 'lang-active' : ''}`}
                  onClick={() => setTheme(m)}
                  aria-pressed={theme === m}
                >
                  {t(lang, `theme.${m}`)}
                </button>
              </span>
            ))}
          </div>
          <div className="lang-toggle" role="group" aria-label={t(lang, 'lang.groupAria')}>
            <button
              className={`lang-button ${lang === 'ja' ? 'lang-active' : ''}`}
              onClick={() => setLang('ja')}
              aria-pressed={lang === 'ja'}
            >
              JA
            </button>
            <span className="lang-sep" aria-hidden="true">
              /
            </span>
            <button
              className={`lang-button ${lang === 'en' ? 'lang-active' : ''}`}
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
          </div>
        </div>
        <div className="rule-graduated" aria-hidden="true" />
      </header>

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

      <footer className="footer">
        <div>
          <p className="footer-sources">{t(lang, 'footer.credits')}</p>
          <p className="footer-disclaimer">{t(lang, 'footer.disclaimer')}</p>
        </div>
        <span className="footer-colophon">YOZORA — NIGHT SKY BULLETIN</span>
      </footer>
    </div>
  )
}

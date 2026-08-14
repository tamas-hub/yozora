import { useEffect, useMemo, useState } from 'react'
import { cityLabel, type City } from '../lib/geo'
import { fmtTime } from '../lib/format'
import { t, type Lang } from '../lib/i18n'
import {
  JAPAN_MAP_VIEWBOX,
  NIGHT_MAP_POINTS,
  summarizeNightPoint,
  type NightMapSummary,
} from '../lib/nightMap'
import { JAPAN_OUTLINE_PATH } from '../lib/japanOutline'
import { tonightHours } from '../lib/astro'
import { fetchWeatherBatch } from '../lib/weather'
import { LeaderRow, Section } from './Section'

interface Props {
  lang: Lang
  now: Date
  onOpenCity: (city: City) => void
}

type LoadState = 'loading' | 'ready' | 'error'

function rankClass(summary: NightMapSummary): string {
  return summary.rank === null ? 'map-rank-none' : `map-rank-${summary.rank}`
}

function JapanMapGraphic({
  lang,
  summaries,
  selectedName,
  onSelect,
}: {
  lang: Lang
  summaries: NightMapSummary[]
  selectedName: string | null
  onSelect: (name: string) => void
}) {
  return (
    <svg
      className="japan-map"
      viewBox={`0 0 ${JAPAN_MAP_VIEWBOX.width} ${JAPAN_MAP_VIEWBOX.height}`}
      role="group"
      aria-label={t(lang, 'map.aria')}
    >
      <g className="japan-outline" aria-hidden="true">
        <path d={JAPAN_OUTLINE_PATH} fillRule="evenodd" />
      </g>
      {summaries.map((summary) => {
        const { point } = summary
        const selected = selectedName === point.name
        const label = t(lang, 'map.selectAria', { city: cityLabel(point, lang) })
        return (
          <g
            key={point.name}
            className={`map-station ${rankClass(summary)} ${selected ? 'map-station-selected' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={`${label}: ${summary.score ?? t(lang, 'map.noData')}`}
            onClick={() => onSelect(point.name)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect(point.name)
              }
            }}
          >
            <line
              className="map-station-line-halo"
              x1={point.x}
              y1={point.y}
              x2={point.labelX}
              y2={point.labelY - 4}
            />
            <line x1={point.x} y1={point.y} x2={point.labelX} y2={point.labelY - 4} />
            <circle className="map-station-hit" cx={point.x} cy={point.y} r="22" />
            <circle className="map-station-ring" cx={point.x} cy={point.y} r="14" />
            <text className="map-station-score" x={point.x} y={point.y + 3.5} textAnchor="middle">
              {summary.score ?? '–'}
            </text>
            <text
              className="map-station-name"
              x={point.labelX}
              y={point.labelY}
              textAnchor={point.labelAnchor}
            >
              {cityLabel(point, lang)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function PointDetail({
  lang,
  summary,
  bestName,
  onOpenCity,
}: {
  lang: Lang
  summary: NightMapSummary
  bestName: string | null
  onOpenCity: (city: City) => void
}) {
  const best = summary.best
  const isBest = summary.point.name === bestName
  const verdictLabel = summary.rank === null ? t(lang, 'map.noData') : t(lang, `verdict.${summary.rank}`)
  const moonLabel = best
    ? best.moonAltDeg < 0
      ? t(lang, 'map.moonBelow')
      : t(lang, 'map.moonUp', {
          illum: Math.round(best.moonIllum * 100),
          alt: Math.round(best.moonAltDeg),
        })
    : t(lang, 'map.noData')

  return (
    <aside className="map-detail" aria-live="polite">
      <div className="map-detail-heading">
        <div>
          {isBest && <span className="map-best-label">{t(lang, 'map.bestTonight')}</span>}
          <h3>{cityLabel(summary.point, lang)}</h3>
          <p>{verdictLabel}</p>
        </div>
        <div className={`map-detail-score ${rankClass(summary)}`}>
          <span>{summary.score ?? '–'}</span>
          <small>/100</small>
        </div>
      </div>

      <div className="map-detail-leaders">
        <LeaderRow label={t(lang, 'score.best')} value={fmtTime(best?.time ?? null)} />
        <LeaderRow
          label={t(lang, 'map.cloud')}
          value={best?.cloud === null || best?.cloud === undefined ? '—' : `${best.cloud}%`}
        />
        <LeaderRow
          label={t(lang, 'map.visibility')}
          value={best?.visibilityM ? `${(best.visibilityM / 1000).toFixed(1)} km` : '—'}
        />
        <LeaderRow label={t(lang, 'map.moon')} value={moonLabel} />
      </div>

      <div className="map-timeline-wrap">
        <p className="map-timeline-title">{t(lang, 'map.timeline')}</p>
        <ol className="map-timeline">
          {summary.hours.map((hour) => (
            <li key={hour.time.toISOString()} className={!hour.dark ? 'map-hour-twilight' : undefined}>
              <span className="map-hour-time">{hour.time.getHours()}</span>
              <span className="map-hour-score">{hour.score ?? '–'}</span>
              <span className="map-hour-cloud">{hour.cloud === null ? '—' : `${hour.cloud}%`}</span>
            </li>
          ))}
        </ol>
      </div>

      <button className="map-open-button" onClick={() => onOpenCity(summary.point)}>
        {t(lang, 'map.open')}
        <span aria-hidden="true">→</span>
      </button>
    </aside>
  )
}

export function JapanMapPage({ lang, now, onOpenCity }: Props) {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [weather, setWeather] = useState<Awaited<ReturnType<typeof fetchWeatherBatch>>>([])
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [requestVersion, setRequestVersion] = useState(0)
  const hours = useMemo(() => tonightHours(now), [now])

  useEffect(() => {
    let stale = false
    setLoadState('loading')
    fetchWeatherBatch(NIGHT_MAP_POINTS)
      .then((result) => {
        if (stale) return
        setWeather(result)
        setLoadState('ready')
      })
      .catch(() => {
        if (!stale) setLoadState('error')
      })
    return () => {
      stale = true
    }
  }, [requestVersion])

  const summaries = useMemo(
    () => NIGHT_MAP_POINTS.map((point, index) => summarizeNightPoint(point, weather[index] ?? [], hours)),
    [hours, weather],
  )
  const rankedSummaries = useMemo(
    () => [...summaries].sort((a, b) => (b.score ?? -1) - (a.score ?? -1)),
    [summaries],
  )
  const bestName = loadState === 'ready' ? (rankedSummaries[0]?.point.name ?? null) : null
  const activeName = selectedName ?? bestName
  const selected = summaries.find((summary) => summary.point.name === activeName) ?? null

  return (
    <main className="map-page">
      <div className="map-hero">
        <p className="map-eyebrow">{t(lang, 'map.eyebrow')}</p>
        <h2>{t(lang, 'map.title')}</h2>
        <p>{t(lang, 'map.intro')}</p>
      </div>

      <Section index="A" labelJa="列島観測" labelEn="MAP" lang={lang}>
        {loadState === 'loading' && (
          <div className="map-status" role="status">
            <span className="map-status-mark" aria-hidden="true" />
            {t(lang, 'map.loading')}
          </div>
        )}
        {loadState === 'error' && (
          <div className="map-error" role="alert">
            <p>{t(lang, 'map.error')}</p>
            <button onClick={() => setRequestVersion((version) => version + 1)}>{t(lang, 'map.retry')}</button>
          </div>
        )}
        {loadState === 'ready' && (
          <div className="map-layout">
            <div className="map-figure-wrap">
              <JapanMapGraphic
                lang={lang}
                summaries={summaries}
                selectedName={activeName}
                onSelect={setSelectedName}
              />
              <div className="map-legend" aria-hidden="true">
                <span><i className="legend-high" />80–100</span>
                <span><i className="legend-mid" />40–79</span>
                <span><i className="legend-low hatch-45" />0–39</span>
              </div>
              <p className="map-source">MAP DATA / NATURAL EARTH · WGS84</p>
            </div>
            {selected && (
              <PointDetail lang={lang} summary={selected} bestName={bestName} onOpenCity={onOpenCity} />
            )}
          </div>
        )}
      </Section>

      {loadState === 'ready' && (
        <Section index="B" labelJa="観測一覧" labelEn="STATIONS" lang={lang}>
          <div className="station-list-heading">
            <h3>{t(lang, 'map.stations')}</h3>
            <p>{t(lang, 'map.stationNote')}</p>
          </div>
          <ol className="station-list">
            {rankedSummaries.map((summary, index) => (
              <li key={summary.point.name}>
                <button
                  className={summary.point.name === activeName ? 'station-row-active' : undefined}
                  onClick={() => setSelectedName(summary.point.name)}
                >
                  <span className="station-rank num">{String(index + 1).padStart(2, '0')}</span>
                  <span className="station-city">{cityLabel(summary.point, lang)}</span>
                  <span className="station-verdict">
                    {summary.rank === null ? '—' : t(lang, `verdict.${summary.rank}`)}
                  </span>
                  <span className="station-best num">{fmtTime(summary.best?.time ?? null)}</span>
                  <strong className={`station-score ${rankClass(summary)}`}>{summary.score ?? '–'}</strong>
                </button>
              </li>
            ))}
          </ol>
        </Section>
      )}
    </main>
  )
}

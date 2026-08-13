import type { PlanetTonight } from '../lib/astro'
import { azimuthToCompass } from '../lib/geo'
import { fmtTime } from '../lib/format'

const PLANET_COLORS: Record<string, string> = {
  水星: '#9ca3af',
  金星: '#fde68a',
  火星: '#f87171',
  木星: '#fcd34d',
  土星: '#d6c9a3',
}

interface Props {
  planets: PlanetTonight[]
}

export function PlanetsCard({ planets }: Props) {
  const visibleCount = planets.filter((p) => p.visible).length
  return (
    <section className="card planets-card" aria-label="今夜見える惑星">
      <div className="card-label">
        今夜の惑星 <span className="count-badge">{visibleCount}個 見える</span>
      </div>
      <ul className="planet-list">
        {planets.map((p) => (
          <li key={p.nameJa} className={`planet-row ${p.visible ? '' : 'planet-hidden'}`}>
            <span className="planet-dot" style={{ background: PLANET_COLORS[p.nameJa] }} />
            <span className="planet-name">{p.nameJa}</span>
            {p.visible ? (
              <span className="planet-detail">
                {fmtTime(p.bestTime)}頃 {azimuthToCompass(p.bestAzimuth)}の空・高度
                {Math.round(p.bestAltitude)}° <span className="planet-mag">{p.magnitude.toFixed(1)}等</span>
              </span>
            ) : (
              <span className="planet-detail muted">今夜は見えません</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

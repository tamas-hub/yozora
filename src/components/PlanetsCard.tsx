import type { PlanetTonight } from '../lib/astro'
import { azimuthToCompass } from '../lib/geo'
import { fmtTime } from '../lib/format'
import { t, type Lang } from '../lib/i18n'

const PLANET_COLORS: Record<string, string> = {
  mercury: 'var(--planet-mercury)',
  venus: 'var(--planet-venus)',
  mars: 'var(--planet-mars)',
  jupiter: 'var(--planet-jupiter)',
  saturn: 'var(--planet-saturn)',
}

interface Props {
  lang: Lang
  planets: PlanetTonight[]
}

export function PlanetsCard({ lang, planets }: Props) {
  const visibleCount = planets.filter((p) => p.visible).length
  return (
    <section className="card planets-card" aria-label={t(lang, 'planets.title')}>
      <div className="card-label">
        {t(lang, 'planets.title')}{' '}
        <span className="count-badge">{t(lang, 'planets.count', { n: visibleCount })}</span>
      </div>
      <ul className="planet-list">
        {planets.map((p) => (
          <li key={p.key} className={`planet-row ${p.visible ? '' : 'planet-hidden'}`}>
            <span className="planet-dot" style={{ background: PLANET_COLORS[p.key] }} />
            <span className="planet-name">{t(lang, `planet.${p.key}`)}</span>
            {p.visible ? (
              <span className="planet-detail">
                {t(lang, 'planets.detail', {
                  time: fmtTime(p.bestTime),
                  dir: azimuthToCompass(p.bestAzimuth, lang),
                  alt: Math.round(p.bestAltitude),
                })}{' '}
                <span className="planet-mag">{t(lang, 'planets.mag', { m: p.magnitude.toFixed(1) })}</span>
              </span>
            ) : (
              <span className="planet-detail muted">{t(lang, 'planets.notVisible')}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

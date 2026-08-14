import type { PlanetTonight } from '../lib/astro'
import { azimuthToCompass } from '../lib/geo'
import { fmtTime } from '../lib/format'
import { t, type Lang } from '../lib/i18n'
import { Section } from './Section'

interface Props {
  lang: Lang
  planets: PlanetTonight[]
}

export function PlanetsCard({ lang, planets }: Props) {
  const visibleCount = planets.filter((p) => p.visible).length
  return (
    <Section index="04" labelJa="惑星" labelEn="PLANETS" lang={lang}>
      <div className="status-line">{t(lang, 'planets.count', { n: visibleCount })}</div>
      <ul className="planet-table">
        {planets.map((p) => (
          <li
            key={p.key}
            className={`planet-row ${p.visible ? '' : 'planet-off'}`}
            aria-label={
              p.visible
                ? `${t(lang, `planet.${p.key}`)}: ${t(lang, 'planets.detail', {
                    time: fmtTime(p.bestTime),
                    dir: azimuthToCompass(p.bestAzimuth, lang),
                    alt: Math.round(p.bestAltitude),
                  })}`
                : `${t(lang, `planet.${p.key}`)}: ${t(lang, 'planets.notVisible')}`
            }
          >
            <span
              className={`planet-marker ${p.visible ? 'planet-marker-on' : 'planet-marker-off hatch-45'}`}
              aria-hidden="true"
            />
            <span className="planet-name">{t(lang, `planet.${p.key}`)}</span>
            {p.visible ? (
              <>
                <span className="planet-cell planet-time">{fmtTime(p.bestTime)}</span>
                <span className="planet-dir">{azimuthToCompass(p.bestAzimuth, lang)}</span>
                <span className="planet-cell planet-alt">{Math.round(p.bestAltitude)}°</span>
                <span className="planet-cell planet-mag">{t(lang, 'planets.mag', { m: p.magnitude.toFixed(1) })}</span>
              </>
            ) : (
              <>
                <span className="planet-cell planet-time">—</span>
                <span className="planet-dir">{t(lang, 'planets.notVisible')}</span>
                <span className="planet-cell planet-alt">—</span>
                <span className="planet-cell planet-mag">—</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </Section>
  )
}

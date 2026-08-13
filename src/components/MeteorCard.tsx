import { COMPASS_16, COMPASS_16_EN } from '../lib/geo'
import type { ActiveShower, MeteorShower } from '../lib/meteors'
import { fmtDateShort } from '../lib/format'
import { t, type Lang } from '../lib/i18n'

interface Props {
  lang: Lang
  showers: ActiveShower[]
  upcoming: { shower: MeteorShower; daysToPeak: number }
}

function showerName(s: MeteorShower, lang: Lang): string {
  return lang === 'ja' ? s.name : s.en
}

function radiantDir(s: MeteorShower, lang: Lang): string {
  return lang === 'ja' ? COMPASS_16[s.radiantIdx] : COMPASS_16_EN[s.radiantIdx]
}

function peakText(lang: Lang, days: number): string {
  if (days === 0) return t(lang, 'meteors.tonightPeak')
  if (days > 0) return t(lang, 'meteors.daysUntil', { d: days })
  return t(lang, 'meteors.daysSince', { d: -days })
}

export function MeteorCard({ lang, showers, upcoming }: Props) {
  return (
    <section className="card meteor-card" aria-label={t(lang, 'meteors.title')}>
      <div className="card-label">{t(lang, 'meteors.title')}</div>
      {showers.length > 0 ? (
        <ul className="meteor-list">
          {showers.map(({ shower, daysToPeak }) => (
            <li key={shower.name} className="meteor-row">
              <div className="meteor-name">
                {showerName(shower, lang)}
                {daysToPeak === 0 && <span className="peak-badge">{t(lang, 'meteors.peak')}</span>}
              </div>
              <div className="meteor-detail">
                {peakText(lang, daysToPeak)} ・{' '}
                {t(lang, 'meteors.detail', { z: shower.zhr, dir: radiantDir(shower, lang) })}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="meteor-detail">
          {t(lang, 'meteors.none', {
            name: showerName(upcoming.shower, lang),
            date: fmtDateShort(
              new Date(new Date().getFullYear(), upcoming.shower.peak[0] - 1, upcoming.shower.peak[1]),
              lang,
            ),
            d: upcoming.daysToPeak,
          })}
        </div>
      )}
    </section>
  )
}

import { COMPASS_16, COMPASS_16_EN } from '../lib/geo'
import type { ActiveShower, MeteorShower } from '../lib/meteors'
import { fmtDateShort } from '../lib/format'
import { t, type Lang } from '../lib/i18n'
import { Section } from './Section'

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
  if (days === 1) return t(lang, 'meteors.dayUntil')
  if (days === -1) return t(lang, 'meteors.daySince')
  if (days > 0) return t(lang, 'meteors.daysUntil', { d: days })
  return t(lang, 'meteors.daysSince', { d: -days })
}

/** ロケット打上げ規約の D− 表記。極大当日は PEAK */
function dNotation(days: number): string {
  if (days === 0) return 'D0'
  return days > 0 ? `D−${days}` : `D+${-days}`
}

export function MeteorCard({ lang, showers, upcoming }: Props) {
  return (
    <Section index="05" labelJa="流星群" labelEn="METEORS" lang={lang}>
      {showers.length > 0 ? (
        <ul className="meteor-list">
          {showers.map(({ shower, daysToPeak }) => (
            <li key={shower.name} className="meteor-row">
              <span className="meteor-d" aria-hidden="true">
                {dNotation(daysToPeak)}
              </span>
              <div className="meteor-main">
                <div className="meteor-name">
                  {showerName(shower, lang)}
                  {daysToPeak === 0 && <span className="peak-badge">{t(lang, 'meteors.peak')}</span>}
                </div>
                <div className="meteor-detail">
                  {peakText(lang, daysToPeak)}
                  {lang === 'ja' ? ' ・ ' : ' · '}
                  {t(lang, 'meteors.detail', { z: shower.zhr, dir: radiantDir(shower, lang) })}
                </div>
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
    </Section>
  )
}

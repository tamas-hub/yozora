import type { MoonInfo } from '../lib/astro'
import { fmtTime } from '../lib/format'
import { t, type Lang } from '../lib/i18n'

/** 位相角(0=新月,180=満月)から月の満ち欠けSVGパスを生成（北半球視点・右から満ちる） */
function MoonSvg({ angle }: { angle: number }) {
  const rad = (angle * Math.PI) / 180
  const rx = 46 * Math.abs(Math.cos(rad))
  const waxing = angle <= 180
  const gibbous = angle > 90 && angle < 270
  const outerSweep = waxing ? 1 : 0
  const termSweep = gibbous === waxing ? 1 : 0
  const litPath = `M50 4 A46 46 0 0 ${outerSweep} 50 96 A${rx.toFixed(2)} 46 0 0 ${termSweep} 50 4`
  return (
    <svg viewBox="0 0 100 100" className="moon-svg" aria-hidden="true">
      <circle cx="50" cy="50" r="46" className="moon-disc" />
      <path d={litPath} className="moon-lit" />
    </svg>
  )
}

interface Props {
  lang: Lang
  moon: MoonInfo
}

export function MoonCard({ lang, moon }: Props) {
  const illumPct = Math.round(moon.illumination * 100)
  const impactKey =
    illumPct >= 70 ? 'moon.impact.strong' : illumPct >= 30 ? 'moon.impact.some' : 'moon.impact.none'
  return (
    <section className="card moon-card" aria-label={t(lang, 'moon.title')}>
      <div className="card-label">{t(lang, 'moon.title')}</div>
      <div className="moon-body">
        <MoonSvg angle={moon.phaseAngle} />
        <div className="moon-info">
          <div className="moon-phase-name">{t(lang, `phase.${moon.phaseKey}`)}</div>
          <div className="moon-detail">
            {t(lang, 'moon.age', { age: moon.age.toFixed(1) })} ・ {t(lang, 'moon.illum', { p: illumPct })}
          </div>
          <div className="moon-detail">
            {t(lang, 'moon.rise')} {fmtTime(moon.rise)} ・ {t(lang, 'moon.set')} {fmtTime(moon.set)}
          </div>
          <div className="moon-impact">{t(lang, impactKey)}</div>
        </div>
      </div>
    </section>
  )
}

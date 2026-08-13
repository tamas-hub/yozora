import type { MoonInfo } from '../lib/astro'
import { fmtTime } from '../lib/format'
import { t, type Lang } from '../lib/i18n'
import { LeaderRow, Section } from './Section'

/**
 * 位相角(0=新月,180=満月)から月の満ち欠けSVG（北半球視点・右から満ちる）。
 * 輝面=インク塗り、陰=クロスハッチ（「ハッチ＝光が届かない」の記法統一）
 */
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
      <defs>
        <pattern id="hatch-cross" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 4L4 0 M0 0L4 4" stroke="var(--rule-strong)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#hatch-cross)" />
      <path d={litPath} className="moon-lit" />
      <circle cx="50" cy="50" r="46" className="moon-outline" />
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
    <Section index="03" labelJa="月" labelEn="MOON" lang={lang}>
      <div className="moon-layout">
        <MoonSvg angle={moon.phaseAngle} />
        <div className="moon-info">
          <div className="moon-phase-name">{t(lang, `phase.${moon.phaseKey}`)}</div>
          <div className="moon-leaders">
            <LeaderRow label={t(lang, 'moon.age')} value={moon.age.toFixed(1)} />
            <LeaderRow label={t(lang, 'moon.illum')} value={`${illumPct}%`} />
            <LeaderRow label={t(lang, 'moon.rise')} value={fmtTime(moon.rise)} />
            <LeaderRow label={t(lang, 'moon.set')} value={fmtTime(moon.set)} />
          </div>
          <div className="moon-impact">{t(lang, impactKey)}</div>
        </div>
      </div>
    </Section>
  )
}

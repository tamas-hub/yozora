import type { MoonInfo } from '../lib/astro'
import { fmtTime } from '../lib/format'

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
      <circle cx="50" cy="50" r="46" fill="#1c2340" stroke="#39415f" strokeWidth="1.5" />
      <path d={litPath} fill="#f5edd6" />
    </svg>
  )
}

interface Props {
  moon: MoonInfo
}

export function MoonCard({ moon }: Props) {
  const illumPct = Math.round(moon.illumination * 100)
  const impact =
    illumPct >= 70
      ? '月明かりが強く、淡い星や天の川には不利です'
      : illumPct >= 30
        ? '月明かりの影響はそこそこ。月没後が狙い目です'
        : '月明かりはほぼ気になりません'
  return (
    <section className="card moon-card" aria-label="今夜の月">
      <div className="card-label">今夜の月</div>
      <div className="moon-body">
        <MoonSvg angle={moon.phaseAngle} />
        <div className="moon-info">
          <div className="moon-phase-name">{moon.phaseName}</div>
          <div className="moon-detail">
            月齢 {moon.age.toFixed(1)} ・ 輝面比 {illumPct}%
          </div>
          <div className="moon-detail">
            月の出 {fmtTime(moon.rise)} ・ 月の入 {fmtTime(moon.set)}
          </div>
          <div className="moon-impact">{impact}</div>
        </div>
      </div>
    </section>
  )
}

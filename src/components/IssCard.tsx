import type { IssPass } from '../lib/iss'
import { azimuthToCompass } from '../lib/geo'
import { fmtDateShort, fmtTime } from '../lib/format'
import { t, type Lang } from '../lib/i18n'
import { Section } from './Section'

/** 24pxの方位ミニ図: 外周円+Nティック+経路弧+最大高度点。筆致は1pxヘアライン */
function PassMiniMap({ pass }: { pass: IssPass }) {
  const pt = (azDeg: number, r: number): [number, number] => {
    const rad = (azDeg * Math.PI) / 180
    return [12 + r * Math.sin(rad), 12 - r * Math.cos(rad)]
  }
  const [x1, y1] = pt(pass.startAzimuthDeg, 10)
  const [x2, y2] = pt(pass.endAzimuthDeg, 10)
  // 最大高度が高いほど中心に寄る（90°=天頂で中心）
  const peakR = 10 * (1 - Math.min(90, pass.maxElevationDeg) / 90)
  const [px, py] = pt(pass.peakAzimuthDeg, peakR)
  // 2次ベジェの制御点: 経路が頂点を通るよう頂点を外挿
  const cx = 2 * px - (x1 + x2) / 2
  const cy = 2 * py - (y1 + y2) / 2
  return (
    <svg viewBox="0 0 24 24" className="iss-minimap" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="none" stroke="var(--rule-strong)" strokeWidth="1" />
      <line x1="12" y1="1" x2="12" y2="4" stroke="var(--rule-strong)" strokeWidth="1" />
      <path d={`M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`} fill="none" stroke="var(--ink)" strokeWidth="1" />
      <circle cx={px} cy={py} r="1.6" fill="var(--ink)" />
    </svg>
  )
}

interface Props {
  lang: Lang
  passes: IssPass[] | null
  loading: boolean
  error: boolean
}

export function IssCard({ lang, passes, loading, error }: Props) {
  return (
    <Section index="06" labelJa="人工衛星" labelEn="ISS PASS" lang={lang}>
      {loading && <div className="status-line">{t(lang, 'iss.loading')}</div>}
      {error && <div className="status-error">{t(lang, 'iss.error')}</div>}
      {passes && passes.length === 0 && <div className="status-line">{t(lang, 'iss.none')}</div>}
      {passes && passes.length > 0 && (
        <ul className="iss-list">
          {passes.map((p) => (
            <li
              key={p.start.getTime()}
              className="iss-row"
              aria-label={`${fmtDateShort(p.peak, lang)} ${fmtTime(p.start)}-${fmtTime(p.end)}: ${t(lang, 'iss.path', {
                from: azimuthToCompass(p.startAzimuthDeg, lang),
                peak: azimuthToCompass(p.peakAzimuthDeg, lang),
                alt: Math.round(p.maxElevationDeg),
                to: azimuthToCompass(p.endAzimuthDeg, lang),
              })}`}
            >
              <PassMiniMap pass={p} />
              <span className="iss-date">{fmtDateShort(p.peak, lang)}</span>
              <span className="iss-time">
                {fmtTime(p.start)}–{fmtTime(p.end)}
              </span>
              <span className="iss-path">
                {azimuthToCompass(p.startAzimuthDeg, lang)} → <strong>{Math.round(p.maxElevationDeg)}°</strong>{' '}
                {azimuthToCompass(p.peakAzimuthDeg, lang)} → {azimuthToCompass(p.endAzimuthDeg, lang)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="iss-note">{t(lang, 'iss.note')}</div>
    </Section>
  )
}

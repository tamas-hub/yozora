import type { IssPass } from '../lib/iss'
import { azimuthToCompass } from '../lib/geo'
import { fmtDateShort, fmtTime } from '../lib/format'

interface Props {
  passes: IssPass[] | null
  loading: boolean
  error: boolean
}

export function IssCard({ passes, loading, error }: Props) {
  return (
    <section className="card iss-card" aria-label="ISS国際宇宙ステーションの通過予報">
      <div className="card-label">ISS（国際宇宙ステーション）通過予報 — 今後3日</div>
      {loading && <div className="score-loading">軌道データ取得中…</div>}
      {error && <div className="score-loading">軌道データを取得できませんでした</div>}
      {passes && passes.length === 0 && (
        <div className="score-loading">今後3日間、この場所からの好条件の通過はありません</div>
      )}
      {passes && passes.length > 0 && (
        <ul className="iss-list">
          {passes.map((p) => (
            <li key={p.start.getTime()} className="iss-row">
              <div className="iss-when">
                <strong>{fmtDateShort(p.peak)}</strong> {fmtTime(p.start)}〜{fmtTime(p.end)}
              </div>
              <div className="iss-path">
                {azimuthToCompass(p.startAzimuthDeg)}から現れ、
                {azimuthToCompass(p.peakAzimuthDeg)}の空 最大高度
                {Math.round(p.maxElevationDeg)}° を通過 →{azimuthToCompass(p.endAzimuthDeg)}へ
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="hourly-note">飛行機より速い明るい光点がスーッと横切ります。肉眼でOK</div>
    </section>
  )
}

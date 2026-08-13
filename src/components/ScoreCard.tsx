import type { Verdict } from '../lib/score'
import { fmtDateShort, fmtTime } from '../lib/format'

interface Props {
  verdict: Verdict | null
  score: number | null
  bestTime: Date | null
  sunset: Date | null
  sunrise: Date | null
  date: Date
  loading: boolean
  error: boolean
}

export function ScoreCard({ verdict, score, bestTime, sunset, sunrise, date, loading, error }: Props) {
  return (
    <section className="card score-card" aria-label="今夜の星空指数">
      <div className="card-label">{fmtDateShort(date)} の星空指数</div>
      {loading && <div className="score-loading">天気を確認中…</div>}
      {error && (
        <div className="score-loading">
          天気データを取得できませんでした。
          <br />
          通信環境を確認して再読み込みしてください。
        </div>
      )}
      {verdict && score !== null && (
        <>
          <div className="score-main">
            <div className={`score-number rank-${verdict.rank}`}>
              {score}
              <span className="score-unit">点</span>
            </div>
            <div className="score-text">
              <div className={`score-verdict rank-${verdict.rank}`}>{verdict.label}</div>
              <div className="score-advice">{verdict.advice}</div>
            </div>
          </div>
          <div className="score-meta">
            {bestTime && (
              <span>
                ベスト時間帯 <strong>{fmtTime(bestTime)}頃</strong>
              </span>
            )}
            <span>日の入 {fmtTime(sunset)}</span>
            <span>日の出 {fmtTime(sunrise)}</span>
          </div>
        </>
      )}
    </section>
  )
}

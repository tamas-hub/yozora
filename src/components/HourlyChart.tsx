export interface HourScore {
  time: Date
  cloud: number | null
  score: number | null
  dark: boolean
}

/** スコア→単一色相（シアン）の明度ステップ。高スコアほど明るい */
function barColor(score: number): string {
  if (score >= 80) return '#a5f3fc'
  if (score >= 60) return '#67e8f9'
  if (score >= 40) return '#22d3ee'
  if (score >= 20) return '#0e7490'
  return '#164e63'
}

interface Props {
  hours: HourScore[]
}

export function HourlyChart({ hours }: Props) {
  const hasData = hours.some((h) => h.score !== null)
  return (
    <section className="card hourly-card" aria-label="時間別の星空スコア">
      <div className="card-label">時間別スコア（バーが高いほど好条件）</div>
      {!hasData ? (
        <div className="score-loading">データ待ち…</div>
      ) : (
        <div className="hourly-chart" role="img" aria-label="18時から翌5時までの時間別星空スコア">
          {hours.map((h) => {
            const score = h.score
            const label = `${h.time.getHours()}時 ${
              score === null ? 'データなし' : `スコア${score}点・雲量${h.cloud}%`
            }${h.dark ? '' : '（まだ明るい）'}`
            return (
              <div className="hour-col" key={h.time.getTime()} data-tip={label}>
                <div className="hour-bar-area">
                  {score !== null && (
                    <div
                      className="hour-bar"
                      style={{
                        height: `${Math.max(4, score)}%`,
                        background: barColor(score),
                        opacity: h.dark ? 1 : 0.35,
                      }}
                    />
                  )}
                </div>
                <div className="hour-label">{h.time.getHours()}</div>
              </div>
            )
          })}
        </div>
      )}
      <div className="hourly-note">薄いバーは薄明中（空がまだ明るい時間）</div>
    </section>
  )
}

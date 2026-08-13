import { t, type Lang } from '../lib/i18n'

export interface HourScore {
  time: Date
  cloud: number | null
  score: number | null
  dark: boolean
}

/** スコア→単一色相の明度ステップ。高スコアほど明るい */
function barColor(score: number): string {
  if (score >= 80) return 'var(--bar-4)'
  if (score >= 60) return 'var(--bar-3)'
  if (score >= 40) return 'var(--bar-2)'
  if (score >= 20) return 'var(--bar-1)'
  return 'var(--bar-0)'
}

interface Props {
  lang: Lang
  hours: HourScore[]
}

export function HourlyChart({ lang, hours }: Props) {
  const hasData = hours.some((h) => h.score !== null)
  return (
    <section className="card hourly-card" aria-label={t(lang, 'hourly.title')}>
      <div className="card-label">{t(lang, 'hourly.title')}</div>
      {!hasData ? (
        <div className="score-loading">{t(lang, 'hourly.waiting')}</div>
      ) : (
        <div className="hourly-chart" role="img" aria-label={t(lang, 'hourly.aria')}>
          {hours.map((h) => {
            const score = h.score
            const label =
              (score === null
                ? t(lang, 'hourly.tipNoData', { h: h.time.getHours() })
                : t(lang, 'hourly.tip', { h: h.time.getHours(), s: score, c: h.cloud ?? '?' })) +
              (h.dark ? '' : t(lang, 'hourly.stillBright'))
            return (
              <div className="hour-col" key={h.time.getTime()} data-tip={label}>
                <div className="hour-bar-area">
                  {score !== null && (
                    <div
                      className={`hour-bar ${h.dark ? '' : 'hour-bar-twilight'}`}
                      style={{ height: `${Math.max(4, score)}%`, background: barColor(score) }}
                    />
                  )}
                </div>
                <div className="hour-label">{h.time.getHours()}</div>
              </div>
            )
          })}
        </div>
      )}
      <div className="hourly-note">{t(lang, 'hourly.note')}</div>
    </section>
  )
}

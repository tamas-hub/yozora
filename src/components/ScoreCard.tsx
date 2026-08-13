import type { Verdict } from '../lib/score'
import { fmtDateShort, fmtTime } from '../lib/format'
import { t, type Lang } from '../lib/i18n'

interface Props {
  lang: Lang
  verdict: Verdict | null
  score: number | null
  bestTime: Date | null
  sunset: Date | null
  sunrise: Date | null
  date: Date
  loading: boolean
  error: boolean
}

export function ScoreCard({ lang, verdict, score, bestTime, sunset, sunrise, date, loading, error }: Props) {
  return (
    <section className="card score-card" aria-label={t(lang, 'score.title', { date: fmtDateShort(date, lang) })}>
      <div className="card-label">{t(lang, 'score.title', { date: fmtDateShort(date, lang) })}</div>
      {loading && <div className="score-loading">{t(lang, 'score.loading')}</div>}
      {error && <div className="score-loading">{t(lang, 'score.error')}</div>}
      {verdict && score !== null && (
        <>
          <div className="score-main">
            <div className={`score-number rank-${verdict.rank}`}>
              {score}
              <span className="score-unit">{t(lang, 'score.unit')}</span>
            </div>
            <div className="score-text">
              <div className={`score-verdict rank-${verdict.rank}`}>{t(lang, `verdict.${verdict.rank}`)}</div>
              <div className="score-advice">{t(lang, `advice.${verdict.rank}`)}</div>
            </div>
          </div>
          <div className="score-meta">
            {bestTime && (
              <span>
                {t(lang, 'score.best')}{' '}
                <strong>{t(lang, 'score.bestValue', { time: fmtTime(bestTime) })}</strong>
              </span>
            )}
            <span>
              {t(lang, 'score.sunset')} {fmtTime(sunset)}
            </span>
            <span>
              {t(lang, 'score.sunrise')} {fmtTime(sunrise)}
            </span>
          </div>
        </>
      )}
    </section>
  )
}

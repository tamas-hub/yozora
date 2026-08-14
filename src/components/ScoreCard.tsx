import type { Verdict } from '../lib/score'
import { fmtTime } from '../lib/format'
import { t, type Lang } from '../lib/i18n'
import { LeaderRow, Section } from './Section'

interface Props {
  lang: Lang
  verdict: Verdict | null
  score: number | null
  bestTime: Date | null
  sunset: Date | null
  sunrise: Date | null
  loading: boolean
  error: boolean
  onRetry: () => void
}

export function ScoreCard({ lang, verdict, score, bestTime, sunset, sunrise, loading, error, onRetry }: Props) {
  return (
    <Section index="01" labelJa="星空指数" labelEn="INDEX" lang={lang}>
      {loading && <div className="status-line">{t(lang, 'score.loading')}</div>}
      {error && (
        <div className="status-error">
          <p>{t(lang, 'score.error')}</p>
          <button type="button" onClick={onRetry}>{t(lang, 'map.retry')}</button>
        </div>
      )}
      {verdict && score !== null && (
        <div className="score-layout">
          <div className="score-figure">
            <span className={`score-number rank-${verdict.rank}`}>{score}</span>
            <span className="score-max">/100</span>
          </div>
          <div className="score-side">
            <div className={`score-verdict rank-${verdict.rank}`}>{t(lang, `verdict.${verdict.rank}`)}</div>
            <div className="score-advice">{t(lang, `advice.${verdict.rank}`)}</div>
            <div className="score-leaders">
              {bestTime && <LeaderRow label={t(lang, 'score.best')} value={fmtTime(bestTime)} />}
              <LeaderRow label={t(lang, 'score.sunset')} value={fmtTime(sunset)} />
              <LeaderRow label={t(lang, 'score.sunrise')} value={fmtTime(sunrise)} />
            </div>
          </div>
        </div>
      )}
    </Section>
  )
}

import { useState } from 'react'
import { t, type Lang } from '../lib/i18n'
import { Section } from './Section'

export interface HourScore {
  time: Date
  cloud: number | null
  score: number | null
  dark: boolean
}

/** スコア→単一明度階調（高さが主符号、色は冗長符号） */
function barClass(score: number): string {
  if (score >= 80) return 'bar-q5'
  if (score >= 60) return 'bar-q4'
  if (score >= 40) return 'bar-q3'
  if (score >= 20) return 'bar-q2'
  return 'bar-q1 hatch-45'
}

interface Props {
  lang: Lang
  hours: HourScore[]
  bestTime: Date | null
}

export function HourlyChart({ lang, hours, bestTime }: Props) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const hasData = hours.some((h) => h.score !== null)

  return (
    <Section index="02" labelJa="時間別" labelEn="HOURLY" lang={lang}>
      {!hasData ? (
        <div className="status-line">{t(lang, 'hourly.waiting')}</div>
      ) : (
        <div className="chart-well" role="img" aria-label={t(lang, 'hourly.aria')}>
          <div className="chart-frame">
            <div className="chart-axis" aria-hidden="true">
              <span className="axis-label" style={{ top: '0%' }}>100</span>
              <span className="axis-label" style={{ top: '50%' }}>50</span>
              <span className="axis-label" style={{ top: '100%' }}>0</span>
            </div>
            <div className="chart-plot">
              <div className="chart-threshold" aria-hidden="true">
                <span className="chart-threshold-label">{t(lang, 'hourly.threshold')}</span>
              </div>
              <div className="chart-bars">
                {hours.map((h, i) => {
                  const score = h.score
                  const isBest = bestTime !== null && h.time.getTime() === bestTime.getTime()
                  const showValue = score !== null && (isBest || activeIdx === i)
                  const label =
                    (score === null
                      ? t(lang, 'hourly.tipNoData', { h: h.time.getHours() })
                      : t(lang, 'hourly.tip', { h: h.time.getHours(), s: score, c: h.cloud ?? '?' })) +
                    (h.dark ? '' : t(lang, 'hourly.stillBright'))
                  const fillClass = !h.dark
                    ? 'bar-twilight hatch-45'
                    : score !== null
                      ? barClass(score)
                      : ''
                  return (
                    <button
                      type="button"
                      className={`bar-col ${isBest ? 'bar-best' : ''}`}
                      key={h.time.getTime()}
                      aria-label={label}
                      onClick={() => setActiveIdx(activeIdx === i ? null : i)}
                    >
                      {score !== null && (
                        <div className={`bar-fill ${fillClass}`} style={{ height: `${Math.max(3, score)}%` }} />
                      )}
                      {isBest && score !== null && (
                        <span className="bar-marker" style={{ bottom: `calc(${Math.max(3, score)}% + 14px)` }} aria-hidden="true">
                          ▼
                        </span>
                      )}
                      {showValue && (
                        <span className="bar-value" style={{ bottom: `calc(${Math.max(3, score!)}% + 2px)` }}>
                          {score}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="chart-frame">
            <div />
            <div>
              <div className="rule-graduated chart-x" aria-hidden="true" />
              <div className="chart-hours" aria-hidden="true">
                {hours.map((h) => (
                  <span className="hour-label" key={h.time.getTime()}>
                    {h.time.getHours() % 3 === 0 ? h.time.getHours() : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="chart-note">{t(lang, 'hourly.note')}</div>
    </Section>
  )
}

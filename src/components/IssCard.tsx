import type { IssPass } from '../lib/iss'
import { azimuthToCompass } from '../lib/geo'
import { fmtDateShort, fmtTime } from '../lib/format'
import { t, type Lang } from '../lib/i18n'

interface Props {
  lang: Lang
  passes: IssPass[] | null
  loading: boolean
  error: boolean
}

export function IssCard({ lang, passes, loading, error }: Props) {
  return (
    <section className="card iss-card" aria-label={t(lang, 'iss.title')}>
      <div className="card-label">{t(lang, 'iss.title')}</div>
      {loading && <div className="score-loading">{t(lang, 'iss.loading')}</div>}
      {error && <div className="score-loading">{t(lang, 'iss.error')}</div>}
      {passes && passes.length === 0 && <div className="score-loading">{t(lang, 'iss.none')}</div>}
      {passes && passes.length > 0 && (
        <ul className="iss-list">
          {passes.map((p) => (
            <li key={p.start.getTime()} className="iss-row">
              <div className="iss-when">
                <strong>{fmtDateShort(p.peak, lang)}</strong> {fmtTime(p.start)}〜{fmtTime(p.end)}
              </div>
              <div className="iss-path">
                {t(lang, 'iss.path', {
                  from: azimuthToCompass(p.startAzimuthDeg, lang),
                  peak: azimuthToCompass(p.peakAzimuthDeg, lang),
                  alt: Math.round(p.maxElevationDeg),
                  to: azimuthToCompass(p.endAzimuthDeg, lang),
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="hourly-note">{t(lang, 'iss.note')}</div>
    </section>
  )
}

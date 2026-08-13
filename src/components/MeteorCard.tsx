import type { ActiveShower } from '../lib/meteors'
import { fmtDateShort } from '../lib/format'

interface Props {
  showers: ActiveShower[]
  upcoming: ActiveShower | { shower: ActiveShower['shower']; daysToPeak: number }
  date: Date
}

function peakText(days: number): string {
  if (days === 0) return '今夜が極大！'
  if (days > 0) return `極大まであと${days}日`
  return `極大から${-days}日経過`
}

export function MeteorCard({ showers, upcoming }: Props) {
  return (
    <section className="card meteor-card" aria-label="流星群情報">
      <div className="card-label">流星群</div>
      {showers.length > 0 ? (
        <ul className="meteor-list">
          {showers.map(({ shower, daysToPeak }) => (
            <li key={shower.name} className="meteor-row">
              <div className="meteor-name">
                {shower.name}
                {daysToPeak === 0 && <span className="peak-badge">極大</span>}
              </div>
              <div className="meteor-detail">
                {peakText(daysToPeak)} ・ 極大時 1時間に最大{shower.zhr}個 ・{' '}
                {shower.radiantDirection}の空を中心に全天
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="meteor-detail">
          現在活動中の主要流星群はありません。次は
          <strong>{upcoming.shower.name}</strong>（
          {fmtDateShort(new Date(new Date().getFullYear(), upcoming.shower.peak[0] - 1, upcoming.shower.peak[1]))}
          極大・あと{upcoming.daysToPeak}日）
        </div>
      )}
    </section>
  )
}

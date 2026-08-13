import type { ReactNode } from 'react'
import type { Lang } from '../lib/i18n'

interface Props {
  index: string
  labelJa: string
  labelEn: string
  lang: Lang
  children: ReactNode
}

/** 観測報の欄: 上辺罫＋トンボ、左に通し番号と縦書き欄名（モバイルは横書き1行） */
export function Section({ index, labelJa, labelEn, lang, children }: Props) {
  const label = lang === 'ja' ? labelJa : labelEn
  return (
    <section className="section" aria-label={label}>
      <div className="section-side">
        <span className="section-index">{index}</span>
        <span className={lang === 'ja' ? 'section-label section-label-ja' : 'section-label section-label-en'}>
          {label}
        </span>
      </div>
      <div className="section-body">{children}</div>
    </section>
  )
}

/** 点線リーダー行（時刻表の手触り） */
export function LeaderRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="leader-row">
      <span className="leader-label">{label}</span>
      <span className="leader-dots" aria-hidden="true" />
      <span className="leader-value">{value}</span>
    </div>
  )
}

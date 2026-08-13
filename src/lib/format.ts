// 表示用フォーマッタ

import type { Lang } from './i18n'

const WEEK_JA = ['日', '月', '火', '水', '木', '金', '土']
const WEEK_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function fmtTime(d: Date | null): string {
  if (!d) return '--:--'
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function fmtDateShort(d: Date, lang: Lang = 'ja'): string {
  if (lang === 'ja') return `${d.getMonth() + 1}/${d.getDate()}(${WEEK_JA[d.getDay()]})`
  return `${WEEK_EN[d.getDay()]}, ${MONTH_EN[d.getMonth()]} ${d.getDate()}`
}

/** 24時超えの「夜時刻」ラベル（例: 25時→「1時」） */
export function fmtHourLabel(d: Date): string {
  return `${d.getHours()}`
}

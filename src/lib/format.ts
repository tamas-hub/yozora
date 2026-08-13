// 表示用フォーマッタ

export function fmtTime(d: Date | null): string {
  if (!d) return '--:--'
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function fmtDateShort(d: Date): string {
  const week = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
  return `${d.getMonth() + 1}/${d.getDate()}(${week})`
}

/** 24時超えの「夜時刻」ラベル（例: 25時→「1時」） */
export function fmtHourLabel(d: Date): string {
  return `${d.getHours()}`
}

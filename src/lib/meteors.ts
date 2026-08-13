// 主要流星群カレンダー（静的データ）

export interface MeteorShower {
  name: string
  /** 英語名 */
  en: string
  /** 活動期間 [月, 日]（両端含む） */
  start: [number, number]
  end: [number, number]
  peak: [number, number]
  /** 極大時の1時間あたり出現数（理想条件） */
  zhr: number
  /** 放射点の方位（16方位インデックス、geo.COMPASS_16準拠） */
  radiantIdx: number
}

export const SHOWERS: MeteorShower[] = [
  { name: 'しぶんぎ座流星群', en: 'Quadrantids', start: [12, 28], end: [1, 12], peak: [1, 4], zhr: 110, radiantIdx: 2 },
  { name: 'こと座流星群', en: 'Lyrids', start: [4, 16], end: [4, 25], peak: [4, 22], zhr: 18, radiantIdx: 4 },
  { name: 'みずがめ座η流星群', en: 'Eta Aquariids', start: [4, 19], end: [5, 28], peak: [5, 6], zhr: 50, radiantIdx: 4 },
  { name: 'みずがめ座δ南流星群', en: 'Southern Delta Aquariids', start: [7, 12], end: [8, 23], peak: [7, 30], zhr: 25, radiantIdx: 8 },
  { name: 'ペルセウス座流星群', en: 'Perseids', start: [7, 17], end: [8, 24], peak: [8, 13], zhr: 100, radiantIdx: 2 },
  { name: 'オリオン座流星群', en: 'Orionids', start: [10, 2], end: [11, 7], peak: [10, 21], zhr: 20, radiantIdx: 6 },
  { name: 'おうし座流星群', en: 'Taurids', start: [10, 20], end: [12, 10], peak: [11, 12], zhr: 5, radiantIdx: 8 },
  { name: 'しし座流星群', en: 'Leonids', start: [11, 6], end: [11, 30], peak: [11, 17], zhr: 15, radiantIdx: 4 },
  { name: 'ふたご座流星群', en: 'Geminids', start: [12, 4], end: [12, 20], peak: [12, 14], zhr: 150, radiantIdx: 4 },
  { name: 'こぐま座流星群', en: 'Ursids', start: [12, 17], end: [12, 26], peak: [12, 22], zhr: 10, radiantIdx: 0 },
]

/** [月,日] を比較用の数値へ */
function md(m: number, d: number): number {
  return m * 100 + d
}

/** その日付に活動中か（年またぎ対応） */
export function isActive(shower: MeteorShower, date: Date): boolean {
  const now = md(date.getMonth() + 1, date.getDate())
  const s = md(...shower.start)
  const e = md(...shower.end)
  if (s <= e) return now >= s && now <= e
  return now >= s || now <= e // 年またぎ（例: 12/28〜1/12）
}

/** 極大日までの日数（今日が極大なら0、過ぎていれば負） */
export function daysToPeak(shower: MeteorShower, date: Date): number {
  const year = date.getFullYear()
  const today = new Date(year, date.getMonth(), date.getDate())
  let peak = new Date(year, shower.peak[0] - 1, shower.peak[1])
  // 年またぎ群: 12月に1月の極大を見る場合は翌年
  if (date.getMonth() + 1 === 12 && shower.peak[0] === 1) {
    peak = new Date(year + 1, shower.peak[0] - 1, shower.peak[1])
  }
  return Math.round((peak.getTime() - today.getTime()) / 86400000)
}

export interface ActiveShower {
  shower: MeteorShower
  daysToPeak: number
}

/** 今夜活動中の流星群（極大が近い順） */
export function activeShowers(date: Date): ActiveShower[] {
  return SHOWERS.filter((s) => isActive(s, date))
    .map((shower) => ({ shower, daysToPeak: daysToPeak(shower, date) }))
    .sort((a, b) => Math.abs(a.daysToPeak) - Math.abs(b.daysToPeak))
}

/** 次に極大を迎える流星群（活動外も含む） */
export function nextPeak(date: Date): { shower: MeteorShower; daysToPeak: number } {
  const candidates = SHOWERS.map((shower) => {
    let days = daysToPeak(shower, date)
    if (days < 0) {
      // 今年の極大は過ぎた → 来年
      const nextYear = new Date(date.getFullYear() + 1, shower.peak[0] - 1, shower.peak[1])
      const today = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      days = Math.round((nextYear.getTime() - today.getTime()) / 86400000)
    }
    return { shower, daysToPeak: days }
  })
  return candidates.sort((a, b) => a.daysToPeak - b.daysToPeak)[0]
}

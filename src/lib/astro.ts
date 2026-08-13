// astronomy-engine ラッパ: 太陽・月・惑星の位置/出没/月相

import {
  Body,
  Equator,
  Horizon,
  Illumination,
  MakeTime,
  MoonPhase,
  Observer,
  SearchRiseSet,
} from 'astronomy-engine'

export interface HorizontalPos {
  /** 高度（度、地平線=0） */
  altitude: number
  /** 方位角（度、北=0、時計回り） */
  azimuth: number
}

export function bodyPosition(body: Body, date: Date, lat: number, lon: number): HorizontalPos {
  const observer = new Observer(lat, lon, 0)
  const time = MakeTime(date)
  const eq = Equator(body, time, observer, true, true)
  const hor = Horizon(time, observer, eq.ra, eq.dec, 'normal')
  return { altitude: hor.altitude, azimuth: hor.azimuth }
}

export function sunAltitude(date: Date, lat: number, lon: number): number {
  return bodyPosition(Body.Sun, date, lat, lon).altitude
}

/** 出（direction=+1）/没（-1）を start から1日以内で探索 */
export function searchRiseSet(
  body: Body,
  date: Date,
  lat: number,
  lon: number,
  direction: 1 | -1,
): Date | null {
  const observer = new Observer(lat, lon, 0)
  const t = SearchRiseSet(body, observer, direction, MakeTime(date), 1)
  return t ? t.date : null
}

// ---- 月 ----

export interface MoonInfo {
  /** 月齢（日） */
  age: number
  /** 輝面比 0-1 */
  illumination: number
  phaseName: string
  /** 位相角 0-360（0=新月, 180=満月） */
  phaseAngle: number
  rise: Date | null
  set: Date | null
}

export function moonPhaseName(angle: number): string {
  if (angle < 22.5 || angle >= 337.5) return '新月'
  if (angle < 67.5) return '三日月'
  if (angle < 112.5) return '上弦の月'
  if (angle < 157.5) return '十三夜月'
  if (angle < 202.5) return '満月'
  if (angle < 247.5) return '寝待月'
  if (angle < 292.5) return '下弦の月'
  return '有明月'
}

export function moonInfo(date: Date, lat: number, lon: number): MoonInfo {
  const time = MakeTime(date)
  const phaseAngle = MoonPhase(time)
  const illumination = Illumination(Body.Moon, time).phase_fraction
  const searchStart = new Date(date)
  searchStart.setHours(12, 0, 0, 0)
  return {
    age: (phaseAngle / 360) * 29.530588,
    illumination,
    phaseName: moonPhaseName(phaseAngle),
    phaseAngle,
    rise: searchRiseSet(Body.Moon, searchStart, lat, lon, 1),
    set: searchRiseSet(Body.Moon, searchStart, lat, lon, -1),
  }
}

/** 指定時刻の月の高度と輝面比（スコア計算用） */
export function moonForScore(date: Date, lat: number, lon: number): { altDeg: number; illum: number } {
  const pos = bodyPosition(Body.Moon, date, lat, lon)
  const illum = Illumination(Body.Moon, MakeTime(date)).phase_fraction
  return { altDeg: pos.altitude, illum }
}

// ---- 惑星 ----

export interface PlanetTonight {
  body: Body
  nameJa: string
  magnitude: number
  /** 暗夜時間帯に高度10°を超える時間があるか */
  visible: boolean
  /** 最高高度に達する時刻（可視時間帯内） */
  bestTime: Date | null
  bestAltitude: number
  bestAzimuth: number
}

const PLANETS: { body: Body; nameJa: string }[] = [
  { body: Body.Mercury, nameJa: '水星' },
  { body: Body.Venus, nameJa: '金星' },
  { body: Body.Mars, nameJa: '火星' },
  { body: Body.Jupiter, nameJa: '木星' },
  { body: Body.Saturn, nameJa: '土星' },
]

/**
 * 今夜の惑星可視情報。
 * nightStart〜nightEnd を20分刻みでサンプリングし、
 * 「太陽高度 < -6°（薄明終了近く）かつ 惑星高度 > 10°」の時間帯を可視と判定。
 */
export function planetsTonight(
  nightStart: Date,
  nightEnd: Date,
  lat: number,
  lon: number,
): PlanetTonight[] {
  const stepMs = 20 * 60 * 1000
  const samples: Date[] = []
  for (let t = nightStart.getTime(); t <= nightEnd.getTime(); t += stepMs) {
    samples.push(new Date(t))
  }
  const darkSamples = samples.filter((d) => sunAltitude(d, lat, lon) < -6)

  return PLANETS.map(({ body, nameJa }) => {
    let best: { time: Date; alt: number; az: number } | null = null
    for (const d of darkSamples) {
      const pos = bodyPosition(body, d, lat, lon)
      if (pos.altitude > 10 && (!best || pos.altitude > best.alt)) {
        best = { time: d, alt: pos.altitude, az: pos.azimuth }
      }
    }
    const mid = new Date((nightStart.getTime() + nightEnd.getTime()) / 2)
    const magnitude = Illumination(body, MakeTime(mid)).mag
    return {
      body,
      nameJa,
      magnitude,
      visible: best !== null,
      bestTime: best?.time ?? null,
      bestAltitude: best?.alt ?? 0,
      bestAzimuth: best?.az ?? 0,
    }
  })
}

// ---- 今夜の時間帯 ----

/**
 * 「今夜」の1時間刻み時刻列（18:00〜翌5:00）。
 * 早朝5時前に開いた場合は進行中の夜（前日18時起点）を「今夜」とする。
 */
export function tonightHours(now: Date): Date[] {
  const base = new Date(now)
  if (base.getHours() < 5) base.setDate(base.getDate() - 1)
  const hours: Date[] = []
  for (let h = 18; h <= 29; h++) {
    hours.push(new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, 0, 0, 0))
  }
  return hours
}

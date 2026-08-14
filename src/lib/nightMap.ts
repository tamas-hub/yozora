import { moonForScore, sunAltitude } from './astro'
import { CITIES, type City } from './geo'
import { computeScore, verdict } from './score'
import { weatherAt, type HourWeather } from './weather'

export interface NightMapPoint extends City {
  x: number
  y: number
  labelX: number
  labelY: number
  labelAnchor: 'start' | 'end'
}

function point(
  name: string,
  x: number,
  y: number,
  labelX: number,
  labelY: number,
  labelAnchor: 'start' | 'end' = 'start',
): NightMapPoint {
  const city = CITIES.find((candidate) => candidate.name === name)
  if (!city) throw new Error(`Unknown map point: ${name}`)
  return { ...city, x, y, labelX, labelY, labelAnchor }
}

/** 日本を縦断する主要観測点。47都市の正本から座標を参照する。 */
export const NIGHT_MAP_POINTS: NightMapPoint[] = [
  point('札幌', 315, 64, 337, 61),
  point('仙台', 300, 203, 323, 202),
  point('新潟', 251, 226, 229, 212, 'end'),
  point('東京', 299, 291, 323, 293),
  point('長野', 248, 274, 226, 268, 'end'),
  point('名古屋', 220, 321, 243, 322),
  point('大阪', 181, 347, 160, 338, 'end'),
  point('広島', 119, 371, 96, 360, 'end'),
  point('高知', 144, 410, 167, 417),
  point('福岡', 66, 397, 43, 386, 'end'),
  point('鹿児島', 67, 466, 91, 474),
  point('那覇', 35, 531, 58, 535),
]

export interface NightMapHour {
  time: Date
  score: number | null
  cloud: number | null
  visibilityM: number | null
  moonAltDeg: number
  moonIllum: number
  dark: boolean
}

export interface NightMapSummary {
  point: NightMapPoint
  score: number | null
  rank: 0 | 1 | 2 | 3 | 4 | null
  best: NightMapHour | null
  hours: NightMapHour[]
}

/** 1観測点について、今夜の暗夜時間のベスト条件と時間別内訳をまとめる。 */
export function summarizeNightPoint(
  point: NightMapPoint,
  weather: HourWeather[],
  hours: Date[],
): NightMapSummary {
  const pointHours = hours.map<NightMapHour>((time) => {
    const currentWeather = weatherAt(weather, time)
    const moon = moonForScore(time, point.lat, point.lon)
    const dark = sunAltitude(time, point.lat, point.lon) < -6
    const score = currentWeather
      ? computeScore({
          cloud: currentWeather.cloud,
          visibilityM: currentWeather.visibilityM,
          moonAltDeg: moon.altDeg,
          moonIllum: moon.illum,
        })
      : null

    return {
      time,
      score,
      cloud: currentWeather?.cloud ?? null,
      visibilityM: currentWeather?.visibilityM ?? null,
      moonAltDeg: moon.altDeg,
      moonIllum: moon.illum,
      dark,
    }
  })

  const candidates = pointHours.filter(
    (hour): hour is NightMapHour & { score: number } => hour.dark && hour.score !== null,
  )
  const best = candidates.length
    ? candidates.reduce((current, candidate) => (candidate.score > current.score ? candidate : current))
    : null

  return {
    point,
    score: best?.score ?? null,
    rank: best ? verdict(best.score).rank : null,
    best,
    hours: pointHours,
  }
}

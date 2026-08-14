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

export const JAPAN_MAP_VIEWBOX = {
  width: 420,
  height: 620,
  padding: 18,
  minLon: 122,
  maxLon: 146,
  minLat: 24,
  maxLat: 46,
} as const

/** WGS84の緯度経度を白地図と同じ正距円筒図法のSVG座標へ投影する。 */
export function projectJapanCoordinate(lon: number, lat: number): { x: number; y: number } {
  const innerWidth = JAPAN_MAP_VIEWBOX.width - JAPAN_MAP_VIEWBOX.padding * 2
  const innerHeight = JAPAN_MAP_VIEWBOX.height - JAPAN_MAP_VIEWBOX.padding * 2
  return {
    x:
      JAPAN_MAP_VIEWBOX.padding +
      ((lon - JAPAN_MAP_VIEWBOX.minLon) / (JAPAN_MAP_VIEWBOX.maxLon - JAPAN_MAP_VIEWBOX.minLon)) * innerWidth,
    y:
      JAPAN_MAP_VIEWBOX.padding +
      ((JAPAN_MAP_VIEWBOX.maxLat - lat) / (JAPAN_MAP_VIEWBOX.maxLat - JAPAN_MAP_VIEWBOX.minLat)) * innerHeight,
  }
}

function point(
  name: string,
  labelDx: number,
  labelDy: number,
  labelAnchor: 'start' | 'end' = 'start',
): NightMapPoint {
  const city = CITIES.find((candidate) => candidate.name === name)
  if (!city) throw new Error(`Unknown map point: ${name}`)
  const { x, y } = projectJapanCoordinate(city.lon, city.lat)
  return { ...city, x, y, labelX: x + labelDx, labelY: y + labelDy, labelAnchor }
}

/** 日本を縦断する主要観測点。地図上の位置は各都市の実緯度経度から算出する。 */
export const NIGHT_MAP_POINTS: NightMapPoint[] = [
  point('札幌', 26, -5),
  point('仙台', 30, -4),
  point('新潟', -30, -14, 'end'),
  point('東京', 32, -8),
  point('長野', -31, -8, 'end'),
  point('名古屋', 35, 16),
  // 関西の密集域では左側が広島のマーカーと重なるため、右下へ引き出す。
  point('大阪', 41, 33),
  point('広島', -33, -17, 'end'),
  point('高知', 31, 21),
  point('福岡', -31, -18, 'end'),
  point('鹿児島', 31, 13),
  point('那覇', 28, 4),
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

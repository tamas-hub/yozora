// Open-Meteo（キー不要・CORS可）から時間別の雲量・視程を取得

import type { City } from './geo'

export interface HourWeather {
  time: Date
  /** 雲量 % */
  cloud: number
  /** 視程 m */
  visibilityM: number
}

interface OpenMeteoResponse {
  hourly: {
    time: string[]
    cloud_cover: (number | null)[]
    visibility: (number | null)[]
  }
}

/** Open-Meteo レスポンス → HourWeather[]（テスト可能な純関数） */
export function parseOpenMeteo(json: OpenMeteoResponse): HourWeather[] {
  const { time, cloud_cover, visibility } = json.hourly
  return time.map((iso, i) => ({
    // timezone=auto のためオフセットなしローカル時刻文字列 → ローカルとして解釈
    time: new Date(iso),
    cloud: cloud_cover[i] ?? 50,
    visibilityM: visibility[i] ?? 20000,
  }))
}

export async function fetchWeather(lat: number, lon: number): Promise<HourWeather[]> {
  // 星空予報に100m単位の位置精度は不要。外部APIへは約1km単位に丸め、
  // 端末が返した詳細な現在地を送信しない。
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}` +
    `&hourly=cloud_cover,visibility&forecast_days=3&timezone=auto`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`weather fetch failed: ${res.status}`)
  return parseOpenMeteo((await res.json()) as OpenMeteoResponse)
}

/** 複数都市の時間別天気を1リクエストで取得する */
export async function fetchWeatherBatch(cities: City[]): Promise<HourWeather[][]> {
  if (cities.length === 0) return []

  const latitudes = cities.map(({ lat }) => lat.toFixed(3)).join(',')
  const longitudes = cities.map(({ lon }) => lon.toFixed(3)).join(',')
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitudes}&longitude=${longitudes}` +
    `&hourly=cloud_cover,visibility&forecast_days=3&timezone=auto`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`weather fetch failed: ${res.status}`)

  const json = await res.json()
  if (!Array.isArray(json) || json.length !== cities.length) {
    throw new Error('weather batch response does not match requested cities')
  }
  return json.map((response) => parseOpenMeteo(response as OpenMeteoResponse))
}

/** 指定時刻に最も近い1時間データを引く（1時間超ズレたら null） */
export function weatherAt(hours: HourWeather[], date: Date): HourWeather | null {
  let best: HourWeather | null = null
  let bestDiff = Infinity
  for (const h of hours) {
    const diff = Math.abs(h.time.getTime() - date.getTime())
    if (diff < bestDiff) {
      bestDiff = diff
      best = h
    }
  }
  return bestDiff <= 3600000 ? best : null
}

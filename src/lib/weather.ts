// Open-Meteo（キー不要・CORS可）から時間別の雲量・視程を取得

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
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}` +
    `&hourly=cloud_cover,visibility&forecast_days=3&timezone=auto`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`weather fetch failed: ${res.status}`)
  return parseOpenMeteo((await res.json()) as OpenMeteoResponse)
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

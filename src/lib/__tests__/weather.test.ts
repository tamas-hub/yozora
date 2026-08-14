import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchWeather, fetchWeatherBatch, parseOpenMeteo, weatherAt } from '../weather'

const sample = {
  hourly: {
    time: ['2026-08-14T18:00', '2026-08-14T19:00', '2026-08-14T20:00'],
    cloud_cover: [10, null, 80],
    visibility: [24140, 20000, null],
  },
}

describe('parseOpenMeteo', () => {
  it('ローカル時刻として解釈し、欠損はデフォルト値', () => {
    const hours = parseOpenMeteo(sample)
    expect(hours).toHaveLength(3)
    expect(hours[0].time.getHours()).toBe(18)
    expect(hours[0].cloud).toBe(10)
    expect(hours[1].cloud).toBe(50) // null → 50
    expect(hours[2].visibilityM).toBe(20000) // null → 20000
  })
})

describe('weatherAt', () => {
  const hours = parseOpenMeteo(sample)

  it('最も近い時刻のデータを返す', () => {
    const w = weatherAt(hours, new Date(2026, 7, 14, 19, 20))
    expect(w?.cloud).toBe(50)
  })

  it('1時間超離れていたら null', () => {
    expect(weatherAt(hours, new Date(2026, 7, 14, 23, 30))).toBeNull()
  })
})

describe('fetchWeatherBatch', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('複数都市を1リクエストで取得し、入力順に返す', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([
      sample,
      { hourly: { ...sample.hourly, cloud_cover: [90, 70, 60] } },
    ]), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const cities = [
      { name: '札幌', en: 'Sapporo', lat: 43.064, lon: 141.347 },
      { name: '東京', en: 'Tokyo', lat: 35.676, lon: 139.65 },
    ]
    const result = await fetchWeatherBatch(cities)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('latitude=43.064,35.676&longitude=141.347,139.650'))
    expect(result.map((hours) => hours[0].cloud)).toEqual([10, 90])
  })

  it('空配列ではリクエストしない', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchWeatherBatch([])).resolves.toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('レスポンス件数が都市数と一致しなければ失敗する', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify([sample]), { status: 200 }),
    ))

    await expect(fetchWeatherBatch([
      { name: '札幌', en: 'Sapporo', lat: 43.064, lon: 141.347 },
      { name: '東京', en: 'Tokyo', lat: 35.676, lon: 139.65 },
    ])).rejects.toThrow('weather batch response does not match requested cities')
  })
})

describe('fetchWeather', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('現在地を約1km単位に丸めて外部APIへ送る', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(sample), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await fetchWeather(35.681236, 139.767125)

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining(
      'latitude=35.68&longitude=139.77',
    ))
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('35.681'))
  })
})

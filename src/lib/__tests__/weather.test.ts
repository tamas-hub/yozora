import { describe, expect, it } from 'vitest'
import { parseOpenMeteo, weatherAt } from '../weather'

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

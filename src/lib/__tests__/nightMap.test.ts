import { describe, expect, it } from 'vitest'
import { NIGHT_MAP_POINTS, summarizeNightPoint } from '../nightMap'

const tokyo = NIGHT_MAP_POINTS.find((point) => point.name === '東京')!
const midnight = new Date(2026, 7, 15, 0, 0, 0)

describe('summarizeNightPoint', () => {
  it('暗夜時間の天気から地点サマリーを作る', () => {
    const result = summarizeNightPoint(
      tokyo,
      [{ time: midnight, cloud: 20, visibilityM: 18000 }],
      [midnight],
    )

    expect(result.point.name).toBe('東京')
    expect(result.best?.time).toEqual(midnight)
    expect(result.best?.cloud).toBe(20)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.rank).not.toBeNull()
  })

  it('対応する天気がなければスコアなしとして扱う', () => {
    const result = summarizeNightPoint(tokyo, [], [midnight])

    expect(result.score).toBeNull()
    expect(result.rank).toBeNull()
    expect(result.best).toBeNull()
    expect(result.hours[0].score).toBeNull()
  })
})

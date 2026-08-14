import { describe, expect, it } from 'vitest'
import {
  JAPAN_MAP_VIEWBOX,
  NIGHT_MAP_POINTS,
  projectJapanCoordinate,
  summarizeNightPoint,
} from '../nightMap'

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

describe('projectJapanCoordinate', () => {
  it('観測点を白地図と同じ緯度経度投影内へ配置する', () => {
    for (const point of NIGHT_MAP_POINTS) {
      const projected = projectJapanCoordinate(point.lon, point.lat)
      expect(point.x).toBeCloseTo(projected.x)
      expect(point.y).toBeCloseTo(projected.y)
      expect(point.x).toBeGreaterThan(0)
      expect(point.x).toBeLessThan(JAPAN_MAP_VIEWBOX.width)
      expect(point.y).toBeGreaterThan(0)
      expect(point.y).toBeLessThan(JAPAN_MAP_VIEWBOX.height)
    }
  })

  it('大阪ラベルを広島のマーカーと重ならない右下へ配置する', () => {
    const osaka = NIGHT_MAP_POINTS.find((point) => point.name === '大阪')!
    const hiroshima = NIGHT_MAP_POINTS.find((point) => point.name === '広島')!

    expect(osaka.labelAnchor).toBe('start')
    expect(osaka.labelX).toBeGreaterThan(osaka.x)
    expect(osaka.labelY).toBeGreaterThan(osaka.y)
    expect(Math.hypot(osaka.labelX - hiroshima.x, osaka.labelY - hiroshima.y)).toBeGreaterThan(70)
  })
})

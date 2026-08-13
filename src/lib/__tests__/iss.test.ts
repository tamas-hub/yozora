import { describe, expect, it } from 'vitest'
import { findVisiblePasses, isInEarthShadow, sunVectorKm } from '../iss'

describe('isInEarthShadow', () => {
  const sun: [number, number, number] = [1.5e8, 0, 0] // +X方向に太陽

  it('太陽側の衛星は影に入らない', () => {
    expect(isInEarthShadow([6800, 0, 0], sun)).toBe(false)
  })

  it('反太陽側・地球の真後ろは影の中', () => {
    expect(isInEarthShadow([-6800, 0, 0], sun)).toBe(true)
  })

  it('反太陽側でも円筒の外（横に大きくずれる）なら照らされる', () => {
    expect(isInEarthShadow([-6800, 8000, 0], sun)).toBe(false)
  })
})

describe('sunVectorKm', () => {
  it('太陽までの距離は約1億5千万km', () => {
    const v = sunVectorKm(new Date(2026, 7, 14))
    const dist = Math.hypot(...v)
    expect(dist).toBeGreaterThan(1.4e8)
    expect(dist).toBeLessThan(1.55e8)
  })
})

describe('findVisiblePasses', () => {
  // 実在のISS TLE（2024年頃のアーカイブ値）。エポックから離れた日付でも
  // 「クラッシュせず妥当な構造を返す」ことを確認する
  const tle = {
    line1: '1 25544U 98067A   24001.50000000  .00016717  00000+0  30777-3 0  9993',
    line2: '2 25544  51.6416 190.5000 0005000  90.0000 270.0000 15.49000000430009',
  }

  it('エポック近傍3日で例外なく探索でき、返るパスは全て仰角10°以上', () => {
    const passes = findVisiblePasses(tle, 35.69, 139.692, new Date(Date.UTC(2024, 0, 1)), 3)
    expect(Array.isArray(passes)).toBe(true)
    for (const p of passes) {
      expect(p.maxElevationDeg).toBeGreaterThanOrEqual(10)
      expect(p.end.getTime()).toBeGreaterThan(p.start.getTime())
      expect(p.visible).toBe(true)
    }
  })
})

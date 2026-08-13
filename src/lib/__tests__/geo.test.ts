import { describe, expect, it } from 'vitest'
import { azimuthToCompass, CITIES } from '../geo'

describe('azimuthToCompass', () => {
  it('基本方位', () => {
    expect(azimuthToCompass(0)).toBe('北')
    expect(azimuthToCompass(90)).toBe('東')
    expect(azimuthToCompass(180)).toBe('南')
    expect(azimuthToCompass(270)).toBe('西')
  })

  it('境界値: 11.25°で北北東へ切り替わる', () => {
    expect(azimuthToCompass(11.24)).toBe('北')
    expect(azimuthToCompass(11.3)).toBe('北北東')
  })

  it('348.75°以上は北に戻る', () => {
    expect(azimuthToCompass(349)).toBe('北')
    expect(azimuthToCompass(360)).toBe('北')
  })

  it('負値・360超を正規化', () => {
    expect(azimuthToCompass(-90)).toBe('西')
    expect(azimuthToCompass(450)).toBe('東')
  })
})

describe('CITIES', () => {
  it('47都市そろっている', () => {
    expect(CITIES).toHaveLength(47)
  })
  it('緯度経度が日本の範囲内', () => {
    for (const c of CITIES) {
      expect(c.lat).toBeGreaterThan(24)
      expect(c.lat).toBeLessThan(46)
      expect(c.lon).toBeGreaterThan(122)
      expect(c.lon).toBeLessThan(146)
    }
  })
})

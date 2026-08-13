import { describe, expect, it } from 'vitest'
import { computeScore, verdict } from '../score'

describe('computeScore', () => {
  it('快晴・月なし・視程良好 → 100', () => {
    expect(computeScore({ cloud: 0, visibilityM: 20000, moonAltDeg: -10, moonIllum: 1 })).toBe(100)
  })

  it('全天曇り → 40以下', () => {
    expect(
      computeScore({ cloud: 100, visibilityM: 20000, moonAltDeg: -10, moonIllum: 0 }),
    ).toBeLessThanOrEqual(40)
  })

  it('満月が天頂 → 月ペナルティで大幅減点', () => {
    const noMoon = computeScore({ cloud: 0, visibilityM: 20000, moonAltDeg: -10, moonIllum: 1 })
    const fullMoon = computeScore({ cloud: 0, visibilityM: 20000, moonAltDeg: 90, moonIllum: 1 })
    expect(noMoon - fullMoon).toBeGreaterThanOrEqual(25)
  })

  it('月が低空なら天頂より減点が小さい', () => {
    const low = computeScore({ cloud: 0, moonAltDeg: 10, moonIllum: 1 })
    const high = computeScore({ cloud: 0, moonAltDeg: 90, moonIllum: 1 })
    expect(low).toBeGreaterThan(high)
  })

  it('視程未提供は良好扱い', () => {
    expect(computeScore({ cloud: 0, moonAltDeg: -10, moonIllum: 0 })).toBe(100)
  })

  it('雲量は0-100にクランプ', () => {
    expect(computeScore({ cloud: 150, moonAltDeg: -10, moonIllum: 0 })).toBe(
      computeScore({ cloud: 100, moonAltDeg: -10, moonIllum: 0 }),
    )
  })
})

describe('verdict', () => {
  it('境界値でランクが変わる', () => {
    expect(verdict(80).rank).toBe(4)
    expect(verdict(79).rank).toBe(3)
    expect(verdict(60).rank).toBe(3)
    expect(verdict(59).rank).toBe(2)
    expect(verdict(40).rank).toBe(2)
    expect(verdict(20).rank).toBe(1)
    expect(verdict(19).rank).toBe(0)
  })
})

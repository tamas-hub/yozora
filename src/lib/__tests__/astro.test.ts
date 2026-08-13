import { describe, expect, it } from 'vitest'
import { moonInfo, moonPhaseKey, sunAltitude, tonightHours } from '../astro'

const TOKYO = { lat: 35.69, lon: 139.692 }

describe('moonPhaseKey', () => {
  it('位相角→フェーズキー', () => {
    expect(moonPhaseKey(0)).toBe('new')
    expect(moonPhaseKey(45)).toBe('waxingCrescent')
    expect(moonPhaseKey(90)).toBe('firstQuarter')
    expect(moonPhaseKey(135)).toBe('waxingGibbous')
    expect(moonPhaseKey(180)).toBe('full')
    expect(moonPhaseKey(225)).toBe('waningGibbous')
    expect(moonPhaseKey(270)).toBe('lastQuarter')
    expect(moonPhaseKey(315)).toBe('waningCrescent')
    expect(moonPhaseKey(350)).toBe('new')
  })
})

describe('sunAltitude', () => {
  it('東京の正午は高く、深夜は地平線下', () => {
    expect(sunAltitude(new Date(2026, 7, 14, 12, 0), TOKYO.lat, TOKYO.lon)).toBeGreaterThan(50)
    expect(sunAltitude(new Date(2026, 7, 14, 0, 0), TOKYO.lat, TOKYO.lon)).toBeLessThan(-20)
  })
})

describe('moonInfo', () => {
  it('輝面比は0-1、月齢は0-29.6', () => {
    const m = moonInfo(new Date(2026, 7, 14, 21, 0), TOKYO.lat, TOKYO.lon)
    expect(m.illumination).toBeGreaterThanOrEqual(0)
    expect(m.illumination).toBeLessThanOrEqual(1)
    expect(m.age).toBeGreaterThanOrEqual(0)
    expect(m.age).toBeLessThan(29.6)
    expect(m.phaseKey).toBeTruthy()
  })
})

describe('tonightHours', () => {
  it('18時〜翌5時の12個', () => {
    const hours = tonightHours(new Date(2026, 7, 14, 21, 0))
    expect(hours).toHaveLength(12)
    expect(hours[0].getHours()).toBe(18)
    expect(hours[0].getDate()).toBe(14)
    expect(hours[11].getHours()).toBe(5)
    expect(hours[11].getDate()).toBe(15)
  })

  it('深夜2時に開いたら前日の夜を指す', () => {
    const hours = tonightHours(new Date(2026, 7, 15, 2, 0))
    expect(hours[0].getDate()).toBe(14)
    expect(hours[0].getHours()).toBe(18)
  })

  it('朝10時なら当日の夜', () => {
    const hours = tonightHours(new Date(2026, 7, 14, 10, 0))
    expect(hours[0].getDate()).toBe(14)
  })
})

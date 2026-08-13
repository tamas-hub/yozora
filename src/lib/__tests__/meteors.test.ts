import { describe, expect, it } from 'vitest'
import { activeShowers, daysToPeak, isActive, nextPeak, SHOWERS } from '../meteors'

const perseids = SHOWERS.find((s) => s.name === 'ペルセウス座流星群')!
const quadrantids = SHOWERS.find((s) => s.name === 'しぶんぎ座流星群')!

describe('isActive', () => {
  it('8/14はペルセウス座流星群が活動中', () => {
    expect(isActive(perseids, new Date(2026, 7, 14))).toBe(true)
  })
  it('9/1はペルセウス座流星群は活動外', () => {
    expect(isActive(perseids, new Date(2026, 8, 1))).toBe(false)
  })
  it('年またぎ: 1/2と12/30はしぶんぎ座流星群が活動中', () => {
    expect(isActive(quadrantids, new Date(2026, 0, 2))).toBe(true)
    expect(isActive(quadrantids, new Date(2026, 11, 30))).toBe(true)
    expect(isActive(quadrantids, new Date(2026, 5, 15))).toBe(false)
  })
})

describe('daysToPeak', () => {
  it('極大当日は0', () => {
    expect(daysToPeak(perseids, new Date(2026, 7, 13))).toBe(0)
  })
  it('極大前は正・後は負', () => {
    expect(daysToPeak(perseids, new Date(2026, 7, 10))).toBe(3)
    expect(daysToPeak(perseids, new Date(2026, 7, 14))).toBe(-1)
  })
  it('12月末→1月極大は翌年扱いで正になる', () => {
    expect(daysToPeak(quadrantids, new Date(2026, 11, 30))).toBe(5)
  })
})

describe('activeShowers', () => {
  it('8/14はペルセウス座を含む', () => {
    const names = activeShowers(new Date(2026, 7, 14)).map((a) => a.shower.name)
    expect(names).toContain('ペルセウス座流星群')
  })
  it('活動なしの時期は空', () => {
    expect(activeShowers(new Date(2026, 2, 10))).toHaveLength(0)
  })
})

describe('nextPeak', () => {
  it('3月時点の次の極大はこと座', () => {
    expect(nextPeak(new Date(2026, 2, 10)).shower.name).toBe('こと座流星群')
  })
  it('12/25時点の次はしぶんぎ座（翌年1/4）', () => {
    const r = nextPeak(new Date(2026, 11, 25))
    expect(r.shower.name).toBe('しぶんぎ座流星群')
    expect(r.daysToPeak).toBe(10)
  })
})

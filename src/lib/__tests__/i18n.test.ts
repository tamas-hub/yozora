import { describe, expect, it } from 'vitest'
import { t } from '../i18n'
import { azimuthToCompass } from '../geo'
import { fmtDateShort } from '../format'

describe('t', () => {
  it('言語別の文字列を返す', () => {
    expect(t('ja', 'moon.age')).toBe('月齢')
    expect(t('en', 'moon.age')).toBe('Moon age')
  })

  it('{key}補間が全出現に効く', () => {
    expect(t('ja', 'hourly.tip', { h: 21, s: 74, c: 30 })).toBe('21時 スコア74点・雲量30%')
    expect(t('en', 'hourly.tip', { h: 21, s: 74, c: 30 })).toBe('21:00 — score 74, clouds 30%')
  })

  it('verdict/adviceがランク0-4すべて日英で定義済み', () => {
    for (const rank of [0, 1, 2, 3, 4] as const) {
      expect(t('ja', `verdict.${rank}`)).toBeTruthy()
      expect(t('en', `verdict.${rank}`)).toBeTruthy()
      expect(t('ja', `advice.${rank}`)).toBeTruthy()
      expect(t('en', `advice.${rank}`)).toBeTruthy()
    }
  })
})

describe('azimuthToCompass 言語別', () => {
  it('英語は略記16方位', () => {
    expect(azimuthToCompass(0, 'en')).toBe('N')
    expect(azimuthToCompass(202.5, 'en')).toBe('SSW')
    expect(azimuthToCompass(202.5, 'ja')).toBe('南南西')
  })
})

describe('fmtDateShort 言語別', () => {
  const d = new Date(2026, 7, 16) // 日曜
  it('ja: 8/16(日)', () => {
    expect(fmtDateShort(d, 'ja')).toBe('8/16(日)')
  })
  it('en: Sun, Aug 16', () => {
    expect(fmtDateShort(d, 'en')).toBe('Sun, Aug 16')
  })
})

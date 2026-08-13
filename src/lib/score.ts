// 星空指数の算出（雲量60% / 月明かり30% / 視程10%）

export interface ScoreInput {
  /** 雲量 % (0-100) */
  cloud: number
  /** 視程 m（不明なら undefined = 良好扱い） */
  visibilityM?: number
  /** 月の高度（度）。地平線下なら負 */
  moonAltDeg: number
  /** 月の輝面比 (0-1) */
  moonIllum: number
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

/** 1時点の星空スコア (0-100) */
export function computeScore(input: ScoreInput): number {
  const cloudScore = 100 - clamp(input.cloud, 0, 100)

  // 月ペナルティ: 輝面比 × 高度係数（高いほど影響大）。月が沈んでいれば 0
  const moonUpFactor = Math.max(0, Math.sin((input.moonAltDeg * Math.PI) / 180))
  const moonScore = 100 - 90 * clamp(input.moonIllum, 0, 1) * moonUpFactor

  const vis = input.visibilityM ?? 20000
  const visScore = clamp((vis - 2000) / 18000, 0, 1) * 100

  return Math.round(0.6 * cloudScore + 0.3 * moonScore + 0.1 * visScore)
}

export interface Verdict {
  /** ランク 0(最悪)-4(最高)。表示文言は i18n の verdict.{rank} / advice.{rank} */
  rank: 0 | 1 | 2 | 3 | 4
}

export function verdict(score: number): Verdict {
  if (score >= 80) return { rank: 4 }
  if (score >= 60) return { rank: 3 }
  if (score >= 40) return { rank: 2 }
  if (score >= 20) return { rank: 1 }
  return { rank: 0 }
}

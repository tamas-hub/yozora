// 方位・都市プリセット

import type { Lang } from './i18n'

export const COMPASS_16 = [
  '北', '北北東', '北東', '東北東', '東', '東南東', '南東', '南南東',
  '南', '南南西', '南西', '西南西', '西', '西北西', '北西', '北北西',
] as const

export const COMPASS_16_EN = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
] as const

/** 方位角（度、0=北、時計回り）→ 16方位インデックス */
export function azimuthToIndex(azimuthDeg: number): number {
  const normalized = ((azimuthDeg % 360) + 360) % 360
  return Math.round(normalized / 22.5) % 16
}

/** 方位角 → 16方位名（言語別） */
export function azimuthToCompass(azimuthDeg: number, lang: Lang = 'ja'): string {
  const index = azimuthToIndex(azimuthDeg)
  return lang === 'ja' ? COMPASS_16[index] : COMPASS_16_EN[index]
}

export interface City {
  /** 日本語名（保存キーを兼ねる） */
  name: string
  /** 英語表記 */
  en: string
  lat: number
  lon: number
}

export function cityLabel(city: City, lang: Lang): string {
  return lang === 'ja' ? city.name : city.en
}

/** 47都道府県庁所在地 */
export const CITIES: City[] = [
  { name: '札幌', en: 'Sapporo', lat: 43.064, lon: 141.347 },
  { name: '青森', en: 'Aomori', lat: 40.824, lon: 140.74 },
  { name: '盛岡', en: 'Morioka', lat: 39.704, lon: 141.153 },
  { name: '仙台', en: 'Sendai', lat: 38.269, lon: 140.872 },
  { name: '秋田', en: 'Akita', lat: 39.719, lon: 140.102 },
  { name: '山形', en: 'Yamagata', lat: 38.24, lon: 140.363 },
  { name: '福島', en: 'Fukushima', lat: 37.75, lon: 140.468 },
  { name: '水戸', en: 'Mito', lat: 36.342, lon: 140.447 },
  { name: '宇都宮', en: 'Utsunomiya', lat: 36.566, lon: 139.884 },
  { name: '前橋', en: 'Maebashi', lat: 36.391, lon: 139.061 },
  { name: 'さいたま', en: 'Saitama', lat: 35.857, lon: 139.649 },
  { name: '千葉', en: 'Chiba', lat: 35.605, lon: 140.123 },
  { name: '東京', en: 'Tokyo', lat: 35.69, lon: 139.692 },
  { name: '横浜', en: 'Yokohama', lat: 35.448, lon: 139.643 },
  { name: '新潟', en: 'Niigata', lat: 37.902, lon: 139.023 },
  { name: '富山', en: 'Toyama', lat: 36.695, lon: 137.211 },
  { name: '金沢', en: 'Kanazawa', lat: 36.594, lon: 136.626 },
  { name: '福井', en: 'Fukui', lat: 36.065, lon: 136.222 },
  { name: '甲府', en: 'Kofu', lat: 35.664, lon: 138.568 },
  { name: '長野', en: 'Nagano', lat: 36.651, lon: 138.181 },
  { name: '岐阜', en: 'Gifu', lat: 35.391, lon: 136.722 },
  { name: '静岡', en: 'Shizuoka', lat: 34.977, lon: 138.383 },
  { name: '名古屋', en: 'Nagoya', lat: 35.18, lon: 136.907 },
  { name: '津', en: 'Tsu', lat: 34.73, lon: 136.509 },
  { name: '大津', en: 'Otsu', lat: 35.004, lon: 135.869 },
  { name: '京都', en: 'Kyoto', lat: 35.021, lon: 135.756 },
  { name: '大阪', en: 'Osaka', lat: 34.686, lon: 135.52 },
  { name: '神戸', en: 'Kobe', lat: 34.691, lon: 135.183 },
  { name: '奈良', en: 'Nara', lat: 34.685, lon: 135.833 },
  { name: '和歌山', en: 'Wakayama', lat: 34.226, lon: 135.167 },
  { name: '鳥取', en: 'Tottori', lat: 35.504, lon: 134.238 },
  { name: '松江', en: 'Matsue', lat: 35.472, lon: 133.051 },
  { name: '岡山', en: 'Okayama', lat: 34.662, lon: 133.935 },
  { name: '広島', en: 'Hiroshima', lat: 34.396, lon: 132.46 },
  { name: '山口', en: 'Yamaguchi', lat: 34.186, lon: 131.471 },
  { name: '徳島', en: 'Tokushima', lat: 34.066, lon: 134.559 },
  { name: '高松', en: 'Takamatsu', lat: 34.34, lon: 134.043 },
  { name: '松山', en: 'Matsuyama', lat: 33.842, lon: 132.766 },
  { name: '高知', en: 'Kochi', lat: 33.56, lon: 133.531 },
  { name: '福岡', en: 'Fukuoka', lat: 33.607, lon: 130.418 },
  { name: '佐賀', en: 'Saga', lat: 33.249, lon: 130.299 },
  { name: '長崎', en: 'Nagasaki', lat: 32.745, lon: 129.874 },
  { name: '熊本', en: 'Kumamoto', lat: 32.79, lon: 130.742 },
  { name: '大分', en: 'Oita', lat: 33.238, lon: 131.613 },
  { name: '宮崎', en: 'Miyazaki', lat: 31.911, lon: 131.424 },
  { name: '鹿児島', en: 'Kagoshima', lat: 31.56, lon: 130.558 },
  { name: '那覇', en: 'Naha', lat: 26.212, lon: 127.681 },
]

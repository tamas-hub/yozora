// 方位・都市プリセット

export const COMPASS_16 = [
  '北', '北北東', '北東', '東北東', '東', '東南東', '南東', '南南東',
  '南', '南南西', '南西', '西南西', '西', '西北西', '北西', '北北西',
] as const

/** 方位角（度、0=北、時計回り）→ 16方位名 */
export function azimuthToCompass(azimuthDeg: number): string {
  const normalized = ((azimuthDeg % 360) + 360) % 360
  const index = Math.round(normalized / 22.5) % 16
  return COMPASS_16[index]
}

export interface City {
  name: string
  lat: number
  lon: number
}

/** 47都道府県庁所在地 */
export const CITIES: City[] = [
  { name: '札幌', lat: 43.064, lon: 141.347 },
  { name: '青森', lat: 40.824, lon: 140.74 },
  { name: '盛岡', lat: 39.704, lon: 141.153 },
  { name: '仙台', lat: 38.269, lon: 140.872 },
  { name: '秋田', lat: 39.719, lon: 140.102 },
  { name: '山形', lat: 38.24, lon: 140.363 },
  { name: '福島', lat: 37.75, lon: 140.468 },
  { name: '水戸', lat: 36.342, lon: 140.447 },
  { name: '宇都宮', lat: 36.566, lon: 139.884 },
  { name: '前橋', lat: 36.391, lon: 139.061 },
  { name: 'さいたま', lat: 35.857, lon: 139.649 },
  { name: '千葉', lat: 35.605, lon: 140.123 },
  { name: '東京', lat: 35.69, lon: 139.692 },
  { name: '横浜', lat: 35.448, lon: 139.643 },
  { name: '新潟', lat: 37.902, lon: 139.023 },
  { name: '富山', lat: 36.695, lon: 137.211 },
  { name: '金沢', lat: 36.594, lon: 136.626 },
  { name: '福井', lat: 36.065, lon: 136.222 },
  { name: '甲府', lat: 35.664, lon: 138.568 },
  { name: '長野', lat: 36.651, lon: 138.181 },
  { name: '岐阜', lat: 35.391, lon: 136.722 },
  { name: '静岡', lat: 34.977, lon: 138.383 },
  { name: '名古屋', lat: 35.18, lon: 136.907 },
  { name: '津', lat: 34.73, lon: 136.509 },
  { name: '大津', lat: 35.004, lon: 135.869 },
  { name: '京都', lat: 35.021, lon: 135.756 },
  { name: '大阪', lat: 34.686, lon: 135.52 },
  { name: '神戸', lat: 34.691, lon: 135.183 },
  { name: '奈良', lat: 34.685, lon: 135.833 },
  { name: '和歌山', lat: 34.226, lon: 135.167 },
  { name: '鳥取', lat: 35.504, lon: 134.238 },
  { name: '松江', lat: 35.472, lon: 133.051 },
  { name: '岡山', lat: 34.662, lon: 133.935 },
  { name: '広島', lat: 34.396, lon: 132.46 },
  { name: '山口', lat: 34.186, lon: 131.471 },
  { name: '徳島', lat: 34.066, lon: 134.559 },
  { name: '高松', lat: 34.34, lon: 134.043 },
  { name: '松山', lat: 33.842, lon: 132.766 },
  { name: '高知', lat: 33.56, lon: 133.531 },
  { name: '福岡', lat: 33.607, lon: 130.418 },
  { name: '佐賀', lat: 33.249, lon: 130.299 },
  { name: '長崎', lat: 32.745, lon: 129.874 },
  { name: '熊本', lat: 32.79, lon: 130.742 },
  { name: '大分', lat: 33.238, lon: 131.613 },
  { name: '宮崎', lat: 31.911, lon: 131.424 },
  { name: '鹿児島', lat: 31.56, lon: 130.558 },
  { name: '那覇', lat: 26.212, lon: 127.681 },
]

// ISS 可視パス予測（satellite.js SGP4 + 地球影の円筒モデル）

import * as satellite from 'satellite.js'
import { Body, GeoVector, MakeTime } from 'astronomy-engine'
import { sunAltitude } from './astro'

const EARTH_RADIUS_KM = 6371
const AU_KM = 149597870.7

export interface TLE {
  line1: string
  line2: string
}

/** 地心太陽ベクトル（km, 赤道座標系）。TEMEとの差は影判定には無視できる */
export function sunVectorKm(date: Date): [number, number, number] {
  const v = GeoVector(Body.Sun, MakeTime(date), true)
  return [v.x * AU_KM, v.y * AU_KM, v.z * AU_KM]
}

/** 円筒影モデル: 衛星が地球の影の中にいるか */
export function isInEarthShadow(
  satPosKm: [number, number, number],
  sunKm: [number, number, number],
): boolean {
  const sunLen = Math.hypot(...sunKm)
  const s: [number, number, number] = [sunKm[0] / sunLen, sunKm[1] / sunLen, sunKm[2] / sunLen]
  const proj = satPosKm[0] * s[0] + satPosKm[1] * s[1] + satPosKm[2] * s[2]
  if (proj >= 0) return false // 太陽側にいる → 照らされている
  const perp: [number, number, number] = [
    satPosKm[0] - proj * s[0],
    satPosKm[1] - proj * s[1],
    satPosKm[2] - proj * s[2],
  ]
  return Math.hypot(...perp) < EARTH_RADIUS_KM
}

export interface IssPass {
  start: Date
  end: Date
  /** 最大仰角時刻 */
  peak: Date
  maxElevationDeg: number
  startAzimuthDeg: number
  peakAzimuthDeg: number
  endAzimuthDeg: number
  /** パス中に「観測者が薄明以下 かつ 衛星被照」の瞬間があるか */
  visible: boolean
}

interface Sample {
  time: Date
  elevationDeg: number
  azimuthDeg: number
  visible: boolean
}

function sampleAt(
  satrec: satellite.SatRec,
  observerGd: satellite.GeodeticLocation,
  lat: number,
  lon: number,
  date: Date,
): Sample | null {
  const pv = satellite.propagate(satrec, date)
  if (!pv || typeof pv.position === 'boolean' || !pv.position) return null
  const gmst = satellite.gstime(date)
  const ecf = satellite.eciToEcf(pv.position, gmst)
  const look = satellite.ecfToLookAngles(observerGd, ecf)
  const elevationDeg = (look.elevation * 180) / Math.PI
  const azimuthDeg = (look.azimuth * 180) / Math.PI
  let visible = false
  if (elevationDeg > 0) {
    const sunAlt = sunAltitude(date, lat, lon)
    if (sunAlt < -6 && sunAlt > -60) {
      const pos: [number, number, number] = [pv.position.x, pv.position.y, pv.position.z]
      visible = !isInEarthShadow(pos, sunVectorKm(date))
    }
  }
  return { time: date, elevationDeg, azimuthDeg, visible }
}

/**
 * 今後 days 日間の可視パスを探索（仰角10°以上・可視条件を満たす瞬間を含むもの）。
 * 60秒刻みで検出し、パス内は15秒刻みで精密化。
 */
export function findVisiblePasses(
  tle: TLE,
  lat: number,
  lon: number,
  start: Date,
  days = 3,
  maxPasses = 5,
): IssPass[] {
  const satrec = satellite.twoline2satrec(tle.line1, tle.line2)
  const observerGd: satellite.GeodeticLocation = {
    latitude: satellite.degreesToRadians(lat),
    longitude: satellite.degreesToRadians(lon),
    height: 0.05,
  }

  const passes: IssPass[] = []
  const endTime = start.getTime() + days * 86400000
  const coarseStep = 60000
  let t = start.getTime()

  while (t < endTime && passes.length < maxPasses) {
    const s = sampleAt(satrec, observerGd, lat, lon, new Date(t))
    if (s && s.elevationDeg >= 10) {
      // パス検出 → 前後に広げて15秒刻みで走査
      const fine: Sample[] = []
      for (let ft = t - 8 * 60000; ft <= t + 8 * 60000; ft += 15000) {
        const fs = sampleAt(satrec, observerGd, lat, lon, new Date(ft))
        if (fs && fs.elevationDeg >= 10) fine.push(fs)
      }
      // 可視パスのみ採用（不可視パスで maxPasses を消費しない）
      if (fine.length > 0 && fine.some((f) => f.visible)) {
        const peak = fine.reduce((a, b) => (b.elevationDeg > a.elevationDeg ? b : a))
        passes.push({
          start: fine[0].time,
          end: fine[fine.length - 1].time,
          peak: peak.time,
          maxElevationDeg: peak.elevationDeg,
          startAzimuthDeg: fine[0].azimuthDeg,
          peakAzimuthDeg: peak.azimuthDeg,
          endAzimuthDeg: fine[fine.length - 1].azimuthDeg,
          visible: true,
        })
      }
      t += 20 * 60000 // 同一パスの再検出を避けて先へ
    } else {
      t += coarseStep
    }
  }
  return passes
}

/** ISSのTLEを取得（WhereTheISS.at 優先、Celestrak フォールバック） */
export async function fetchIssTle(): Promise<TLE> {
  try {
    const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544/tles')
    if (res.ok) {
      const json = (await res.json()) as { line1: string; line2: string }
      if (json.line1 && json.line2) return { line1: json.line1, line2: json.line2 }
    }
  } catch {
    // フォールバックへ
  }
  const res = await fetch('https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE')
  if (!res.ok) throw new Error(`TLE fetch failed: ${res.status}`)
  const lines = (await res.text()).trim().split('\n').map((l) => l.trim())
  const l1 = lines.find((l) => l.startsWith('1 '))
  const l2 = lines.find((l) => l.startsWith('2 '))
  if (!l1 || !l2) throw new Error('TLE parse failed')
  return { line1: l1, line2: l2 }
}

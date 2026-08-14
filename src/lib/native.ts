import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { Preferences } from '@capacitor/preferences'
import { Share } from '@capacitor/share'
import type { HourWeather } from './weather'

const WEATHER_SNAPSHOT_KEY = 'yozora.weatherSnapshot.v1'

interface StoredHourWeather {
  time: string
  cloud: number
  visibilityM: number
}

interface StoredWeatherSnapshot {
  lat: number
  lon: number
  fetchedAt: string
  hours: StoredHourWeather[]
}

export interface WeatherSnapshot {
  fetchedAt: Date
  hours: HourWeather[]
}

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform()
}

export async function getCurrentCoordinates(): Promise<{ lat: number; lon: number }> {
  if (isNativeApp()) {
    const permission = await Geolocation.checkPermissions()
    if (permission.location === 'prompt' || permission.coarseLocation === 'prompt') {
      const requested = await Geolocation.requestPermissions({ permissions: ['location'] })
      if (requested.location !== 'granted' && requested.coarseLocation !== 'granted') {
        throw new Error('location permission denied')
      }
    } else if (permission.location === 'denied' && permission.coarseLocation === 'denied') {
      throw new Error('location permission denied')
    }

    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000,
    })
    return { lat: position.coords.latitude, lon: position.coords.longitude }
  }

  if (!navigator.geolocation) throw new Error('geolocation unavailable')
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
      reject,
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  })
}

export async function saveWeatherSnapshot(
  lat: number,
  lon: number,
  hours: HourWeather[],
  fetchedAt = new Date(),
): Promise<void> {
  if (!isNativeApp()) return
  const snapshot: StoredWeatherSnapshot = {
    lat,
    lon,
    fetchedAt: fetchedAt.toISOString(),
    hours: hours.map((hour) => ({
      time: hour.time.toISOString(),
      cloud: hour.cloud,
      visibilityM: hour.visibilityM,
    })),
  }
  await Preferences.set({ key: WEATHER_SNAPSHOT_KEY, value: JSON.stringify(snapshot) })
}

export async function loadWeatherSnapshot(lat: number, lon: number): Promise<WeatherSnapshot | null> {
  if (!isNativeApp()) return null
  const { value } = await Preferences.get({ key: WEATHER_SNAPSHOT_KEY })
  if (!value) return null

  try {
    const snapshot = JSON.parse(value) as StoredWeatherSnapshot
    const sameLocation = Math.abs(snapshot.lat - lat) < 0.002 && Math.abs(snapshot.lon - lon) < 0.002
    if (!sameLocation || !Array.isArray(snapshot.hours) || snapshot.hours.length === 0) return null

    const fetchedAt = new Date(snapshot.fetchedAt)
    const hours = snapshot.hours.map((hour) => ({
      time: new Date(hour.time),
      cloud: hour.cloud,
      visibilityM: hour.visibilityM,
    }))
    if (Number.isNaN(fetchedAt.getTime()) || hours.some((hour) => Number.isNaN(hour.time.getTime()))) {
      return null
    }
    return { fetchedAt, hours }
  } catch {
    return null
  }
}

export async function impactLight(): Promise<void> {
  if (!isNativeApp()) return
  await Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined)
}

export async function notifyExcellentForecast(): Promise<void> {
  if (!isNativeApp()) return
  await Haptics.notification({ type: NotificationType.Success }).catch(() => undefined)
}

export async function shareText(title: string, text: string): Promise<void> {
  if (isNativeApp()) {
    await Share.share({ title, text, dialogTitle: title })
    return
  }
  if (navigator.share) {
    await navigator.share({ title, text })
  }
}

export function onNativeAppActive(callback: () => void): () => void {
  if (!isNativeApp()) return () => undefined
  let disposed = false
  let removeListener: (() => Promise<void>) | undefined
  void App.addListener('appStateChange', ({ isActive }) => {
    if (isActive && !disposed) callback()
  }).then((handle) => {
    if (disposed) void handle.remove()
    else removeListener = handle.remove
  })
  return () => {
    disposed = true
    if (removeListener) void removeListener()
  }
}

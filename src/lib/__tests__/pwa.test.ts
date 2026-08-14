/// <reference types="node" />

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(resolve(root, path), 'utf8'))
}

function pngSize(path: string): { width: number; height: number } {
  const file = readFileSync(resolve(root, path))
  return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) }
}

describe('PWA assets', () => {
  it('ホーム画面アプリ用manifestを正しいスコープで提供する', () => {
    const manifest = readJson('public/manifest.webmanifest') as {
      start_url: string
      scope: string
      display: string
      icons: Array<{ src: string; sizes: string; purpose?: string }>
    }

    expect(manifest.start_url).toBe('./')
    expect(manifest.scope).toBe('./')
    expect(manifest.display).toBe('standalone')
    expect(manifest.icons.some((icon) => icon.sizes === '192x192')).toBe(true)
    expect(manifest.icons.some((icon) => icon.sizes === '512x512')).toBe(true)
    expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true)
    for (const icon of manifest.icons) {
      expect(existsSync(resolve(root, 'public', icon.src))).toBe(true)
    }
  })

  it('iOSと標準PWA向けのPNGアイコン寸法を保つ', () => {
    expect(pngSize('public/icons/apple-touch-icon.png')).toEqual({ width: 180, height: 180 })
    expect(pngSize('public/icons/yozora-192.png')).toEqual({ width: 192, height: 192 })
    expect(pngSize('public/icons/yozora-512.png')).toEqual({ width: 512, height: 512 })
    expect(pngSize('public/icons/yozora-maskable-512.png')).toEqual({ width: 512, height: 512 })
  })

  it('Service WorkerとiOS用メタデータを公開する', () => {
    const html = readFileSync(resolve(root, 'index.html'), 'utf8')
    const worker = readFileSync(resolve(root, 'public/sw.js'), 'utf8')

    expect(html).toContain('rel="manifest"')
    expect(html).toContain('rel="apple-touch-icon"')
    expect(html).toContain('apple-mobile-web-app-capable')
    expect(() => new Function(worker)).not.toThrow()
    expect(worker).toContain('discoverBuildAssets')
    expect(worker).toContain('api.open-meteo.com')
  })
})

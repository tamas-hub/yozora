import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'jp.tama.yozora',
  appName: 'YOZORA 星空予報',
  webDir: 'dist',
  backgroundColor: '#101014',
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },
}

export default config

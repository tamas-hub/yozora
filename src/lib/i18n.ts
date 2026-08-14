// 日英バイリンガル辞書（1キー=1ペアでズレを構造的に防ぐ）

export type Lang = 'ja' | 'en'

export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem('yozora.lang')
    if (saved === 'ja' || saved === 'en') return saved
  } catch {
    /* ignore */
  }
  return typeof navigator !== 'undefined' && navigator.language?.startsWith('ja') ? 'ja' : 'en'
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem('yozora.lang', lang)
  } catch {
    /* ignore */
  }
}

type Entry = { ja: string; en: string }

const DICT = {
  tagline: { ja: 'ヨゾラ — 今夜、星は見える？', en: 'Will the stars be out tonight?' },
  'lang.groupAria': { ja: '言語', en: 'Language' },
  'theme.groupAria': { ja: '表示モード', en: 'Theme' },
  'theme.night': { ja: '夜', en: 'NIGHT' },
  'theme.day': { ja: '昼', en: 'DAY' },
  'theme.aurora': { ja: '極光', en: 'AURORA' },
  'score.loading': { ja: '観測待機中 — 天気を確認しています', en: 'STANDBY — checking the weather' },
  'score.error': {
    ja: '天気データを取得できませんでした。通信環境を確認して再読み込みしてください。',
    en: "Couldn't load weather data. Check your connection and reload.",
  },
  'score.best': { ja: 'ベスト時間帯', en: 'Best window' },
  'score.sunset': { ja: '日の入', en: 'Sunset' },
  'score.sunrise': { ja: '日の出', en: 'Sunrise' },
  'verdict.4': { ja: '絶好の星空日和', en: 'A perfect night for stars' },
  'verdict.3': { ja: '良好', en: 'Good' },
  'verdict.2': { ja: 'まずまず', en: 'Fair' },
  'verdict.1': { ja: '厳しめ', en: 'Poor' },
  'verdict.0': { ja: '今夜は絶望的', en: 'Hopeless tonight' },
  'advice.4': { ja: '迷わず外へ。天の川が見えるチャンスです', en: 'Head outside — you may even catch the Milky Way' },
  'advice.3': { ja: '明るい星や惑星はしっかり見えます', en: 'Bright stars and planets will shine through' },
  'advice.2': { ja: '雲の切れ間や月明かり次第。粘れば見えます', en: 'Depends on cloud breaks and moonlight — patience pays' },
  'advice.1': { ja: '今夜は条件がよくありません。明日に期待', en: 'Conditions are rough tonight. Try tomorrow' },
  'advice.0': { ja: '空を見るより布団の中がおすすめです', en: 'Better off under a blanket than under the sky' },
  'hourly.waiting': { ja: 'データ待ち…', en: 'Waiting for data…' },
  'hourly.aria': { ja: '18時から翌5時までの時間別星空スコア', en: 'Hourly stargazing score, 18:00 to 5:00' },
  'hourly.note': { ja: '斜線のバーは薄明（空がまだ明るい時間）。バーをタップで数値表示', en: 'Hatched bars: twilight, sky still bright. Tap a bar for its value' },
  'hourly.threshold': { ja: '観測適', en: 'GOOD' },
  'hourly.tip': { ja: '{h}時 スコア{s}点・雲量{c}%', en: '{h}:00 — score {s}, clouds {c}%' },
  'hourly.tipNoData': { ja: '{h}時 データなし', en: '{h}:00 — no data' },
  'hourly.stillBright': { ja: '（まだ明るい）', en: ' (still bright)' },
  'moon.age': { ja: '月齢', en: 'Moon age' },
  'moon.illum': { ja: '輝面比', en: 'Illuminated' },
  'moon.rise': { ja: '月の出', en: 'Moonrise' },
  'moon.set': { ja: '月の入', en: 'Moonset' },
  'phase.new': { ja: '新月', en: 'New Moon' },
  'phase.waxingCrescent': { ja: '三日月', en: 'Waxing Crescent' },
  'phase.firstQuarter': { ja: '上弦の月', en: 'First Quarter' },
  'phase.waxingGibbous': { ja: '十三夜月', en: 'Waxing Gibbous' },
  'phase.full': { ja: '満月', en: 'Full Moon' },
  'phase.waningGibbous': { ja: '寝待月', en: 'Waning Gibbous' },
  'phase.lastQuarter': { ja: '下弦の月', en: 'Last Quarter' },
  'phase.waningCrescent': { ja: '有明月', en: 'Waning Crescent' },
  'moon.impact.strong': {
    ja: '月明かりが強く、淡い星や天の川には不利です',
    en: 'Strong moonlight — faint stars and the Milky Way will suffer',
  },
  'moon.impact.some': { ja: '月明かりの影響はそこそこ。月没後が狙い目です', en: 'Some moonlight — aim for after moonset' },
  'moon.impact.none': { ja: '月明かりはほぼ気になりません', en: 'Moonlight is barely a factor' },
  'planets.count': { ja: '可視 {n} / 5', en: 'VISIBLE {n} / 5' },
  'planets.notVisible': { ja: '今夜は見えません', en: 'Not visible tonight' },
  'planets.detail': { ja: '{time}頃 {dir}の空・高度{alt}°', en: 'around {time} · {dir} sky · alt {alt}°' },
  'planets.mag': { ja: '{m}等', en: 'mag {m}' },
  'planet.mercury': { ja: '水星', en: 'Mercury' },
  'planet.venus': { ja: '金星', en: 'Venus' },
  'planet.mars': { ja: '火星', en: 'Mars' },
  'planet.jupiter': { ja: '木星', en: 'Jupiter' },
  'planet.saturn': { ja: '土星', en: 'Saturn' },
  'iss.loading': { ja: '軌道データ取得中…', en: 'Fetching orbital data…' },
  'iss.error': { ja: '軌道データを取得できませんでした', en: "Couldn't load orbital data" },
  'iss.none': {
    ja: '今後3日間、この場所からの好条件の通過はありません',
    en: 'No good passes from this location in the next 3 days',
  },
  'iss.path': {
    ja: '{from}から現れ、{peak}の空 最大高度{alt}° を通過 → {to}へ',
    en: 'Rises in the {from}, peaks at {alt}° in the {peak}, sets toward the {to}',
  },
  'iss.note': {
    ja: '飛行機より速い明るい光点がスーッと横切ります。肉眼でOK',
    en: 'A bright point gliding faster than a plane — naked eye is enough',
  },
  'meteors.peak': { ja: '極大', en: 'Peak' },
  'meteors.tonightPeak': { ja: '今夜が極大！', en: 'Peaks tonight!' },
  'meteors.daysUntil': { ja: '極大まであと{d}日', en: '{d} days to peak' },
  'meteors.daysSince': { ja: '極大から{d}日経過', en: '{d} days past peak' },
  'meteors.dayUntil': { ja: '極大まであと1日', en: '1 day to peak' },
  'meteors.daySince': { ja: '極大から1日経過', en: '1 day past peak' },
  'meteors.detail': {
    ja: '極大時 1時間に最大{z}個 ・ {dir}の空を中心に全天',
    en: 'Up to {z}/hr at peak · radiant in the {dir}, visible all over the sky',
  },
  'meteors.none': {
    ja: '現在活動中の主要流星群はありません。次は{name}（{date}極大・あと{d}日）',
    en: 'No major shower is active now. Next up: {name} — peaks {date}, in {d} days',
  },
  'footer.credits': {
    ja: '計算: astronomy-engine / satellite.js ・ 天気: Open-Meteo ・ TLE: WhereTheISS.at',
    en: 'CALC ASTRONOMY-ENGINE / SATELLITE.JS · WX OPEN-METEO · TLE WHERETHEISS.AT',
  },
  'footer.disclaimer': {
    ja: '予報は目安です。標高・光害・地形により実際の見え方は変わります。',
    en: "Forecasts are estimates. Elevation, light pollution and terrain affect what you'll actually see.",
  },
  'loc.current': { ja: '現在地', en: 'Current location' },
  'loc.locating': { ja: '取得中…', en: 'Locating…' },
  'loc.error': { ja: '位置情報を取得できませんでした', en: "Couldn't get your location" },
  'loc.selectAria': { ja: '都市を選択', en: 'Choose a city' },
  'loc.useCurrent': { ja: '現在地を使う', en: 'Use my location' },
  'app.title': { ja: 'Yozora — 今夜の星空ナビ', en: 'Yozora — tonight’s stargazing guide' },
} satisfies Record<string, Entry>

export type DictKey = keyof typeof DICT

/** 翻訳＋{key}補間 */
export function t(lang: Lang, key: DictKey, params?: Record<string, string | number>): string {
  let s: string = DICT[key][lang]
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replaceAll(`{${k}}`, String(v))
    }
  }
  return s
}

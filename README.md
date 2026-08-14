# Yozora — 今夜の星空ナビ / Tonight's Stargazing Guide

「**今夜、星は見える？**」に3秒で答えるWebアプリ。
場所を選ぶ（または現在地）だけで、今夜の観測条件と見どころを1画面に集約します。
日本語 / English 切替対応。

*Answers "Will the stars be out tonight?" in three seconds — stargazing index, planets, moon, ISS passes and meteor showers for your location, fully client-side.*

## 機能

- **星空指数（0〜100点）** — 雲量60%・月明かり30%・視程10%の加重スコア＋ベスト時間帯
- **全国地図** — 主要12地点の今夜の星空指数を一望し、雲量・視程・月明かり・時間別推移を比較
- **時間別スコア** — 18時〜翌5時の1時間ごとのバー表示（ホバーで詳細）
- **月** — 月齢・輝面比・満ち欠けSVG・月の出入り・月明かりの影響コメント
- **惑星** — 水金火木土の今夜の可視判定・見頃時刻・方角・高度・等級
- **ISS通過予報** — 今後3日の可視パス（出現方角→最大高度→消える方角）
- **流星群** — 主要10流星群のカレンダーと今夜のアクティブ判定
- **3つの表示モード** — 夜（観測報・ゴールド）/ 昼（紙にインク）/ 極光（オーロラ空＋ガラスパネル）

## デザイン — 夜間観測報 / Night Sky Bulletin

天文台が毎晩掲示する一枚の観測速報として設計。スイス・タイポグラフィの規律（ヘアライン罫・巨大数字・単一アクセント色）に、縦書き和文インデックス列・点線リーダー・罫端のトンボ・「45°ハッチ＝観測不能」の製図記法を重ねた、黒地ネガ刷りの単一テーマ。夜間の屋外で暗順応を壊さないことを機能要件とする。

- 書体: Archivo（可変・Expanded）/ IBM Plex Mono / 和文はシステムゴシック
- 全テキスト WCAG AA コントラスト実測済み・hover非依存（バー値はタップ表示）

## 技術

- Vite + React 19 + TypeScript（完全静的・サーバ不要）
- 天体計算: [astronomy-engine](https://github.com/cosinekitty/astronomy)（惑星・月・太陽）
- 軌道計算: [satellite.js](https://github.com/shashwatak/satellite-js) v5（SGP4伝播＋地球影の円筒モデルで可視判定）
- 天気: [Open-Meteo](https://open-meteo.com/)（APIキー不要・CORS可）
- TLE: [WhereTheISS.at](https://wheretheiss.at/)（フォールバック: Celestrak）
- 地図: [Natural Earth](https://www.naturalearthdata.com/) 1:50m（パブリックドメイン、Japan geometryを静的SVG化）

## 開発

```bash
npm install
npm run dev    # 開発サーバ
npm test       # vitest（計算コア37件）
npm run build  # 本番ビルド（dist/）
```

## デプロイ

`base: './'` の相対パス構成のため、GitHub Pages（サブパス）にそのまま置けます。
`.github/workflows/deploy.yml` 同梱 — mainへのpushで自動デプロイ（リポジトリのSettings → Pages → Source を「GitHub Actions」に設定）。

## 注意

予報は目安です。標高・光害・地形により実際の見え方は変わります。
ISS予報はTLEの鮮度に依存します（数日以内のエポックであれば±数秒精度）。

import { fmtBulletinDate } from '../lib/format'
import { t, type Lang } from '../lib/i18n'
import type { City } from '../lib/geo'
import type { ThemeMode } from '../App'
import { LocationPicker } from './LocationPicker'

const THEMES: ThemeMode[] = ['night', 'day', 'aurora']

interface Props {
  date: Date
  lang: Lang
  theme: ThemeMode
  page: 'bulletin' | 'map'
  location: City
  onLocationChange: (city: City) => void
  onLangChange: (lang: Lang) => void
  onThemeChange: (theme: ThemeMode) => void
}

function MapIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true">
      <path d="M1.5 3.5 6.5 1l5 2.5 5-2v13l-5 2-5-2.5-5 2.5z" fill="none" stroke="currentColor" />
      <path d="M6.5 1v13m5-10.5v13" fill="none" stroke="currentColor" />
    </svg>
  )
}

export function Masthead({
  date,
  lang,
  theme,
  page,
  location,
  onLocationChange,
  onLangChange,
  onThemeChange,
}: Props) {
  return (
    <header className="masthead">
      <div className="masthead-top">
        <div className="brand">
          <h1 className="brand-name">YOZORA</h1>
          <p className="brand-tag">{t(lang, 'tagline')}</p>
        </div>
        <div className="masthead-date">{fmtBulletinDate(date)}</div>
      </div>
      <div className="masthead-controls">
        {page === 'bulletin' && (
          <LocationPicker lang={lang} location={location} onChange={onLocationChange} />
        )}
        <a className="page-link" href={page === 'map' ? '#/' : '#/map'}>
          <MapIcon />
          {t(lang, page === 'map' ? 'nav.bulletin' : 'nav.map')}
        </a>
        <div className="lang-toggle theme-toggle" role="group" aria-label={t(lang, 'theme.groupAria')}>
          {THEMES.map((mode, index) => (
            <span key={mode} className="theme-toggle-item">
              {index > 0 && (
                <span className="lang-sep" aria-hidden="true">
                  /
                </span>
              )}
              <button
                className={`lang-button ${theme === mode ? 'lang-active' : ''}`}
                onClick={() => onThemeChange(mode)}
                aria-pressed={theme === mode}
              >
                {t(lang, `theme.${mode}`)}
              </button>
            </span>
          ))}
        </div>
        <div className="lang-toggle" role="group" aria-label={t(lang, 'lang.groupAria')}>
          <button
            className={`lang-button ${lang === 'ja' ? 'lang-active' : ''}`}
            onClick={() => onLangChange('ja')}
            aria-pressed={lang === 'ja'}
          >
            JA
          </button>
          <span className="lang-sep" aria-hidden="true">
            /
          </span>
          <button
            className={`lang-button ${lang === 'en' ? 'lang-active' : ''}`}
            onClick={() => onLangChange('en')}
            aria-pressed={lang === 'en'}
          >
            EN
          </button>
        </div>
      </div>
      <div className="rule-graduated" aria-hidden="true" />
    </header>
  )
}

import { useLanguageStore, LanguageCode } from '@/store/languageStore'
import { useThemeStore } from '@/store/themeStore'
import { Globe, Sun, Moon } from 'lucide-react'
import i18n from '@/i18n'

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguageStore()
  const { theme, toggleTheme } = useThemeStore()

  function handleLanguageChange(lang: LanguageCode) {
    setLanguage(lang)
    try {
      void i18n.changeLanguage(lang)
    } catch {
      // ignore
    }
  }

  return (
    <div className="inline-flex items-center gap-1.5 bg-[var(--surface)] border-2 border-[var(--rule)] rounded-md p-1 transition-colors">
      <div className="flex items-center gap-1">
        <div className="flex items-center justify-center pl-1.5 pr-0.5 text-[var(--ink)]">
          <Globe className="h-4 w-4 text-[#F5671A]" />
        </div>
        {(['en', 'hi', 'gu'] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => handleLanguageChange(code)}
            aria-pressed={language === code}
            className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-all ${
              language === code
                ? 'bg-[#F5671A] text-[#111111] font-bold border-1.5 border-[#111111]'
                : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hair)]'
            }`}
          >
            {code === 'en' ? 'English' : code === 'hi' ? 'हिन्दी' : 'ગુજરાતી'}
          </button>
        ))}
      </div>

      <div className="h-4 w-[2px] bg-[var(--rule)]" />

      <button
        type="button"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className="flex items-center justify-center p-1.5 rounded-md text-[var(--ink)] hover:bg-[var(--hair)] transition-colors"
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4 text-[#F5671A]" />
        ) : (
          <Moon className="h-4 w-4 text-[var(--ink)]" />
        )}
      </button>
    </div>
  )
}


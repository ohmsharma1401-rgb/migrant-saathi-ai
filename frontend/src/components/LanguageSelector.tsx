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
      // ignore if i18n not configured
    }
  }

  return (
    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-xs">
      <div className="flex items-center gap-1">
        <Globe className="h-4 w-4 text-teal-600 dark:text-teal-400 ml-1 shrink-0" />
        {(['en', 'hi', 'gu'] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => handleLanguageChange(code)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              language === code
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {code === 'en' ? 'English' : code === 'hi' ? 'हिन्दी' : 'ગુજરાતી'}
          </button>
        ))}
      </div>

      <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 my-auto" />

      {/* Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className="flex items-center justify-center p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4 text-amber-400" />
        ) : (
          <Moon className="h-4 w-4 text-slate-700" />
        )}
      </button>
    </div>
  )
}


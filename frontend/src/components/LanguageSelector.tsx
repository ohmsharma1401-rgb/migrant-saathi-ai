import { useLanguageStore, LanguageCode } from '@/store/languageStore'
import { Globe } from 'lucide-react'
import i18n from '@/i18n'

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguageStore()

  function handleLanguageChange(lang: LanguageCode) {
    setLanguage(lang)
    try {
      void i18n.changeLanguage(lang)
    } catch {
      // ignore if i18n not configured
    }
  }

  return (
    <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1 shadow-xs">
      <Globe className="h-4 w-4 text-teal-600 ml-1.5 shrink-0" />
      <div className="flex items-center gap-1">
        {(['en', 'hi', 'gu'] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => handleLanguageChange(code)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              language === code
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            {code === 'en' ? 'English' : code === 'hi' ? 'हिन्दी' : 'ગુજરાતી'}
          </button>
        ))}
      </div>
    </div>
  )
}

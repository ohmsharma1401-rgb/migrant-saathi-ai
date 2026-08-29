import { useLanguageStore } from '@/store/languageStore'
import { Globe } from 'lucide-react'

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguageStore()

  return (
    <div className="flex items-center gap-1.5 bg-slate-900/10 dark:bg-white/10 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
      <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400 ml-1.5" />
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            language === 'en'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLanguage('hi')}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            language === 'hi'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          हिन्दी
        </button>
        <button
          type="button"
          onClick={() => setLanguage('gu')}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            language === 'gu'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          ગુજરાતી
        </button>
      </div>
    </div>
  )
}

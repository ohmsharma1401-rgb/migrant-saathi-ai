import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LanguageCode = 'en' | 'hi' | 'gu'

interface LanguageState {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language: LanguageCode) => set({ language }),
    }),
    { name: 'saathi-language' }
  )
)

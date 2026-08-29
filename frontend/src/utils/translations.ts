import { LanguageCode } from '@/store/languageStore'

export const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Nav & Common
    app_title: 'Migrant Saathi AI',
    app_name: 'Migrant Saathi AI',
    nav_dashboard: 'Dashboard',
    nav_profile: 'My Profile',
    nav_skills: 'My Skills',
    nav_welfare: 'Welfare Schemes',
    nav_wages: 'Wage Rate Check',
    nav_report: 'Report Safety Issue',
    nav_grievances: 'My Grievances',
    nav_ai: 'AI Assistant',
    nav_workers: 'Worker Directory',
    nav_map: 'Worker Distribution Map',
    nav_insights: 'AI Insights',
    nav_logout: 'Logout',
    select_language: 'Language / भाषा / ભાષા',

    // Worker Dashboard
    worker_greeting: 'Welcome Back',
    worker_subtitle: 'Your migrant worker portal for welfare, wage rights, and safety.',
    kpi_welfare_matches: 'Matched Schemes',
    kpi_wage_status: 'Wage Rate Status',
    kpi_active_reports: 'Active Reports',
    quick_actions: 'Quick Actions',
    action_check_wages: 'Check Minimum Wages',
    action_explore_schemes: 'Explore Welfare Schemes',
    action_report_issue: 'Report Workplace Issue',
    action_ask_ai: 'Ask AI Assistant',
    recommended_schemes: 'Recommended Welfare Schemes',
    wage_comparison_title: 'District Wage Comparison',
    ai_prompt_teaser: 'Need help with worker rights, PM-SYM pension, or legal advice?',
    ai_button: 'Chat with AI Assistant',
    view_details: 'View Details',
    apply_now: 'Apply Now',

    // Government Dashboard
    gov_greeting: 'Good Day, Labour Officer',
    gov_subtitle: 'Gujarat Labour & Employment Department Enforcement Console',
    gov_reg_workers: 'Registered Workers',
    gov_welfare_coverage: 'Welfare Scheme Coverage',
    gov_wage_alerts: 'Wage Violation Alerts',
    gov_open_grievances: 'Open Grievances',
    gov_high_priority: 'High Priority Cases',
    gov_district_map: 'Gujarat Worker Corridor Map',
    gov_ai_insights: 'IBM Granite AI Insights',
    gov_grievances_console: 'Live Grievance Enforcement Console',
    gov_refresh: 'Refresh Data',
    gov_assign_inspector: 'Assign Inspector',
    gov_status_review: 'Review',
    gov_status_resolve: 'Resolve',
    gov_live_connected: 'Live Connected',
  },
  hi: {
    // Nav & Common
    app_title: 'माइग्रेंट साथी एआई',
    app_name: 'माइग्रेंट साथी एआई',
    nav_dashboard: 'डैशबोर्ड',
    nav_profile: 'मेरी प्रोफाइल',
    nav_skills: 'मेरे कौशल',
    nav_welfare: 'कल्याणकारी योजनाएं',
    nav_wages: 'न्यूनतम मजदूरी जांच',
    nav_report: 'सुरक्षा शिकायत दर्ज करें',
    nav_grievances: 'मेरी शिकायतें',
    nav_ai: 'एआई सहायक',
    nav_workers: 'श्रमिक निर्देशिका',
    nav_map: 'श्रमिक वितरण मानचित्र',
    nav_insights: 'एआई अंतर्दृष्टि',
    nav_logout: 'लॉगआउट',
    select_language: 'भाषा चुनें',

    // Worker Dashboard
    worker_greeting: 'नमस्ते, स्वागत है',
    worker_subtitle: 'कल्याणकारी योजनाओं, मजदूरी अधिकारों और सुरक्षा के लिए आपका पोर्टल।',
    kpi_welfare_matches: 'योग्य योजनाएं',
    kpi_wage_status: 'मजदूरी स्थिति',
    kpi_active_reports: 'सक्रिय शिकायतें',
    quick_actions: 'त्वरित कार्रवाई',
    action_check_wages: 'न्यूनतम मजदूरी जांचें',
    action_explore_schemes: 'योजनाएं देखें',
    action_report_issue: 'सुरक्षा मुद्दा रिपोर्ट करें',
    action_ask_ai: 'एआई सहायक से पूछें',
    recommended_schemes: 'अनुशंसित कल्याणकारी योजनाएं',
    wage_comparison_title: 'जिला मजदूरी तुलना',
    ai_prompt_teaser: 'श्रमिक अधिकारों, पेंशन योजना या कानूनी सलाह में मदद चाहिए?',
    ai_button: 'एआई सहायक से बात करें',
    view_details: 'विवरण देखें',
    apply_now: 'अभी आवेदन करें',

    // Government Dashboard
    gov_greeting: 'नमस्कार, श्रम अधिकारी',
    gov_subtitle: 'गुजरात श्रम और रोजगार विभाग प्रवर्तन कंसोल',
    gov_reg_workers: 'कुल पंजीकृत श्रमिक',
    gov_welfare_coverage: 'कल्याण योजना कवरेज',
    gov_wage_alerts: 'मजदूरी उल्लंघन अलर्ट',
    gov_open_grievances: 'लंबित शिकायतें',
    gov_high_priority: 'उच्च प्राथमिकता मामले',
    gov_district_map: 'गुजरात श्रमिक गलियारा मानचित्र',
    gov_ai_insights: 'आईबीएम ग्रेनाइट एआई अंतर्दृष्टि',
    gov_grievances_console: 'लाइव शिकायत निवारण कंसोल',
    gov_refresh: 'डेटा रिफ्रेश करें',
    gov_assign_inspector: 'निरीक्षक आवंटित करें',
    gov_status_review: 'समीक्षा करें',
    gov_status_resolve: 'समाधान करें',
    gov_live_connected: 'लाइव कनेक्टेड',
  },
  gu: {
    // Nav & Common
    app_title: 'માઇગ્રન્ટ સાથી એઆઇ',
    app_name: 'માઇગ્રન્ટ સાથી એઆઇ',
    nav_dashboard: 'ડેશબોર્ડ',
    nav_profile: 'મારી પ્રોફાઇલ',
    nav_skills: 'મારા કૌશલ્યો',
    nav_welfare: 'કલ્યાણકારી યોજનાઓ',
    nav_wages: 'લઘુત્તમ વેતનની તપાસ',
    nav_report: 'સુરક્ષા ફરિયાદ નોંધાવો',
    nav_grievances: 'મારી ફરિયાદો',
    nav_ai: 'એઆઇ સહાયક',
    nav_workers: 'શ્રમિક ડિરેક્ટરી',
    nav_map: 'શ્રમિક વિતરણ નકશો',
    nav_insights: 'એઆઇ આંતરદૃષ્ટિ',
    nav_logout: 'લૉગઆઉટ',
    select_language: 'ભાષા પસંદ કરો',

    // Worker Dashboard
    worker_greeting: 'નમસ્તે, સ્વાગત છે',
    worker_subtitle: 'કલ્યાણકારી યોજનાઓ, વેતન અધિકારો અને સુરક્ષા માટે તમારું પોર્ટલ.',
    kpi_welfare_matches: 'મળવાપાત્ર યોજનાઓ',
    kpi_wage_status: 'વેતન સ્થિતિ',
    kpi_active_reports: 'સક્રિય ફરિયાદો',
    quick_actions: 'ઝડપી કાર્યો',
    action_check_wages: 'લઘુત્તમ વેતન તપાસો',
    action_explore_schemes: 'યોજનાઓ જુઓ',
    action_report_issue: 'સમસ્યાની જાણ કરો',
    action_ask_ai: 'એઆઇ સહાયકને પૂછો',
    recommended_schemes: 'ભલામણ કરેલ કલ્યાણકારી યોજનાઓ',
    wage_comparison_title: 'જીલ્લા વેતન સરખામણી',
    ai_prompt_teaser: 'શ્રમિક અધિકારો, પેન્શન યોજના અથવા કાનૂની સલાહ માટે મદદ જોઈએ છે?',
    ai_button: 'એઆઇ સહાયક સાથે વાત કરો',
    view_details: 'વિગતો જુઓ',
    apply_now: 'અત્યારે જ અરજી કરો',

    // Government Dashboard
    gov_greeting: 'નમસ્તે, શ્રમ અધિકારીશ્રી',
    gov_subtitle: 'ગુજરાત શ્રમ અને રોજગાર વિભાગ અમલીકરણ કન્સોલ',
    gov_reg_workers: 'કુલ નોંધાયેલ શ્રમિકો',
    gov_welfare_coverage: 'કલ્યાણ યોજના કવરેજ',
    gov_wage_alerts: 'વેતન ઉલ્લંઘન ચેતવણીઓ',
    gov_open_grievances: 'પ્રકીર્ણ ફરિયાદો',
    gov_high_priority: 'ઉચ્ચ પ્રાધાન્ય કેસો',
    gov_district_map: 'ગુજરાત શ્રમિક કોરિડોર નકશો',
    gov_ai_insights: 'IBM ગ્રેનાઇટ એઆઇ આંતરદૃષ્ટિ',
    gov_grievances_console: 'લાઇવ ફરિયાદ નિવારણ કન્સોલ',
    gov_refresh: 'ડેટા રિફ્રેશ કરો',
    gov_assign_inspector: 'નિરીક્ષક ફાળવો',
    gov_status_review: 'સમીક્ષા કરો',
    gov_status_resolve: 'ઉકેલ લાવો',
    gov_live_connected: 'લાઇવ કનેક્ટેડ',
  },
}

import { useLanguageStore } from '@/store/languageStore'

export function useTranslation() {
  const store = useLanguageStore()
  const lang: LanguageCode = store?.language || 'en'
  const setLanguage = store?.setLanguage

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations['en']?.[key] || key
  }

  return { t, lang, setLanguage }
}

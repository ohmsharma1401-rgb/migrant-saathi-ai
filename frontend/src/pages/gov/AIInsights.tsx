import { useState } from 'react'
import { BrainCircuit, ChevronDown, ChevronUp, RefreshCw, CheckCircle, Sparkles } from 'lucide-react'
import { useTranslation } from '@/utils/translations'

interface Insight {
  id: string
  section: 'observed' | 'trend' | 'recommendation'
  text: Record<'en' | 'hi' | 'gu', string>
  detail: Record<'en' | 'hi' | 'gu', string>
  dataPoints: Record<'en' | 'hi' | 'gu', string>
}

const INSIGHTS: Insight[] = [
  // OBSERVED
  {
    id: 'obs-1',
    section: 'observed',
    text: {
      en: '12,847 migrant workers are currently registered in Gujarat. Construction sector workers represent the largest group (40.7%).',
      hi: 'गुजरात में वर्तमान में 12,847 प्रवासी श्रमिक पंजीकृत हैं। निर्माण क्षेत्र के श्रमिक सबसे बड़े समूह (40.7%) का प्रतिनिधित्व करते हैं।',
      gu: 'ગુજરાતમાં હાલમાં ૧૨,૮૪૭ સ્થળાંતરિત શ્રમિકો નોંધાયેલા છે. બાંધકામ ક્ષેત્રના શ્રમિકો સૌથી મોટો સમૂહ (૪૦.૭%) ધરાવે છે.',
    },
    detail: {
      en: 'Workers are distributed across 6 major districts, with Ahmedabad (4,231) and Surat (3,892) accounting for the highest concentrations. Registration growth was +234 workers this month.',
      hi: 'श्रमिक 6 प्रमुख जिलों में फैले हैं, जिनमें अहमदाबाद (4,231) और सूरत (3,892) का उच्चतम संकेंद्रण है। इस महीने +234 नए श्रमिक जुड़े।',
      gu: 'શ્રમિકો ૬ મુખ્ય જિલ્લાઓમાં પથરાયેલા છે, જેમાં અમદાવાદ (૪,૨૩૧) અને સુરત (૩,૮૯૨) સૌથી વધુ નોંધણી ધરાવે છે. આ મહિને +૨૩૪ નવા શ્રમિકો ઉમેરાયા.',
    },
    dataPoints: {
      en: '12,847 worker profiles',
      hi: '12,847 श्रमिक प्रोफाइल',
      gu: '૧૨,૮૪૭ શ્રમિક પ્રોફાઇલ',
    },
  },
  {
    id: 'obs-2',
    section: 'observed',
    text: {
      en: 'Surat and Ahmedabad districts have the highest concentrations of registered migrant workers, together comprising 62.6% of the registered base.',
      hi: 'सूरत और अहमदाबाद जिलों में पंजीकृत प्रवासी श्रमिकों का सबसे अधिक संकेंद्रण है, जो मिलकर पंजीकृत आधार का 62.6% हैं।',
      gu: 'સુરત અને અમદાવાદ જિલ્લાઓમાં સૌથી વધુ નોંધાયેલા શ્રમિકો છે, જે મળીને એકંદર ૬૨.૬% હિસ્સો ધરાવે છે.',
    },
    detail: {
      en: 'Ahmedabad: 4,231 workers (32.9%). Surat: 3,892 workers (30.3%). Vadodara: 2,104 (16.4%). Remaining districts account for the balance.',
      hi: 'अहमदाबाद: 4,231 श्रमिक (32.9%)। सूरत: 3,892 श्रमिक (30.3%)। वडोदरा: 2,104 (16.4%)।',
      gu: 'અમદાવાદ: ૪,૨૩૧ શ્રમિકો (૩૨.૯%). સુરત: ૩,૮૯૨ શ્રમિકો (૩૦.૩%). વડોદરા: ૨,૧૦૪ (૧૬.૪%).',
    },
    dataPoints: {
      en: '6 district records · 12,847 workers',
      hi: '6 जिला रिकॉर्ड · 12,847 श्रमिक',
      gu: '૬ જિલ્લા રેકોર્ડ · ૧૨,૮૪૭ શ્રમિકો',
    },
  },
  {
    id: 'obs-3',
    section: 'observed',
    text: {
      en: 'Welfare scheme match coverage stands at 65.5% of registered workers, with 8,412 workers matched to at least one eligible scheme.',
      hi: 'कल्याणकारी योजना मिलान कवरेज 65.5% पंजीकृत श्रमिकों पर है, जिसमें 8,412 श्रमिक कम से कम एक योजना के लिए योग्य हैं।',
      gu: 'કલ્યાણકારી યોજના મેચ કવરેજ ૬૫.૫% પર છે, જેમાં ૮,૪૧૨ શ્રમિકો ઓછામાં ઓછી એક યોજના માટે પાત્ર છે.',
    },
    detail: {
      en: 'The remaining 34.5% (4,435 workers) have not yet been matched. Common matched schemes are PM-JAY, e-Shram, and PMAY-G.',
      hi: 'शेष 34.5% (4,435 श्रमिक) को अभी तक नहीं जोड़ा गया है। मुख्य योजनाएं PM-JAY, ई-श्रम और PMAY-G हैं।',
      gu: 'બાકીના ૩૪.૫% (૪,૪૩૫ શ્રમિકો) ને જોડવાના બાકી છે. મુખ્ય યોજનાઓ PM-JAY, ઇ-શ્રમ અને PMAY-G છે.',
    },
    dataPoints: {
      en: '8,412 matched workers · 347 active schemes',
      hi: '8,412 योग्य श्रमिक · 347 सक्रिय योजनाएं',
      gu: '૮,૪૧૨ પાત્ર શ્રમિકો · ૩૪૭ સક્રિય યોજનાઓ',
    },
  },
  // POTENTIAL TRENDS
  {
    id: 'trend-1',
    section: 'trend',
    text: {
      en: 'Wage discrepancy alerts in the diamond polishing sector (Surat) appear to have increased compared to the previous period.',
      hi: 'हीरा पॉलिशिंग क्षेत्र (सूरत) में मजदूरी विसंगति अलर्ट पिछली अवधि की तुलना में बढ़े हैं। समीक्षा की सिफारिश की जाती है।',
      gu: 'હીરા પોલિશિંગ ક્ષેત્ર (સુરત) માં વેતન વિસંગતતા ચેતવણીઓ અગાઉના સમયગાળાની તુલનામાં વધી છે. સમીક્ષા કરવાની ભલામણ કરાય છે.',
    },
    detail: {
      en: 'Alert count in diamond sector rose from 89 to 109 (+22.5%). System-generated alerts based on reported wages vs reference minimum rates.',
      hi: 'हीरा क्षेत्र में अलर्ट 89 से बढ़कर 109 हो गए (+22.5%)। रिपोर्ट की गई मजदूरी बनाम न्यूनतम दरों पर आधारित अलर्ट।',
      gu: 'હીરા ક્ષેત્રમાં અલર્ટ ૮૯ થી વધીને ૧૦૯ થયા (+૨૨.૫%). રિપોર્ટ થયેલ વેતન અને લઘુત્તમ દરના આધારે સિસ્ટમ અલર્ટ.',
    },
    dataPoints: {
      en: '1,203 total wage alerts · 109 in diamond sector',
      hi: '1,203 कुल मजदूरी अलर्ट · 109 हीरा क्षेत्र में',
      gu: '૧,૨૦૩ કુલ વેતન અલર્ટ · ૧૦૯ હીરા ક્ષેત્રમાં',
    },
  },
  {
    id: 'trend-2',
    section: 'trend',
    text: {
      en: 'Safety-related grievances in construction sites (Ahmedabad) may show an upward pattern. Field verification recommended.',
      hi: 'निर्माण स्थलों (अहमदाबाद) में सुरक्षा संबंधी शिकायतों में वृद्धि का रुझान दिख रहा है। क्षेत्र सत्यापन की सिफारिश की जाती है।',
      gu: 'બાંધકામ સાઇટ્સ (અમદાવાદ) માં સુરક્ષા સંબંધિત ફરિયાદો વધી રહી છે. સ્થળ પર જઈ ચકાસણી કરવાની ભલામણ છે.',
    },
    detail: {
      en: 'Safety grievances in Ahmedabad increased from 31 to 43 over the observed window. Construction accounts for 72% of safety complaints.',
      hi: 'अहमदाबाद में सुरक्षा शिकायतें 31 से बढ़कर 43 हो गईं। निर्माण क्षेत्र का सुरक्षा शिकायतों में 72% हिस्सा है।',
      gu: 'અમદાવાદમાં સુરક્ષા ફરિયાદો ૩૧ થી વધીને ૪૩ થઈ. બાંધકામ ક્ષેત્રનો સુરક્ષા ફરિયાદોમાં ૭૨% હિસ્સો છે.',
    },
    dataPoints: {
      en: '89 safety grievances · 43 in Ahmedabad construction',
      hi: '89 सुरक्षा शिकायतें · 43 अहमदाबाद निर्माण में',
      gu: '૮૯ સુરક્ષા ફરિયાદો · ૪૩ અમદાવાદ બાંધકામમાં',
    },
  },
  {
    id: 'trend-3',
    section: 'trend',
    text: {
      en: 'Workers from Bihar and Uttar Pradesh origin states represent the largest migrant source groups in Gujarat.',
      hi: 'बिहार और उत्तर प्रदेश के मूल निवासी श्रमिक गुजरात में सबसे बड़े प्रवासी समूह का प्रतिनिधित्व करते हैं।',
      gu: 'બિહાર અને ઉત્તર પ્રદેશના શ્રમિકો ગુજરાતમાં સૌથી મોટો સ્થળાંતરિત સમૂહ ધરાવે છે.',
    },
    detail: {
      en: 'Bihar: ~28%, UP: ~34%. Combined, these two states represent over 60% of the migrant workforce in Gujarat.',
      hi: 'बिहार: ~28%, यूपी: ~34%। कुल मिलाकर दोनों राज्य 60% से अधिक प्रवासी कार्यबल का प्रतिनिधित्व करते हैं।',
      gu: 'બિહાર: ~૨૮%, યુપી: ~૩૪%. બંને રાજ્યો મળીને ૬૦% થી વધુ શ્રમિકો ધરાવે છે.',
    },
    dataPoints: {
      en: '12,847 workers · origin state field data',
      hi: '12,847 श्रमिक · मूल राज्य फील्ड डेटा',
      gu: '૧૨,૮૪૭ શ્રમિકો · વતન રાજ્ય ફાઇન્ડિંગ ડેટા',
    },
  },
  // RECOMMENDATIONS
  {
    id: 'rec-1',
    section: 'recommendation',
    text: {
      en: 'Approximately 34% of registered workers may have unclaimed welfare scheme opportunities. Targeted outreach in high-density districts is recommended.',
      hi: 'लगभग 34% पंजीकृत श्रमिकों के पास अनदावा की गई कल्याणकारी योजना के अवसर हैं। उच्च घनत्व वाले जिलों में लक्षित अभियान चलाएं।',
      gu: 'અંદાજે ૩૪% નોંધાયેલા શ્રમિકો પાસે અનક્લેઇમ થયેલ યોજનાના લાભો છે. સઘન ઝુંબેશથી કવરેજ સુધારી શકાય છે.',
    },
    detail: {
      en: 'An estimated 4,435 workers have no matched welfare scheme. Prioritising Surat and Ahmedabad could cover ~2,700 workers.',
      hi: 'अनुमानित 4,435 श्रमिकों के पास कोई योजना नहीं है। सूरत और अहमदाबाद को प्राथमिकता देने से ~2,700 श्रमिकों को कवर किया जा सकता है।',
      gu: 'અંદાજિત ૪,૪૩૫ શ્રમિકો પાસે કોઈ યોજના નથી. સુરત અને અમદાવાદને પ્રાથમિકતા આપવાથી ~૨,૭૦૦ શ્રમિકો આવરી લેવાશે.',
    },
    dataPoints: {
      en: '4,435 unmatched workers · scheme eligibility data',
      hi: '4,435 अयोग्य श्रमिक · योजना पात्रता डेटा',
      gu: '૪,૪૩૫ પાત્ર ન થયેલા શ્રમિકો · યોજના પાત્રતા ડેટા',
    },
  },
  {
    id: 'rec-2',
    section: 'recommendation',
    text: {
      en: 'Assigning additional inspectors to the Surat diamond sector may help address the volume of wage-related grievances.',
      hi: 'सूरत हीरा क्षेत्र में अतिरिक्त निरीक्षकों को नियुक्त करने से वेतन संबंधी शिकायतों का त्वरित समाधान हो सकता है।',
      gu: 'સુરત હીરા ક્ષેત્રમાં વધારાના નિરીક્ષકોની નીમણૂક કરવાથી વેતન ફરિયાદોનો ઝડપી નિકાલ થઈ શકે છે.',
    },
    detail: {
      en: 'Surat currently has the highest concentration of wage alerts relative to inspector headcount. Directing 2–3 inspectors is recommended.',
      hi: 'सूरत में वर्तमान में निरीक्षक संख्या के सापेक्ष मजदूरी अलर्ट का उच्चतम घनत्व है। 2-3 निरीक्षकों को तैनात करने की सिफारिश की जाती है।',
      gu: 'સુરતમાં નિરીક્ષકોના પ્રમાણમાં વેતન અલર્ટ સૌથી વધુ છે. ૨-૩ નિરીક્ષકો ફાળવવાની ભલામણ કરાય છે.',
    },
    dataPoints: {
      en: '109 wage alerts · Surat district inspector ratio',
      hi: '109 मजदूरी अलर्ट · सूरत जिला निरीक्षक अनुपात',
      gu: '૧૦૯ વેતન અલર્ટ · સુરત જિલ્લા નિરીક્ષક ગુણોત્તર',
    },
  },
  {
    id: 'rec-3',
    section: 'recommendation',
    text: {
      en: 'Multilingual outreach materials in Hindi and Gujarati may improve worker registration rates in rural districts.',
      hi: 'हिंदी और गुजराती में बहुभाषी प्रचार सामग्री से ग्रामीण जिलों में श्रमिक पंजीकरण दर में सुधार हो सकता है।',
      gu: 'હિન્દી અને ગુજરાતીમાં બહુભાષી પ્રચાર સામગ્રીથી ગ્રામીણ જિલ્લાઓમાં શ્રમિક નોંધણી દર સુધરી શકે છે.',
    },
    detail: {
      en: 'Districts like Kutch and Banaskantha show lower registration density relative to estimated migrant worker populations.',
      hi: 'कच्छ और बनासकांठा जैसे जिलों में अनुमानित प्रवासी आबादी की तुलना में कम पंजीकरण घनत्व दिखाई देता है।',
      gu: 'કચ્છ અને બનાસકાંઠા જેવા જિલ્લાઓમાં અંદાજિત શ્રમિક વસ્તીની સરખામણીએ ઓછી નોંધણી છે.',
    },
    dataPoints: {
      en: 'Registration density by district · language survey data',
      hi: 'जिलों द्वारा पंजीकरण घनत्व · भाषा सर्वेक्षण डेटा',
      gu: 'જિલ્લા મુજબ નોંધણી ઘનતા · ભાષા મોજણી ડેટા',
    },
  },
]

interface InsightCardProps {
  insight: Insight
  lang: 'en' | 'hi' | 'gu'
}

const sectionMeta = {
  observed: {
    label: { en: 'OBSERVED DATA', hi: 'अवलोकन डेटा', gu: 'અવલોકન કરેલ ડેટા' },
    badgeBg: 'bg-green-50 text-green-700 border border-green-200',
    dot: 'bg-green-500',
  },
  trend: {
    label: { en: 'POTENTIAL TREND', hi: 'संभावित रुझान', gu: 'સંભવિત વલણ' },
    badgeBg: 'bg-amber-50 text-amber-700 border border-amber-200',
    dot: 'bg-amber-500',
  },
  recommendation: {
    label: { en: 'RECOMMENDATION', hi: 'सिफारिश', gu: 'ભલામણ' },
    badgeBg: 'bg-blue-50 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
  },
}

function InsightCard({ insight, lang }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false)
  const meta = sectionMeta[insight.section]
  const currentLang = (lang === 'hi' || lang === 'gu') ? lang : 'en'

  return (
    <div className="bg-white rounded-2xl shadow-2xs border border-slate-200 overflow-hidden flex flex-col justify-between p-5 hover:shadow-md transition-all">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${meta.dot}`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${meta.badgeBg}`}>
            {meta.label[currentLang]}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#0C2D27] leading-relaxed font-bold">
          {insight.text[currentLang]}
        </p>

        {expanded && (
          <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 animate-in fade-in">
            <p className="text-xs text-[#52605D] leading-relaxed font-normal">
              {insight.detail[currentLang]}
            </p>
          </div>
        )}
      </div>

      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-400 font-medium truncate pr-2">
          {currentLang === 'hi' ? 'डेटा आधार: ' : currentLang === 'gu' ? 'ડેટા આધાર: ' : 'Based on: '}
          <span className="font-bold text-[#0C2D27]">{insight.dataPoints[currentLang]}</span>
        </span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-[#FF6B53] hover:underline flex items-center gap-1 font-bold shrink-0 cursor-pointer"
        >
          {expanded ? (
            <>{currentLang === 'hi' ? 'कम देखें' : currentLang === 'gu' ? 'ઓછું જુઓ' : 'Less detail'} <ChevronUp className="h-3.5 w-3.5" /></>
          ) : (
            <>{currentLang === 'hi' ? 'विस्तार से देखें' : currentLang === 'gu' ? 'વિગતો જુઓ' : 'More detail'} <ChevronDown className="h-3.5 w-3.5" /></>
          )}
        </button>
      </div>
    </div>
  )
}

export default function AIInsights() {
  const { t, lang } = useTranslation()
  const currentLang = (lang === 'hi' || lang === 'gu') ? lang : 'en'
  const [generating, setGenerating] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const observed = INSIGHTS.filter((i) => i.section === 'observed')
  const trends = INSIGHTS.filter((i) => i.section === 'trend')
  const recommendations = INSIGHTS.filter((i) => i.section === 'recommendation')

  function handleGenerate() {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      const msg = lang === 'hi'
        ? 'नवीनतम एआई अंतर्दृष्टि सफलतापूर्वक अपडेट की गई।'
        : lang === 'gu'
        ? 'નવીનતમ એઆઇ આંતરદૃષ્ટિ સફળતાપૂર્વક અપડેટ થઈ.'
        : 'Insights refreshed successfully.'
      setToastMessage(msg)
      setTimeout(() => setToastMessage(null), 3500)
    }, 1800)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-[#0C2D27] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-emerald-600 animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-[#C0E862]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#FF6B53] mb-1">
            <span className="w-4 h-[2px] bg-[#FF6B53]" />
            GOVERNMENT ANALYTICS &amp; DECISION ENGINE
          </div>
          <h1 className="text-3xl font-normal text-[#0C2D27] tracking-tight flex items-center gap-2">
            <BrainCircuit className="h-7 w-7 text-[#FF6B53]" />
            <span>{t('nav_insights')}</span>
          </h1>
          <p className="text-xs text-[#52605D] mt-1 font-normal">
            {lang === 'hi'
              ? 'गुजरात श्रम विभाग के लिए एआई-संचालित कार्यबल रुझान और सिफारिशें।'
              : lang === 'gu'
              ? 'ગુજરાત શ્રમ વિભાગ માટે એઆઇ-સંચાલિત શ્રમિક વલણો અને ભલામણો.'
              : 'AI-driven workforce trends, welfare coverage, and inspection recommendations for Gujarat Labour Dept.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="figma-btn-coral py-2.5 px-5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
          >
            {generating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{lang === 'hi' ? 'तैयार हो रहा है...' : lang === 'gu' ? 'તૈયાર થઈ રહ્યું છે...' : 'Generating…'}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>{lang === 'hi' ? 'नए विचार उत्पन्न करें' : lang === 'gu' ? 'નવી આંતરદૃષ્ટિ બનાવો' : 'Generate New Insights'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-xs text-amber-900">
        <span className="text-lg leading-none">🤖</span>
        <div className="space-y-0.5">
          <b className="block font-bold text-amber-950">
            {lang === 'hi' ? 'एआई अस्वीकरण' : lang === 'gu' ? 'એઆઇ અસ્વીકરણ' : 'AI Analysis Disclaimer'}
          </b>
          <p className="leading-relaxed">
            {lang === 'hi'
              ? 'ये विचार समेकित और अज्ञात डेटा के एआई-जनरेटेड सारांश हैं। फील्ड सत्यापन अनिवार्य है।'
              : lang === 'gu'
              ? 'આ આંતરદૃષ્ટિ એકત્રિત અને અનામી ડેટાનો AI-જનરેટેડ સારાંશ છે. સ્થળ ચકાસણી ફરજિયાત છે.'
              : 'Insights are AI-generated summaries based on aggregated worker registry data. Potential trends require ground field verification before legal action.'}
          </p>
        </div>
      </div>

      {/* Section 1: Workforce Overview */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-[#0C2D27]">
            {lang === 'hi' ? '📊 कार्यबल अवलोकन' : lang === 'gu' ? '📊 શ્રમિક ઓવરવ્યૂ' : '📊 Workforce Overview'}
          </h2>
          <span className="text-xs bg-emerald-100 text-emerald-800 rounded-full px-2.5 py-0.5 font-bold">
            {observed.length} {lang === 'hi' ? 'विचार' : lang === 'gu' ? 'આંતરદૃષ્ટિ' : 'insights'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {observed.map((insight) => (
            <InsightCard key={insight.id} insight={insight} lang={currentLang} />
          ))}
        </div>
      </section>

      {/* Section 2: Potential Issues */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-[#0C2D27]">
            {lang === 'hi' ? '⚠ संभावित समस्याएं व रुझान' : lang === 'gu' ? '⚠ સંભવિત સમસ્યાઓ અને વલણો' : '⚠ Potential Issues & Trends'}
          </h2>
          <span className="text-xs bg-amber-100 text-amber-800 rounded-full px-2.5 py-0.5 font-bold">
            {trends.length} {lang === 'hi' ? 'विचार' : lang === 'gu' ? 'આંતરદૃષ્ટિ' : 'insights'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trends.map((insight) => (
            <InsightCard key={insight.id} insight={insight} lang={currentLang} />
          ))}
        </div>
      </section>

      {/* Section 3: Recommendations */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-[#0C2D27]">
            {lang === 'hi' ? '💡 कार्रवाई योग्य सिफारिशें' : lang === 'gu' ? '💡 અમલીકરણ ભલામણો' : '💡 Actionable Recommendations'}
          </h2>
          <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2.5 py-0.5 font-bold">
            {recommendations.length} {lang === 'hi' ? 'विचार' : lang === 'gu' ? 'આંતરદૃષ્ટિ' : 'insights'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((insight) => (
            <InsightCard key={insight.id} insight={insight} lang={currentLang} />
          ))}
        </div>
      </section>

      {/* Data Quality Footer Box */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-2xs space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C2D27]">
          {lang === 'hi' ? 'डेटा गुणवत्ता व कवरेज' : lang === 'gu' ? 'ડેટા ગુણવત્તા અને કવરેજ' : 'Data Quality & Protection Standard'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#52605D]">
          <div>
            <b className="text-[#0C2D27] block font-bold">
              {lang === 'hi' ? 'अंतिम अपडेट' : lang === 'gu' ? 'છેલ્લે અપડેટ થયું' : 'Last Updated'}
            </b>
            <span>{lang === 'hi' ? 'आज सुबह 9:00 बजे' : lang === 'gu' ? 'આજે સવારે ૯:૦૦ વાગ્યે' : 'Today at 9:00 AM'}</span>
          </div>
          <div>
            <b className="text-[#0C2D27] block font-bold">
              {lang === 'hi' ? 'कवरेज आधार' : lang === 'gu' ? 'કવરેજ આધાર' : 'Coverage Base'}
            </b>
            <span>12,847 workers · 347 grievances · 1,203 wage alerts</span>
          </div>
          <div>
            <b className="text-[#0C2D27] block font-bold">
              {lang === 'hi' ? 'गोपनीयता मानक' : lang === 'gu' ? 'ગોપનીયતા ધોરણ' : 'Privacy Standard'}
            </b>
            <span>{lang === 'hi' ? 'सभी डेटा का समेकीकरण और अनामकरण किया गया है' : lang === 'gu' ? 'તમામ ડેટા એકત્રિત અને અનામી રાખવામાં આવ્યો છે' : 'All personal worker data is aggregated and anonymized for AI analysis'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

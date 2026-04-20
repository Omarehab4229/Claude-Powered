
import React, { useState } from 'react';
import Anthropic from "@anthropic-ai/sdk";
import { 
  Globe, 
  AlertCircle, 
  Terminal, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Calendar as CalendarIcon, 
  Layers, 
  Target,
  Activity,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EconomicEvent {
  date: string;
  time: string;
  event: string;
  currency: string;
  impact: 'High' | 'Medium' | 'Low';
  forecast: string;
  previous: string;
  strategic_playbook: string;
  detailed_analysis: string;
}

interface MarketBrief {
  narrative: string;
  sentiment: string;
  macro_correlation: string;
  critical_warning: string;
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ 
    events: EconomicEvent[], 
    brief: MarketBrief,
    sources: any[] 
  } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EconomicEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  
  const [fromDate, setFromDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [minImpact, setMinImpact] = useState<'High' | 'Medium' | 'Low' | 'All'>('Medium');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchIntelligence = async (retryCount = 0) => {
    const apiKey = (import.meta as any).env?.VITE_ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      setError(lang === 'ar' 
        ? 'مفتاح API مفقود. يرجى التأكد من إعداد VITE_ANTHROPIC_API_KEY في ملف .env.local' 
        : 'API Key missing. Please set VITE_ANTHROPIC_API_KEY in your .env.local file.');
      return;
    }

    setLoading(true);
    setError(null);
    if (retryCount === 0) setData(null);
    
    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
      const today = new Date().toLocaleDateString('en-GB');

      const systemInstruction = `You are the Maxifyfx Institutional Intelligence Terminal (OS V4.5). Today is ${today}.

STRICT OPERATIONAL DIRECTIVES:
1. Generate realistic, plausible economic calendar events for the period from ${fromDate} to ${toDate}.
2. Reference the most recent economic context from your knowledge.
3. Filter for ${minImpact === 'All' ? 'ALL' : minImpact} impact level events.
4. Use professional financial terminology: 'Liquidity Sweeps', 'Order Blocks', 'Yield Curve Control', 'Mean Reversion'.
5. For every event, provide a 1-sentence institutional "Strategic Playbook".
6. Return ONLY valid JSON — no markdown, no preamble, no explanation whatsoever.`;

      const prompt = `Language: ${lang === 'ar' ? 'Arabic' : 'English'}.
Period: ${fromDate} to ${toDate}. Impact filter: ${minImpact}.

Return ONLY this exact JSON (no other text):
{
  "brief": { 
    "narrative": "2-sentence macro summary in ${lang === 'ar' ? 'Arabic' : 'English'}", 
    "sentiment": "Bullish",
    "macro_correlation": "short correlation note",
    "critical_warning": "specific liquidity risk warning"
  },
  "events": [{
    "date": "YYYY-MM-DD", 
    "time": "HH:MM", 
    "event": "Event name in ${lang === 'ar' ? 'Arabic' : 'English'}", 
    "currency": "USD", 
    "impact": "High", 
    "forecast": "value", 
    "previous": "value", 
    "strategic_playbook": "1-sentence guide in ${lang === 'ar' ? 'Arabic' : 'English'}",
    "detailed_analysis": "1-sentence deep dive in ${lang === 'ar' ? 'Arabic' : 'English'}"
  }]
}

Generate exactly 5 realistic economic events. All text in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

      const message = await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        system: systemInstruction,
        messages: [{ role: 'user', content: prompt }],
      });

      const textBlock = message.content.find(b => b.type === 'text');
      if (!textBlock || textBlock.type !== 'text') throw new Error('No text response from Claude');

      const clean = textBlock.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      const parsed = JSON.parse(clean);

      setData({ ...parsed, sources: [] });
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error('Fetch Error:', err);
      const isRateLimit = err?.status === 429 || err?.message?.includes('rate_limit');
      const maxRetries = isRateLimit ? 3 : 2;
      const delay = isRateLimit ? Math.pow(2, retryCount) * 15000 : 1000;
      if (retryCount < maxRetries) {
        setTimeout(() => fetchIntelligence(retryCount + 1), delay);
        return;
      }
      setError(lang === 'ar'
        ? `فشل النظام: ${err.message || String(err)}`
        : `Deep data sync failed: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#020617] p-3 md:p-6 lg:p-8 flex flex-col gap-4 md:gap-6 max-w-[1700px] mx-auto text-slate-200 ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${selectedEvent.impact === 'High' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : selectedEvent.impact === 'Medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'}`}>
                      <Activity size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-black text-white leading-tight">{selectedEvent.event}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedEvent.date} • {selectedEvent.time}</span>
                        <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700 text-[10px]">{selectedEvent.currency}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-white">
                    <X size={24} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">{lang === 'ar' ? 'التوقع' : 'FORECAST'}</span>
                    <span className="text-lg font-bold text-white">{selectedEvent.forecast || '-'}</span>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">{lang === 'ar' ? 'السابق' : 'PREVIOUS'}</span>
                    <span className="text-lg font-bold text-white">{selectedEvent.previous || '-'}</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Target size={16} className="text-emerald-500" />
                      <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{lang === 'ar' ? 'خطة التداول المؤسسية' : 'INSTITUTIONAL PLAYBOOK'}</h4>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl">
                      <p className="text-sm text-slate-300 leading-relaxed italic">"{selectedEvent.strategic_playbook}"</p>
                    </div>
                  </section>
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Layers size={16} className="text-indigo-400" />
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{lang === 'ar' ? 'التحليل العميق' : 'DEEP ANALYSIS'}</h4>
                    </div>
                    <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl">
                      <p className="text-sm text-slate-300 leading-relaxed">{selectedEvent.detailed_analysis}</p>
                    </div>
                  </section>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                  {lang === 'ar' ? 'إغلاق' : 'CLOSE TERMINAL'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 md:gap-6 bg-slate-900/40 p-4 md:p-6 rounded-3xl border border-slate-800/60 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-tr from-indigo-700 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/20 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
            <Terminal className="text-white" size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 md:gap-3">
              <h1 className="text-xl md:text-3xl font-black tracking-tighter text-white">MAXIFYFX</h1>
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] md:text-[9px] font-black rounded uppercase tracking-widest animate-pulse">Live_Sync</span>
            </div>
            <p className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Institutional Intelligence OS v4.5 • Powered by Claude AI</p>
            {lastUpdated && (
              <div className="flex items-center gap-2 mt-2">
                <Clock size={10} className="text-slate-600" />
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{lang === 'ar' ? 'آخر تحديث:' : 'LAST UPDATED:'} {lastUpdated}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto bg-slate-950/40 p-2 rounded-2xl border border-slate-800/50">
          <div className="flex flex-col sm:flex-row gap-2 bg-slate-900 rounded-xl p-1 border border-slate-800">
            <div className="flex items-center gap-2 px-2">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{lang === 'ar' ? 'من:' : 'FROM:'}</span>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-slate-950 text-white text-[9px] font-black p-1.5 rounded border border-slate-700 focus:border-indigo-500 outline-none" />
            </div>
            <div className="flex items-center gap-2 px-2">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{lang === 'ar' ? 'إلى:' : 'TO:'}</span>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-slate-950 text-white text-[9px] font-black p-1.5 rounded border border-slate-700 focus:border-indigo-500 outline-none" />
            </div>
          </div>

          <div className="flex overflow-x-auto bg-slate-900 rounded-xl p-1 border border-slate-800">
            {(['High', 'Medium', 'Low', 'All'] as const).map((impact) => (
              <button key={impact} onClick={() => setMinImpact(impact)} className={`px-3 md:px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all whitespace-nowrap ${minImpact === impact ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                {impact === 'All' ? (lang === 'ar' ? 'الكل' : 'ALL') : `${impact}+`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-indigo-400 transition-all flex-1 sm:flex-none flex justify-center">
              <Globe size={18} />
            </button>
            <button onClick={() => fetchIntelligence()} disabled={loading} className="flex-1 sm:flex-none px-6 md:px-10 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-[10px] md:text-xs font-black text-white shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-3 active:scale-95 transition-all">
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <Zap size={18} className="fill-current" />}
              <span className="whitespace-nowrap">{loading ? (lang === 'ar' ? 'جاري المعالجة...' : 'PROCESSING...') : (lang === 'ar' ? 'تحديث' : 'SYNC')}</span>
            </button>
          </div>
        </div>
      </header>

      {data && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 p-5 md:p-8 rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 end-0 p-4 md:p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
               <Activity size={80} />
             </div>
             <div className="flex items-center gap-3 mb-3 md:mb-4">
                <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400"><Activity size={18} /></div>
                <h2 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400">{lang === 'ar' ? 'المنظور الكلي للسوق' : 'MACRO MARKET PERSPECTIVE'}</h2>
             </div>
             <p className="text-base md:text-xl font-semibold text-white leading-tight mb-4">{data.brief.narrative}</p>
             <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest border-t border-slate-800/50 pt-4">
               <Target size={14} className="text-emerald-500" />
               <span className="text-emerald-400/80 truncate">{data.brief.macro_correlation}</span>
             </div>
          </div>
          <div className="bg-rose-950/10 p-5 md:p-8 rounded-3xl border border-rose-500/20 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 blur-3xl rounded-full -mr-10 -mt-10"></div>
            <div>
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <AlertCircle className="text-rose-500" size={18} />
                <span className="text-[8px] md:text-[10px] font-black text-rose-500 uppercase tracking-widest">{lang === 'ar' ? 'تنبيه السيولة والمخاطر' : 'LIQUIDITY & RISK ALERT'}</span>
              </div>
              <p className="text-xs md:text-sm font-medium leading-relaxed text-rose-200/70 italic">"{data.brief.critical_warning}"</p>
            </div>
            <div className="mt-4 md:mt-6 flex items-center justify-between bg-slate-950/50 p-3 md:p-4 rounded-2xl border border-slate-800/50">
               <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang === 'ar' ? 'الاتجاه السائد:' : 'DOMINANT BIAS:'}</span>
               <span className={`text-[10px] md:text-xs font-black uppercase ${data.brief.sentiment === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}`}>{data.brief.sentiment}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between gap-4 text-rose-400 text-sm shadow-xl">
          <div className="flex items-center gap-4"><AlertCircle size={24} /> {error}</div>
          <button onClick={() => fetchIntelligence()} className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg border border-rose-500/30 transition-all text-[10px] font-black uppercase whitespace-nowrap">
            {lang === 'ar' ? 'إعادة المحاولة' : 'RETRY'}
          </button>
        </div>
      )}

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-900/10 rounded-[3rem] border border-dashed border-slate-800/40 relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.05)_0%,transparent_70%)]"></div>
           <div className="relative mb-10">
              <div className="w-36 h-36 border-[6px] border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_30px_rgba(79,70,229,0.2)]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <RefreshCw className="text-indigo-500 animate-pulse" size={48} />
              </div>
           </div>
           <div className="text-center space-y-4 relative z-10">
              <p className="text-xs text-indigo-400 animate-pulse tracking-[0.6em] uppercase">ACCESSING GLOBAL DATASTREAMS</p>
              <p className="text-[10px] text-slate-600 font-bold tracking-widest uppercase">Querying Claude AI Intelligence Engine</p>
              <div className="flex gap-1 justify-center mt-4">
                {[1,2,3,4,5].map(i => (<div key={i} className="w-1 h-1 bg-indigo-500/30 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>))}
              </div>
           </div>
        </div>
      )}

      {!data && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center py-40 opacity-20 group">
          <div className="p-12 bg-slate-900/50 rounded-full mb-10 border border-slate-800 group-hover:scale-110 transition-transform duration-700">
            <Layers size={120} className="text-slate-700" />
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-500">TERMINAL_STANDBY</h2>
          <p className="text-sm mt-4 font-bold text-slate-600 tracking-[0.3em] uppercase">Initialize Intelligence Scan to Begin</p>
        </div>
      )}

      {data && !loading && (
        <div className="mb-10 md:mb-20">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 md:px-4">
              <div className="flex items-center gap-3">
                <CalendarIcon className="text-indigo-400" size={20} />
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white">{lang === 'ar' ? 'رادار البيانات المؤسسية' : 'INSTITUTIONAL ECONOMIC RADAR'}</h3>
              </div>
              <span className="text-[8px] md:text-[10px] bg-slate-800 px-3 py-1 rounded-full text-slate-500 font-black uppercase border border-slate-700">{fromDate} - {toDate}</span>
            </div>

            <div className="bg-slate-900/30 border border-slate-800/60 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
              
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-start border-collapse">
                  <thead>
                    <tr className="bg-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/50">
                      <th className="py-5 px-6 text-start">{lang === 'ar' ? 'الجدول الزمني' : 'TIMELINE'}</th>
                      <th className="py-5 px-6 text-start">{lang === 'ar' ? 'الحدث الاستراتيجي' : 'STRATEGIC EVENT'}</th>
                      <th className="py-5 px-6 text-center">{lang === 'ar' ? 'التأثير' : 'IMPACT'}</th>
                      <th className="py-5 px-6 text-start">{lang === 'ar' ? 'خطة التداول' : 'STRATEGIC PLAYBOOK'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/30">
                    {data.events.map((ev, i) => (
                      <tr key={i} onClick={() => setSelectedEvent(ev)} className="hover:bg-indigo-500/[0.04] transition-all group border-b border-slate-800/20 last:border-0 cursor-pointer">
                        <td className="py-6 px-6">
                          <div className="text-[11px] font-black text-white mb-1 uppercase tracking-tighter">{ev.date}</div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                            <Clock size={12} className="text-indigo-500/50" /> {ev.time}
                          </div>
                        </td>
                        <td className="py-6 px-6">
                          <div className="text-[14px] font-black text-indigo-100 group-hover:text-indigo-400 transition-colors tracking-tight">{ev.event}</div>
                          <div className="text-[10px] text-slate-500 mt-2 font-black flex items-center gap-2">
                             <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">{ev.currency}</span>
                             <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                             <span className="text-slate-500">F: {ev.forecast || '-'} | P: {ev.previous || '-'}</span>
                          </div>
                        </td>
                        <td className="py-6 px-6">
                          <div className="flex justify-center">
                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border shadow-2xl ${ev.impact === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : ev.impact === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'}`}>{ev.impact}</span>
                          </div>
                        </td>
                        <td className="py-6 px-6 max-w-[280px]">
                          <div className="flex items-start gap-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 group-hover:border-indigo-500/30 transition-all">
                             <Target size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                             <p className="text-[11px] leading-relaxed text-slate-400 font-medium italic">{ev.strategic_playbook}</p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-slate-800/30">
                {data.events.map((ev, i) => (
                  <div key={i} onClick={() => setSelectedEvent(ev)} className="p-5 space-y-4 active:bg-slate-800/50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1 text-start">
                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">{ev.date} • {ev.time}</div>
                        <div className="text-sm font-black text-white leading-tight">{ev.event}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase border shrink-0 ms-4 ${ev.impact === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : ev.impact === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'}`}>{ev.impact}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] font-bold">
                      <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">{ev.currency}</span>
                      <span className="text-slate-500">F: {ev.forecast || '-'} | P: {ev.previous || '-'}</span>
                    </div>
                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/50 flex gap-3 text-start">
                      <Target size={14} className="text-emerald-500 shrink-0" />
                      <p className="text-[10px] leading-relaxed text-slate-400 italic">{ev.strategic_playbook}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 md:gap-4 mt-6 md:mt-8 px-2 md:px-4 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest mr-2 md:mr-4">
                <ShieldCheck size={14} className="text-emerald-500" />
                POWERED BY:
              </div>
              <div className="text-[8px] md:text-[9px] text-slate-500 flex items-center gap-2 bg-slate-900/50 px-3 md:px-5 py-2 rounded-xl border border-slate-800">
                <Zap size={10} className="text-indigo-400" /> Claude AI (Anthropic)
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-auto py-16 border-t border-slate-900/50 flex flex-col items-center gap-6 opacity-40">
        <div className="flex items-center gap-8">
           <div className="h-px w-20 bg-gradient-to-r from-transparent to-slate-800"></div>
           <p className="text-[11px] font-black uppercase tracking-[1em] text-slate-600">MAXIFYFX_OS_V4.5_CORE</p>
           <div className="h-px w-20 bg-gradient-to-l from-transparent to-slate-800"></div>
        </div>
        <p className="text-[10px] text-slate-700 font-bold tracking-widest">EST. 2024 • GLOBAL INSTITUTIONAL DATA AGGREGATOR • LONDON • DUBAI • SINGAPORE</p>
      </footer>
    </div>
  );
};

export default App;

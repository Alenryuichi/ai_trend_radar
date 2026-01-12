
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchAITrends, getRadarData, fetchDetailedAnalysis, fetchTrendingRepos } from './services/geminiService';
import { TrendItem, RadarPoint, AICategory, Language, TRANSLATIONS, GitHubRepo, INTELLIGENCE_CORES, IntelligenceCore, TokenUsage } from './types';
import TrendCard from './components/TrendCard';
import RadarChart from './components/RadarChart';
import GitHubRepoCard from './components/GitHubRepoCard';
import DailyPracticeSection from './components/coding-efficiency/DailyPracticeSection';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('zh'); 
  const [activeCore, setActiveCore] = useState<IntelligenceCore>(INTELLIGENCE_CORES[0]); 
  const [showCoreMenu, setShowCoreMenu] = useState(false);
  
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [radarData, setRadarData] = useState<RadarPoint[]>([]);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInfiniteLoading, setIsInfiniteLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<AICategory | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [favorites, setFavorites] = useState<TrendItem[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [detailedAnalysis, setDetailedAnalysis] = useState<string | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Token Usage State
  const [totalUsage, setTotalUsage] = useState<TokenUsage>({ promptTokens: 0, completionTokens: 0, totalTokens: 0 });

  const initialFetchDone = useRef(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const coreMenuRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];

  const updateUsage = useCallback((newUsage: TokenUsage) => {
    setTotalUsage(prev => {
      const updated = {
        promptTokens: prev.promptTokens + newUsage.promptTokens,
        completionTokens: prev.completionTokens + newUsage.completionTokens,
        totalTokens: prev.totalTokens + newUsage.totalTokens
      };
      localStorage.setItem('ai_radar_usage', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetUsage = () => {
    const zero = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    setTotalUsage(zero);
    localStorage.setItem('ai_radar_usage', JSON.stringify(zero));
  };

  const initApp = useCallback(async () => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;
    
    setIsLoading(true);
    const coreId = activeCore.id;

    // Load usage from storage
    const savedUsage = localStorage.getItem('ai_radar_usage');
    if (savedUsage) {
      try { setTotalUsage(JSON.parse(savedUsage)); } catch(e) {}
    }

    try {
      const [trendRes, radarRes, repoRes] = await Promise.all([
        fetchAITrends("", language, coreId),
        getRadarData(language, coreId),
        fetchTrendingRepos(language, coreId)
      ]);
      setTrends(trendRes.data);
      setRadarData(radarRes.data);
      setGithubRepos(repoRes.data);
      updateUsage(trendRes.usage);
      updateUsage(radarRes.usage);
      updateUsage(repoRes.usage);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Initialization failed", e);
    } finally {
      setIsLoading(false);
    }
  }, [language, activeCore.id, updateUsage]);

  useEffect(() => {
    initApp();
  }, [initApp]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (coreMenuRef.current && !coreMenuRef.current.contains(event.target as Node)) {
        setShowCoreMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('ai_radar_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load favorites", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_radar_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const performSearch = useCallback(async (query: string, category?: AICategory | null, targetLang?: Language, append: boolean = false, coreId?: string) => {
    if (append) {
      setIsInfiniteLoading(true);
    } else {
      setIsLoading(true);
      setShowOnlyFavorites(false); 
      setSelectedTrend(null); 
    }

    const langToUse = targetLang || language;
    const modelToUse = coreId || activeCore.id;
    try {
      const results = await fetchAITrends(query, langToUse, modelToUse, category || undefined);
      updateUsage(results.usage);
      
      setTrends(prev => {
        if (!append) return results.data;
        const existingTitles = new Set(prev.map(t => t.title));
        const newItems = results.data.filter(item => !existingTitles.has(item.title));
        return [...prev, ...newItems];
      });
      
      setLastUpdated(new Date());

      if (!append && (!category || category === AICategory.CODING_EFFICIENCY)) {
        fetchTrendingRepos(langToUse, modelToUse).then(res => {
          setGithubRepos(res.data);
          updateUsage(res.usage);
        });
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
      setIsInfiniteLoading(false);
    }
  }, [language, activeCore.id, updateUsage]);

  const handleRadarCategorySelect = (subject: string) => {
    let matchedCategory: AICategory | null = null;
    for (const cat of Object.values(AICategory)) {
      if (cat === subject) {
        matchedCategory = cat;
        break;
      }
    }
    
    if (!matchedCategory && language === 'zh') {
       if (subject.includes('模型') || subject.includes('LLM')) matchedCategory = AICategory.LLM;
       else if (subject.includes('机器人')) matchedCategory = AICategory.ROBOTICS;
       else if (subject.includes('生成') || subject.includes('媒体')) matchedCategory = AICategory.GEN_ART;
       else if (subject.includes('智能体')) matchedCategory = AICategory.AGENTS;
       else if (subject.includes('政策') || subject.includes('伦理')) matchedCategory = AICategory.ETHICS;
       else if (subject.includes('算力') || subject.includes('硬件')) matchedCategory = AICategory.HARDWARE;
       else if (subject.includes('编程') || subject.includes('提效')) matchedCategory = AICategory.CODING_EFFICIENCY;
    }

    if (matchedCategory) {
      handleCategoryToggle(matchedCategory);
    }
  };

  useEffect(() => {
    if (showOnlyFavorites || selectedTrend || isLoading || isInfiniteLoading) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && trends.length > 0) {
          performSearch(searchQuery, activeCategory, language, true);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [showOnlyFavorites, selectedTrend, isLoading, isInfiniteLoading, trends.length, searchQuery, activeCategory, language, performSearch]);

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'zh' : 'en';
    setLanguage(nextLang);
    performSearch(searchQuery, activeCategory, nextLang);
    getRadarData(nextLang, activeCore.id).then(res => {
      setRadarData(res.data);
      updateUsage(res.usage);
    });
    if (selectedTrend) {
       handleSelectTrend(selectedTrend, nextLang);
    }
  };

  const switchCore = (core: IntelligenceCore) => {
    setActiveCore(core);
    setShowCoreMenu(false);
    performSearch(searchQuery, activeCategory, language, false, core.id);
    getRadarData(language, core.id).then(res => {
      setRadarData(res.data);
      updateUsage(res.usage);
    });
  };

  const toggleFavorite = (e: React.MouseEvent, item: TrendItem) => {
    e.stopPropagation(); 
    setFavorites(prev => {
      const exists = prev.find(f => f.id === item.id);
      if (exists) {
        return prev.filter(f => f.id !== item.id);
      }
      return [item, ...prev];
    });
  };

  const handleSelectTrend = async (item: TrendItem, forceLang?: Language) => {
    setSelectedTrend(item);
    setDetailedAnalysis(null);
    setIsDetailLoading(true);
    const analysisRes = await fetchDetailedAnalysis(item, forceLang || language, activeCore.id);
    setDetailedAnalysis(analysisRes.data);
    updateUsage(analysisRes.usage);
    setIsDetailLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedTrend(null);
    setDetailedAnalysis(null);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    performSearch(searchQuery, activeCategory);
  };

  const handleCategoryToggle = (cat: AICategory) => {
    const newCat = activeCategory === cat ? null : cat;
    setActiveCategory(newCat);
    performSearch(searchQuery, newCat);
  };

  const categories = Object.values(AICategory);
  const displayedTrends = showOnlyFavorites ? favorites : trends;

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-gray-200 selection:bg-blue-500/30">
      <div className="bg-blue-600/10 border-b border-blue-500/20 py-2 px-6 flex items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="h-full w-full bg-[linear-gradient(to_right,transparent_49.5%,rgba(59,130,246,0.3)_50%,transparent_50.5%)] bg-[length:20px_100%]"></div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]"></span>
            {t.live}
          </div>
          <div className="h-4 w-px bg-blue-500/20"></div>
          <div className="flex items-center gap-2">
            <i className={`fa-solid ${activeCore.supportsGrounding ? 'fa-satellite-dish text-emerald-400' : 'fa-brain text-amber-500'}`}></i>
            <span className={activeCore.supportsGrounding ? 'text-emerald-400' : 'text-amber-500'}>
              {activeCore.supportsGrounding ? t.groundingActive : t.groundingDisabled}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <span className="opacity-70">{t.sync}: {lastUpdated.toLocaleTimeString()}</span>
          <button 
            onClick={toggleLanguage}
            className="bg-white/5 border border-white/10 px-3 py-1 rounded hover:bg-white/10 transition-all flex items-center gap-2 font-bold active:scale-95"
          >
            <i className="fa-solid fa-globe text-[10px]"></i>
            {language === 'en' ? 'EN' : 'ZH'}
          </button>
        </div>
      </div>

      <header className="border-b border-white/5 glass-card sticky top-0 z-50 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 group cursor-pointer" onClick={() => { handleBackToList(); performSearch("", null); setActiveCategory(null); }}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 group-hover:rotate-12 transition-all duration-500">
              <i className="fa-solid fa-radar text-white text-2xl animate-pulse"></i>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-white">AI TREND<span className="text-blue-500">RADAR</span></h1>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest border border-white/10 px-2 rounded-sm bg-white/5">v4.0 Ultra</span>
                <div className="relative" ref={coreMenuRef}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowCoreMenu(!showCoreMenu); }}
                    className="text-[9px] text-blue-500/80 hover:text-blue-400 font-mono uppercase tracking-widest flex items-center gap-1.5 transition-colors group/core"
                  >
                    <i className={`fa-solid ${activeCore.icon} text-[10px]`}></i>
                    {activeCore.name}
                    <i className={`fa-solid fa-chevron-down text-[7px] transition-transform ${showCoreMenu ? 'rotate-180' : ''}`}></i>
                  </button>
                  
                  {showCoreMenu && (
                    <div className="absolute top-full left-0 mt-3 w-64 glass-card rounded-2xl border border-white/10 shadow-2xl z-[100] p-2 animate-in fade-in slide-in-from-top-2">
                       <div className="px-3 py-2 text-[8px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 mb-1">{t.coreSelect}</div>
                       {INTELLIGENCE_CORES.map(core => (
                         <button
                          key={core.id}
                          onClick={() => switchCore(core)}
                          className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-4 hover:bg-white/5 group ${activeCore.id === core.id ? 'bg-blue-500/10 border border-blue-500/20' : 'border border-transparent'}`}
                         >
                            <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activeCore.id === core.id ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-500 group-hover:text-white'}`}>
                               <i className={`fa-solid ${core.icon} text-sm`}></i>
                            </div>
                            <div>
                               <div className={`text-[11px] font-black uppercase tracking-wider ${activeCore.id === core.id ? 'text-blue-400' : 'text-gray-300'}`}>{core.name}</div>
                               <div className="text-[9px] text-gray-500 font-medium leading-tight mt-0.5">{core.description}</div>
                            </div>
                         </button>
                       ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-[480px] group">
            <input
              type="text"
              placeholder={t.placeholder}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-12 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-gray-600 text-white font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
            />
            <i className={`fa-solid ${isLoading ? 'fa-circle-notch fa-spin text-blue-500' : 'fa-magnifying-glass text-gray-600'} absolute left-4.5 top-1/2 -translate-y-1/2 text-sm transition-colors group-focus-within:text-blue-500`}></i>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className={`bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black px-5 py-2.5 rounded-xl transition-all uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-sync fa-spin"></i>
                    {language === 'zh' ? '正在提取' : 'Extracting'}
                  </>
                ) : t.analyze}
              </button>
            </div>
          </form>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-3 space-y-10 lg:sticky lg:top-32 h-fit">
          {/* Telemetry Monitor Section */}
          <section className="glass-card rounded-[2rem] p-6 border-blue-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
              <i className="fa-solid fa-chart-line text-6xl"></i>
            </div>
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-6 flex items-center justify-between">
              {t.usageMonitor}
              <button onClick={resetUsage} className="hover:text-red-400 transition-colors">
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                  <span>{t.tokens}</span>
                  <span className="text-blue-400 font-bold">{totalUsage.totalTokens.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse" style={{ width: `${Math.min(100, (totalUsage.totalTokens / 100000) * 100)}%` }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                   <div className="text-[8px] text-gray-600 uppercase mb-1">Inbound</div>
                   <div className="text-[11px] font-mono text-emerald-500">{totalUsage.promptTokens.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                   <div className="text-[8px] text-gray-600 uppercase mb-1">Outbound</div>
                   <div className="text-[11px] font-mono text-amber-500">{totalUsage.completionTokens.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="relative">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-5 flex items-center justify-between px-1">
              {t.radar}
              <div className="flex items-center gap-1.5 opacity-50">
                <i className="fa-solid fa-circle-nodes text-[8px] animate-pulse"></i>
              </div>
            </h2>
            <div className="relative rounded-2xl p-1 bg-gradient-to-br from-white/10 to-transparent">
              <RadarChart 
                data={radarData} 
                activeCategory={activeCategory} 
                onSelectCategory={handleRadarCategorySelect} 
              />
            </div>
          </section>

          <nav className="space-y-1.5">
             <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-4 px-2">{t.clusters}</h2>
             <button
              onClick={() => { setShowOnlyFavorites(!showOnlyFavorites); setSelectedTrend(null); }}
              className={`w-full text-left px-5 py-3.5 rounded-2xl text-[11px] font-black transition-all flex items-center justify-between group mb-5 border ${
                showOnlyFavorites 
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-400 shadow-xl shadow-blue-500/10' 
                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-gray-200'
              }`}
             >
               <span className="flex items-center gap-4">
                <i className={`fa-${showOnlyFavorites ? 'solid' : 'regular'} fa-bookmark text-sm transition-transform group-hover:scale-125`}></i>
                {t.favorites}
               </span>
               <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono ${showOnlyFavorites ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50' : 'bg-white/10 text-gray-500'}`}>
                {favorites.length.toString().padStart(2, '0')}
               </span>
             </button>

             <div className="space-y-2">
               {categories.map((cat) => (
                 <button
                  key={cat}
                  disabled={showOnlyFavorites}
                  onClick={() => { handleCategoryToggle(cat); setSelectedTrend(null); }}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-between group relative overflow-hidden ${
                    !showOnlyFavorites && activeCategory === cat 
                    ? 'bg-white/10 border border-blue-500/40 text-blue-400' 
                    : 'bg-white/5 border border-transparent text-gray-400 hover:bg-white/10 hover:text-gray-200 disabled:opacity-20'
                  }`}
                 >
                   <span className="relative z-10 flex items-center gap-2">
                     {cat === AICategory.CODING_EFFICIENCY && <i className="fa-solid fa-laptop-code text-xs text-blue-500"></i>}
                     {cat}
                   </span>
                   {activeCategory === cat && !showOnlyFavorites && (
                     <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span>
                   )}
                   <i className={`fa-solid fa-chevron-right text-[8px] transition-all relative z-10 ${activeCategory === cat && !showOnlyFavorites ? 'rotate-90 translate-x-1 text-blue-400' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`}></i>
                 </button>
               ))}
             </div>
          </nav>
        </aside>

        <div className="lg:col-span-9 space-y-8">
          {selectedTrend ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex items-center justify-between gap-4 mb-4">
                <button 
                  onClick={handleBackToList}
                  className="group flex items-center gap-3 text-blue-400 hover:text-blue-300 text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                >
                  <div className="w-8 h-8 rounded-full border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                    <i className="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"></i>
                  </div>
                  {language === 'zh' ? '返回聚合流' : 'Back to Stream'}
                </button>
              </div>

              <div className="space-y-10">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="px-4 py-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/5">
                    {selectedTrend.category}
                  </span>
                  <div className="h-px w-8 bg-white/10"></div>
                  <span className="text-[11px] text-gray-500 font-mono tracking-wider flex items-center gap-2">
                    <i className="fa-regular fa-calendar-check"></i>
                    {new Date(selectedTrend.timestamp).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight">
                  {selectedTrend.title}
                </h1>

                <div className="flex flex-wrap items-center gap-8 py-8 border-y border-white/5">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">{t.signal} Intensity</span>
                    <div className="flex items-center gap-4">
                       <span className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{selectedTrend.relevanceScore}%</span>
                       <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" style={{ width: `${selectedTrend.relevanceScore}%` }}></div>
                       </div>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-white/10 hidden md:block"></div>
                  <button 
                    onClick={(e) => toggleFavorite(e, selectedTrend)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${
                      favorites.some(f => f.id === selectedTrend.id) 
                      ? 'bg-blue-600/20 border-blue-500/40 text-blue-400 shadow-xl shadow-blue-500/10' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <i className={`fa-${favorites.some(f => f.id === selectedTrend.id) ? 'solid' : 'regular'} fa-bookmark`}></i>
                    {language === 'zh' ? '数据入库' : 'Save Signal'}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
                  <div className="lg:col-span-8 space-y-10">
                    <div className="prose prose-invert max-w-none">
                      <p className="text-2xl text-blue-400/90 font-bold leading-relaxed mb-10 border-l-4 border-blue-500 pl-8">
                        {selectedTrend.summary}
                      </p>
                      
                      {isDetailLoading ? (
                        <div className="space-y-10 py-10">
                          <div className="flex items-center gap-4 text-blue-400 font-mono text-[11px] uppercase tracking-[0.3em] animate-pulse">
                            <i className="fa-solid fa-dna fa-spin text-sm"></i>
                            {language === 'zh' ? '解析技术深度结构中...' : 'Decoding Technical Matrix...'}
                          </div>
                          <div className="space-y-6 opacity-40">
                            <div className="h-5 bg-white/10 rounded-lg w-full animate-pulse"></div>
                            <div className="h-5 bg-white/10 rounded-lg w-11/12 animate-pulse" style={{ animationDelay: '200ms' }}></div>
                            <div className="h-48 bg-white/10 rounded-2xl w-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-300 text-lg leading-[1.8] font-medium selection:bg-blue-500/40">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {detailedAnalysis || ''}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>

                  <aside className="lg:col-span-4 space-y-10">
                    <div className="glass-card rounded-3xl p-8 border-blue-500/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <i className="fa-solid fa-link-slash text-6xl"></i>
                      </div>
                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        {t.sources}
                      </h3>
                      <div className="space-y-4">
                        {selectedTrend.sources.map((source, idx) => (
                          <a 
                            key={idx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-5 bg-white/5 border border-white/5 rounded-2xl hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group"
                          >
                            <div className="flex justify-between items-start gap-3 mb-2">
                              <p className="text-sm font-black text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                                {source.title}
                              </p>
                              <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-gray-600 group-hover:text-blue-500 transition-colors"></i>
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono flex items-center gap-2 overflow-hidden">
                              <i className="fa-solid fa-shield-halved text-blue-500/50"></i>
                              <span className="truncate opacity-60 group-hover:opacity-100">{new URL(source.uri).hostname}</span>
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600/10 to-transparent rounded-3xl p-8 border border-white/5">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-4">Signal Metadata</h4>
                        <div className="space-y-3">
                           <div className="flex justify-between text-[11px] font-mono">
                              <span className="text-gray-600">Trust Score</span>
                              <span className="text-blue-500">Verified High</span>
                           </div>
                           <div className="flex justify-between text-[11px] font-mono">
                              <span className="text-gray-600">Latency</span>
                              <span className="text-emerald-500">240ms</span>
                           </div>
                        </div>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-8">
                <div className="flex items-center gap-5">
                  <h2 className="text-4xl font-black text-white tracking-tighter">
                    {showOnlyFavorites ? t.favorites : (activeCategory ? activeCategory : t.globalPulse)}
                  </h2>
                </div>
                
                {!showOnlyFavorites && (
                  <button 
                    onClick={() => performSearch(searchQuery, activeCategory)}
                    disabled={isLoading}
                    className="flex items-center gap-3 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95"
                  >
                    <i className={`fa-solid fa-arrows-rotate ${isLoading ? 'fa-spin text-blue-500' : ''}`}></i>
                    {t.refresh}
                  </button>
                )}
              </div>

              {/* 今日精選區塊 - 僅在 Coding Efficiency 類別顯示 */}
              {activeCategory === AICategory.CODING_EFFICIENCY && !showOnlyFavorites && !selectedTrend && (
                <div className="mb-8">
                  <DailyPracticeSection />
                </div>
              )}

              {isLoading ? (
                <div className="space-y-8 py-4">
                  {[1, 2].map(i => (
                    <div key={i} className="glass-card rounded-3xl p-10 animate-pulse border border-white/5 h-64"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 py-4">
                  {displayedTrends.length > 0 ? (
                    displayedTrends.map(trend => (
                      <TrendCard
                        key={trend.id} 
                        item={trend} 
                        language={language} 
                        isFavorited={favorites.some(f => f.id === trend.id)}
                        onToggleFavorite={toggleFavorite}
                        onClick={handleSelectTrend}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-40 text-gray-600 space-y-8 glass-card rounded-[3rem] border-dashed border-2 border-white/5 text-center">
                      <i className={`fa-solid ${showOnlyFavorites ? 'fa-folder-open' : 'fa-satellite-dish'} text-4xl opacity-20`}></i>
                      <p className="text-xl font-black text-white/80">{showOnlyFavorites ? t.favorites : t.signalLost}</p>
                    </div>
                  )}

                  {!showOnlyFavorites && trends.length > 0 && (
                    <div ref={observerTarget} className="py-12 flex flex-col items-center gap-6">
                      {isInfiniteLoading && (
                        <div className="text-blue-500 font-mono text-[10px] uppercase tracking-[0.4em] animate-pulse">Scanning</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;


import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchAITrends, getRadarData, fetchDetailedAnalysis, fetchTrendingRepos, fetchCodingBenchmarks } from './services/geminiService';
import { TrendItem, RadarPoint, AICategory, Language, TRANSLATIONS, GitHubRepo, INTELLIGENCE_CORES, IntelligenceCore, TokenUsage, BenchmarkData } from './types';
import TrendCard from './components/TrendCard';
import RadarChart from './components/RadarChart';
import GitHubRepoCard from './components/GitHubRepoCard';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('zh'); 
  const [activeCore, setActiveCore] = useState<IntelligenceCore>(INTELLIGENCE_CORES[0]); 
  const [showCoreMenu, setShowCoreMenu] = useState(false);
  
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [radarData, setRadarData] = useState<RadarPoint[]>([]);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([]);
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

  const [totalUsage, setTotalUsage] = useState<TokenUsage>({ promptTokens: 0, completionTokens: 0, totalTokens: 0 });

  const initialFetchDone = useRef(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const coreMenuRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  const t = TRANSLATIONS[language];

  const isDevLabMode = activeCategory === AICategory.CODING_EFFICIENCY;

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

  /**
   * Main Search Logic - centralized to avoid double firing
   */
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

      // Concurrent secondary data
      if (category === AICategory.CODING_EFFICIENCY) {
        fetchCodingBenchmarks(langToUse, modelToUse).then(res => {
          setBenchmarks(res.data);
          updateUsage(res.usage);
        });
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

  const initApp = useCallback(async () => {
    // Only fetch meta-data (radar) on init/core/lang change
    setIsLoading(true);
    const coreId = activeCore.id;

    // Load usage
    const savedUsage = localStorage.getItem('ai_radar_usage');
    if (savedUsage) { try { setTotalUsage(JSON.parse(savedUsage)); } catch(e) {} }

    try {
      const radarRes = await getRadarData(language, coreId);
      setRadarData(radarRes.data);
      updateUsage(radarRes.usage);
      
      // Perform initial trend search
      await performSearch(searchQuery, activeCategory, language, false, coreId);
    } catch (e) {
      console.error("Initialization failed", e);
    } finally {
      setIsLoading(false);
    }
  }, [language, activeCore.id, performSearch]);

  // Handle Mount & Global Params Change
  useEffect(() => {
    initApp();
  }, [language, activeCore.id]);

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
    if (saved) { try { setFavorites(JSON.parse(saved)); } catch (e) {} }
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_radar_favorites', JSON.stringify(favorites));
  }, [favorites]);

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

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [showOnlyFavorites, selectedTrend, isLoading, isInfiniteLoading, trends.length, searchQuery, activeCategory, language, performSearch]);

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'zh' : 'en';
    setLanguage(nextLang);
  };

  const switchCore = (core: IntelligenceCore) => {
    setActiveCore(core);
    setShowCoreMenu(false);
  };

  const toggleFavorite = (e: React.MouseEvent, item: TrendItem) => {
    e.stopPropagation(); 
    setFavorites(prev => {
      const exists = prev.find(f => f.id === item.id);
      if (exists) return prev.filter(f => f.id !== item.id);
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
    performSearch(searchQuery, activeCategory);
  };

  const handleCategoryToggle = (cat: AICategory) => {
    const newCat = activeCategory === cat ? null : cat;
    setActiveCategory(newCat);
    // Explicitly call search when category changes
    performSearch(searchQuery, newCat);
  };

  const categories = Object.values(AICategory);

  return (
    <div className={`min-h-screen flex flex-col bg-[#050505] text-gray-200 selection:bg-blue-500/30 ${isDevLabMode ? 'selection:bg-emerald-500/30' : ''}`}>
      <div className={`${isDevLabMode ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400' : 'bg-blue-600/10 border-blue-500/20 text-blue-400'} border-b py-2 px-6 flex items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-[0.2em] relative overflow-hidden`}>
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${isDevLabMode ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-blue-500 shadow-[0_0_8px_#3b82f6]'}`}></span>
            {isDevLabMode ? t.devLab : t.live}
          </div>
          <div className="h-4 w-px bg-white/10"></div>
          <div className="flex items-center gap-2">
            <i className={`fa-solid fa-satellite-dish`}></i>
            <span>{t.groundingActive}</span>
          </div>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <span className="opacity-70">{t.sync}: {lastUpdated.toLocaleTimeString()}</span>
          <button 
            onClick={toggleLanguage}
            className="bg-white/5 border border-white/10 px-3 py-1 rounded hover:bg-white/10 transition-all flex items-center gap-2 font-bold"
          >
            {language === 'en' ? 'EN' : 'ZH'}
          </button>
        </div>
      </div>

      <header className="border-b border-white/5 glass-card sticky top-0 z-50 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 group cursor-pointer" onClick={() => { handleBackToList(); setActiveCategory(null); performSearch("", null); }}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 ${isDevLabMode ? 'bg-emerald-600 shadow-emerald-500/20 rotate-45' : 'bg-blue-600 shadow-blue-500/20'}`}>
              <i className={`fa-solid ${isDevLabMode ? 'fa-laptop-code' : 'fa-radar'} text-white text-2xl`}></i>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-white">
                {isDevLabMode ? 'DEV' : 'AI TREND'}<span className={isDevLabMode ? 'text-emerald-500' : 'text-blue-500'}>{isDevLabMode ? 'LAB' : 'RADAR'}</span>
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest border border-white/10 px-2 rounded-sm bg-white/5">Ultra Precision</span>
                <div className="relative" ref={coreMenuRef}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowCoreMenu(!showCoreMenu); }}
                    className="text-[9px] text-blue-500/80 hover:text-blue-400 font-mono uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                  >
                    {activeCore.name}
                    <i className="fa-solid fa-chevron-down text-[7px]"></i>
                  </button>
                  {showCoreMenu && (
                    <div className="absolute top-full left-0 mt-3 w-64 glass-card rounded-2xl border border-white/10 shadow-2xl z-[100] p-2">
                       {INTELLIGENCE_CORES.map(core => (
                         <button key={core.id} onClick={() => switchCore(core)} className="w-full text-left p-3 rounded-xl transition-all hover:bg-white/5 flex flex-col">
                            <span className="text-[11px] font-black uppercase text-gray-300">{core.name}</span>
                            <span className="text-[9px] text-gray-500">{core.description}</span>
                         </button>
                       ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-[480px]">
            <input
              type="text"
              placeholder={t.placeholder}
              className={`w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-12 text-sm focus:outline-none transition-all text-white font-medium ${isDevLabMode ? 'focus:border-emerald-500/50' : 'focus:border-blue-500/50'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
            />
            <i className={`fa-solid ${isLoading ? 'fa-circle-notch fa-spin text-blue-500' : 'fa-magnifying-glass text-gray-600'} absolute left-4.5 top-1/2 -translate-y-1/2`}></i>
          </form>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-3 space-y-10">
          <section className={`glass-card rounded-[2rem] p-6 border-white/5 ${isDevLabMode ? 'border-emerald-500/20' : ''}`}>
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-6 flex justify-between">
              {t.usageMonitor}
              <button onClick={resetUsage}><i className="fa-solid fa-rotate-right"></i></button>
            </h2>
            <div className="space-y-4">
              <div className="text-2xl font-mono font-black text-white">{totalUsage.totalTokens.toLocaleString()}</div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${isDevLabMode ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-blue-500 shadow-[0_0_8px_#3b82f6]'}`} style={{ width: `${Math.min(100, (totalUsage.totalTokens / 100000) * 100)}%` }}></div>
              </div>
            </div>
          </section>

          <nav className="space-y-1.5">
             <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-4">{t.clusters}</h2>
             {categories.map((cat) => (
               <button
                key={cat}
                onClick={() => handleCategoryToggle(cat)}
                className={`w-full text-left px-5 py-3.5 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-between ${
                  activeCategory === cat 
                  ? (isDevLabMode ? 'bg-emerald-600/10 border border-emerald-500/40 text-emerald-400' : 'bg-blue-600/10 border border-blue-500/40 text-blue-400')
                  : 'bg-white/5 border border-transparent text-gray-400 hover:bg-white/10'
                }`}
               >
                 {cat}
                 <i className={`fa-solid fa-chevron-right text-[8px] ${activeCategory === cat ? 'rotate-90' : ''}`}></i>
               </button>
             ))}
          </nav>
        </aside>

        <div className="lg:col-span-9 space-y-8">
          {isDevLabMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="glass-card rounded-3xl p-8 border-emerald-500/10">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <i className="fa-solid fa-bolt text-emerald-500"></i>
                    {t.benchmark}
                  </h3>
                  <div className="space-y-4">
                    {benchmarks.length > 0 ? benchmarks.map((b, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span>{b.model}</span>
                          <span className="text-emerald-400">{b.score}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500/60 shadow-[0_0_8px_#10b981]" style={{ width: `${b.score}%` }}></div>
                        </div>
                      </div>
                    )) : [1,2,3].map(i => <div key={i} className="h-8 bg-white/5 rounded animate-pulse"></div>)}
                  </div>
               </div>
               <div className="bg-gradient-to-br from-emerald-600/10 to-transparent border border-emerald-500/10 rounded-3xl p-8">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <i className="fa-solid fa-toolbox text-emerald-500"></i>
                    {t.tools}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                     {['Cursor', 'Windsurf', 'Trae', 'DeepSeek-V3'].map(tool => (
                       <div key={tool} className="bg-black/40 border border-white/10 p-4 rounded-xl text-[11px] font-black text-center text-emerald-400 border-dashed">
                         {tool}
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {selectedTrend ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <button onClick={handleBackToList} className="text-blue-400 hover:text-blue-300 text-xs font-black uppercase tracking-[0.2em]">
                <i className="fa-solid fa-arrow-left mr-2"></i> {isDevLabMode ? 'Back to Lab' : 'Back to Stream'}
              </button>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight">{selectedTrend.title}</h1>
              <div className="prose prose-invert max-w-none text-gray-300">
                {isDetailLoading ? <div className="animate-pulse">Analyzing technical structure...</div> : <ReactMarkdown remarkPlugins={[remarkGfm]}>{detailedAnalysis || ""}</ReactMarkdown>}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 py-4">
              {isLoading && trends.length === 0 ? (
                [1, 2, 3].map(i => <div key={i} className="h-64 glass-card rounded-3xl animate-pulse"></div>)
              ) : (
                <>
                  {trends.map(trend => (
                    <TrendCard 
                      key={trend.id} 
                      item={trend} 
                      language={language} 
                      isFavorited={favorites.some(f => f.id === trend.id)}
                      onToggleFavorite={toggleFavorite}
                      onClick={handleSelectTrend}
                    />
                  ))}
                  <div ref={observerTarget} className="h-20 flex items-center justify-center">
                    {isInfiniteLoading && <i className="fa-solid fa-circle-notch fa-spin text-blue-500"></i>}
                  </div>
                </>
              )}
              {isDevLabMode && !isLoading && (
                <div className="mt-12 space-y-6">
                  <h2 className="text-xl font-black text-white flex items-center gap-3">
                    <i className="fa-brands fa-github text-emerald-500"></i>
                    {t.trendingRepos}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {githubRepos.map((repo, i) => <GitHubRepoCard key={i} repo={repo} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchAITrends, fetchDetailedAnalysis, fetchTrendingRepos } from './services/geminiService';
import { TrendItem, AICategory, Language, TRANSLATIONS, GitHubRepo, INTELLIGENCE_CORES, IntelligenceCore, TokenUsage } from './types';
import TrendCard from './components/TrendCard';
import GitHubRepoCard from './components/GitHubRepoCard';
import DailyPracticeSection from './components/coding-efficiency/DailyPracticeSection';
import PracticeHistory from './components/coding-efficiency/PracticeHistory';
import { getCompletedPracticeIds } from './services/practiceStorageService';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('zh');
  const [activeCore, setActiveCore] = useState<IntelligenceCore>(INTELLIGENCE_CORES[0]);
  const [showCoreMenu, setShowCoreMenu] = useState(false);

  // 搜索結果（Coding Efficiency 相關）
  const [searchResults, setSearchResults] = useState<TrendItem[]>([]);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // 詳情視圖
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [detailedAnalysis, setDetailedAnalysis] = useState<string | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // 側邊欄視圖
  const [sidebarView, setSidebarView] = useState<'stats' | 'history'>('stats');

  // Token Usage State
  const [totalUsage, setTotalUsage] = useState<TokenUsage>({ promptTokens: 0, completionTokens: 0, totalTokens: 0 });

  // 完成統計
  const [completedCount, setCompletedCount] = useState(0);

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

  // 初始化：載入 Token 使用量和完成統計
  useEffect(() => {
    const savedUsage = localStorage.getItem('ai_radar_usage');
    if (savedUsage) {
      try { setTotalUsage(JSON.parse(savedUsage)); } catch(e) {}
    }
    setCompletedCount(getCompletedPracticeIds().size);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (coreMenuRef.current && !coreMenuRef.current.contains(event.target as Node)) {
        setShowCoreMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 搜索 Coding Efficiency 相關內容
  const performSearch = useCallback(async (query: string, targetLang?: Language, coreId?: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setSelectedTrend(null);
    setHasSearched(true);

    const langToUse = targetLang || language;
    const modelToUse = coreId || activeCore.id;

    try {
      // 強制使用 Coding Efficiency 類別
      const results = await fetchAITrends(query, langToUse, modelToUse, AICategory.CODING_EFFICIENCY);
      updateUsage(results.usage);
      setSearchResults(results.data);
      setLastUpdated(new Date());

      // 同時獲取相關 GitHub 倉庫
      fetchTrendingRepos(langToUse, modelToUse).then(res => {
        setGithubRepos(res.data);
        updateUsage(res.usage);
      });
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  }, [language, activeCore.id, updateUsage]);

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'zh' : 'en';
    setLanguage(nextLang);
    if (searchQuery) {
      performSearch(searchQuery, nextLang);
    }
    if (selectedTrend) {
      handleSelectTrend(selectedTrend, nextLang);
    }
  };

  const switchCore = (core: IntelligenceCore) => {
    setActiveCore(core);
    setShowCoreMenu(false);
    if (searchQuery) {
      performSearch(searchQuery, language, core.id);
    }
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
    setHasSearched(false);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSearching || !searchQuery.trim()) return;
    performSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setSelectedTrend(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-gray-200 selection:bg-blue-500/30">
      {/* Top Status Bar */}
      <div className="bg-blue-600/10 border-b border-blue-500/20 py-2 px-6 flex items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="h-full w-full bg-[linear-gradient(to_right,transparent_49.5%,rgba(59,130,246,0.3)_50%,transparent_50.5%)] bg-[length:20px_100%]"></div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
            <span className="text-emerald-400">Coding Efficiency</span>
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

      {/* Header */}
      <header className="border-b border-white/5 glass-card sticky top-0 z-50 px-6 py-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 group cursor-pointer" onClick={clearSearch}>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 group-hover:rotate-12 transition-all duration-500">
              <i className="fa-solid fa-laptop-code text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white">
                <span className="text-emerald-400">LLM</span>Pulse
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">
                  {language === 'zh' ? 'AI 輔助編程效率提升' : 'AI-Powered Coding Efficiency'}
                </span>
                <div className="relative" ref={coreMenuRef}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowCoreMenu(!showCoreMenu); }}
                    className="text-[9px] text-blue-500/80 hover:text-blue-400 font-mono uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                  >
                    <i className={`fa-solid ${activeCore.icon} text-[10px]`}></i>
                    {activeCore.name}
                    <i className={`fa-solid fa-chevron-down text-[7px] transition-transform ${showCoreMenu ? 'rotate-180' : ''}`}></i>
                  </button>

                  {showCoreMenu && (
                    <div className="absolute top-full left-0 mt-3 w-64 glass-card rounded-2xl border border-white/10 shadow-2xl z-[100] p-2">
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

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-[400px] group">
            <input
              type="text"
              placeholder={language === 'zh' ? '搜索編程技巧、AI工具、提效方法...' : 'Search coding tips, AI tools, efficiency methods...'}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-12 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-gray-600 text-white font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching}
            />
            <i className={`fa-solid ${isSearching ? 'fa-circle-notch fa-spin text-emerald-500' : 'fa-magnifying-glass text-gray-600'} absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors group-focus-within:text-emerald-500`}></i>
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-all uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              {isSearching ? <i className="fa-solid fa-sync fa-spin"></i> : <i className="fa-solid fa-search"></i>}
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-8 lg:sticky lg:top-32 h-fit">
          {/* Token Monitor */}
          <section className="glass-card rounded-2xl p-5 border-emerald-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
              <i className="fa-solid fa-chart-line text-5xl"></i>
            </div>
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-5 flex items-center justify-between">
              {t.usageMonitor}
              <button onClick={resetUsage} className="hover:text-red-400 transition-colors">
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                  <span>{t.tokens}</span>
                  <span className="text-emerald-400 font-bold">{totalUsage.totalTokens.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${Math.min(100, (totalUsage.totalTokens / 100000) * 100)}%` }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-white/5 rounded-lg border border-white/5">
                   <div className="text-[8px] text-gray-600 uppercase mb-1">Inbound</div>
                   <div className="text-[10px] font-mono text-emerald-500">{totalUsage.promptTokens.toLocaleString()}</div>
                </div>
                <div className="p-2.5 bg-white/5 rounded-lg border border-white/5">
                   <div className="text-[8px] text-gray-600 uppercase mb-1">Outbound</div>
                   <div className="text-[10px] font-mono text-amber-500">{totalUsage.completionTokens.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="glass-card rounded-2xl p-5 border-emerald-500/10">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-5">
              {language === 'zh' ? '學習進度' : 'Learning Progress'}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <span className="text-sm text-emerald-400 font-bold flex items-center gap-2">
                  <i className="fa-solid fa-check-circle"></i>
                  {language === 'zh' ? '已完成' : 'Completed'}
                </span>
                <span className="text-2xl font-black text-white">{completedCount}</span>
              </div>
            </div>
          </section>

          {/* Navigation */}
          <nav className="space-y-2">
            <button
              onClick={() => setSidebarView('stats')}
              className={`w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold transition-all flex items-center gap-3 ${
                sidebarView === 'stats'
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                : 'bg-white/5 border border-transparent text-gray-400 hover:bg-white/10'
              }`}
            >
              <i className="fa-solid fa-calendar-day"></i>
              {language === 'zh' ? '今日精選' : "Today's Pick"}
            </button>
            <button
              onClick={() => setSidebarView('history')}
              className={`w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold transition-all flex items-center gap-3 ${
                sidebarView === 'history'
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                : 'bg-white/5 border border-transparent text-gray-400 hover:bg-white/10'
              }`}
            >
              <i className="fa-solid fa-clock-rotate-left"></i>
              {language === 'zh' ? '歷史精選' : 'History'}
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-8">
          {selectedTrend ? (
            /* Detail View for Search Results */
            <div className="space-y-8">
              <button
                onClick={handleBackToList}
                className="group flex items-center gap-3 text-emerald-400 hover:text-emerald-300 text-xs font-black uppercase tracking-[0.2em] transition-all"
              >
                <div className="w-8 h-8 rounded-full border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                  <i className="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"></i>
                </div>
                {language === 'zh' ? '返回' : 'Back'}
              </button>

              <div className="space-y-6">
                <span className="px-3 py-1 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  Coding Efficiency
                </span>

                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                  {selectedTrend.title}
                </h1>

                <p className="text-lg text-emerald-400/90 font-medium leading-relaxed border-l-4 border-emerald-500 pl-6">
                  {selectedTrend.summary}
                </p>

                {isDetailLoading ? (
                  <div className="space-y-6 py-8">
                    <div className="flex items-center gap-4 text-emerald-400 font-mono text-[11px] uppercase tracking-[0.3em] animate-pulse">
                      <i className="fa-solid fa-spinner fa-spin text-sm"></i>
                      {language === 'zh' ? '載入詳情...' : 'Loading details...'}
                    </div>
                    <div className="space-y-4 opacity-40">
                      <div className="h-4 bg-white/10 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-white/10 rounded w-11/12 animate-pulse"></div>
                      <div className="h-32 bg-white/10 rounded-xl w-full animate-pulse"></div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {detailedAnalysis || ''}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Sources */}
                {selectedTrend.sources.length > 0 && (
                  <div className="glass-card rounded-2xl p-6 mt-8">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-link text-emerald-500"></i>
                      {t.sources}
                    </h3>
                    <div className="space-y-3">
                      {selectedTrend.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 bg-white/5 border border-white/5 rounded-xl hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
                        >
                          <div className="flex justify-between items-center gap-3">
                            <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                              {source.title}
                            </p>
                            <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-gray-600 group-hover:text-emerald-500 transition-colors shrink-0"></i>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : hasSearched ? (
            /* Search Results */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white">
                  {language === 'zh' ? '搜索結果' : 'Search Results'}
                </h2>
                <button
                  onClick={clearSearch}
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-xmark"></i>
                  {language === 'zh' ? '清除' : 'Clear'}
                </button>
              </div>

              {isSearching ? (
                <div className="space-y-6 py-4">
                  {[1, 2].map(i => (
                    <div key={i} className="glass-card rounded-2xl p-8 animate-pulse border border-white/5 h-48"></div>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {searchResults.map(trend => (
                    <TrendCard
                      key={trend.id}
                      item={trend}
                      language={language}
                      isFavorited={false}
                      onToggleFavorite={() => {}}
                      onClick={handleSelectTrend}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-600 space-y-4 glass-card rounded-2xl border-dashed border-2 border-white/5">
                  <i className="fa-solid fa-search text-3xl opacity-20"></i>
                  <p className="text-lg font-bold text-white/60">
                    {language === 'zh' ? '未找到相關結果' : 'No results found'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Default View: Daily Practice or History */
            <>
              {sidebarView === 'stats' ? (
                <DailyPracticeSection />
              ) : (
                <PracticeHistory />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;

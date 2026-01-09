
import React, { useState, useEffect, useRef } from 'react';
import { TrendItem, AICategory, Language, TRANSLATIONS } from '../types';

interface TrendCardProps {
  item: TrendItem;
  language: Language;
  isFavorited: boolean;
  onToggleFavorite: (e: React.MouseEvent, item: TrendItem) => void;
  onClick: (item: TrendItem) => void;
}

const TrendCard: React.FC<TrendCardProps> = ({ item, language, isFavorited, onToggleFavorite, onClick }) => {
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [triggerPop, setTriggerPop] = useState(false);
  const firstRender = useRef(true);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    
    // Only trigger animation when becoming favorited
    if (isFavorited) {
      setShowBurst(true);
      setTriggerPop(true);
      const timer = setTimeout(() => {
        setShowBurst(false);
        setTriggerPop(false);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      // Small pop even on unfavorite
      setTriggerPop(true);
      const timer = setTimeout(() => setTriggerPop(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isFavorited]);

  const getCategoryTheme = (cat: AICategory) => {
    switch (cat) {
      case AICategory.LLM: 
        return { 
          bg: 'bg-blue-600/10', 
          text: 'text-blue-400', 
          border: 'border-blue-500/20',
          icon: 'fa-brain'
        };
      case AICategory.ROBOTICS: 
        return { 
          bg: 'bg-purple-600/10', 
          text: 'text-purple-400', 
          border: 'border-purple-500/20',
          icon: 'fa-robot'
        };
      case AICategory.GEN_ART: 
        return { 
          bg: 'bg-pink-600/10', 
          text: 'text-pink-400', 
          border: 'border-pink-500/20',
          icon: 'fa-palette'
        };
      case AICategory.AGENTS: 
        return { 
          bg: 'bg-emerald-600/10', 
          text: 'text-emerald-400', 
          border: 'border-emerald-500/20',
          icon: 'fa-microchip'
        };
      case AICategory.ETHICS: 
        return { 
          bg: 'bg-amber-600/10', 
          text: 'text-amber-400', 
          border: 'border-amber-500/20',
          icon: 'fa-scale-balanced'
        };
      case AICategory.CODING_EFFICIENCY:
        return { 
          bg: 'bg-cyan-600/10', 
          text: 'text-cyan-400', 
          border: 'border-cyan-500/20',
          icon: 'fa-laptop-code'
        };
      default: 
        return { 
          bg: 'bg-gray-600/10', 
          text: 'text-gray-400', 
          border: 'border-gray-500/20',
          icon: 'fa-newspaper'
        };
    }
  };

  const theme = getCategoryTheme(item.category);
  const visibleSources = isSourcesExpanded ? item.sources : item.sources.slice(0, 2);
  const hasSources = item.sources.length > 0;

  return (
    <div 
      onClick={() => onClick(item)}
      className="glass-card rounded-2xl p-8 transition-all hover:bg-white/[0.03] hover:border-blue-500/30 group relative overflow-hidden cursor-pointer"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${theme.bg} blur-[60px] -z-0 opacity-50 group-hover:opacity-100 transition-opacity`}></div>
      
      <div className="relative z-10">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${theme.bg} ${theme.text} ${theme.border}`}>
              <i className={`fa-solid ${theme.icon}`}></i>
              {item.category}
            </span>
            <div className="flex items-center gap-1 ml-2">
              <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">{t.signal}:</span>
              <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                  style={{ width: `${item.relevanceScore}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[10px] text-gray-500 font-mono mr-2">
              {new Date(item.timestamp).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 relative">
              <button 
                onClick={(e) => onToggleFavorite(e, item)}
                className={`p-2 rounded-full transition-all relative z-10 ${isFavorited ? 'text-blue-500 bg-blue-500/10' : 'text-gray-500 hover:text-blue-400 hover:bg-white/5'} ${triggerPop ? 'animate-fav-pop' : ''}`}
              >
                {showBurst && <div className="fav-ring"></div>}
                <i className={`fa-${isFavorited ? 'solid' : 'regular'} fa-bookmark text-sm transition-transform duration-300 ${triggerPop ? 'scale-125' : 'scale-100'}`}></i>
              </button>
            </div>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors leading-tight">
          {item.title}
        </h3>
        
        <div className="relative mb-8">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 to-transparent"></div>
          <div className="pl-6 text-gray-400 text-base leading-relaxed italic">
            {item.summary}
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
           <div className="flex flex-wrap items-center gap-4">
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] shrink-0">{t.sources}:</span>
            
            {hasSources ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {visibleSources.map((source, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-gray-500 bg-white/5 px-2 py-1 rounded-lg border border-white/5 group/source">
                      <span className="max-w-[120px] truncate">{source.title}</span>
                    </div>
                  ))}
                </div>
                {item.sources.length > 2 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsSourcesExpanded(!isSourcesExpanded); }}
                    className="text-[10px] font-bold text-blue-500/70 hover:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                  >
                    {isSourcesExpanded ? (
                      <>
                        <i className="fa-solid fa-chevron-up text-[8px]"></i>
                        {t.showLess}
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-chevron-down text-[8px]"></i>
                        {t.showMore} (+{item.sources.length - 2})
                      </>
                    )}
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-[10px] text-gray-500 italic bg-white/5 px-3 py-1 rounded-lg border border-dashed border-white/10">
                <i className="fa-solid fa-microchip text-[8px] opacity-50"></i>
                {t.modelSynthesis}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-end">
            <span className="text-blue-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {language === 'zh' ? '阅读更多' : 'Read More'}
              <i className="fa-solid fa-arrow-right"></i>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendCard;

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

  const isCoding = item.category === AICategory.CODING_EFFICIENCY;

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    
    if (isFavorited) {
      setShowBurst(true);
      setTriggerPop(true);
      const timer = setTimeout(() => {
        setShowBurst(false);
        setTriggerPop(false);
      }, 600);
      return () => clearTimeout(timer);
    } else {
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
      case AICategory.CODING_EFFICIENCY:
        return { 
          bg: 'bg-emerald-600/10', 
          text: 'text-emerald-400', 
          border: 'border-emerald-500/20',
          icon: 'fa-laptop-code'
        };
      case AICategory.ROBOTICS: 
        return { 
          bg: 'bg-purple-600/10', 
          text: 'text-purple-400', 
          border: 'border-purple-500/20',
          icon: 'fa-robot'
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
      className={`glass-card rounded-2xl p-8 transition-all hover:bg-white/[0.03] group relative overflow-hidden cursor-pointer ${isCoding ? 'hover:border-emerald-500/40 border-emerald-500/10 font-mono bg-black/40' : 'hover:border-blue-500/30'}`}
    >
      {/* DevLab Terminal Decoration */}
      {isCoding && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-emerald-500/5 flex flex-col items-center py-8 gap-4 select-none pointer-events-none border-r border-emerald-500/10">
          {[1,2,3,4,5].map(n => <span key={n} className="text-[9px] text-emerald-500/20">{n}</span>)}
        </div>
      )}

      <div className={`absolute top-0 right-0 w-32 h-32 ${theme.bg} blur-[60px] -z-0 opacity-50 group-hover:opacity-100 transition-opacity`}></div>
      
      <div className={`relative z-10 ${isCoding ? 'pl-6' : ''}`}>
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${theme.bg} ${theme.text} ${theme.border}`}>
              <i className={`fa-solid ${theme.icon}`}></i>
              {item.category}
            </span>
            <div className="flex items-center gap-2 px-2 py-0.5 bg-black/40 rounded border border-white/5">
              <span className="text-[10px] text-gray-600 uppercase tracking-widest">{t.signal}:</span>
              <span className={`text-[10px] font-black ${isCoding ? 'text-emerald-400' : 'text-blue-400'}`}>{item.relevanceScore}%</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 font-mono">
              {new Date(item.timestamp).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button 
              onClick={(e) => onToggleFavorite(e, item)}
              className={`p-2 rounded-full transition-all relative ${isFavorited ? 'text-emerald-500 bg-emerald-500/10' : 'text-gray-500 hover:text-emerald-400 hover:bg-white/5'}`}
            >
              <i className={`fa-${isFavorited ? 'solid' : 'regular'} fa-bookmark text-sm`}></i>
            </button>
          </div>
        </div>
        
        <h3 className={`text-2xl font-bold mb-4 text-white group-hover:text-emerald-400 transition-colors leading-tight ${isCoding ? 'tracking-tight' : ''}`}>
          {isCoding && <span className="text-emerald-500 mr-2">$</span>}{item.title}
        </h3>
        
        <div className="relative mb-8">
          <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${isCoding ? 'bg-emerald-500/30' : 'bg-blue-500/50'}`}></div>
          <div className="pl-6 text-gray-400 text-base leading-relaxed">
            {isCoding ? (
              <span className="text-emerald-400/80">&gt; <span className="text-gray-300 italic">{item.summary}</span></span>
            ) : item.summary}
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
           <div className="flex flex-wrap items-center gap-4">
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">{t.sources}:</span>
            {hasSources ? (
              <div className="flex flex-wrap gap-2">
                {visibleSources.map((source, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                    <span className="max-w-[120px] truncate">{source.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-gray-600 italic">Synthetic Synthesis</div>
            )}
          </div>
          <div className="flex items-center justify-end">
            <span className={`${isCoding ? 'text-emerald-500' : 'text-blue-500'} text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2`}>
              {isCoding ? 'RUN ANALYSIS' : 'READ MORE'}
              <i className="fa-solid fa-code text-[8px]"></i>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendCard;

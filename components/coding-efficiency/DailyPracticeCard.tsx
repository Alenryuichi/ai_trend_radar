/**
 * DailyPracticeCard - 今日精選卡片組件
 * 
 * 支持 main (主推薦) 和 alternative (備選) 兩種變體
 */

import React from 'react';
import { DailyPractice, ScenarioTag } from '../../types';

// 場景標籤配置
const SCENARIO_CONFIG: Record<ScenarioTag, { label: string; icon: string; color: string }> = {
  'debugging': { label: '調試', icon: 'fa-bug', color: 'text-red-400 bg-red-500/10' },
  'refactoring': { label: '重構', icon: 'fa-code-branch', color: 'text-purple-400 bg-purple-500/10' },
  'code-review': { label: '代碼審查', icon: 'fa-magnifying-glass-chart', color: 'text-blue-400 bg-blue-500/10' },
  'testing': { label: '測試', icon: 'fa-vial', color: 'text-cyan-400 bg-cyan-500/10' },
  'documentation': { label: '文檔', icon: 'fa-file-lines', color: 'text-orange-400 bg-orange-500/10' },
  'learning': { label: '學習', icon: 'fa-graduation-cap', color: 'text-indigo-400 bg-indigo-500/10' },
  'productivity': { label: '生產力', icon: 'fa-rocket', color: 'text-emerald-400 bg-emerald-500/10' },
  'prompt-engineering': { label: '提示工程', icon: 'fa-wand-magic-sparkles', color: 'text-pink-400 bg-pink-500/10' },
};

// ============================================================
// Types
// ============================================================

export interface DailyPracticeCardProps {
  practice: DailyPractice;
  variant?: 'main' | 'alternative';
  expanded?: boolean;
  onToggleExpand?: () => void;
}

// ============================================================
// Helper Components
// ============================================================

const DifficultyBadge: React.FC<{ difficulty: DailyPractice['difficulty'] }> = ({ difficulty }) => {
  const config = {
    beginner: { label: '入門', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
    intermediate: { label: '中級', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    advanced: { label: '高級', className: 'bg-red-500/20 text-red-400 border-red-500/30' }
  };
  const { label, className } = config[difficulty];
  
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${className}`}>
      {label}
    </span>
  );
};

const EstimatedTime: React.FC<{ minutes: number }> = ({ minutes }) => (
  <span className="flex items-center gap-1.5 text-gray-400 text-xs">
    <i className="fa-regular fa-clock"></i>
    約 {minutes} 分鐘
  </span>
);

// ============================================================
// Main Component
// ============================================================

const DailyPracticeCard: React.FC<DailyPracticeCardProps> = ({
  practice,
  variant = 'main',
  expanded = false,
  onToggleExpand
}) => {
  const isMain = variant === 'main';

  // 樣式配置
  const cardStyles = isMain
    ? 'bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border-2 border-blue-500/30 shadow-lg shadow-blue-500/10'
    : 'bg-white/5 border border-white/10 hover:border-white/20';

  const titleStyles = isMain ? 'text-xl' : 'text-lg';
  const paddingStyles = isMain ? 'p-6' : 'p-4';

  return (
    <div className={`rounded-2xl ${cardStyles} ${paddingStyles} transition-all duration-300`}>
      {/* 今日推薦標籤 (僅主卡片) */}
      {isMain && (
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-500/30">
            <i className="fa-solid fa-star mr-1.5"></i>
            今日推薦
          </span>
        </div>
      )}

      {/* 標題和元信息 */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <h3 className={`${titleStyles} font-bold text-white leading-tight`}>
          {practice.title}
        </h3>
        <div className="flex items-center gap-3">
          <DifficultyBadge difficulty={practice.difficulty} />
          <EstimatedTime minutes={practice.estimatedMinutes} />
        </div>
      </div>

      {/* 摘要 */}
      <p className="text-gray-400 text-sm leading-relaxed mb-4">
        {practice.summary}
      </p>

      {/* 場景標籤 */}
      {practice.scenarioTags && practice.scenarioTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {practice.scenarioTags.map((scenario) => {
            const config = SCENARIO_CONFIG[scenario];
            if (!config) return null;
            return (
              <span
                key={scenario}
                className={`px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1.5 ${config.color}`}
              >
                <i className={`fa-solid ${config.icon} text-[8px]`}></i>
                {config.label}
              </span>
            );
          })}
        </div>
      )}

      {/* 標籤 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {practice.tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-0.5 bg-white/5 text-gray-500 text-[10px] rounded-md"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* 展開按鈕 */}
      {onToggleExpand && (
        <button
          onClick={onToggleExpand}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
        >
          <span>{expanded ? '收起詳情' : '查看詳情'}</span>
          <i className={`fa-solid fa-chevron-${expanded ? 'up' : 'down'} text-[10px]`}></i>
        </button>
      )}

      {/* 展開內容 */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
          {/* 為何重要 */}
          <div>
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              <i className="fa-solid fa-lightbulb text-yellow-500 mr-2"></i>
              為何重要
            </h4>
            <p className="text-gray-400 text-sm">{practice.whyItMatters}</p>
          </div>

          {/* 實踐步驟 */}
          <div>
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              <i className="fa-solid fa-list-check text-green-500 mr-2"></i>
              實踐步驟
            </h4>
            <ol className="space-y-2">
              {practice.steps.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm text-gray-400">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-[10px] font-bold">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* 相關工具 */}
          {practice.tools.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                <i className="fa-solid fa-toolbox text-purple-500 mr-2"></i>
                相關工具
              </h4>
              <div className="flex flex-wrap gap-2">
                {practice.tools.map((tool, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-lg border border-purple-500/20"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyPracticeCard;


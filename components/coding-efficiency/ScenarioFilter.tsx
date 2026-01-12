/**
 * ScenarioFilter - 場景和難度篩選器組件
 */

import React from 'react';
import { ScenarioTag } from '../../types';

// ============================================================
// Types
// ============================================================

export interface ScenarioFilterProps {
  selectedScenario: ScenarioTag | 'all';
  selectedDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'all';
  onScenarioChange: (scenario: ScenarioTag | 'all') => void;
  onDifficultyChange: (difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all') => void;
}

// ============================================================
// Constants
// ============================================================

const SCENARIOS: Array<{ value: ScenarioTag | 'all'; label: string; icon: string }> = [
  { value: 'all', label: '全部場景', icon: 'fa-layer-group' },
  { value: 'debugging', label: '調試', icon: 'fa-bug' },
  { value: 'refactoring', label: '重構', icon: 'fa-code-branch' },
  { value: 'code-review', label: '代碼審查', icon: 'fa-magnifying-glass-chart' },
  { value: 'testing', label: '測試', icon: 'fa-vial' },
  { value: 'documentation', label: '文檔', icon: 'fa-file-lines' },
  { value: 'learning', label: '學習', icon: 'fa-graduation-cap' },
  { value: 'productivity', label: '生產力', icon: 'fa-rocket' },
  { value: 'prompt-engineering', label: '提示工程', icon: 'fa-wand-magic-sparkles' },
];

const DIFFICULTIES: Array<{ value: 'beginner' | 'intermediate' | 'advanced' | 'all'; label: string; color: string }> = [
  { value: 'all', label: '全部難度', color: 'bg-gray-600' },
  { value: 'beginner', label: '入門', color: 'bg-green-600' },
  { value: 'intermediate', label: '中級', color: 'bg-yellow-600' },
  { value: 'advanced', label: '高級', color: 'bg-red-600' },
];

// ============================================================
// Component
// ============================================================

export const ScenarioFilter: React.FC<ScenarioFilterProps> = ({
  selectedScenario,
  selectedDifficulty,
  onScenarioChange,
  onDifficultyChange,
}) => {
  return (
    <div className="space-y-3 mb-6">
      {/* 場景選擇器 */}
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.value}
            onClick={() => onScenarioChange(scenario.value)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
              flex items-center gap-1.5
              ${selectedScenario === scenario.value
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            <i className={`fa-solid ${scenario.icon} text-[10px]`}></i>
            {scenario.label}
          </button>
        ))}
      </div>

      {/* 難度選擇器 */}
      <div className="flex flex-wrap gap-2">
        {DIFFICULTIES.map((difficulty) => (
          <button
            key={difficulty.value}
            onClick={() => onDifficultyChange(difficulty.value)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
              ${selectedDifficulty === difficulty.value
                ? `${difficulty.color} text-white shadow-lg`
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            {difficulty.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScenarioFilter;


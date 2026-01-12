/**
 * ScenarioFilter - 场景和难度筛选器组件
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
  { value: 'all', label: '全部场景', icon: 'fa-layer-group' },
  { value: 'debugging', label: '调试', icon: 'fa-bug' },
  { value: 'refactoring', label: '重构', icon: 'fa-code-branch' },
  { value: 'code-review', label: '代码审查', icon: 'fa-magnifying-glass-chart' },
  { value: 'testing', label: '测试', icon: 'fa-vial' },
  { value: 'documentation', label: '文档', icon: 'fa-file-lines' },
  { value: 'learning', label: '学习', icon: 'fa-graduation-cap' },
  { value: 'productivity', label: '生产力', icon: 'fa-rocket' },
  { value: 'prompt-engineering', label: '提示工程', icon: 'fa-wand-magic-sparkles' },
];

const DIFFICULTIES: Array<{ value: 'beginner' | 'intermediate' | 'advanced' | 'all'; label: string; color: string }> = [
  { value: 'all', label: '全部难度', color: 'bg-gray-600' },
  { value: 'beginner', label: '入门', color: 'bg-green-600' },
  { value: 'intermediate', label: '中级', color: 'bg-yellow-600' },
  { value: 'advanced', label: '高级', color: 'bg-red-600' },
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
      {/* 场景选择器 */}
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

      {/* 难度选择器 */}
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


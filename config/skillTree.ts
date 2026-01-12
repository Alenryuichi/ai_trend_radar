/**
 * Skill Tree Configuration
 * 
 * 定義技能分支、等級和學習路徑
 */

import { ScenarioTag } from '../types';

// ============================================================
// Types
// ============================================================

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface SkillMilestone {
  level: SkillLevel;
  title: string;
  description: string;
  requiredCount: number;  // 需要完成的技巧數量
}

export interface SkillBranch {
  id: string;
  name: string;
  icon: string;
  color: string;           // Tailwind color class
  description: string;
  scenarioTags: ScenarioTag[];  // 關聯的場景標籤
  milestones: SkillMilestone[];
}

// ============================================================
// Skill Branches Configuration
// ============================================================

export const SKILL_BRANCHES: SkillBranch[] = [
  {
    id: 'prompt-master',
    name: '提示工程師',
    icon: 'fa-wand-magic-sparkles',
    color: 'purple',
    description: '掌握與 AI 溝通的藝術，編寫高效提示詞',
    scenarioTags: ['prompt-engineering'],
    milestones: [
      { level: 'beginner', title: '提示新手', description: '掌握基礎提示技巧', requiredCount: 2 },
      { level: 'intermediate', title: '提示達人', description: '能編寫複雜分層提示', requiredCount: 5 },
      { level: 'advanced', title: '提示大師', description: '精通各種高級提示技術', requiredCount: 10 },
    ],
  },
  {
    id: 'debug-detective',
    name: '調試偵探',
    icon: 'fa-bug',
    color: 'red',
    description: '利用 AI 快速定位和修復代碼問題',
    scenarioTags: ['debugging'],
    milestones: [
      { level: 'beginner', title: '除蟲新手', description: '學會基礎 AI 輔助調試', requiredCount: 2 },
      { level: 'intermediate', title: '除蟲達人', description: '能處理複雜調試場景', requiredCount: 5 },
      { level: 'advanced', title: '除蟲大師', description: '精通系統級問題排查', requiredCount: 10 },
    ],
  },
  {
    id: 'code-sculptor',
    name: '代碼雕塑家',
    icon: 'fa-gem',
    color: 'blue',
    description: '運用 AI 進行代碼重構和優化',
    scenarioTags: ['refactoring', 'code-review'],
    milestones: [
      { level: 'beginner', title: '重構新手', description: '掌握基礎重構模式', requiredCount: 2 },
      { level: 'intermediate', title: '重構達人', description: '能進行模組級重構', requiredCount: 5 },
      { level: 'advanced', title: '重構大師', description: '精通架構級重構策略', requiredCount: 10 },
    ],
  },
  {
    id: 'test-guardian',
    name: '測試守護者',
    icon: 'fa-shield-halved',
    color: 'green',
    description: '使用 AI 提升測試覆蓋率和質量',
    scenarioTags: ['testing'],
    milestones: [
      { level: 'beginner', title: '測試新手', description: '學會 AI 輔助寫測試', requiredCount: 2 },
      { level: 'intermediate', title: '測試達人', description: '能設計完整測試策略', requiredCount: 5 },
      { level: 'advanced', title: '測試大師', description: '精通 TDD 和測試自動化', requiredCount: 10 },
    ],
  },
  {
    id: 'productivity-ninja',
    name: '效率忍者',
    icon: 'fa-bolt',
    color: 'yellow',
    description: '最大化 AI 輔助開發的生產力',
    scenarioTags: ['productivity', 'learning', 'documentation'],
    milestones: [
      { level: 'beginner', title: '效率新手', description: '掌握基礎提效技巧', requiredCount: 2 },
      { level: 'intermediate', title: '效率達人', description: '能優化開發工作流', requiredCount: 5 },
      { level: 'advanced', title: '效率大師', description: '精通全流程 AI 協作', requiredCount: 10 },
    ],
  },
];

// ============================================================
// Helper Functions
// ============================================================

/**
 * 根據完成數量獲取當前等級
 */
export function getCurrentLevel(completedCount: number, milestones: SkillMilestone[]): SkillLevel | null {
  const sortedMilestones = [...milestones].sort((a, b) => b.requiredCount - a.requiredCount);
  for (const milestone of sortedMilestones) {
    if (completedCount >= milestone.requiredCount) {
      return milestone.level;
    }
  }
  return null;
}

/**
 * 獲取下一個里程碑
 */
export function getNextMilestone(completedCount: number, milestones: SkillMilestone[]): SkillMilestone | null {
  const sortedMilestones = [...milestones].sort((a, b) => a.requiredCount - b.requiredCount);
  for (const milestone of sortedMilestones) {
    if (completedCount < milestone.requiredCount) {
      return milestone;
    }
  }
  return null;
}

/**
 * 計算到下一級的進度百分比
 */
export function getProgressToNextLevel(completedCount: number, milestones: SkillMilestone[]): number {
  const nextMilestone = getNextMilestone(completedCount, milestones);
  if (!nextMilestone) return 100; // 已達最高級
  
  const sortedMilestones = [...milestones].sort((a, b) => a.requiredCount - b.requiredCount);
  const currentMilestoneIndex = sortedMilestones.findIndex(m => m === nextMilestone);
  const previousRequired = currentMilestoneIndex > 0 ? sortedMilestones[currentMilestoneIndex - 1].requiredCount : 0;
  
  const progress = completedCount - previousRequired;
  const needed = nextMilestone.requiredCount - previousRequired;
  
  return Math.min(Math.round((progress / needed) * 100), 100);
}

/**
 * 獲取等級對應的顏色
 */
export function getLevelColor(level: SkillLevel | null): string {
  switch (level) {
    case 'beginner': return 'text-green-400';
    case 'intermediate': return 'text-yellow-400';
    case 'advanced': return 'text-red-400';
    default: return 'text-gray-500';
  }
}


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
    name: '提示工程师',
    icon: 'fa-wand-magic-sparkles',
    color: 'purple',
    description: '掌握与 AI 沟通的艺术，编写高效提示词',
    scenarioTags: ['prompt-engineering'],
    milestones: [
      { level: 'beginner', title: '提示新手', description: '掌握基础提示技巧', requiredCount: 2 },
      { level: 'intermediate', title: '提示达人', description: '能编写复杂分层提示', requiredCount: 5 },
      { level: 'advanced', title: '提示大师', description: '精通各种高级提示技术', requiredCount: 10 },
    ],
  },
  {
    id: 'debug-detective',
    name: '调试侦探',
    icon: 'fa-bug',
    color: 'red',
    description: '利用 AI 快速定位和修复代码问题',
    scenarioTags: ['debugging'],
    milestones: [
      { level: 'beginner', title: '除虫新手', description: '学会基础 AI 辅助调试', requiredCount: 2 },
      { level: 'intermediate', title: '除虫达人', description: '能处理复杂调试场景', requiredCount: 5 },
      { level: 'advanced', title: '除虫大师', description: '精通系统级问题排查', requiredCount: 10 },
    ],
  },
  {
    id: 'code-sculptor',
    name: '代码雕塑家',
    icon: 'fa-gem',
    color: 'blue',
    description: '运用 AI 进行代码重构和优化',
    scenarioTags: ['refactoring', 'code-review'],
    milestones: [
      { level: 'beginner', title: '重构新手', description: '掌握基础重构模式', requiredCount: 2 },
      { level: 'intermediate', title: '重构达人', description: '能进行模块级重构', requiredCount: 5 },
      { level: 'advanced', title: '重构大师', description: '精通架构级重构策略', requiredCount: 10 },
    ],
  },
  {
    id: 'test-guardian',
    name: '测试守护者',
    icon: 'fa-shield-halved',
    color: 'green',
    description: '使用 AI 提升测试覆盖率和质量',
    scenarioTags: ['testing'],
    milestones: [
      { level: 'beginner', title: '测试新手', description: '学会 AI 辅助写测试', requiredCount: 2 },
      { level: 'intermediate', title: '测试达人', description: '能设计完整测试策略', requiredCount: 5 },
      { level: 'advanced', title: '测试大师', description: '精通 TDD 和测试自动化', requiredCount: 10 },
    ],
  },
  {
    id: 'productivity-ninja',
    name: '效率忍者',
    icon: 'fa-bolt',
    color: 'yellow',
    description: '最大化 AI 辅助开发的生产力',
    scenarioTags: ['productivity', 'learning', 'documentation'],
    milestones: [
      { level: 'beginner', title: '效率新手', description: '掌握基础提效技巧', requiredCount: 2 },
      { level: 'intermediate', title: '效率达人', description: '能优化开发工作流', requiredCount: 5 },
      { level: 'advanced', title: '效率大师', description: '精通全流程 AI 协作', requiredCount: 10 },
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


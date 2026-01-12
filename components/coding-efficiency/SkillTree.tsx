/**
 * SkillTree - 技能樹主組件
 * 
 * 顯示所有技能分支和用戶在每個分支的進度
 */

import React, { useState, useEffect, useMemo } from 'react';
import { SKILL_BRANCHES, SkillBranch, getCurrentLevel, getNextMilestone, getProgressToNextLevel, getLevelColor } from '../../config/skillTree';
import { loadCompletedPractices } from '../../services/practiceStorageService';
import { ScenarioTag, DailyPracticeRecord } from '../../types';
import { supabase } from '../../services/supabaseService';

// ============================================================
// Types
// ============================================================

interface SkillProgress {
  branchId: string;
  completedCount: number;
  practiceIds: string[];
}

// ============================================================
// SkillBranchCard Component
// ============================================================

interface SkillBranchCardProps {
  branch: SkillBranch;
  progress: SkillProgress;
  onSelect: (branch: SkillBranch) => void;
  isSelected: boolean;
}

const SkillBranchCard: React.FC<SkillBranchCardProps> = ({ branch, progress, onSelect, isSelected }) => {
  const currentLevel = getCurrentLevel(progress.completedCount, branch.milestones);
  const nextMilestone = getNextMilestone(progress.completedCount, branch.milestones);
  const progressPercent = getProgressToNextLevel(progress.completedCount, branch.milestones);
  
  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400' },
    red: { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400' },
    blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400' },
    green: { bg: 'bg-green-500/20', border: 'border-green-500/40', text: 'text-green-400' },
    yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400' },
  };
  
  const colors = colorMap[branch.color] || colorMap.blue;
  
  return (
    <button
      onClick={() => onSelect(branch)}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        isSelected 
          ? `${colors.bg} ${colors.border}` 
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
          <i className={`fa-solid ${branch.icon} ${colors.text}`}></i>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white text-sm">{branch.name}</h3>
            {currentLevel && (
              <span className={`text-xs ${getLevelColor(currentLevel)}`}>
                {branch.milestones.find(m => m.level === currentLevel)?.title}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-2 line-clamp-1">{branch.description}</p>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full ${colors.bg.replace('/20', '')} transition-all duration-300`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-gray-500">
              {progress.completedCount}/{nextMilestone?.requiredCount || '✓'}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

// ============================================================
// SkillDetail Component
// ============================================================

interface SkillDetailProps {
  branch: SkillBranch;
  progress: SkillProgress;
  onClose: () => void;
}

const SkillDetail: React.FC<SkillDetailProps> = ({ branch, progress, onClose }) => {
  const currentLevel = getCurrentLevel(progress.completedCount, branch.milestones);
  
  const colorMap: Record<string, { bg: string; text: string; gradient: string }> = {
    purple: { bg: 'bg-purple-500', text: 'text-purple-400', gradient: 'from-purple-600 to-purple-400' },
    red: { bg: 'bg-red-500', text: 'text-red-400', gradient: 'from-red-600 to-red-400' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-400', gradient: 'from-blue-600 to-blue-400' },
    green: { bg: 'bg-green-500', text: 'text-green-400', gradient: 'from-green-600 to-green-400' },
    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-400', gradient: 'from-yellow-600 to-yellow-400' },
  };
  
  const colors = colorMap[branch.color] || colorMap.blue;
  
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
            <i className={`fa-solid ${branch.icon} text-white text-xl`}></i>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{branch.name}</h2>
            <p className="text-xs text-gray-400">{branch.description}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
      
      {/* Milestones */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">学习路径</h3>
        {branch.milestones.map((milestone, index) => {
          const isCompleted = progress.completedCount >= milestone.requiredCount;
          const isCurrent = currentLevel === milestone.level;
          
          return (
            <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${
              isCurrent ? 'bg-white/10 border border-white/20' : 'bg-white/5'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted ? `bg-gradient-to-r ${colors.gradient}` : 'bg-white/10'
              }`}>
                {isCompleted ? (
                  <i className="fa-solid fa-check text-white text-xs"></i>
                ) : (
                  <span className="text-xs text-gray-500">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${isCompleted ? 'text-white' : 'text-gray-400'}`}>
                    {milestone.title}
                  </span>
                  <span className="text-[10px] text-gray-600">({milestone.requiredCount} 个技巧)</span>
                </div>
                <p className="text-xs text-gray-500">{milestone.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// Main SkillTree Component
// ============================================================

const SkillTree: React.FC = () => {
  const [skillProgress, setSkillProgress] = useState<Record<string, SkillProgress>>({});
  const [selectedBranch, setSelectedBranch] = useState<SkillBranch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 載入用戶技能進度
  useEffect(() => {
    const loadSkillProgress = async () => {
      setIsLoading(true);
      try {
        // 1. 獲取已完成的實踐 ID
        const completedPractices = loadCompletedPractices();
        const completedIds = new Set(Object.keys(completedPractices));

        // 2. 從 Supabase 獲取這些實踐的詳細信息
        const { data: records } = await supabase
          .from('daily_practices')
          .select('main_practice, alt_practices')
          .order('date', { ascending: false })
          .limit(100);

        // 3. 建立 practiceId -> scenarioTags 映射
        const practiceTagsMap: Record<string, ScenarioTag[]> = {};
        if (records) {
          records.forEach((record: DailyPracticeRecord) => {
            const allPractices = [record.main_practice, ...(record.alt_practices || [])];
            allPractices.forEach(practice => {
              if (practice && practice.id) {
                practiceTagsMap[practice.id] = practice.scenarioTags || [];
              }
            });
          });
        }

        // 4. 計算每個技能分支的進度
        const progress: Record<string, SkillProgress> = {};

        SKILL_BRANCHES.forEach(branch => {
          const matchingPracticeIds: string[] = [];

          completedIds.forEach(practiceId => {
            const tags = practiceTagsMap[practiceId] || [];
            // 檢查是否有任何標籤匹配這個分支
            if (branch.scenarioTags.some(tag => tags.includes(tag))) {
              matchingPracticeIds.push(practiceId);
            }
          });

          progress[branch.id] = {
            branchId: branch.id,
            completedCount: matchingPracticeIds.length,
            practiceIds: matchingPracticeIds,
          };
        });

        setSkillProgress(progress);
      } catch (error) {
        console.error('Failed to load skill progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSkillProgress();
  }, []);

  // 計算總體統計
  const totalStats = useMemo(() => {
    const branches = SKILL_BRANCHES.length;
    let unlockedBranches = 0;
    let totalCompleted = 0;

    Object.values(skillProgress).forEach(progress => {
      if (progress.completedCount > 0) unlockedBranches++;
      totalCompleted += progress.completedCount;
    });

    return { branches, unlockedBranches, totalCompleted };
  }, [skillProgress]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-white/5 rounded animate-pulse w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-sitemap text-emerald-500 text-lg"></i>
          <h2 className="text-xl font-bold text-white">技能树</h2>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span><i className="fa-solid fa-unlock text-emerald-400 mr-1"></i>{totalStats.unlockedBranches}/{totalStats.branches} 分支</span>
          <span><i className="fa-solid fa-check text-blue-400 mr-1"></i>{totalStats.totalCompleted} 技巧</span>
        </div>
      </div>

      {/* Branch Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SKILL_BRANCHES.map(branch => (
          <SkillBranchCard
            key={branch.id}
            branch={branch}
            progress={skillProgress[branch.id] || { branchId: branch.id, completedCount: 0, practiceIds: [] }}
            onSelect={setSelectedBranch}
            isSelected={selectedBranch?.id === branch.id}
          />
        ))}
      </div>

      {/* Selected Branch Detail */}
      {selectedBranch && (
        <SkillDetail
          branch={selectedBranch}
          progress={skillProgress[selectedBranch.id] || { branchId: selectedBranch.id, completedCount: 0, practiceIds: [] }}
          onClose={() => setSelectedBranch(null)}
        />
      )}

      {/* Empty State Hint */}
      {totalStats.totalCompleted === 0 && (
        <div className="text-center py-6 bg-white/5 rounded-xl border border-white/10">
          <i className="fa-solid fa-seedling text-gray-600 text-3xl mb-3"></i>
          <p className="text-gray-500 text-sm">完成今日精选技巧，开始解锁技能树！</p>
          <p className="text-gray-600 text-xs mt-1">每个技巧都会累积到对应的技能分支</p>
        </div>
      )}
    </div>
  );
};

export default SkillTree;
export { SkillBranchCard, SkillDetail };


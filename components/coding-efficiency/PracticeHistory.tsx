/**
 * PracticeHistory - 历史精选浏览
 *
 * 显示最近 7 天的历史精选，支持展开详情和标记实践
 */

import React, { useState, useEffect } from 'react';
import { DailyPractice, DailyPracticeRecord } from '../../types';
import { getPracticeHistory } from '../../services/supabaseService';
import { getCompletedPracticeIds, savePracticeStatus } from '../../services/practiceStorageService';
import DailyPracticeCard from './DailyPracticeCard';
import PracticeProgress from './PracticeProgress';

// ============================================================
// Helper Functions
// ============================================================

const formatRelativeDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

// ============================================================
// Sub Components
// ============================================================

interface HistoryItemProps {
  record: DailyPracticeRecord;
  isCompleted: boolean;
  onToggleComplete: (id: string, status: boolean) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ record, isCompleted, onToggleComplete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const practice = record.main_practice;
  
  const difficultyConfig = {
    beginner: { label: '入门', className: 'bg-green-500/20 text-green-400' },
    intermediate: { label: '中级', className: 'bg-yellow-500/20 text-yellow-400' },
    advanced: { label: '高级', className: 'bg-red-500/20 text-red-400' }
  };
  const { label: diffLabel, className: diffClass } = difficultyConfig[practice.difficulty];

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      {/* 摘要行 */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
      >
        {/* 狀態指示器 */}
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-600'}`}>
          <i className={`fa-solid ${isCompleted ? 'fa-check' : 'fa-circle'} text-xs`}></i>
        </div>
        
        {/* 日期 */}
        <span className="text-xs text-gray-500 w-16 flex-shrink-0">
          {formatRelativeDate(record.date)}
        </span>
        
        {/* 標題 */}
        <span className="flex-1 text-sm text-white truncate font-medium">
          {practice.title}
        </span>
        
        {/* 難度 */}
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${diffClass}`}>
          {diffLabel}
        </span>
        
        {/* 展開指示器 */}
        <i className={`fa-solid fa-chevron-down text-gray-500 text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}></i>
      </div>
      
      {/* 展開詳情 */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-4">
          <p className="text-sm text-gray-400">{practice.summary}</p>
          
          {/* 为何重要 */}
          <div>
            <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
              <i className="fa-solid fa-lightbulb text-yellow-500 mr-1.5"></i>为何重要
            </h5>
            <p className="text-sm text-gray-500">{practice.whyItMatters}</p>
          </div>

          {/* 步骤（简化显示） */}
          <div>
            <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
              <i className="fa-solid fa-list-check text-green-500 mr-1.5"></i>实践步骤
            </h5>
            <ol className="space-y-1">
              {practice.steps.slice(0, 3).map((step, i) => (
                <li key={i} className="text-xs text-gray-500 flex gap-2">
                  <span className="text-blue-400">{i + 1}.</span>
                  <span className="truncate">{step}</span>
                </li>
              ))}
              {practice.steps.length > 3 && (
                <li className="text-xs text-gray-600">...还有 {practice.steps.length - 3} 个步骤</li>
              )}
            </ol>
          </div>

          {/* 标记按钮 */}
          <div className="pt-2">
            <PracticeProgress
              practiceId={practice.id}
              isCompleted={isCompleted}
              onToggle={onToggleComplete}
              size="sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// Main Component
// ============================================================

const PracticeHistory: React.FC = () => {
  const [history, setHistory] = useState<DailyPracticeRecord[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    setCompletedIds(getCompletedPracticeIds());
    
    const result = await getPracticeHistory(7);
    // 过滤掉今天的记录（今天在主区块显示）
    const today = new Date().toISOString().split('T')[0];
    const pastRecords = (result.data || []).filter(r => r.date !== today);
    setHistory(pastRecords);
    setIsLoading(false);
  };

  const handleToggleComplete = (practiceId: string, newStatus: boolean) => {
    savePracticeStatus(practiceId, newStatus);
    setCompletedIds(getCompletedPracticeIds());
  };

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 bg-white/5 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <i className="fa-solid fa-clock-rotate-left text-2xl mb-2 opacity-30"></i>
        <p className="text-sm">暂无历史精选</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map(record => (
        <HistoryItem
          key={record.id}
          record={record}
          isCompleted={completedIds.has(record.main_practice.id)}
          onToggleComplete={handleToggleComplete}
        />
      ))}
    </div>
  );
};

export default PracticeHistory;


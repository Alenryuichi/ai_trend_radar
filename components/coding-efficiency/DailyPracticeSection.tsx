/**
 * DailyPracticeSection - 今日精選區塊
 * 
 * 包含主推薦卡片和備選卡片網格
 */

import React, { useState, useEffect } from 'react';
import { DailyPractice, DailyPracticeRecord } from '../../types';
import { getTodayPractice } from '../../services/supabaseService';
import { getCompletedPracticeIds, savePracticeStatus } from '../../services/practiceStorageService';
import DailyPracticeCard from './DailyPracticeCard';
import PracticeProgress from './PracticeProgress';
import PracticeHistory from './PracticeHistory';

// ============================================================
// Skeleton Loading Component
// ============================================================

const SkeletonCard: React.FC<{ isMain?: boolean }> = ({ isMain = false }) => (
  <div className={`rounded-2xl ${isMain ? 'p-6 bg-blue-900/10 border-2 border-blue-500/20' : 'p-4 bg-white/5 border border-white/10'} animate-pulse`}>
    {isMain && <div className="h-6 w-24 bg-white/10 rounded-lg mb-4"></div>}
    <div className="flex justify-between items-start gap-3 mb-3">
      <div className="h-6 w-2/3 bg-white/10 rounded"></div>
      <div className="flex gap-2">
        <div className="h-6 w-12 bg-white/10 rounded-lg"></div>
        <div className="h-6 w-20 bg-white/10 rounded-lg"></div>
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-4 w-full bg-white/10 rounded"></div>
      <div className="h-4 w-3/4 bg-white/10 rounded"></div>
    </div>
    <div className="flex gap-2">
      <div className="h-5 w-16 bg-white/10 rounded"></div>
      <div className="h-5 w-20 bg-white/10 rounded"></div>
    </div>
  </div>
);

// ============================================================
// Main Component
// ============================================================

const DailyPracticeSection: React.FC = () => {
  const [mainPractice, setMainPractice] = useState<DailyPractice | null>(null);
  const [altPractices, setAltPractices] = useState<DailyPractice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadTodayPractice();
    setCompletedIds(getCompletedPracticeIds());
  }, []);

  const loadTodayPractice = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getTodayPractice();

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.data) {
        setMainPractice(result.data.main_practice);
        setAltPractices(result.data.alt_practices || []);
      } else {
        setError('今日內容尚未生成，請稍後再來');
      }
    } catch (e) {
      setError('載入失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleToggleComplete = (practiceId: string, newStatus: boolean) => {
    savePracticeStatus(practiceId, newStatus);
    setCompletedIds(getCompletedPracticeIds());
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <i className="fa-solid fa-laptop-code text-blue-500"></i>
          <h2 className="text-2xl font-bold text-white">今日精選</h2>
        </div>
        <SkeletonCard isMain />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="rounded-2xl bg-red-900/20 border border-red-500/30 p-6 text-center">
        <i className="fa-solid fa-triangle-exclamation text-red-500 text-2xl mb-3"></i>
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={loadTodayPractice}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
        >
          <i className="fa-solid fa-arrows-rotate mr-2"></i>
          重試
        </button>
      </div>
    );
  }

  // Empty State
  if (!mainPractice) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
        <i className="fa-solid fa-inbox text-gray-600 text-3xl mb-3"></i>
        <p className="text-gray-500">今日內容尚未生成</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-laptop-code text-blue-500 text-lg"></i>
          <h2 className="text-2xl font-bold text-white">今日精選</h2>
        </div>
        <span className="text-xs text-gray-500 font-mono">
          {new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Main Practice Card */}
      <div className="space-y-4">
        <DailyPracticeCard
          practice={mainPractice}
          variant="main"
          expanded={expandedId === mainPractice.id}
          onToggleExpand={() => handleToggleExpand(mainPractice.id)}
        />
        {/* 實踐狀態按鈕 */}
        <div className="flex items-center justify-between">
          <PracticeProgress
            practiceId={mainPractice.id}
            isCompleted={completedIds.has(mainPractice.id)}
            onToggle={handleToggleComplete}
          />
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <i className={`fa-solid fa-clock-rotate-left mr-1.5`}></i>
            {showHistory ? '隱藏歷史' : '查看歷史'}
          </button>
        </div>
      </div>

      {/* Alternative Practices */}
      {altPractices.length > 0 && (
        <>
          <div className="flex items-center gap-3 pt-4">
            <div className="h-px flex-1 bg-white/10"></div>
            <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">更多推薦</span>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {altPractices.map((practice) => (
              <DailyPracticeCard
                key={practice.id}
                practice={practice}
                variant="alternative"
                expanded={expandedId === practice.id}
                onToggleExpand={() => handleToggleExpand(practice.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* 歷史精選區塊 */}
      {showHistory && (
        <div className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-white/10"></div>
            <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">
              <i className="fa-solid fa-clock-rotate-left mr-1.5"></i>
              歷史精選
            </span>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>
          <PracticeHistory />
        </div>
      )}
    </div>
  );
};

export default DailyPracticeSection;


/**
 * DailyPracticeSection - 今日精選區塊
 * 
 * 包含主推薦卡片和備選卡片網格
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DailyPractice, DailyPracticeRecord, ScenarioTag } from '../../types';
import { getTodayPractice } from '../../services/supabaseService';
import { getCompletedPracticeIds, savePracticeStatus } from '../../services/practiceStorageService';
import { cacheDailyPractice, getTodayCachedPractice } from '../../services/practicesCacheService';
import useNetworkStatus from '../../hooks/useNetworkStatus';
import DailyPracticeCard from './DailyPracticeCard';
import PracticeProgress from './PracticeProgress';
import PracticeHistory from './PracticeHistory';
import NetworkBanner from './NetworkBanner';
import ScenarioFilter from './ScenarioFilter';

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
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [showHistory, setShowHistory] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);

  // 篩選器狀態
  const [selectedScenario, setSelectedScenario] = useState<ScenarioTag | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'all'>('all');

  const { isOnline, isOffline, wasOffline } = useNetworkStatus();

  // 篩選後的精選列表
  const filteredPractices = useMemo(() => {
    const allPractices = mainPractice ? [mainPractice, ...altPractices] : altPractices;

    return allPractices.filter((practice) => {
      // 難度篩選
      if (selectedDifficulty !== 'all' && practice.difficulty !== selectedDifficulty) {
        return false;
      }
      // 場景篩選
      if (selectedScenario !== 'all') {
        const scenarios = practice.scenarioTags || [];
        if (!scenarios.includes(selectedScenario)) {
          return false;
        }
      }
      return true;
    });
  }, [mainPractice, altPractices, selectedScenario, selectedDifficulty]);

  // 檢查是否有篩選條件
  const hasFilters = selectedScenario !== 'all' || selectedDifficulty !== 'all';

  const loadTodayPractice = useCallback(async (skipCache = false) => {
    setIsLoading(true);
    setError(null);
    setIsFromCache(false);

    // 離線時嘗試讀取緩存
    if (isOffline && !skipCache) {
      const cached = getTodayCachedPractice();
      if (cached) {
        setMainPractice(cached.main_practice);
        setAltPractices(cached.alt_practices || []);
        setIsFromCache(true);
        setIsLoading(false);
        return;
      }
      setError('離線狀態，無緩存內容');
      setIsLoading(false);
      return;
    }

    try {
      const result = await getTodayPractice();

      if (result.error) {
        // 網絡錯誤時嘗試讀取緩存
        const cached = getTodayCachedPractice();
        if (cached) {
          setMainPractice(cached.main_practice);
          setAltPractices(cached.alt_practices || []);
          setIsFromCache(true);
        } else {
          setError(result.error);
        }
        return;
      }

      if (result.data) {
        setMainPractice(result.data.main_practice);
        setAltPractices(result.data.alt_practices || []);
        // 緩存數據
        cacheDailyPractice(result.data);
      } else {
        setError('今日內容尚未生成，請稍後再來');
      }
    } catch (e) {
      // 錯誤時嘗試讀取緩存
      const cached = getTodayCachedPractice();
      if (cached) {
        setMainPractice(cached.main_practice);
        setAltPractices(cached.alt_practices || []);
        setIsFromCache(true);
      } else {
        setError('載入失敗，請重試');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isOffline]);

  useEffect(() => {
    loadTodayPractice();
    setCompletedIds(getCompletedPracticeIds());
  }, []);

  // 網絡恢復時自動刷新
  useEffect(() => {
    if (wasOffline && isOnline && isFromCache) {
      loadTodayPractice(true);
    }
  }, [wasOffline, isOnline, isFromCache, loadTodayPractice]);

  const handleRetry = async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    await loadTodayPractice();
    setIsRetrying(false);
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
      <div className="space-y-4">
        <NetworkBanner isOffline={isOffline} wasOffline={wasOffline} />
        <div className="rounded-2xl bg-red-900/20 border border-red-500/30 p-8 text-center">
          <div className="text-4xl mb-4">😕</div>
          <h3 className="text-lg font-bold text-white mb-2">載入失敗</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
          >
            {isRetrying ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                重試中...
              </>
            ) : (
              <>
                <i className="fa-solid fa-arrows-rotate mr-2"></i>
                重試
              </>
            )}
          </button>
        </div>
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
      {/* 網絡狀態提示 */}
      <NetworkBanner isOffline={isOffline} wasOffline={wasOffline} isFromCache={isFromCache} />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-laptop-code text-emerald-500 text-lg"></i>
          <h2 className="text-xl sm:text-2xl font-bold text-white">今日精選</h2>
          {isFromCache && (
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] rounded-lg">
              緩存
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500 font-mono">
          {new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* 場景篩選器 */}
      <ScenarioFilter
        selectedScenario={selectedScenario}
        selectedDifficulty={selectedDifficulty}
        onScenarioChange={setSelectedScenario}
        onDifficultyChange={setSelectedDifficulty}
      />

      {/* 篩選結果顯示 */}
      {hasFilters ? (
        <>
          {/* 篩選結果數量 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              找到 <span className="text-emerald-400 font-medium">{filteredPractices.length}</span> 個相關技巧
            </span>
            <button
              onClick={() => {
                setSelectedScenario('all');
                setSelectedDifficulty('all');
              }}
              className="text-xs text-gray-500 hover:text-emerald-400 transition-colors"
            >
              <i className="fa-solid fa-xmark mr-1"></i>
              清除篩選
            </button>
          </div>

          {/* 篩選後的精選列表 */}
          {filteredPractices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPractices.map((practice, index) => (
                <DailyPracticeCard
                  key={practice.id}
                  practice={practice}
                  variant={index === 0 ? 'main' : 'alternative'}
                  expanded={expandedId === practice.id}
                  onToggleExpand={() => handleToggleExpand(practice.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
              <i className="fa-solid fa-filter-circle-xmark text-gray-600 text-3xl mb-3"></i>
              <p className="text-gray-500">暫無符合條件的技巧</p>
              <p className="text-gray-600 text-xs mt-2">嘗試調整篩選條件</p>
            </div>
          )}
        </>
      ) : (
        <>
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
        </>
      )}

      {/* 歷史精選區塊 */}
      {showHistory && !hasFilters && (
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


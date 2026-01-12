/**
 * Practice Storage Service
 * 
 * 使用 LocalStorage 持久化用戶的實踐狀態
 */

const STORAGE_KEY = 'llmpulse_completed_practices';

// ============================================================
// Types
// ============================================================

export interface CompletedPractice {
  completedAt: string;  // ISO timestamp
}

export interface CompletedPracticesMap {
  [practiceId: string]: CompletedPractice;
}

// ============================================================
// Core Functions
// ============================================================

/**
 * 載入所有已完成的實踐記錄
 */
export function loadCompletedPractices(): CompletedPracticesMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    
    const parsed = JSON.parse(raw);
    // 驗證數據結構
    if (typeof parsed !== 'object' || parsed === null) {
      console.warn('Invalid practice data format, resetting');
      return {};
    }
    return parsed as CompletedPracticesMap;
  } catch (e) {
    console.warn('Failed to load practice status:', e);
    return {};
  }
}

/**
 * 檢查指定實踐是否已完成
 */
export function isPracticeCompleted(practiceId: string): boolean {
  const completed = loadCompletedPractices();
  return practiceId in completed;
}

/**
 * 獲取已完成實踐的 ID Set
 */
export function getCompletedPracticeIds(): Set<string> {
  const completed = loadCompletedPractices();
  return new Set(Object.keys(completed));
}

/**
 * 保存實踐狀態
 */
export function savePracticeStatus(practiceId: string, isCompleted: boolean): void {
  try {
    const current = loadCompletedPractices();
    
    if (isCompleted) {
      current[practiceId] = {
        completedAt: new Date().toISOString()
      };
    } else {
      delete current[practiceId];
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to save practice status:', e);
  }
}

/**
 * 切換實踐狀態（返回新狀態）
 */
export function togglePracticeStatus(practiceId: string): boolean {
  const isCurrentlyCompleted = isPracticeCompleted(practiceId);
  const newStatus = !isCurrentlyCompleted;
  savePracticeStatus(practiceId, newStatus);
  return newStatus;
}

/**
 * 清除所有實踐記錄（用於測試或重置）
 */
export function clearAllPractices(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear practice status:', e);
  }
}

/**
 * 獲取完成統計
 */
export function getPracticeStats(): { total: number; thisWeek: number } {
  const completed = loadCompletedPractices();
  const entries = Object.entries(completed);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const thisWeek = entries.filter(([_, data]) => {
    const completedDate = new Date(data.completedAt);
    return completedDate >= weekAgo;
  }).length;

  return {
    total: entries.length,
    thisWeek
  };
}

/**
 * 獲取詳細學習統計
 */
export interface DetailedStats {
  total: number;           // 總完成數
  thisWeek: number;        // 本週完成數
  thisMonth: number;       // 本月完成數
  streak: number;          // 連續打卡天數
  longestStreak: number;   // 最長連續天數
  completionsByDate: Record<string, number>;  // 按日期分組的完成數
  recentCompletions: Array<{ id: string; completedAt: string }>;  // 最近完成列表
}

export function getDetailedStats(): DetailedStats {
  const completed = loadCompletedPractices();
  const entries = Object.entries(completed);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 按日期分組
  const completionsByDate: Record<string, number> = {};
  const sortedEntries: Array<{ id: string; completedAt: string }> = [];

  entries.forEach(([id, data]) => {
    const date = data.completedAt.split('T')[0]; // YYYY-MM-DD
    completionsByDate[date] = (completionsByDate[date] || 0) + 1;
    sortedEntries.push({ id, completedAt: data.completedAt });
  });

  // 排序（最新的在前）
  sortedEntries.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  // 計算連續打卡天數
  const { streak, longestStreak } = calculateStreak(completionsByDate);

  // 本週和本月統計
  let thisWeek = 0;
  let thisMonth = 0;
  entries.forEach(([_, data]) => {
    const completedDate = new Date(data.completedAt);
    if (completedDate >= weekAgo) thisWeek++;
    if (completedDate >= monthAgo) thisMonth++;
  });

  return {
    total: entries.length,
    thisWeek,
    thisMonth,
    streak,
    longestStreak,
    completionsByDate,
    recentCompletions: sortedEntries.slice(0, 10)  // 最近10條
  };
}

/**
 * 計算連續打卡天數
 */
function calculateStreak(completionsByDate: Record<string, number>): { streak: number; longestStreak: number } {
  const dates = Object.keys(completionsByDate).sort().reverse(); // 從最新到最舊

  if (dates.length === 0) {
    return { streak: 0, longestStreak: 0 };
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // 計算當前連續天數
  let streak = 0;
  let checkDate = dates[0] === today || dates[0] === yesterday ? dates[0] : null;

  if (checkDate) {
    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date(Date.now() - (i + (dates[0] === today ? 0 : 1)) * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      if (dates.includes(expectedDate)) {
        streak++;
      } else {
        break;
      }
    }
  }

  // 計算最長連續天數
  let longestStreak = 0;
  let currentRun = 1;
  const sortedDates = [...dates].sort(); // 從最舊到最新

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = (currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000);

    if (diffDays === 1) {
      currentRun++;
    } else {
      longestStreak = Math.max(longestStreak, currentRun);
      currentRun = 1;
    }
  }
  longestStreak = Math.max(longestStreak, currentRun);

  return { streak, longestStreak };
}

/**
 * 獲取最近 N 天的完成數據（用於圖表）
 */
export function getCompletionHistory(days: number = 7): Array<{ date: string; count: number }> {
  const completed = loadCompletedPractices();
  const result: Array<{ date: string; count: number }> = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const count = Object.values(completed).filter(
      p => p.completedAt.split('T')[0] === date
    ).length;
    result.push({ date, count });
  }

  return result;
}


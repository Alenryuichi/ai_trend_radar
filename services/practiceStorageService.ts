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


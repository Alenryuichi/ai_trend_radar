/**
 * Practices Cache Service
 * 
 * 緩存今日精選數據到 LocalStorage，支持離線訪問
 */

import { DailyPracticeRecord } from '../types';

const CACHE_KEY_PREFIX = 'llmpulse_daily_';
const MAX_CACHE_DAYS = 7;

// ============================================================
// Types
// ============================================================

interface CachedData {
  record: DailyPracticeRecord;
  cachedAt: number;
}

// ============================================================
// Core Functions
// ============================================================

/**
 * 獲取指定日期的緩存 key
 */
function getCacheKey(date: string): string {
  return `${CACHE_KEY_PREFIX}${date}`;
}

/**
 * 保存今日精選到緩存
 */
export function cacheDailyPractice(record: DailyPracticeRecord): void {
  try {
    const cacheKey = getCacheKey(record.date);
    const cacheData: CachedData = {
      record,
      cachedAt: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    
    // 清理過期緩存
    cleanupOldCache();
  } catch (e) {
    console.warn('Failed to cache daily practice:', e);
  }
}

/**
 * 從緩存獲取今日精選
 */
export function getCachedDailyPractice(date: string): DailyPracticeRecord | null {
  try {
    const cacheKey = getCacheKey(date);
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;
    
    const cached: CachedData = JSON.parse(raw);
    return cached.record;
  } catch (e) {
    console.warn('Failed to read cached daily practice:', e);
    return null;
  }
}

/**
 * 獲取今天的緩存
 */
export function getTodayCachedPractice(): DailyPracticeRecord | null {
  const today = new Date().toISOString().split('T')[0];
  return getCachedDailyPractice(today);
}

/**
 * 獲取所有緩存的歷史記錄
 */
export function getAllCachedPractices(): DailyPracticeRecord[] {
  const practices: DailyPracticeRecord[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const cached: CachedData = JSON.parse(raw);
          practices.push(cached.record);
        }
      }
    }
    
    // 按日期降序排列
    practices.sort((a, b) => b.date.localeCompare(a.date));
  } catch (e) {
    console.warn('Failed to read cached practices:', e);
  }
  
  return practices;
}

/**
 * 清理過期緩存（保留最近 N 天）
 */
function cleanupOldCache(): void {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_CACHE_DAYS);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];
    
    const keysToDelete: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        const dateStr = key.replace(CACHE_KEY_PREFIX, '');
        if (dateStr < cutoffStr) {
          keysToDelete.push(key);
        }
      }
    }
    
    keysToDelete.forEach(key => localStorage.removeItem(key));
  } catch (e) {
    console.warn('Failed to cleanup old cache:', e);
  }
}

/**
 * 檢查是否有緩存
 */
export function hasCachedData(): boolean {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        return true;
      }
    }
  } catch (e) {
    // ignore
  }
  return false;
}


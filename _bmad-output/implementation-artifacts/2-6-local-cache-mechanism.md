# Story 2.6: 精選資料本地快取機制

Status: ready-for-dev

## Dependencies
- **Story 2.1**: DailyPractice 類型定義
- **Epic 1 Story 1.2**: Supabase 服務層（數據獲取）

## Story

As a **開發者用戶**,
I want **今日精選資料被快取在本地**,
So that **重新開啟頁面時能快速載入，且同一天內不會看到不同的內容**.

## Acceptance Criteria

1. **AC1:** Given 用戶首次在當天訪問 Coding Efficiency 頁面, When 今日精選資料載入成功, Then 資料被儲存到 LocalStorage，key 格式為 `llmpulse_daily_${date}`
2. **AC2:** And 下次訪問時優先從 LocalStorage 讀取資料
3. **AC3:** And 日期變更時，自動載入新資料

## Tasks / Subtasks

- [ ] Task 1: 創建 LocalStorage 快取服務 (AC: #1, #2, #3)
  - [ ] 1.1 創建 `src/services/localCacheService.ts`
  - [ ] 1.2 定義快取 key 格式: `llmpulse_daily_${date}`
  - [ ] 1.3 實現日期格式化函數 (YYYY-MM-DD)

- [ ] Task 2: 實現快取讀取邏輯 (AC: #2)
  - [ ] 2.1 實現 `getCachedDailyPractice()` 方法
  - [ ] 2.2 解析 JSON 資料
  - [ ] 2.3 處理 JSON 解析錯誤
  - [ ] 2.4 快取不存在時返回 null

- [ ] Task 3: 實現快取寫入邏輯 (AC: #1)
  - [ ] 3.1 實現 `cacheDailyPractice()` 方法
  - [ ] 3.2 序列化資料為 JSON
  - [ ] 3.3 處理 LocalStorage 容量限制錯誤

- [ ] Task 4: 實現日期檢查和快取失效邏輯 (AC: #3)
  - [ ] 4.1 實現 `isValidCache()` 方法檢查日期
  - [ ] 4.2 日期變更時返回 false 觸發重新載入
  - [ ] 4.3 可選: 清理過期快取 (超過 7 天)

- [ ] Task 5: 整合到資料載入流程 (AC: #1, #2, #3)
  - [ ] 5.1 頁面載入時先檢查快取
  - [ ] 5.2 快取有效則使用快取資料
  - [ ] 5.3 快取無效則從 API/資料源載入
  - [ ] 5.4 載入成功後更新快取

## Dev Notes

### 技術規格

- **服務位置:** `src/services/localCacheService.ts`
- **快取 Key:** `llmpulse_daily_${date}`
- **日期格式:** YYYY-MM-DD (例: 2026-01-11)
- **狀態管理:** React useState (遵循現有模式)

### LocalCacheService 設計

```typescript
// src/services/localCacheService.ts

interface CachedDailyPractice {
  date: string;
  mainPractice: DailyPractice;
  altPractices: DailyPractice[];
  cachedAt: number; // timestamp
}

const CACHE_KEY_PREFIX = 'llmpulse_daily_';

export const localCacheService = {
  getDateKey(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  },

  getCacheKey(): string {
    return `${CACHE_KEY_PREFIX}${this.getDateKey()}`;
  },

  getCachedDailyPractice(): CachedDailyPractice | null {
    try {
      const key = this.getCacheKey();
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const data = JSON.parse(cached) as CachedDailyPractice;
      // 驗證日期是否為今天
      if (data.date !== this.getDateKey()) return null;
      
      return data;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  },

  cacheDailyPractice(
    mainPractice: DailyPractice, 
    altPractices: DailyPractice[]
  ): void {
    try {
      const data: CachedDailyPractice = {
        date: this.getDateKey(),
        mainPractice,
        altPractices,
        cachedAt: Date.now()
      };
      localStorage.setItem(this.getCacheKey(), JSON.stringify(data));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  },

  clearExpiredCache(daysToKeep: number = 7): void {
    const today = new Date();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        const dateStr = key.replace(CACHE_KEY_PREFIX, '');
        const cacheDate = new Date(dateStr);
        const diffDays = (today.getTime() - cacheDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > daysToKeep) {
          localStorage.removeItem(key);
        }
      }
    }
  }
};
```

### 資料載入流程

```tsx
// 在 CodingEfficiency 組件或自訂 Hook 中
useEffect(() => {
  const loadDailyPractice = async () => {
    // 1. 嘗試讀取快取
    const cached = localCacheService.getCachedDailyPractice();
    if (cached) {
      setMainPractice(cached.mainPractice);
      setAltPractices(cached.altPractices);
      return;
    }

    // 2. 快取無效，從資料源載入
    const data = await fetchDailyPractice();
    setMainPractice(data.mainPractice);
    setAltPractices(data.altPractices);

    // 3. 更新快取
    localCacheService.cacheDailyPractice(data.mainPractice, data.altPractices);
  };

  loadDailyPractice();
}, []);
```

### 測試驗收

- 驗證首次載入時資料被寫入 LocalStorage
- 驗證重新整理後從快取讀取
- 驗證日期變更後重新載入新資料
- 驗證 LocalStorage 錯誤時優雅降級


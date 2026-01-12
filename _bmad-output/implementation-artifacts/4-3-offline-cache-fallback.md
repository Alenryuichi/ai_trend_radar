# Story 4.3: 離線緩存降級

## Status: ready-for-dev

## Story

**As a** 開發者用戶,
**I want** 在網絡不穩定時仍能查看之前載入過的今日精選內容,
**So that** 即使在離線或弱網環境下也能繼續學習.

## Acceptance Criteria

### AC 4.3.1: 離線時顯示緩存
**Given** 用戶在離線狀態下訪問今日精選頁面
**When** 頁面嘗試載入數據
**Then** 自動讀取並顯示 LocalStorage 中的緩存數據
**And** 頁面頂部顯示「離線模式 - 顯示緩存內容」提示條

### AC 4.3.2: 無緩存時的空狀態
**Given** 用戶首次訪問且處於離線狀態
**When** 頁面嘗試載入數據
**Then** 顯示「暫無緩存內容，請連接網絡後重試」的友好提示

## Technical Notes

### 網絡狀態檢測
```typescript
// 獲取當前網絡狀態
const isOnline = navigator.onLine;

// 監聽網絡狀態變化
window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);
```

### LocalStorage Key 格式
```typescript
// 今日精選緩存
const CACHE_KEY = `llmpulse_daily_${date}`; // date: YYYY-MM-DD

// 緩存結構
interface CachedPractice {
  date: string;
  data: DailyPractice;
  cachedAt: number; // timestamp
}
```

### 離線提示條設計
- 背景: `bg-yellow-100 dark:bg-yellow-900`
- 文字: `text-yellow-800 dark:text-yellow-200`
- 圖標: 雲端離線圖標
- 位置: 頁面頂部固定

### 緩存策略
1. 載入時先檢查網絡狀態
2. 離線時直接讀取緩存
3. 在線時先顯示緩存再更新
4. 更新成功後刷新緩存

## Tasks

### Task 4.3.1: 實現網絡狀態檢測
- [ ] 創建 `hooks/useNetworkStatus.ts`
- [ ] 實現 `navigator.onLine` 初始狀態獲取
- [ ] 實現 `online`/`offline` 事件監聽
- [ ] 返回 `isOnline` 狀態和 `isOffline` 狀態
- [ ] 組件卸載時清理事件監聽器

### Task 4.3.2: 實現離線緩存讀取邏輯
- [ ] 修改數據獲取 hook 支援離線模式
- [ ] 離線時優先讀取 LocalStorage 緩存
- [ ] 緩存不存在時返回 null 並設置錯誤狀態
- [ ] 緩存讀取成功時設置 `isFromCache: true` 標記

### Task 4.3.3: 創建離線提示條組件
- [ ] 創建 `components/coding-efficiency/OfflineBanner.tsx`
- [ ] 實現黃色警告樣式
- [ ] 添加離線圖標
- [ ] 顯示文字「離線模式 - 顯示緩存內容」
- [ ] 網絡恢復時自動隱藏

### Task 4.3.4: 創建無緩存空狀態組件
- [ ] 創建 `components/coding-efficiency/NoCacheState.tsx`
- [ ] 實現友好的空狀態設計
- [ ] 顯示「暫無緩存內容，請連接網絡後重試」
- [ ] 添加適當的圖標

### Task 5: 網絡恢復自動刷新（AC 補充）
- [ ] 5.1 在 `online` 事件觸發時自動調用數據刷新
- [ ] 5.2 隱藏離線提示條
- [ ] 5.3 顯示「已恢復連線」短暫提示（2 秒後消失）

## Dependencies

- **Epic 2 Story 2.6**: LocalStorage 緩存機制（複用 localCacheService）
- **Epic 1 Story 1.2**: supabaseService（在線數據獲取）

## Files to Create

- `hooks/useNetworkStatus.ts`
- `components/coding-efficiency/OfflineBanner.tsx`
- `components/coding-efficiency/NoCacheState.tsx`

## Files to Modify

- 數據獲取 hook (添加離線邏輯)
- `components/coding-efficiency/DailyPracticeSection.tsx` (添加離線 UI)

## Component Examples

```tsx
// OfflineBanner.tsx
export function OfflineBanner() {
  return (
    <div className="bg-yellow-100 dark:bg-yellow-900 px-4 py-2 text-center">
      <span className="text-yellow-800 dark:text-yellow-200">
        ☁️ 離線模式 - 顯示緩存內容
      </span>
    </div>
  );
}

// NoCacheState.tsx
export function NoCacheState() {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">📡</div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        暫無緩存內容
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        請連接網絡後重試
      </p>
    </div>
  );
}
```

## Definition of Done

- [ ] useNetworkStatus hook 正確檢測網絡狀態
- [ ] 離線時自動顯示緩存內容
- [ ] 離線提示條正確顯示/隱藏
- [ ] 無緩存時顯示空狀態
- [ ] 網絡恢復時自動刷新數據
- [ ] 事件監聽器正確清理


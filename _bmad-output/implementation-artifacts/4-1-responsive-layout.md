# Story 4.1: 響應式布局適配

## Status: ready-for-dev

## Story

**As a** 開發者用戶,
**I want** 在不同尺寸的設備上都能正常瀏覽今日精選內容,
**So that** 無論我使用手機、平板還是電腦，都能獲得良好的使用體驗.

## Acceptance Criteria

### AC 4.1.1: 移動端單欄布局
**Given** 用戶使用寬度小於 640px 的移動設備訪問今日精選頁面
**When** 頁面載入完成
**Then** 今日精選卡片以單欄垂直堆疊方式顯示
**And** 字體大小、間距適合觸控操作

### AC 4.1.2: 平板雙欄布局
**Given** 用戶使用寬度在 640-1024px 的平板設備訪問今日精選頁面
**When** 頁面載入完成
**Then** 今日精選卡片以雙欄網格方式顯示

### AC 4.1.3: 桌面端完整布局
**Given** 用戶使用寬度大於 1024px 的桌面設備訪問今日精選頁面
**When** 頁面載入完成
**Then** 完整顯示側邊導航和輔助信息
**And** LCP < 2.5 秒, CLS < 0.1

## Technical Notes

### 斷點定義
- **Mobile:** < 640px (無前綴，Tailwind 預設)
- **Tablet (sm):** 640px - 767px
- **Tablet (md):** 768px - 1023px
- **Desktop (lg):** >= 1024px

### Tailwind CSS 響應式前綴
- 無前綴: 基礎移動端樣式
- `sm:`: >= 640px
- `md:`: >= 768px
- `lg:`: >= 1024px

### 性能要求 (NFR)
- LCP (Largest Contentful Paint) < 2.5 秒
- CLS (Cumulative Layout Shift) < 0.1
- FID (First Input Delay) < 100ms
- 使用 width/height 屬性防止 layout shift

### FID 優化指南
- 避免主線程長任務（> 50ms）
- 使用 `requestAnimationFrame` 處理動畫
- 延遲非關鍵 JavaScript 載入

### 觸控操作優化
- 最小點擊目標: 44x44px
- 適當的間距 (padding/margin)
- 字體大小: base (16px) 以上

## Tasks

### Task 4.1.1: 審查現有組件響應式類
- [ ] 檢查 DailyPracticeCard 組件現有響應式類
- [ ] 檢查 AltPracticeCard 組件現有響應式類
- [ ] 檢查歷史精選列表組件響應式類
- [ ] 記錄需要調整的組件清單

### Task 4.1.2: 添加移動端樣式 (< 640px)
- [ ] 設置卡片單欄垂直堆疊布局
- [ ] 調整字體大小確保可讀性 (text-base 或更大)
- [ ] 調整間距確保觸控友好 (p-4, gap-4)
- [ ] 確保按鈕最小點擊區域 44x44px

### Task 4.1.3: 添加平板端樣式 (640-1024px)
- [ ] 使用 sm:grid-cols-2 實現雙欄網格
- [ ] 調整卡片間距 (sm:gap-6)
- [ ] 調整內容區域寬度

### Task 4.1.4: 添加桌面端樣式 (> 1024px)
- [ ] 使用 lg: 前綴設置桌面布局
- [ ] 確保側邊導航正常顯示
- [ ] 設置最大內容寬度 (max-w-4xl 或類似)
- [ ] 調整輔助信息區域布局

### Task 4.1.5: 測試各斷點布局
- [ ] 使用 Chrome DevTools 測試 375px (iPhone SE)
- [ ] 測試 390px (iPhone 14)
- [ ] 測試 768px (iPad)
- [ ] 測試 1024px (iPad Pro)
- [ ] 測試 1440px (Desktop)
- [ ] 驗證 LCP < 2.5s 使用 Lighthouse
- [ ] 驗證 CLS < 0.1 使用 Lighthouse
- [ ] 驗證 FID < 100ms 使用 Lighthouse

### 性能驗證任務
- [ ] 使用 Chrome Lighthouse 驗證：
  - LCP < 2.5 秒 ✓
  - CLS < 0.1 ✓
  - **FID < 100ms** ✓ （新增）

## Dependencies

- **Epic 2 全部**: 所有 UI 組件需要響應式適配
- **Epic 3 全部**: 歷史瀏覽組件需要響應式適配

## Files to Modify

- `components/coding-efficiency/DailyPracticeCard.tsx`
- `components/coding-efficiency/AltPracticeCard.tsx`
- `components/coding-efficiency/PracticeHistory.tsx`
- `pages/coding-efficiency.tsx` 或對應頁面組件

## Definition of Done

- [ ] 所有三個斷點布局正確顯示
- [ ] 觸控目標滿足 44x44px 最小尺寸
- [ ] Lighthouse LCP < 2.5s
- [ ] Lighthouse CLS < 0.1
- [ ] Lighthouse FID < 100ms
- [ ] 響應式測試在主流設備尺寸通過


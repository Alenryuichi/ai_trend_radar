# Story 4.2: Skeleton Loading 狀態

## Status: ready-for-dev

## Story

**As a** 開發者用戶,
**I want** 在內容載入時看到骨架屏動畫,
**So that** 我知道內容正在載入中，而不是頁面卡住了.

## Acceptance Criteria

### AC 4.2.1: 骨架屏顯示
**Given** 用戶進入今日精選頁面
**When** API 數據尚未返回
**Then** 顯示與實際內容布局一致的骨架屏組件
**And** 骨架屏有平滑的脈動動畫效果

### AC 4.2.2: 過渡動畫
**Given** 骨架屏正在顯示
**When** API 數據成功返回
**Then** 骨架屏平滑過渡為實際內容
**And** 過渡動畫時長不超過 300ms

## Technical Notes

### Tailwind CSS 動畫類
```css
/* 脈動動畫 */
animate-pulse

/* 過渡效果 */
transition-opacity duration-300
```

### 骨架屏設計原則
- 布局尺寸與實際內容完全一致 (防止 CLS)
- 使用灰色背景模擬內容區塊
- 標題區域: 較寬的骨架塊
- 摘要區域: 多行骨架塊
- 標籤區域: 圓角小骨架塊

### 骨架屏顏色
- 背景: `bg-gray-200 dark:bg-gray-700`
- 動畫: Tailwind `animate-pulse` 內建

### 過渡實現
```tsx
// 使用 opacity 過渡
<div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
  {content}
</div>
```

## Tasks

### Task 4.2.1: 創建 SkeletonCard 組件
- [ ] 創建 `components/coding-efficiency/SkeletonCard.tsx`
- [ ] 實現標題骨架區域 (h-6 w-3/4)
- [ ] 實現摘要骨架區域 (多行 h-4)
- [ ] 實現標籤骨架區域 (inline-block h-6 w-16)
- [ ] 實現按鈕骨架區域
- [ ] 確保尺寸與 DailyPracticeCard 一致

### Task 4.2.2: 實現脈動動畫效果
- [ ] 添加 `animate-pulse` 類到骨架元素
- [ ] 確保動畫流暢無卡頓
- [ ] 測試暗色模式下的顏色對比度

### Task 4.2.3: 實現載入狀態管理
- [ ] 在數據獲取 hook 中添加 `isLoading` 狀態
- [ ] 確保載入狀態正確反映 API 請求進度
- [ ] 處理快速載入場景 (避免閃爍)

### Task 4.2.4: 實現過渡動畫
- [ ] 添加 `transition-opacity duration-300` 類
- [ ] 實現骨架屏到內容的平滑切換
- [ ] 測試過渡效果在各瀏覽器的一致性

## Dependencies

- **Epic 2 Story 2.1**: DailyPracticeCard（創建對應骨架屏）
- **Epic 2 Story 2.2**: 備選卡片（創建對應骨架屏）

## Files to Create

- `components/coding-efficiency/SkeletonCard.tsx`

## Files to Modify

- `components/coding-efficiency/DailyPracticeSection.tsx` (或主容器組件)
- 數據獲取 hook (添加載入狀態)

## Component Structure

```tsx
// SkeletonCard.tsx
export function SkeletonCard({ variant = 'main' }: { variant?: 'main' | 'alt' }) {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      {/* 標題骨架 */}
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
      
      {/* 摘要骨架 */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
      </div>
      
      {/* 標籤骨架 */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      </div>
      
      {/* 按鈕骨架 */}
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32" />
    </div>
  );
}
```

## Definition of Done

- [ ] SkeletonCard 組件創建完成
- [ ] 骨架屏尺寸與實際卡片一致
- [ ] 脈動動畫流暢運行
- [ ] 過渡動畫 <= 300ms
- [ ] 暗色模式正常顯示
- [ ] 無 CLS (布局偏移)


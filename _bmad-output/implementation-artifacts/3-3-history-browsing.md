# Story 3.3: 歷史精選瀏覽

Status: ready-for-dev

## Dependencies
- **Epic 1 Story 1.2**: supabaseService.getPracticeHistory() 方法
- **Story 3.1**: PracticeProgress 組件（顯示狀態）
- **Story 3.2**: practiceStorageService（讀取本地狀態）

## Story

As a 開發者用戶,
I want 瀏覽最近 7-14 天的歷史精選,
so that 我可以回顧錯過的內容或重新練習之前的題目.

## Acceptance Criteria

1. **AC1 - 歷史列表展示**
   - **Given** 用戶在今日精選頁面
   - **When** 用戶查看歷史區域
   - **Then** 顯示最近 7 天的精選列表（按日期降序排列）
   - **And** 每項顯示日期、標題、難度標籤
   - **And** 每個精選項目顯示其實踐狀態（已完成/未完成）

2. **AC2 - 空狀態處理**
   - **Given** 沒有歷史精選數據
   - **When** 用戶查看歷史區域
   - **Then** 顯示友好的空狀態提示

## Tasks / Subtasks

- [ ] Task 1: 創建 PracticeHistory 組件 (AC: 1, 2)
  - [ ] 1.1 創建 `components/coding-efficiency/PracticeHistory.tsx` 文件
  - [ ] 1.2 定義組件 Props: `history: DailyPractice[]`, `completedIds: Set<string>`
  - [ ] 1.3 實現基礎容器結構和標題樣式

- [ ] Task 2: 創建 PracticeHistoryItem 組件 (AC: 1)
  - [ ] 2.1 創建單個歷史項目子組件
  - [ ] 2.2 顯示日期（格式化為 MM/DD 或相對時間如「3天前」）
  - [ ] 2.3 顯示精選標題
  - [ ] 2.4 顯示難度標籤（使用與今日精選一致的樣式）
  - [ ] 2.5 顯示實踐狀態指示器（綠色勾/灰色圓圈）

- [ ] Task 3: 整合 Supabase 歷史數據服務 (AC: 1)
  - [ ] 3.1 確認 supabaseService.getPracticeHistory(days: number) 方法存在
  - [ ] 3.2 在父組件中調用服務獲取歷史數據
  - [ ] 3.3 處理加載狀態（顯示 skeleton 或 spinner）
  - [ ] 3.4 處理請求錯誤（顯示錯誤提示）

- [ ] Task 4: 實現空狀態顯示 (AC: 2)
  - [ ] 4.1 當 history 數組為空時顯示空狀態 UI
  - [ ] 4.2 設計友好的空狀態插圖/圖標和文案
  - [ ] 4.3 建議文案：「暫無歷史精選，持續關注每日更新！」

- [ ] Task 5: 整合實踐狀態顯示 (AC: 1)
  - [ ] 5.1 從 LocalStorage 讀取已完成的實踐 ID（使用 Story 3.2 的服務）
  - [ ] 5.2 將 completedIds 傳遞給 PracticeHistory 組件
  - [ ] 5.3 在每個歷史項目中顯示對應的實踐狀態

## Dev Notes

### 技術約束
- 調用 `supabaseService.getPracticeHistory(7)` 獲取最近 7 天數據
- 實踐狀態需從 LocalStorage 讀取（key: `llmpulse_completed_practices`）
- 按日期降序排列（最新的在最前面）

### 組件結構設計

```
PracticeHistory
├── Title: "歷史精選"
├── PracticeHistoryItem × N
│   ├── Date (左側)
│   ├── Title (中間)
│   ├── Difficulty Badge (右側)
│   └── Status Indicator (最右側)
└── EmptyState (條件渲染)
```

### 日期格式化建議

```typescript
// 相對時間顯示
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
};
```

### 難度標籤樣式

```typescript
const difficultyStyles = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800', 
  hard: 'bg-red-100 text-red-800'
};
```

### supabaseService.getPracticeHistory() 實現

**注意**: 此方法需要在 Story 1.2 完成時添加到 `supabaseService.ts`。

如果 Story 1.2 未包含此方法，請在此 Story 開發時添加：

```typescript
// 添加到 src/services/supabaseService.ts

/**
 * 獲取最近 N 天的歷史精選
 * @param days 天數（預設 7）
 * @returns 歷史精選列表，按日期降序
 */
export async function getPracticeHistory(days: number = 7): Promise<DailyPracticeRecord[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_practices')
    .select('*')
    .gte('date', startDateStr)
    .order('date', { ascending: false });

  if (error) {
    console.error('Failed to fetch practice history:', error);
    return [];
  }

  return data || [];
}
```

**數據轉換注意事項：**
- Supabase 返回的 `main_practice` 是 JSONB，需要解析為 `DailyPractice` 類型
- 日期格式：Supabase 返回 `YYYY-MM-DD` 字符串

### Project Structure Notes

- 新建文件: `src/components/coding-efficiency/PracticeHistory.tsx`
- 依賴: Story 3.2 的 practiceStorageService
- 依賴: supabaseService.getPracticeHistory() 方法

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Component Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture - practiceHistory State]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.3]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### Change Log

### File List


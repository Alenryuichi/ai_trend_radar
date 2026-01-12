# Story 2.1: 今日主推精選卡片基礎展示

Status: ready-for-dev

## Dependencies
- **Epic 1 完成**: 需要 Supabase 數據源
- **無 Story 依賴**: 這是 Epic 2 的起始 Story

## Story

As a **開發者用戶**,
I want **在 Coding Efficiency 頁面看到今日主推的 AI Coding 精選實踐卡片，包含標題、摘要、難度等級和預估完成時間**,
So that **我可以快速了解今天推薦的實踐主題並評估是否適合我當前的時間和能力**.

## Acceptance Criteria

1. **AC1:** Given 用戶進入 Coding Efficiency 頁面, When 頁面載入完成, Then 用戶可以看到一張主推精選卡片，顯示於頁面醒目位置
2. **AC2:** And 卡片顯示精選的標題 (title)、摘要說明 (summary)
3. **AC3:** And 卡片顯示難度等級標識，使用視覺化徽章區分「入門」/「中級」/「高級」
4. **AC4:** And 卡片顯示預估完成時間（格式：約 X 分鐘）
5. **AC5:** And 主推卡片有明顯的視覺標識（如「今日推薦」標籤）

## Tasks / Subtasks

- [ ] Task 1: 定義 DailyPractice 類型介面 (AC: #1)
  - [ ] 1.1 在 `types.ts` 中新增 `DailyPractice` interface
  - [ ] 1.2 定義難度類型 `'beginner' | 'intermediate' | 'advanced'`
  - [ ] 1.3 包含欄位: id, title, summary, difficulty, estimatedMinutes, steps, whyItMatters, sourceUrl, sourceName, tools, tags

- [ ] Task 2: 創建 DailyPracticeCard 組件 (AC: #1, #2)
  - [ ] 2.1 創建 `src/components/coding-efficiency/DailyPracticeCard.tsx`
  - [ ] 2.2 實現卡片基礎佈局 (使用 Tailwind CSS)
  - [ ] 2.3 顯示標題 (title) 和摘要 (summary)
  - [ ] 2.4 實現響應式設計

- [ ] Task 3: 實現難度等級徽章組件 (AC: #3)
  - [ ] 3.1 創建 DifficultyBadge 子組件或內聯樣式
  - [ ] 3.2 難度映射: beginner=「入門」(綠色), intermediate=「中級」(黃色), advanced=「高級」(紅色)
  - [ ] 3.3 使用 Tailwind 的 badge 樣式

- [ ] Task 4: 實現預估時間顯示 (AC: #4)
  - [ ] 4.1 顯示格式「約 X 分鐘」
  - [ ] 4.2 使用時鐘圖標增強視覺

- [ ] Task 5: 添加「今日推薦」視覺標識 (AC: #5)
  - [ ] 5.1 實現標籤樣式 (醒目顏色/位置)
  - [ ] 5.2 可使用 ribbon 或 badge 形式

- [ ] Task 6: 整合到 Coding Efficiency 頁面 (AC: #1)
  - [ ] 6.1 在 CodingEfficiency 區域引入 DailyPracticeCard
  - [ ] 6.2 使用 Mock 資料進行視覺驗證
  - [ ] 6.3 確認卡片在醒目位置顯示

## Dev Notes

### 技術規格

- **組件位置:** `src/components/coding-efficiency/DailyPracticeCard.tsx`
- **樣式方案:** Tailwind CSS 響應式類
- **狀態管理:** React useState (遵循現有模式)

### DailyPractice Interface

```typescript
interface DailyPractice {
  id: string;
  title: string;
  summary: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  steps: string[];
  whyItMatters: string;
  sourceUrl: string;
  sourceName: string;
  tools: string[];
  tags: string[];
}
```

### 難度等級視覺映射

| 難度值 | 顯示文字 | 顏色 |
|--------|----------|------|
| beginner | 入門 | `bg-green-100 text-green-800` |
| intermediate | 中級 | `bg-yellow-100 text-yellow-800` |
| advanced | 高級 | `bg-red-100 text-red-800` |

### 設計參考

- 卡片應有圓角 (rounded-lg) 和陰影 (shadow-md)
- 「今日推薦」標籤使用醒目顏色如 `bg-blue-600 text-white`
- 響應式: 移動端全寬, 桌面端適當寬度

### 測試驗收

- 使用 Mock 資料驗證卡片渲染
- 驗證不同難度等級的顏色正確
- 驗證響應式在不同螢幕寬度的表現


# Story 3.1: 實踐狀態標記功能

Status: ready-for-dev

## Dependencies
- **Epic 1**: Supabase 基礎設施
- **Epic 2 Story 2.1**: DailyPracticeCard 組件（整合按鈕）

## Story

As a 開發者用戶,
I want 將今日精選標記為「已實踐」或取消標記,
so that 我可以追蹤自己的學習進度並保持練習動力.

## Acceptance Criteria

1. **AC1 - 標記為已實踐**
   - **Given** 用戶正在查看今日精選卡片
   - **When** 用戶點擊「標記為已實踐」按鈕
   - **Then** 按鈕狀態變更為「已完成」樣式（帶有勾選圖標）
   - **And** 顯示簡短的成功反饋（如：✓ 已記錄）

2. **AC2 - 取消已實踐標記**
   - **Given** 用戶已將精選標記為「已實踐」
   - **When** 用戶再次點擊該按鈕
   - **Then** 按鈕恢復為「標記為已實踐」初始狀態
   - **And** 實踐記錄被移除

## Tasks / Subtasks

- [ ] Task 1: 創建 PracticeProgress 組件 (AC: 1, 2)
  - [ ] 1.1 創建 `components/coding-efficiency/PracticeProgress.tsx` 文件
  - [ ] 1.2 定義組件 Props 介面 (`practiceId: string`, `isCompleted: boolean`, `onToggle: () => void`)
  - [ ] 1.3 實現基礎按鈕結構和樣式

- [ ] Task 2: 實現按鈕狀態切換邏輯 (AC: 1, 2)
  - [ ] 2.1 使用 React useState 管理內部 UI 狀態
  - [ ] 2.2 實現 onClick 處理器呼叫 onToggle callback
  - [ ] 2.3 根據 isCompleted prop 動態切換按鈕顯示內容

- [ ] Task 3: 添加視覺反饋和動畫 (AC: 1)
  - [ ] 3.1 實現未完成狀態樣式（outline 邊框按鈕）
  - [ ] 3.2 實現已完成狀態樣式（filled 填充按鈕 + checkmark 圖標）
  - [ ] 3.3 添加狀態切換過渡動畫 (Tailwind transition)

- [ ] Task 4: 實現成功提示反饋 (AC: 1)
  - [ ] 4.1 狀態變更時顯示「✓ 已記錄」提示
  - [ ] 4.2 提示自動在 2 秒後淡出消失
  - [ ] 4.3 使用 setTimeout + useState 控制提示顯示邏輯

## Dev Notes

### 組件命名說明
組件名稱 `PracticeProgress` 與架構文檔一致，包含狀態標記按鈕功能。

### 技術約束
- 使用 React useState 管理組件狀態（符合專案現有模式）
- 使用 Tailwind CSS 進行樣式設計
- 組件應為受控組件，狀態由父組件管理

### 按鈕狀態設計
| 狀態 | 樣式 | 文字 |
|------|------|------|
| 未完成 | outline (邊框) | 📝 標記為已實踐 |
| 已完成 | filled (填充) + checkmark | ✓ 已完成 |

### 建議樣式類

```typescript
// 未完成狀態
"border border-gray-300 text-gray-700 hover:bg-gray-50"

// 已完成狀態  
"bg-green-100 text-green-700 border-green-300"

// 過渡動畫
"transition-all duration-200 ease-in-out"
```

### Project Structure Notes

- 新建文件: `src/components/coding-efficiency/PracticeProgress.tsx`
- 符合架構設計: `components/coding-efficiency/` 目錄結構
- 遵循專案命名規範: PascalCase 組件名

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Architecture]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### Change Log

### File List


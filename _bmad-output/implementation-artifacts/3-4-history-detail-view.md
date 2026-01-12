# Story 3.4: 歷史精選詳情查看

Status: ready-for-dev

## Dependencies
- **Story 3.3**: PracticeHistory 組件
- **Epic 2 Story 2.4**: PracticeSteps 組件（複用）
- **Story 3.1**: PracticeProgress 組件（複用）

## Story

As a 開發者用戶,
I want 點擊歷史精選查看完整詳情,
so that 我可以回顧或重新練習之前的內容.

## Acceptance Criteria

1. **AC1 - 展開詳情內容**
   - **Given** 用戶在歷史列表中看到某個精選
   - **When** 用戶點擊該精選項目
   - **Then** 展開顯示完整的精選內容（與今日精選格式一致）
   - **And** 包含實踐步驟、價值說明、工具標籤

2. **AC2 - 歷史項目可標記實踐**
   - **Given** 用戶正在查看歷史精選詳情
   - **When** 該精選尚未標記為已實踐
   - **Then** 顯示「標記為已實踐」按鈕
   - **And** 點擊後可正常標記並持久化

## Tasks / Subtasks

- [ ] Task 1: 實現歷史項目展開/收合交互 (AC: 1)
  - [ ] 1.1 在 PracticeHistoryItem 添加展開狀態管理 (useState)
  - [ ] 1.2 點擊項目時切換展開/收合狀態
  - [ ] 1.3 添加展開/收合視覺指示器（箭頭圖標旋轉）
  - [ ] 1.4 添加展開/收合過渡動畫

- [ ] Task 2: 複用今日精選詳情組件 (AC: 1)
  - [ ] 2.1 確認 DailyPracticeCard 或 PracticeSteps 組件可複用
  - [ ] 2.2 在展開區域渲染完整精選內容
  - [ ] 2.3 確保顯示實踐步驟列表
  - [ ] 2.4 確保顯示價值說明區塊
  - [ ] 2.5 確保顯示工具/場景標籤

- [ ] Task 3: 整合實踐狀態標記功能 (AC: 2)
  - [ ] 3.1 在展開的詳情區域添加 PracticeProgress
  - [ ] 3.2 傳遞正確的 practiceId 和當前狀態
  - [ ] 3.3 確保標記操作正確持久化到 LocalStorage
  - [ ] 3.4 標記後更新歷史列表中的狀態指示器

## Dev Notes

### 技術約束
- 複用現有組件避免重複代碼
- 使用 Story 3.1 的 PracticeProgress 組件
- 使用 Story 3.2 的持久化服務
- 保持與今日精選一致的視覺風格

### 展開/收合交互設計

```typescript
// PracticeHistoryItem 狀態
const [isExpanded, setIsExpanded] = useState(false);

// 點擊處理
const handleClick = () => setIsExpanded(!isExpanded);

// 展開區域條件渲染
{isExpanded && (
  <div className="mt-4 pt-4 border-t">
    {/* 複用詳情組件 */}
  </div>
)}
```

### 動畫效果建議

```typescript
// 箭頭旋轉
<ChevronIcon className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />

// 內容展開動畫
<div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
```

### 組件複用策略

從 Epic 2 複用以下組件：
- `PracticeSteps.tsx` - 顯示步驟列表
- `WhyItMatters.tsx` - 顯示價值說明
- `TagList.tsx` - 顯示工具和標籤

從 Epic 3 複用：
- `PracticeProgress.tsx` - 狀態標記按鈕

```
PracticeHistoryItem (展開後)
├── 原有摘要信息
└── 展開區域
    ├── PracticeSteps (複用)
    ├── 價值說明區塊
    ├── 工具標籤列表
    └── PracticeProgress (複用 Story 3.1)
```

### 狀態同步注意事項
- 歷史項目標記後需同步更新列表顯示
- 使用回調函數通知父組件狀態變更
- 考慮將 completedIds 提升到共同父組件管理

### Project Structure Notes

- 修改文件: `src/components/coding-efficiency/PracticeHistory.tsx`
- 依賴組件: PracticeProgress (Story 3.1)
- 依賴組件: PracticeSteps 或 DailyPracticeCard (Epic 2)
- 依賴服務: practiceStorageService (Story 3.2)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Component Architecture]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.4]
- [Source: _bmad-output/planning-artifacts/prd.md#FR16 歷史詳情]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### Change Log

### File List


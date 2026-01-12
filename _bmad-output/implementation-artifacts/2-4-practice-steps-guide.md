# Story 2.4: 實踐步驟指南展示

Status: ready-for-dev

## Dependencies
- **Story 2.1**: DailyPracticeCard 組件（整合步驟展示）

## Story

As a **開發者用戶**,
I want **查看精選的具體實踐步驟（1-2-3 步驟指南）**,
So that **我知道如何開始執行這個實踐，不需要額外查找資料**.

## Acceptance Criteria

1. **AC1:** Given 用戶點擊展開或查看某個精選的詳細內容, When 詳細內容區域展開/顯示, Then 用戶可以看到清晰編號的實踐步驟列表（steps 陣列）
2. **AC2:** And 每個步驟前有數字編號（1. 2. 3. ...）
3. **AC3:** And 步驟按順序垂直排列，易於閱讀和跟隨
4. **AC4:** And 步驟區域有明確的標題「實踐步驟」或類似標識

## Tasks / Subtasks

- [ ] Task 1: 創建 PracticeSteps 組件 (AC: #1, #2, #3, #4)
  - [ ] 1.1 創建 `src/components/coding-efficiency/PracticeSteps.tsx`
  - [ ] 1.2 接收 `steps: string[]` 作為 props
  - [ ] 1.3 渲染有序列表 (ordered list)
  - [ ] 1.4 添加「實踐步驟」標題

- [ ] Task 2: 實現步驟編號列表樣式 (AC: #2, #3)
  - [ ] 2.1 使用 `<ol>` 語義化標籤
  - [ ] 2.2 自訂編號樣式 (圓形背景數字或標準列表)
  - [ ] 2.3 適當的步驟間距 (space-y-3)
  - [ ] 2.4 步驟文字清晰易讀

- [ ] Task 3: 添加展開/收合交互（可選功能） (AC: #1)
  - [ ] 3.1 預設收合步驟區域
  - [ ] 3.2 添加「展開步驟」/「收合」按鈕
  - [ ] 3.3 使用 useState 管理展開狀態
  - [ ] 3.4 平滑的展開/收合動畫 (transition)

- [ ] Task 4: 整合到卡片組件 (AC: #1)
  - [ ] 4.1 在主推卡片中整合 PracticeSteps
  - [ ] 4.2 在備選卡片中整合 PracticeSteps
  - [ ] 4.3 驗證步驟正確渲染

## Dev Notes

### 技術規格

- **組件位置:** `src/components/coding-efficiency/PracticeSteps.tsx`
- **樣式方案:** Tailwind CSS

### PracticeSteps 組件設計

```tsx
interface PracticeStepsProps {
  steps: string[];
  defaultExpanded?: boolean;
}

const PracticeSteps: React.FC<PracticeStepsProps> = ({ 
  steps, 
  defaultExpanded = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-blue-600 hover:text-blue-800"
      >
        <span className="font-medium">實踐步驟</span>
        <span className="ml-2">{isExpanded ? '▼' : '▶'}</span>
      </button>
      
      {isExpanded && (
        <ol className="mt-3 space-y-3 list-decimal list-inside">
          {steps.map((step, index) => (
            <li key={index} className="text-gray-700">
              {step}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
```

### 自訂編號樣式 (進階選項)

```tsx
<ol className="mt-3 space-y-3">
  {steps.map((step, index) => (
    <li key={index} className="flex items-start">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 
                       text-blue-800 text-sm font-medium flex items-center 
                       justify-center mr-3">
        {index + 1}
      </span>
      <span className="text-gray-700">{step}</span>
    </li>
  ))}
</ol>
```

### 步驟資料範例

```typescript
const mockSteps = [
  "在 Claude Code 中開啟專案資料夾",
  "使用 /compact 指令清理對話上下文",
  "輸入你的編程任務，觀察回應品質提升"
];
```

### 展開/收合動畫

```tsx
<div className={`overflow-hidden transition-all duration-300 ease-in-out 
                 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
  {/* 步驟列表 */}
</div>
```

### 測試驗收

- 驗證步驟列表正確渲染
- 驗證編號順序正確 (1, 2, 3...)
- 驗證展開/收合功能正常
- 驗證標題「實踐步驟」顯示


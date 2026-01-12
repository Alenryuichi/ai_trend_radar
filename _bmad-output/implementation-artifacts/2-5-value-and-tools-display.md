# Story 2.5: 實踐價值說明與工具標籤展示

Status: ready-for-dev

## Dependencies
- **Story 2.1**: 主推卡片組件
- **Story 2.4**: 步驟展示（布局整合）

## Story

As a **開發者用戶**,
I want **了解為什麼這個實踐對我有價值，以及適用的工具和場景**,
So that **我可以判斷這個實踐是否值得投入時間**.

## Acceptance Criteria

1. **AC1:** Given 用戶正在查看某個精選的詳細內容, When 詳細內容區域展開/顯示, Then 用戶可以看到「為什麼重要」區塊，顯示 whyItMatters 內容
2. **AC2:** And 用戶可以看到適用工具列表（tools 陣列），以標籤形式展示
3. **AC3:** And 用戶可以看到相關標籤（tags 陣列），以標籤形式展示

## Tasks / Subtasks

- [ ] Task 1: 創建 WhyItMatters 區塊組件 (AC: #1)
  - [ ] 1.1 創建 `src/components/coding-efficiency/WhyItMatters.tsx`
  - [ ] 1.2 接收 `content: string` 作為 props
  - [ ] 1.3 添加「💡 為什麼重要」標題
  - [ ] 1.4 使用適當的文字樣式和間距

- [ ] Task 2: 創建 TagList 標籤組件 (AC: #2, #3)
  - [ ] 2.1 創建 `src/components/coding-efficiency/TagList.tsx`
  - [ ] 2.2 接收 `tags: string[]` 和可選 `label` 作為 props
  - [ ] 2.3 渲染水平排列的標籤列表
  - [ ] 2.4 標籤自動換行 (flex-wrap)

- [ ] Task 3: 實現工具標籤樣式 (AC: #2)
  - [ ] 3.1 工具標籤使用特定顏色 (如藍色系)
  - [ ] 3.2 添加工具圖標前綴 (🔧 或 fa-wrench)
  - [ ] 3.3 區別於一般標籤的視覺風格

- [ ] Task 4: 實現一般標籤樣式 (AC: #3)
  - [ ] 4.1 一般標籤使用中性顏色 (如灰色系)
  - [ ] 4.2 添加 # 符號前綴
  - [ ] 4.3 統一的圓角和間距

- [ ] Task 5: 整合到詳情展示區域 (AC: #1, #2, #3)
  - [ ] 5.1 在卡片詳情區域整合 WhyItMatters
  - [ ] 5.2 整合工具 TagList (tools)
  - [ ] 5.3 整合標籤 TagList (tags)
  - [ ] 5.4 確定各區塊的顯示順序和間距

## Dev Notes

### 技術規格

- **組件位置:**
  - `src/components/coding-efficiency/WhyItMatters.tsx`
  - `src/components/coding-efficiency/TagList.tsx`
- **樣式方案:** Tailwind CSS

### WhyItMatters 組件設計

```tsx
interface WhyItMattersProps {
  content: string;
}

const WhyItMatters: React.FC<WhyItMattersProps> = ({ content }) => (
  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
    <h4 className="font-medium text-yellow-800 mb-2">
      💡 為什麼重要
    </h4>
    <p className="text-gray-700 text-sm leading-relaxed">
      {content}
    </p>
  </div>
);
```

### TagList 組件設計

```tsx
interface TagListProps {
  tags: string[];
  variant?: 'tools' | 'tags';
  label?: string;
}

const TagList: React.FC<TagListProps> = ({ tags, variant = 'tags', label }) => {
  const tagStyles = {
    tools: 'bg-blue-100 text-blue-800',
    tags: 'bg-gray-100 text-gray-700'
  };
  const prefix = variant === 'tools' ? '🔧 ' : '#';

  return (
    <div className="mt-3">
      {label && <span className="text-sm text-gray-500 mr-2">{label}:</span>}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className={`px-2 py-1 text-xs rounded-full ${tagStyles[variant]}`}
          >
            {prefix}{tag}
          </span>
        ))}
      </div>
    </div>
  );
};
```

### 資料範例

```typescript
const mockPractice = {
  whyItMatters: "使用上下文壓縮技術可以讓 AI 助手在長對話中保持更好的記憶，減少重複解釋，提升編程效率 30%+",
  tools: ["Claude Code", "Cursor", "GitHub Copilot"],
  tags: ["prompt-engineering", "workflow", "context-management"]
};
```

### 區塊排列順序建議

1. 標題 + 摘要
2. 難度 + 時間
3. 「為什麼重要」區塊
4. 實踐步驟 (展開/收合)
5. 工具標籤
6. 相關標籤
7. 來源連結

### 測試驗收

- 驗證「為什麼重要」內容正確顯示
- 驗證工具標籤列表正確渲染
- 驗證相關標籤列表正確渲染
- 驗證標籤自動換行正確


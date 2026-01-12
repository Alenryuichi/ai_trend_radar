# Story 2.2: 備選精選卡片展示

Status: ready-for-dev

## Dependencies
- **Story 2.1**: DailyPracticeCard 組件和 DailyPractice 類型

## Story

As a **開發者用戶**,
I want **在主推精選下方看到 2 個備選精選卡片**,
So that **如果主推不適合我，我可以從備選中選擇其他感興趣的實踐**.

## Acceptance Criteria

1. **AC1:** Given 用戶在 Coding Efficiency 頁面查看今日精選, When 頁面載入完成, Then 用戶可以在主推卡片下方看到 2 張備選精選卡片
2. **AC2:** And 備選卡片與主推卡片使用相同的資訊結構（標題、摘要、難度、預估時間）
3. **AC3:** And 備選卡片視覺上略小於主推卡片，形成明確的主次層級

## Tasks / Subtasks

- [ ] Task 1: 創建 AlternativePracticeCard 組件 (AC: #1, #2, #3)
  - [ ] 1.1 創建 `src/components/coding-efficiency/AlternativePracticeCard.tsx`
  - [ ] 1.2 複用 DailyPracticeCard 的資料結構
  - [ ] 1.3 調整視覺尺寸 (較小的 padding, font-size)
  - [ ] 1.4 移除「今日推薦」標籤

- [ ] Task 2: 實現備選卡片網格布局 (AC: #1, #3)
  - [ ] 2.1 使用 Tailwind Grid 實現 2 欄布局
  - [ ] 2.2 響應式: 移動端單欄, 桌面端雙欄
  - [ ] 2.3 卡片間距適當 (gap-4)

- [ ] Task 3: 調整視覺層級區分 (AC: #3)
  - [ ] 3.1 備選卡片使用較淺的背景色或邊框
  - [ ] 3.2 備選卡片陰影較淺 (shadow-sm vs shadow-md)
  - [ ] 3.3 可添加「備選」小標籤區分

- [ ] Task 4: 整合到頁面布局 (AC: #1)
  - [ ] 4.1 在主推卡片下方添加「更多今日精選」區域標題
  - [ ] 4.2 渲染備選卡片列表
  - [ ] 4.3 使用 Mock 資料驗證布局

## Dev Notes

### 技術規格

- **組件位置:** `src/components/coding-efficiency/AlternativePracticeCard.tsx`
- **樣式方案:** Tailwind CSS Grid + 響應式類
- **資料結構:** 複用 `DailyPractice` interface

### 組件設計決策

使用 **變體 Props 方式**（推薦）：在現有 `DailyPracticeCard` 組件添加 `variant?: 'main' | 'alternative'` prop，而非創建獨立組件。這樣可以減少代碼重複，統一維護。

### 響應式布局

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {altPractices.map(practice => (
    <AlternativePracticeCard key={practice.id} practice={practice} />
  ))}
</div>
```

### 視覺層級對比

| 屬性 | 主推卡片 | 備選卡片 |
|------|----------|----------|
| 陰影 | shadow-md | shadow-sm |
| 內距 | p-6 | p-4 |
| 標題字體 | text-xl | text-lg |
| 背景 | bg-white | bg-gray-50 |
| 邊框 | border-2 border-blue-200 | border border-gray-200 |

### 資料結構

```typescript
// 頁面狀態
const [mainPractice, setMainPractice] = useState<DailyPractice | null>(null);
const [altPractices, setAltPractices] = useState<DailyPractice[]>([]);
```

### 測試驗收

- 驗證 2 張備選卡片正確渲染
- 驗證備選卡片資訊結構完整
- 驗證主次層級視覺差異明顯
- 驗證響應式布局在移動端/桌面端正確


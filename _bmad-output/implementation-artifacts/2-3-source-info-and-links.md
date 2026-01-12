# Story 2.3: 精選來源資訊與外部連結

Status: ready-for-dev

## Dependencies
- **Story 2.1**: DailyPracticeCard 組件
- **Story 2.2**: 備選卡片（需整合來源信息）

## Story

As a **開發者用戶**,
I want **查看每個精選的資料來源，並能點擊連結跳轉到原始資料**,
So that **我可以驗證資訊的可信度並深入閱讀原始內容**.

## Acceptance Criteria

1. **AC1:** Given 用戶正在查看任一精選卡片, When 用戶查看卡片底部資訊區域, Then 用戶可以看到來源名稱（sourceName）顯示於卡片上
2. **AC2:** And 來源名稱旁有可點擊的連結圖標或「查看原文」文字
3. **AC3:** And 點擊來源連結後，在新瀏覽器分頁開啟原始資料頁面 (sourceUrl)
4. **AC4:** And 連結使用 `rel="noopener noreferrer"` 確保安全性

## Tasks / Subtasks

- [ ] Task 1: 添加來源資訊區域到卡片組件 (AC: #1)
  - [ ] 1.1 在卡片底部設計來源資訊區域
  - [ ] 1.2 顯示來源圖標 (📄 或 fa-external-link)
  - [ ] 1.3 顯示來源名稱 (sourceName)
  - [ ] 1.4 使用分隔線或背景色區分來源區域

- [ ] Task 2: 實現外部連結組件 (AC: #2, #3, #4)
  - [ ] 2.1 創建可複用的 ExternalLink 組件 (或內聯實現)
  - [ ] 2.2 添加「查看原文」可點擊文字或圖標
  - [ ] 2.3 設定 `target="_blank"` 開啟新分頁
  - [ ] 2.4 設定 `rel="noopener noreferrer"` 安全屬性

- [ ] Task 3: 視覺與互動優化 (AC: #2)
  - [ ] 3.1 連結 hover 狀態樣式 (顏色變化/底線)
  - [ ] 3.2 添加外部連結指示圖標 (↗ 或 external-link icon)
  - [ ] 3.3 確保點擊區域足夠大 (無障礙友好)

- [ ] Task 4: 整合到主推與備選卡片 (AC: #1, #2, #3, #4)
  - [ ] 4.1 在 DailyPracticeCard 中整合來源區域
  - [ ] 4.2 在 AlternativePracticeCard 中整合來源區域
  - [ ] 4.3 驗證連結行為正確

## Dev Notes

### 技術規格

- **組件位置:** 整合於現有卡片組件內
- **安全要求:** 必須使用 `rel="noopener noreferrer"`

### ExternalLink 組件設計

```tsx
interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const ExternalLink: React.FC<ExternalLinkProps> = ({ href, children, className }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`text-blue-600 hover:text-blue-800 hover:underline ${className}`}
  >
    {children}
    <span className="ml-1">↗</span>
  </a>
);
```

### 來源區域布局

```tsx
<div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
  <div className="flex items-center text-sm text-gray-600">
    <span className="mr-1">📄</span>
    <span>來源：{practice.sourceName}</span>
  </div>
  <ExternalLink href={practice.sourceUrl}>
    查看原文
  </ExternalLink>
</div>
```

### 安全性說明

- `noopener`: 防止新頁面通過 `window.opener` 訪問原頁面
- `noreferrer`: 防止洩漏 referrer 資訊

### 常見來源名稱範例

- Anthropic Docs
- Cursor Documentation
- GitHub Copilot Guide
- Google AI Studio
- Every.to
- Community Best Practices

### 測試驗收

- 驗證來源名稱正確顯示
- 驗證點擊連結開啟新分頁
- 驗證連結安全屬性存在
- 驗證 hover 狀態視覺效果


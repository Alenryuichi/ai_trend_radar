# Story 4.4: 錯誤狀態展示與重試

## Status: ready-for-dev

## Story

**As a** 開發者用戶,
**I want** 在內容載入失敗時看到友好的錯誤提示並能手動重試,
**So that** 我能了解發生了什麼問題並知道如何處理.

## Acceptance Criteria

### AC 4.4.1: 錯誤狀態組件
**Given** 用戶訪問今日精選頁面
**When** API 請求返回錯誤
**Then** 顯示錯誤狀態組件，包含:
  - 清晰的錯誤圖示
  - 錯誤標題「載入失敗」
  - 錯誤描述
  - 「重試」按鈕

### AC 4.4.2: 重試載入狀態
**Given** 頁面顯示錯誤狀態
**When** 用戶點擊「重試」按鈕
**Then** 按鈕顯示載入中狀態
**And** 重新發起 API 請求

### AC 4.4.3: 重試成功處理
**Given** 用戶點擊重試按鈕
**When** 重試請求成功
**Then** 錯誤狀態消失，顯示正常內容
**And** FID < 100 毫秒

## Technical Notes

### 性能要求 (NFR)
- FID (First Input Delay) < 100ms
- 重試按鈕響應需立即 (無延遲)

### 錯誤圖示選項
- Emoji: ⚠️ 或 😕
- SVG icon: ExclamationCircle 或類似

### 防止重複點擊
```typescript
const [isRetrying, setIsRetrying] = useState(false);

const handleRetry = async () => {
  if (isRetrying) return; // 防止重複點擊
  setIsRetrying(true);
  try {
    await refetch();
  } finally {
    setIsRetrying(false);
  }
};
```

### 按鈕載入狀態樣式
```tsx
<button disabled={isRetrying} className="...">
  {isRetrying ? (
    <>
      <Spinner className="animate-spin mr-2" />
      重試中...
    </>
  ) : (
    '重試'
  )}
</button>
```

## Tasks

### Task 4.4.1: 創建 ErrorState 組件
- [ ] 創建 `components/coding-efficiency/ErrorState.tsx`
- [ ] 實現錯誤圖示 (使用 emoji 或 SVG)
- [ ] 實現錯誤標題「載入失敗」
- [ ] 實現錯誤描述文字 (props 傳入或預設)
- [ ] 實現「重試」按鈕
- [ ] 接收 `onRetry` callback prop

### Task 4.4.2: 實現重試按鈕邏輯
- [ ] 按鈕點擊觸發 onRetry callback
- [ ] 實現防止重複點擊邏輯
- [ ] 按鈕 disabled 時顯示載入狀態

### Task 4.4.3: 實現重試載入狀態
- [ ] 添加 `isRetrying` 狀態
- [ ] 按鈕顯示 spinner + "重試中..."
- [ ] 按鈕在載入時 disabled

### Task 4.4.4: 整合錯誤處理到數據獲取流程
- [ ] 數據 hook 提供 `error` 狀態
- [ ] 數據 hook 提供 `refetch` 方法
- [ ] 主組件根據 error 狀態顯示 ErrorState
- [ ] 傳遞 refetch 給 ErrorState.onRetry

### FID 驗證步驟
- [ ] 使用 Chrome DevTools Performance 面板測量 FID
- [ ] 確保 `onClick` 處理器無同步阻塞操作（如大量計算）
- [ ] 使用 `useTransition` 或 `startTransition` 處理非緊急更新（可選）

## Dependencies

- **Epic 1 Story 1.2**: supabaseService（錯誤處理整合）
- **Epic 2 Story 2.1**: 卡片組件（整合錯誤狀態）

## Files to Create

- `components/coding-efficiency/ErrorState.tsx`

## Files to Modify

- 數據獲取 hook (確保 error 和 refetch 可用)
- `components/coding-efficiency/DailyPracticeSection.tsx` (添加錯誤 UI)

## Component Structure

```tsx
// ErrorState.tsx
interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ErrorState({ 
  message = '無法載入今日精選內容，請檢查網絡連接後重試。',
  onRetry,
  isRetrying = false
}: ErrorStateProps) {
  return (
    <div className="text-center py-12">
      {/* 錯誤圖示 */}
      <div className="text-5xl mb-4">😕</div>
      
      {/* 錯誤標題 */}
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        載入失敗
      </h3>
      
      {/* 錯誤描述 */}
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {message}
      </p>
      
      {/* 重試按鈕 */}
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg
                   hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200"
      >
        {isRetrying ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            重試中...
          </>
        ) : (
          '重試'
        )}
      </button>
    </div>
  );
}
```

## Usage Example

```tsx
// DailyPracticeSection.tsx
function DailyPracticeSection() {
  const { data, isLoading, error, refetch } = useDailyPractice();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refetch();
    } finally {
      setIsRetrying(false);
    }
  };

  if (error) {
    return <ErrorState onRetry={handleRetry} isRetrying={isRetrying} />;
  }

  // ... rest of component
}
```

## Definition of Done

- [ ] ErrorState 組件創建完成
- [ ] 錯誤圖示、標題、描述、按鈕都正確顯示
- [ ] 重試按鈕防止重複點擊
- [ ] 載入狀態正確顯示 spinner
- [ ] 重試成功後正確切換到內容顯示
- [ ] FID < 100ms (Lighthouse 測試)
- [ ] 暗色模式正常顯示


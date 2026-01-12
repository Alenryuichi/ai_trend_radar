# Story 1.2: Supabase 服務層實現

Status: review

## Story

As a 後端開發者,
I want 擁有封裝好的 Supabase 服務模組,
So that 可以透過統一介面操作 daily_practices 資料.

## Acceptance Criteria (AC)

1. **AC1**: Given Supabase 基礎設施已設置完成, When 建立 services/supabaseService.ts, Then:
   - 模組匯出 supabase client 實例
   - 模組提供方法: `saveDailyPractice(data)`, `getDailyPractice(date)`, `getPracticeHistory(days)`

2. **AC2**: Given 呼叫 saveDailyPractice 方法, When 傳入有效的精選內容資料, Then:
   - 資料成功寫入 daily_practices 表
   - 回傳包含 id 的完整記錄

3. **AC3**: Given 呼叫 getDailyPractice 方法:
   - When 傳入存在的日期, Then 回傳該日期的精選內容
   - When 傳入不存在的日期, Then 回傳 null

## Tasks / Subtasks

- [x] Task 1: 創建 Supabase 服務文件 (AC: #1)
  - [x] 創建 `services/supabaseService.ts`（注意：源碼在根目錄，非 src/）
  - [x] 初始化 supabase client
  - [x] 處理環境變數讀取

- [x] Task 2: 定義 TypeScript 類型 (AC: #1, #2, #3)
  - [x] 在 `types.ts` 添加 `DailyPractice` interface
  - [x] 在 `types.ts` 添加 `DailyPracticeRecord` interface (資料庫記錄)
  - [x] 定義 `ApiResult<T>` 通用響應類型
  - [x] 添加 `PracticeStatus` 和 `PracticeStatusRecord` 類型

- [x] Task 3: 實現 saveDailyPractice 方法 (AC: #2)
  - [x] 接收 DailyPractice 數據
  - [x] 調用 Supabase insert
  - [x] 處理錯誤並返回結果

- [x] Task 4: 實現 getDailyPractice 方法 (AC: #3)
  - [x] 接收 date 參數（格式: YYYY-MM-DD）
  - [x] 查詢 daily_practices 表
  - [x] 找到則返回數據，否則返回 null
  - [x] 添加 getTodayPractice 便捷方法

- [x] Task 5: 實現 getPracticeHistory 方法 (AC: #1)
  - [x] 接收 days 參數（預設 7 天）
  - [x] 查詢最近 N 天的記錄
  - [x] 按日期降序排列

## Dev Notes

### 技術參考

**來自架構文檔 (architecture.md):**

```typescript
// services/supabaseService.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**DailyPractice 數據模型:**

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

**ApiResult 響應格式:**

```typescript
interface ApiResult<T> {
  data: T | null;
  error: string | null;
  fromCache: boolean;
}
```

### 文件位置

```
src/
└── services/
    ├── geminiService.ts    # 現有
    └── supabaseService.ts  # 新增
```

### 服務層實現模式

```typescript
// 範例: saveDailyPractice
export async function saveDailyPractice(
  date: string,
  mainPractice: DailyPractice,
  altPractices: DailyPractice[],
  aiModel: string
): Promise<ApiResult<DailyPracticeRecord>> {
  const { data, error } = await supabase
    .from('daily_practices')
    .insert({
      date,
      main_practice: mainPractice,
      alt_practices: altPractices,
      ai_model: aiModel,
      generation_status: 'success'
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message, fromCache: false };
  }
  return { data, error: null, fromCache: false };
}
```

### 命名規範

- 資料庫欄位: snake_case (`main_practice`, `alt_practices`)
- TypeScript 屬性: camelCase (`mainPractice`, `altPractices`)
- Supabase 會自動處理轉換

### 依賴關係

- 依賴 Story 1.1: Supabase 基礎設施設置
- 被依賴: Story 1.4 (Vercel Cron API Route)

### 驗收檢查清單

- [ ] supabaseService.ts 可被正確 import
- [ ] supabase client 初始化無錯誤
- [ ] saveDailyPractice 可寫入數據
- [ ] getDailyPractice 可正確查詢
- [ ] getPracticeHistory 返回正確排序的歷史記錄
- [ ] 所有方法都有正確的 TypeScript 類型

### 錯誤處理

- 網絡錯誤: 返回 `{ data: null, error: '網絡連接失敗', fromCache: false }`
- 查詢無結果: 返回 `{ data: null, error: null, fromCache: false }`
- 寫入失敗: 返回具體錯誤訊息


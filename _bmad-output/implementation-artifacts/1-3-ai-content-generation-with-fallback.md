# Story 1.3: AI 內容生成服務（含多模型 Fallback）

Status: review

## Dependencies
- **Story 1.2**: Supabase 服務層（類型定義、客戶端）

## Story

As a 系統,
I want 能夠呼叫 AI 模型生成編程精選內容，並在失敗時自動切換備用模型,
So that 確保每日內容生成的高可用性.

## Acceptance Criteria (AC)

1. **AC1**: Given 內容生成服務已建立, When 呼叫主要模型 (DeepSeek) 成功, Then:
   - 回傳生成的 AI Coding 精選內容
   - 記錄使用的模型為 "deepseek"

2. **AC2**: Given 主要模型 (DeepSeek) 呼叫失敗, When 系統自動嘗試第一備用模型 (Zhipu), Then:
   - 若成功則回傳內容
   - 記錄模型為 "zhipu"

3. **AC3**: Given DeepSeek 和 Zhipu 都失敗, When 系統自動嘗試第二備用模型 (Aliyun), Then:
   - 若成功則回傳內容
   - 記錄模型為 "aliyun"

4. **AC4**: Given 所有三個模型都失敗, When 內容生成請求完成, Then:
   - 拋出明確的錯誤訊息
   - 包含所有失敗原因

## Tasks / Subtasks

- [x] Task 1: 創建 AI 生成服務文件 (AC: #1-#4)
  - [x] 創建 `api/services/aiGenerationService.ts`（Serverless 環境）
  - [x] 定義生成結果的 TypeScript 類型

- [x] Task 2: 實現 DeepSeek API 調用 (AC: #1)
  - [x] 配置 DeepSeek API 端點
  - [x] 實現 `generateWithDeepSeek()` 函數
  - [x] 處理 API 響應和錯誤

- [x] Task 3: 實現 Zhipu API 調用 (AC: #2)
  - [x] 配置 Zhipu API 端點
  - [x] 實現 `generateWithZhipu()` 函數
  - [x] 處理 API 響應和錯誤

- [x] Task 4: 實現 Aliyun API 調用 (AC: #3)
  - [x] 配置 Aliyun API 端點
  - [x] 實現 `generateWithAliyun()` 函數
  - [x] 處理 API 響應和錯誤

- [x] Task 5: 實現多模型 Fallback 邏輯 (AC: #1-#4)
  - [x] 創建 `generateDailyContent()` 主函數
  - [x] 實現 DeepSeek → Zhipu → Aliyun 順序調用
  - [x] 收集所有失敗原因
  - [x] 返回成功結果或完整錯誤訊息

- [x] Task 6: 定義 Prompt 模板 (AC: #1-#3)
  - [x] 創建每日精選內容的 prompt
  - [x] 定義輸出 JSON 結構要求
  - [x] 確保 prompt 適用於三個模型

- [x] Task 7: 配置環境變數 (AC: #1-#3)
  - [x] 添加 DEEPSEEK_API_KEY（已在 .env.example）
  - [x] 添加 ZHIPU_API_KEY（已在 .env.example）
  - [x] 添加 ALIYUN_API_KEY（已在 .env.example）
  - [x] 更新 .env.example（已包含所有配置）

## Dev Notes

### ⚠️ 重要環境說明

此服務運行於 **Vercel Serverless 環境** (Node.js)，與前端環境不同：
- ✅ 使用 `process.env.DEEPSEEK_API_KEY` (Serverless)
- ❌ 不使用 `import.meta.env.VITE_*` (僅前端)

### 與現有服務的關係

| 服務 | 用途 | 環境 |
|------|------|------|
| `geminiService.ts` | 前端交互式 AI 調用 | 瀏覽器 |
| `aiGenerationService.ts` | 後端 Cron 批量生成 | Serverless |

**本服務是新建獨立模組，不修改現有 geminiService.ts**

### 技術參考

**來自架構文檔 (architecture.md):**

Fallback 順序: DeepSeek → Zhipu → Aliyun

**現有 AI 模型配置 (types.ts):**

```typescript
export const INTELLIGENCE_CORES: IntelligenceCore[] = [
  { id: 'deepseek-chat', provider: 'deepseek' },
  { id: 'glm-4-plus', provider: 'zhipu' },
  { id: 'qwen-plus', provider: 'aliyun' }
];
```

### Prompt 模板

```
你是一位 AI 輔助編程專家。請生成今日的「AI 編程最佳實踐」推薦。

要求：
1. 生成 1 個主推薦和 2 個備選推薦
2. 每個推薦必須包含：
   - title: 標題（15字以內）
   - summary: 簡述（50字以內）
   - difficulty: 難度（beginner/intermediate/advanced）
   - estimatedMinutes: 預計時間（分鐘）
   - steps: 實踐步驟（3-5步）
   - whyItMatters: 為何重要
   - tools: 相關工具
   - tags: 標籤

請以 JSON 格式輸出：
{
  "mainPractice": {...},
  "altPractices": [{...}, {...}]
}
```

### 生成結果類型

```typescript
interface GenerationResult {
  mainPractice: DailyPractice;
  altPractices: DailyPractice[];
  model: 'deepseek' | 'zhipu' | 'aliyun';
}
```

### API 配置

| 模型 | 端點 | 環境變數 |
|------|------|----------|
| DeepSeek | https://api.deepseek.com/v1/chat/completions | DEEPSEEK_API_KEY |
| Zhipu | https://open.bigmodel.cn/api/paas/v4/chat/completions | ZHIPU_API_KEY |
| Aliyun | https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation | ALIYUN_API_KEY |

### Fallback 實現模式

```typescript
export async function generateDailyContent(): Promise<GenerationResult> {
  const errors: string[] = [];
  
  // 嘗試 DeepSeek
  try {
    const result = await generateWithDeepSeek();
    return { ...result, model: 'deepseek' };
  } catch (e) {
    errors.push(`DeepSeek: ${e.message}`);
  }
  
  // 嘗試 Zhipu
  try {
    const result = await generateWithZhipu();
    return { ...result, model: 'zhipu' };
  } catch (e) {
    errors.push(`Zhipu: ${e.message}`);
  }
  
  // 嘗試 Aliyun
  try {
    const result = await generateWithAliyun();
    return { ...result, model: 'aliyun' };
  } catch (e) {
    errors.push(`Aliyun: ${e.message}`);
  }
  
  throw new Error(`所有模型都失敗: ${errors.join('; ')}`);
}
```

### 依賴關係

- 依賴: Story 1.2 的 DailyPractice 類型定義
- 被依賴: Story 1.4 (Vercel Cron API Route)

### 驗收檢查清單

- [ ] generateWithDeepSeek() 可正常調用（需 API Key）
- [ ] generateWithZhipu() 可正常調用（需 API Key）
- [ ] generateWithAliyun() 可正常調用（需 API Key）
- [ ] Fallback 邏輯正確切換模型
- [ ] 全部失敗時錯誤訊息完整
- [ ] 返回的數據符合 DailyPractice 結構


# Story 1.4: Vercel Cron API Route 實現

Status: review

## Dependencies
- **Story 1.2**: Supabase 服務層
- **Story 1.3**: AI 內容生成服務

## Story

As a 系統管理員,
I want 每日自動觸發內容生成流程,
So that 無需人工介入即可產出每日精選內容.

## Acceptance Criteria (AC)

1. **AC1**: Given api/cron/daily-practice.ts 已建立, When 收到帶有正確 CRON_SECRET 的請求, Then:
   - 執行每日內容生成流程
   - 回傳 200 狀態碼與成功訊息

2. **AC2**: Given 收到請求但 CRON_SECRET 不匹配, When 驗證授權, Then:
   - 回傳 401 狀態碼
   - 不執行任何生成邏輯

3. **AC3**: Given 今日內容尚未生成, When Cron 觸發執行, Then:
   - 呼叫 AI 生成內容（1 主推 + 2 備選）
   - 儲存到 daily_practices 表

4. **AC4**: Given vercel.json 配置, When 部署到 Vercel, Then:
   - Cron 排程設定為每日 UTC 00:00 執行

## Tasks / Subtasks

- [x] Task 1: 創建 API Route 目錄結構 (AC: #1)
  - [x] 安裝 @vercel/node 類型依賴: `npm install -D @vercel/node`
  - [x] 創建 `api/cron/` 目錄
  - [x] 創建 `api/cron/daily-practice.ts`

- [x] Task 2: 實現 CRON_SECRET 驗證 (AC: #1, #2)
  - [x] 讀取 Authorization header
  - [x] 比對 CRON_SECRET 環境變數
  - [x] 未授權時返回 401

- [x] Task 3: 整合 AI 生成服務 (AC: #3)
  - [x] 導入 aiGenerationService
  - [x] 調用 generateDailyContent()
  - [x] 處理生成失敗情況

- [x] Task 4: 整合 Supabase 存儲服務 (AC: #3)
  - [x] 創建 supabaseServerService（Serverless 專用）
  - [x] 檢查今日是否已生成
  - [x] 調用 saveDailyPractice 存儲

- [x] Task 5: 創建 vercel.json 配置 (AC: #4)
  - [x] 配置 Cron 路徑
  - [x] 設定執行時間 "0 0 * * *"

- [x] Task 6: 配置 CRON_SECRET 環境變數 (AC: #1, #2)
  - [x] CRON_SECRET 已在 .env.example
  - [x] 添加 SUPABASE_URL 到 .env.example
  - [ ] 待部署: 在 Vercel Dashboard 配置生產環境變數

## Dev Notes

### ⚠️ Vercel Serverless 環境重要說明

**此代碼運行於 Node.js (Vercel Serverless)，與 Vite 前端環境不同：**

| 特性 | Serverless (api/) | 前端 (src/) |
|------|------------------|-------------|
| 環境變數 | `process.env.*` | `import.meta.env.VITE_*` |
| 模組系統 | CommonJS / ESM | ESM only |
| Runtime | Node.js 18+ | Browser |

**不要使用：**
- ❌ `import.meta.env`
- ❌ Next.js App Router 的 `export async function GET()`

**正確使用：**
- ✅ `process.env.CRON_SECRET`
- ✅ `export default async function handler(req, res)`
- ✅ `@vercel/node` 類型

### 完整 API Route 實現（正確的 Vercel Serverless 語法）

```typescript
// api/cron/daily-practice.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

// 注意：Serverless 環境使用 process.env
const CRON_SECRET = process.env.CRON_SECRET;

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // 驗證授權
  const authHeader = request.headers.authorization;
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 動態導入服務（Serverless 環境需要）
    const { generateDailyContent } = await import('../services/aiGenerationService');
    const { saveDailyPractice, getDailyPractice } = await import('../services/supabaseService');

    const today = new Date().toISOString().split('T')[0];

    // 檢查今日是否已生成
    const existing = await getDailyPractice(today);
    if (existing) {
      return response.status(200).json({
        message: 'Already generated for today',
        date: today
      });
    }

    // 生成內容
    const content = await generateDailyContent();

    // 儲存到 Supabase
    await saveDailyPractice({
      date: today,
      main_practice: content.mainPractice,
      alt_practices: content.altPractices,
      ai_model: content.modelUsed,
      generation_status: 'success'
    });

    return response.status(200).json({
      success: true,
      date: today,
      model: content.modelUsed
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return response.status(500).json({
      error: 'Generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

### Vercel Cron 配置

```json
{
  "buildCommand": "npm run build",
  "framework": "vite",
  "crons": [
    {
      "path": "/api/cron/daily-practice",
      "schedule": "0 0 * * *"
    }
  ]
}
```

*Note: `0 0 * * *` = 每日 UTC 00:00 (北京時間 08:00)*

### 文件結構

```
專案根目錄/
├── api/
│   └── cron/
│       └── daily-practice.ts    # Vercel Cron Handler
├── vercel.json                  # Cron 配置
└── .env.local
    └── CRON_SECRET=your-secret-here
```

### 環境變數

| 變數名 | 用途 | 範例值 |
|--------|------|--------|
| CRON_SECRET | Cron 任務驗證密鑰 | `random-32-char-string` |

生成安全密鑰：
```bash
openssl rand -hex 32
```

### 依賴關係

- 依賴: Story 1.2 (Supabase 服務層)
- 依賴: Story 1.3 (AI 內容生成服務)

### Vercel Cron 限制

- 免費層: 每天最多 1 次執行
- 執行超時: 10 秒（Hobby）/ 60 秒（Pro）
- 需在 Vercel Dashboard 確認 Cron 已啟用

### 驗收檢查清單

- [ ] API Route 可通過 curl 測試
- [ ] 正確 CRON_SECRET 返回 200
- [ ] 錯誤 CRON_SECRET 返回 401
- [ ] 今日已生成時不重複生成
- [ ] AI 生成內容正確存儲
- [ ] vercel.json 配置正確
- [ ] 部署後 Cron 正常執行

### 測試命令

```bash
# 本地測試（需先設置環境變數）
curl -H "Authorization: Bearer your-secret" \
  http://localhost:3000/api/cron/daily-practice

# 驗證 401
curl http://localhost:3000/api/cron/daily-practice
# 應返回 Unauthorized
```


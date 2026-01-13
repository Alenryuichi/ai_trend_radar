---
title: 'TrendRadar 數據採集整合'
slug: 'trendradar-data-integration'
created: '2026-01-12'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack:
  - TypeScript 5.8.2
  - React 19.2.3
  - Vite 6.2.0
  - Vercel Serverless (@vercel/node 5.5.16)
  - Supabase PostgreSQL (@supabase/supabase-js 2.90.1)
  - rss-parser (新增)
files_to_modify:
  - supabase/migrations/002_create_raw_trends.sql (新增)
  - api/services/rssService.ts (新增)
  - api/cron/daily-practice.ts (修改 - 整合 RSS 採集 + scenarioTags)
  - types.ts (修改 - 新增 RawTrend 類型)
code_patterns:
  - Vercel Cron API Route with CRON_SECRET auth
  - Supabase Lazy Init pattern
  - Multi-model AI fallback (DeepSeek → Zhipu → Aliyun)
  - ApiResult<T> response wrapper
test_patterns:
  - curl 測試 Cron endpoints
  - Supabase Dashboard 驗證
  - Vercel Logs 監控
---

# Tech-Spec: TrendRadar 數據採集整合

**Created:** 2026-01-12

## Overview

### Problem Statement

現有 `/api/cron/daily-practice` 完全依賴 AI 生成內容，存在以下問題：
1. **幻覺風險** - AI 可能生成不存在的工具、錯誤的 URL
2. **無真實來源** - 無法追溯到原始資料
3. **時效性差** - 依賴 AI 知識截止日期，無法反映最新動態

### Solution

整合 RSS/RSSHub 真實數據採集能力到現有 Vercel + Supabase 架構：
1. 新增 `raw_trends` 表存儲原始採集數據
2. 改造 `/api/cron/daily-practice` 整合 RSS 採集 + AI 生成（單一 Cron，適配 Hobby 層限制）
3. AI 基於真實數據生成精選，保留降級機制

### Scope

**In Scope:**
- `raw_trends` 表設計與遷移腳本
- RSS/RSSHub 數據採集服務 (`rssService.ts`)
- 改造 daily-practice Cron（整合採集 + 生成）
- 數據自動清理機制（保留 30 天）

**Out of Scope:**
- MCP Server 整合
- 對話式分析 UI
- 推送通知功能
- 知乎/微博直接爬蟲（使用 RSSHub 代理）

## Context for Development

### Codebase Patterns

**現有模式（必須遵循）：**
- Vercel API Route: `api/cron/*.ts` 使用 `VercelRequest/VercelResponse`
- Supabase 初始化: Lazy init pattern，使用 `process.env`
- AI Fallback: DeepSeek → Zhipu → Aliyun 順序
- 錯誤處理: try-catch + console.error + JSON response

**命名規範：**
- 數據庫表: snake_case (`raw_trends`)
- TypeScript 接口: PascalCase (`RawTrend`)
- 服務函數: camelCase (`syncTrendsFromRSS`)

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `api/cron/daily-practice.ts` | 現有 Cron 實現，需改造 |
| `supabase/migrations/001_create_daily_practices.sql` | 遷移腳本模式參考 |
| `services/supabaseService.ts` | 前端 Supabase 服務模式 |
| `types.ts` | 類型定義，需擴展 RawTrend |
| `vercel.json` | Cron 配置（無需修改，使用現有 daily-practice） |

### Technical Decisions

1. **RSS 解析方案**:
   - **主方案**: 使用 `rss-parser` (輕量、TypeScript 支持)
   - **Fallback**: 如遇兼容性問題，改用 `fetch` + 正則解析簡單 RSS 結構
   - **驗證**: Task 1 後立即在 Vercel Dev 測試兼容性
2. **RSSHub 實例**: 使用公共實例 `rsshub.app`（可通過環境變數配置自建）
3. **單一 Cron**: 因 Vercel Hobby 層限制，採集 + 生成合併在同一 Cron
4. **數據保留**: 30 天清理，在每次採集時執行 DELETE 語句
5. **重複處理**: 使用 `ON CONFLICT (link) DO NOTHING` 忽略重複

### Data Sources Configuration (Party Mode 決策)

| 優先級 | 數據源 | URL | 類型 | Timeout | 備註 |
|--------|--------|-----|------|---------|------|
| **P0** | every.to | `https://every.to/feed.xml` | 直接 RSS | 2s | ✅ 已驗證存在 |
| **P0** | Anthropic News | `https://rsshub.app/anthropic/news` | RSSHub | 2s | ⚠️ 路由存在但公共實例不穩定 |
| **P1** | Hacker News AI | `https://hnrss.org/newest?q=AI+LLM+coding&count=20&points=10` | 直接 RSS | 2s | ✅ 穩定 |
| **P1** | GitHub Trending | `https://rsshub.app/github/trending/daily` | RSSHub | 2s | ✅ 穩定 |

**注意**: Anthropic 路由在公共實例可能不可用，建議：
1. 優先使用直接 RSS 源（every.to, HN）
2. 考慮自建 RSSHub 實例
3. 或改用 Anthropic 官網 RSS（如有）

### Architecture Decisions (Party Mode 決策)

1. **單一 Cron 策略** - 因 Vercel Hobby 層限制（每日 1 次），合併 sync + generate 為單一 Cron
2. **並行採集** - 4 源完全並行 `Promise.allSettled`，任何源失敗不阻塞
3. **激進超時** - 每源 2s timeout，總採集控制在 3s 內
4. **降級保底** - 如果所有源失敗，回退到現有純 AI 生成邏輯
5. **環境變數控制** - `RSSHUB_BASE_URL` 可配置自建實例
6. **ScenarioTags 整合** - raw_trends 新增 `inferred_tags` 字段，AI Prompt 基於真實數據生成

### ScenarioTags 整合 (Party Mode 決策 #2)

**來源標籤映射：**
| 數據源 | 預分配標籤 |
|--------|------------|
| every.to | `productivity`, `prompt-engineering` |
| Anthropic | `prompt-engineering`, `learning` |
| GitHub Trending | `productivity`, `refactoring` |
| Hacker News | (需 AI 判斷) |

**raw_trends 表設計：**
```sql
CREATE TABLE raw_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  link TEXT UNIQUE NOT NULL,
  content TEXT,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  inferred_tags TEXT[]
);

-- 索引優化
CREATE INDEX idx_raw_trends_fetched_at ON raw_trends(fetched_at DESC);
CREATE INDEX idx_raw_trends_source ON raw_trends(source);

-- 30 天自動清理（在每次 Cron 執行時調用）
DELETE FROM raw_trends WHERE fetched_at < NOW() - INTERVAL '30 days';

-- 處理重複插入
INSERT INTO raw_trends (source, title, link, content, published_at, inferred_tags)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (link) DO NOTHING;
```

**注意：已移除 `is_processed` 字段（無明確用途）**

## Implementation Plan

### Tasks

- [ ] **Task 1: 安裝並驗證依賴**
  - Action: `npm install rss-parser`
  - **驗證步驟**:
    1. 創建臨時測試文件驗證 Vercel Serverless 兼容性
    2. 運行 `vercel dev` 確認無模組解析錯誤
    3. 如不兼容，改用 `fetch` + XML 正則解析
  - Notes: rss-parser 使用 Node.js 原生模組，需驗證 Vercel 環境

- [ ] **Task 2: 創建 raw_trends 表遷移**
  - File: `supabase/migrations/002_create_raw_trends.sql`
  - Action: 創建表結構，包含 `inferred_tags` 和 30 天自動清理
  - Notes: 參考 `001_create_daily_practices.sql` 模式

- [ ] **Task 3: 新增 RawTrend 類型定義**
  - File: `types.ts`
  - Action: 新增 `RawTrend` 和 `RawTrendRecord` 接口
  - Notes: 與 `DailyPractice` 類型風格一致

- [ ] **Task 4: 創建 RSS 解析服務**
  - File: `api/services/rssService.ts`
  - Action: 實現 `fetchRSSFeeds()` 並行採集 4 源
  - Notes:
    - 使用 `Promise.allSettled` 並行
    - 每源 2s timeout（使用 AbortController）
    - 返回標準化 `RawTrend[]`
    - **根據 source 分配 inferred_tags**：
      ```typescript
      import { ScenarioTag } from '../../types';

      const SOURCE_TAGS: Record<string, ScenarioTag[]> = {
        'every.to': ['productivity', 'prompt-engineering'],
        'anthropic': ['prompt-engineering', 'learning'],
        'github': ['productivity', 'refactoring'],
        'hackernews': [] // AI 判斷
      };
      ```

- [ ] **Task 5: 改造 daily-practice Cron**
  - File: `api/cron/daily-practice.ts`
  - Action:
    1. 調用 `fetchRSSFeeds()` 採集數據
    2. **執行 30 天清理**: `DELETE FROM raw_trends WHERE fetched_at < NOW() - INTERVAL '30 days'`
    3. 使用 `ON CONFLICT DO NOTHING` 插入 raw_trends
    4. **讀取 raw_trends**（最多 10 條，按 fetched_at DESC）
       - ⚠️ **首次執行說明**: 第一天 raw_trends 為空，會直接 fallback 到純 AI 生成（符合預期）
       - 之後每天會有累積數據可用
    5. 修改 AI Prompt，嵌入真實數據上下文
    6. 保留現有 fallback 邏輯（採集失敗或無數據時純 AI 生成）
  - **AI Prompt 修改示例**:
    ```
    基於以下真實熱點數據生成今日推薦：

    ${rawTrends.map(t => `- [${t.source}] ${t.title}: ${t.link}`).join('\n')}

    要求：
    1. 優先基於上述真實數據生成推薦
    2. sourceUrl 和 sourceName 必須來自真實數據
    3. 如數據不足，可補充 AI 知識，但 sourceUrl 留空
    4. 每個推薦必須包含 scenarioTags（1-3 個）
    ```
  - Notes: 保持現有 CRON_SECRET 驗證和錯誤處理模式

- [ ] **Task 6: 執行 Supabase 遷移**
  - Action: 在 Supabase Dashboard 執行 002 遷移腳本
  - Notes: 驗證表創建成功

- [ ] **Task 7: 本地測試**
  - Action: 使用 curl 測試 `/api/cron/daily-practice`
  - Notes: 驗證 RSS 採集 + AI 生成完整流程

- [ ] **Task 8: 部署驗證**
  - Action: 部署到 Vercel Preview，觸發 Cron 測試
  - Notes: 檢查 Vercel Logs 和 Supabase 數據

### Acceptance Criteria

- [ ] **AC 1**: Given RSS 源正常，When Cron 執行，Then `raw_trends` 表有新數據且 `daily_practices` 基於真實數據生成
- [ ] **AC 2**: Given 單個 RSS 源超時，When Cron 執行，Then 其他源數據正常採集，不阻塞整體流程
- [ ] **AC 3**: Given 所有 RSS 源失敗，When Cron 執行，Then 回退到純 AI 生成（現有邏輯），日誌記錄降級原因
- [ ] **AC 4**: Given `raw_trends` 有數據，When AI 生成，Then `DailyPractice.sourceUrl` 和 `sourceName` 來自真實數據
- [ ] **AC 5**: Given `raw_trends` 數據超過 30 天，When 清理觸發，Then 過期數據被刪除
- [ ] **AC 6**: Given 重複 RSS 條目（相同 link），When 採集，Then 不插入重複數據（UNIQUE 約束）

## Additional Context

### Dependencies

**新增依賴：**
```bash
npm install rss-parser
```

**環境變數（可選）：**
```
RSSHUB_BASE_URL=https://rsshub.app  # 可配置自建實例
```

### Testing Strategy

**本地測試：**
```bash
# 1. 設置環境變數
export CRON_SECRET=test-secret
export SUPABASE_URL=xxx
export SUPABASE_SERVICE_ROLE_KEY=xxx
export DEEPSEEK_API_KEY=xxx

# 2. 啟動 Vercel Dev
vercel dev

# 3. 觸發 Cron
curl -H "Authorization: Bearer test-secret" http://localhost:3000/api/cron/daily-practice
```

**驗證點：**
- [ ] Supabase `raw_trends` 表有新數據
- [ ] Supabase `daily_practices` 表有新記錄
- [ ] `main_practice.sourceUrl` 非空
- [ ] Vercel Logs 無錯誤

### Risk Assessment

| ID | 風險 | 概率 | 影響 | 緩解 | 狀態 |
|----|------|------|------|------|------|
| R1 | RSS 源響應慢導致 10s 超時 | 中 | 高 | 激進 2s timeout + 並行 | ✅ 已規劃 |
| R2 | RSSHub 公共實例限流 | 中 | 中 | 環境變數支持自建實例 | ✅ 已規劃 |
| R3 | AI Prompt 過長超出 token 限制 | 低 | 中 | 限制 raw_trends 最多 10 條 | ✅ 已規劃 |
| R4 | rss-parser Vercel 不兼容 | 中 | 高 | Task 1 驗證 + fetch fallback | ✅ 已規劃 |
| R5 | Anthropic RSSHub 路由不穩定 | 高 | 低 | 作為 P0 但允許失敗，不阻塞 | ✅ 已規劃 |

### Notes

- RSSHub 公共實例可能有速率限制，生產環境建議自建
- Vercel Hobby 層 Cron 每天最多 1 次，需升級 Pro 支持多次
- 未來可擴展：MCP Server 整合、對話式分析 UI


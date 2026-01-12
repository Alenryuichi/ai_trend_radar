---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: complete
completedAt: '2026-01-11'
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "docs/index.md"
  - "docs/architecture.md"
workflowType: 'architecture'
project_name: 'LLMPulse'
user_name: 'alenryuichi'
date: '2026-01-11'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- 26 個功能需求分為 7 個類別
- 核心能力：今日精選展示、實踐追蹤、歷史瀏覽、內容自動化
- 用戶交互：標記已實踐、查看詳情、響應式適配
- 系統能力：Vercel Cron 自動生成、Supabase 存儲、多模型 fallback

**Non-Functional Requirements:**
- 性能：LCP < 2.5s, FID < 100ms, CLS < 0.1
- 可靠性：99% 可用性, > 95% Cron 成功率
- 存儲：< 100MB Supabase 使用量 (3個月)
- 無障礙：基礎 WCAG AA 合規

**Scale & Complexity:**
- Primary domain: Full-stack (React SPA + Serverless)
- Complexity level: Low-Medium
- Estimated architectural components: 5-7 個主要組件

### Technical Constraints & Dependencies

| 類型 | 約束 |
|------|------|
| 平台限制 | Supabase 免費層 500MB, Vercel Cron 每日 1 次 |
| 現有架構 | 需與現有 React 19 + Vite 6 技術棧整合 |
| 認證 | 無用戶系統，使用 LocalStorage |
| 安全性 | 需解決 API 金鑰暴露問題 |

### Cross-Cutting Concerns Identified

1. **緩存一致性** - LocalStorage 與 Supabase 數據同步
2. **錯誤恢復** - 多層降級策略 (AI fallback → 緩存 → 錯誤提示)
3. **狀態管理** - 實踐追蹤狀態跨組件共享
4. **響應式適配** - 三斷點 (Mobile < 640px, Tablet 640-1024px, Desktop > 1024px)

## Starter Template Evaluation

### Primary Technology Domain

Brownfield 項目增強 - 基於現有 React 19 + TypeScript + Vite 6 技術棧

### Starter Options Considered

由於這是現有系統的功能增強 (Brownfield)，不需要選擇新的 Starter Template。
技術棧已由現有項目確定。

### Selected Approach: 增量擴展

**Rationale:**
- 保持與現有代碼庫的一致性
- 最小化重構風險
- 複用現有組件和服務架構

**新增依賴：**

| 包名 | 版本 | 用途 |
|------|------|------|
| `@supabase/supabase-js` | ^2.90.1 | Supabase PostgreSQL 客戶端 |

**初始化命令：**

```bash
npm install @supabase/supabase-js
```

### Architectural Decisions From Existing Stack

**Language & Runtime:**
- TypeScript 5.8.2 (strict mode)
- React 19.2.3
- Node.js (Vercel Serverless Functions)

**Styling Solution:**
- Tailwind CSS via CDN (現有模式)

**Build Tooling:**
- Vite 6.2.0 (現有配置)

**Code Organization:**
- 現有：`components/`, `services/`
- 新增：`api/cron/` (Vercel API Routes)

**Note:** Supabase 依賴安裝應作為第一個實現故事。

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Supabase PostgreSQL 作為內容存儲
- Vercel Cron 作為定時任務引擎
- LocalStorage 作為用戶實踐狀態存儲

**Important Decisions (Shape Architecture):**
- 新增 API Route 層處理 Cron 任務
- 前端組件擴展策略
- 緩存與數據同步策略

**Deferred Decisions (Post-MVP):**
- 用戶認證系統
- 個性化推薦引擎
- 實踐統計看板

### Data Architecture

**Database: Supabase PostgreSQL**
- Version: Supabase 免費層 (500MB)
- Rationale: 零成本、即時 REST API、TypeScript 類型生成

**Schema Design:**

```sql
-- 今日精選內容表
CREATE TABLE daily_practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  main_practice JSONB NOT NULL,      -- 主推精選
  alt_practices JSONB[] NOT NULL,    -- 備選精選 (2個)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ai_model VARCHAR(50),              -- 生成模型
  generation_status VARCHAR(20)      -- success/failed/pending
);

-- 索引優化
CREATE INDEX idx_daily_practices_date ON daily_practices(date DESC);
```

**Data Model (TypeScript):**

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

**Caching Strategy:**
- LocalStorage 緩存今日精選 (key: `llmpulse_daily_practice_${date}`)
- 緩存有效期: 24 小時
- 優先讀取緩存，失敗時 fallback 到 Supabase

### Authentication & Security

**Authentication:** 無 (MVP 階段)
- 使用 LocalStorage 存儲用戶實踐狀態
- 無跨設備同步需求

**API Security:**
- Supabase Row Level Security (RLS): 公開讀取，禁止匿名寫入
- Cron API Route: 使用 `CRON_SECRET` 環境變數驗證

```typescript
// api/cron/daily-practice.ts
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  // ... 生成內容邏輯
}
```

**環境變數管理:**

| 變數名 | 用途 | 存儲位置 |
|--------|------|----------|
| `SUPABASE_URL` | Supabase 項目 URL | Vercel Environment |
| `SUPABASE_ANON_KEY` | Supabase 匿名金鑰 | Vercel Environment |
| `CRON_SECRET` | Cron 任務驗證 | Vercel Environment |
| `API_KEY` | Gemini API Key | Vercel Environment (現有) |

### API & Communication Patterns

**API Design: REST**
- 複用 Supabase 自動生成的 REST API
- 無需自建後端 API

**Supabase Client 使用:**

```typescript
// services/supabaseService.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Error Handling Standards:**

```typescript
interface ApiResult<T> {
  data: T | null;
  error: string | null;
  fromCache: boolean;
}
```

**Retry Strategy:**
- AI 生成失敗: 切換備用模型 (DeepSeek → Zhipu → Aliyun)
- Supabase 請求失敗: 3 次重試，指數退避
- 最終失敗: 返回 LocalStorage 緩存或友好錯誤提示

### Frontend Architecture

**State Management:** React useState (保持現有模式)

| State | Type | 用途 |
|-------|------|------|
| `dailyPractice` | `DailyPractice \| null` | 今日主推精選 |
| `altPractices` | `DailyPractice[]` | 備選精選 |
| `practiceHistory` | `DailyPractice[]` | 歷史精選 (7-14天) |
| `completedPractices` | `Set<string>` | 已完成實踐 ID |
| `isLoading` | `boolean` | 加載狀態 |

**Component Architecture:**

```
components/
├── coding-efficiency/
│   ├── DailyPracticeCard.tsx    # 今日精選主卡片
│   ├── PracticeSteps.tsx        # 實踐步驟展示
│   ├── PracticeHistory.tsx      # 歷史精選列表
│   └── PracticeProgress.tsx     # 已實踐標記 UI
```

**Lazy Loading:**
- Coding Efficiency 組件按需加載
- 使用 React.lazy() + Suspense

### Infrastructure & Deployment

**Hosting:** Vercel (現有)
- 前端: Vite 靜態構建
- API Routes: Vercel Serverless Functions

**Vercel Cron 配置:**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/daily-practice",
      "schedule": "0 0 * * *"
    }
  ]
}
```
*Note: `0 0 * * *` = 每日 UTC 00:00 (北京時間 08:00)*

**Environment Configuration:**
- Development: `.env.local`
- Production: Vercel Dashboard

**Monitoring:**
- Vercel Dashboard: Cron 執行狀態
- Supabase Dashboard: 數據庫使用量

### Decision Impact Analysis

**Implementation Sequence:**
1. 安裝 Supabase 依賴
2. 設置 Supabase 項目 + 創建表
3. 創建 supabaseService.ts
4. 創建 Cron API Route
5. 實現前端組件
6. 配置 Vercel Cron
7. 部署測試

**Cross-Component Dependencies:**
- Cron API Route → geminiService (AI 生成)
- Cron API Route → supabaseService (數據存儲)
- Frontend → supabaseService (數據讀取)
- Frontend → LocalStorage (緩存 + 實踐狀態)

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 8 個需要一致性規則的領域

### Naming Patterns

**Database Naming Conventions:**
- 表名: snake_case 複數 (`daily_practices`)
- 欄位名: snake_case (`created_at`, `main_practice`)
- 索引名: `idx_{table}_{column}` (`idx_daily_practices_date`)

**API Naming Conventions:**
- Supabase 自動生成，遵循表名
- Cron 路徑: `/api/cron/{feature}` (`/api/cron/daily-practice`)

**Code Naming Conventions:**
- React 組件: PascalCase (`DailyPracticeCard.tsx`)
- TypeScript 接口: PascalCase (`DailyPractice`)
- 函數: camelCase (`fetchDailyPractice`)
- 常量: UPPER_SNAKE_CASE (`CACHE_KEY_PREFIX`)
- 文件名: PascalCase for components, camelCase for services

### Structure Patterns

**Project Organization:**
- 按功能分組: `components/coding-efficiency/`
- 服務層: `services/` (現有模式)
- API Routes: `api/cron/`

**File Structure Patterns:**
- 每個組件一個文件
- 相關組件放同一目錄
- 共享類型在 `types.ts`

### Format Patterns

**API Response Formats:**
```typescript
// Supabase 響應包裝
interface ApiResult<T> {
  data: T | null;
  error: string | null;
  fromCache: boolean;
}
```

**Date Format:**
- 存儲: ISO 8601 (`2026-01-11T00:00:00Z`)
- 顯示: 本地化 (`toLocaleDateString()`)
- 緩存 Key: `YYYY-MM-DD`

**Data Exchange:**
- JSON 字段: camelCase (TypeScript)
- 數據庫字段: snake_case (PostgreSQL)
- 使用 Supabase 自動轉換

### Communication Patterns

**State Management Patterns:**
- 使用 React useState (保持現有模式)
- 避免全局狀態庫
- Props 向下傳遞

**LocalStorage Patterns:**
```typescript
// 緩存 Key 格式
const CACHE_KEYS = {
  dailyPractice: (date: string) => `llmpulse_daily_${date}`,
  completedPractices: 'llmpulse_completed_practices',
  practiceHistory: 'llmpulse_practice_history'
};
```

### Process Patterns

**Error Handling Patterns:**
```typescript
// 統一錯誤處理
try {
  const result = await supabaseService.fetchDailyPractice();
  if (result.error) {
    // 嘗試從緩存讀取
    const cached = localStorage.getItem(CACHE_KEYS.dailyPractice(today));
    if (cached) return { data: JSON.parse(cached), fromCache: true };
    throw new Error(result.error);
  }
  return { data: result.data, fromCache: false };
} catch (error) {
  console.error('Failed to fetch daily practice:', error);
  return { data: null, error: error.message, fromCache: false };
}
```

**Loading State Patterns:**
- `isLoading`: 主加載狀態
- Skeleton UI: 加載時顯示骨架屏
- 錯誤狀態: 顯示友好提示 + 重試按鈕

### Enforcement Guidelines

**All AI Agents MUST:**
- 使用上述命名規範
- 遵循錯誤處理模式
- 使用定義的緩存 Key 格式
- 保持現有代碼風格一致性

**Pattern Examples:**

✅ Good:
```typescript
const DailyPracticeCard: React.FC<Props> = ({ practice, onComplete }) => { ... }
```

❌ Bad:
```typescript
const daily_practice_card = (props) => { ... }
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
LLMPulse/
├── index.html                    # Entry HTML (現有)
├── index.tsx                     # React 入口 (現有)
├── App.tsx                       # 主應用組件 (現有)
├── types.ts                      # TypeScript 類型 (擴展)
├── vite.config.ts                # Vite 配置 (現有)
├── package.json                  # 依賴管理 (擴展)
├── vercel.json                   # Vercel + Cron 配置 (新增)
├── .env.local                    # 開發環境變數 (擴展)
├── .env.example                  # 環境變數模板 (新增)
│
├── api/                          # Vercel API Routes (新增)
│   └── cron/
│       └── daily-practice.ts     # 每日精選生成 Cron
│
├── components/                   # React 組件 (現有)
│   ├── RadarChart.tsx            # (現有)
│   ├── TrendCard.tsx             # (現有)
│   ├── GitHubRepoCard.tsx        # (現有)
│   └── coding-efficiency/        # 新功能組件 (新增)
│       ├── DailyPracticeCard.tsx # 今日精選卡片
│       ├── PracticeSteps.tsx     # 實踐步驟展示
│       ├── PracticeHistory.tsx   # 歷史精選列表
│       └── PracticeProgress.tsx  # 已實踐標記
│
├── services/                     # 服務層 (現有)
│   ├── geminiService.ts          # AI 服務 (現有，擴展)
│   └── supabaseService.ts        # Supabase 服務 (新增)
│
└── docs/                         # 文檔 (現有)
    ├── index.md
    └── architecture.md
```

### Architectural Boundaries

**API Boundaries:**
- `/api/cron/daily-practice`: 僅 Vercel Cron 調用，驗證 CRON_SECRET
- Supabase REST API: 前端直接調用，使用 anon key

**Component Boundaries:**
- `coding-efficiency/` 組件: 獨立功能模塊，不依賴其他 Tab
- 共享: `types.ts` 類型定義、Tailwind 樣式

**Service Boundaries:**
- `supabaseService.ts`: 所有 Supabase 交互
- `geminiService.ts`: 所有 AI 模型調用 (現有)

**Data Boundaries:**
- Supabase: 持久化內容存儲
- LocalStorage: 用戶狀態 + 緩存

### Requirements to Structure Mapping

| 功能需求 | 對應文件 |
|----------|----------|
| FR1-FR6 今日精選展示 | `DailyPracticeCard.tsx` |
| FR7-FR9 實踐指南 | `PracticeSteps.tsx` |
| FR10-FR13 實踐追蹤 | `PracticeProgress.tsx` + LocalStorage |
| FR14-FR16 歷史精選 | `PracticeHistory.tsx` |
| FR17-FR20 內容自動化 | `api/cron/daily-practice.ts` |
| FR21-FR23 UI 適配 | Tailwind 響應式類 |
| FR24-FR26 錯誤處理 | `supabaseService.ts` 錯誤處理模式 |

### Integration Points

**Internal Communication:**
- App.tsx → coding-efficiency 組件 (props)
- 組件 → supabaseService (數據讀取)
- 組件 → LocalStorage (狀態持久化)

**External Integrations:**
- Supabase PostgreSQL (REST API)
- Vercel Cron (HTTP 調用)
- AI Providers (現有 geminiService)

**Data Flow:**
```
Vercel Cron (每日 08:00)
    ↓
api/cron/daily-practice.ts
    ↓
geminiService.ts (AI 生成)
    ↓
supabaseService.ts (存儲)
    ↓
Supabase PostgreSQL

---

用戶訪問
    ↓
supabaseService.ts (讀取)
    ↓ (緩存)
LocalStorage
    ↓
React Components (渲染)
    ↓
LocalStorage (實踐狀態)
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- React 19 + Supabase Client: ✅ 完全兼容
- Vite 6 + Vercel API Routes: ✅ 標準支持
- TypeScript + Supabase: ✅ 類型生成支持

**Pattern Consistency:**
- 命名規範: ✅ 與現有代碼一致
- 組件結構: ✅ 遵循現有 components/ 模式
- 服務層: ✅ 遵循現有 services/ 模式

**Structure Alignment:**
- 項目結構: ✅ 增量擴展，無破壞性變更
- 邊界定義: ✅ 清晰的責任分離

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
- FR1-FR26: ✅ 全部架構支持

**Non-Functional Requirements Coverage:**
- 性能 (LCP < 2.5s): ✅ LocalStorage 緩存 + Skeleton UI
- 可靠性 (99%): ✅ 多層降級策略
- 存儲 (< 100MB): ✅ Supabase 免費層足夠

### Implementation Readiness Validation ✅

**Decision Completeness:**
- 所有關鍵決策: ✅ 已文檔化
- 技術版本: ✅ 已驗證

**Structure Completeness:**
- 目錄結構: ✅ 完整定義
- 文件職責: ✅ 明確

**Pattern Completeness:**
- 命名規範: ✅ 完整
- 錯誤處理: ✅ 完整
- 緩存策略: ✅ 完整

### Gap Analysis Results

**Critical Gaps:** 無

**Important Gaps (可 Post-MVP 處理):**
- 測試策略未定義 (建議後續添加)
- Supabase 遷移策略 (表已設計，無需遷移)

**Nice-to-Have:**
- 性能監控集成 (可使用 Vercel Analytics)

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] 項目上下文分析完成
- [x] 規模與複雜度評估
- [x] 技術約束識別
- [x] 跨領域關注點映射

**✅ Architectural Decisions**
- [x] 關鍵決策文檔化
- [x] 技術棧完整指定
- [x] 集成模式定義
- [x] 性能考慮

**✅ Implementation Patterns**
- [x] 命名規範建立
- [x] 結構模式定義
- [x] 通信模式指定
- [x] 流程模式文檔化

**✅ Project Structure**
- [x] 完整目錄結構定義
- [x] 組件邊界建立
- [x] 集成點映射
- [x] 需求到結構映射完成

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION ✅

**Confidence Level:** 高 - 基於驗證結果

**Key Strengths:**
- 增量擴展，風險最小化
- 複用現有技術棧和模式
- 清晰的責任分離
- 多層錯誤降級策略

**Areas for Future Enhancement:**
- 測試覆蓋率策略
- 性能監控集成
- 用戶認證系統 (P1)

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2026-01-11
**Document Location:** _bmad-output/planning-artifacts/architecture.md

### Final Architecture Deliverables

**📋 Complete Architecture Document**
- 所有架構決策已文檔化
- 實現模式確保 AI Agent 一致性
- 完整項目結構定義
- 需求到架構映射
- 驗證確認連貫性和完整性

**🏗️ Implementation Ready Foundation**
- 15+ 架構決策
- 8 個實現模式類別
- 7 個新增組件/文件
- 26 個功能需求完整支持

**📚 AI Agent Implementation Guide**
- 技術棧與驗證版本
- 一致性規則防止實現衝突
- 項目結構與清晰邊界
- 集成模式與通信標準

### Implementation Handoff

**For AI Agents:**
此架構文檔是實現 LLMPulse Coding Efficiency 功能的完整指南。請嚴格遵循所有決策、模式和結構。

**First Implementation Priority:**
```bash
npm install @supabase/supabase-js
```

**Development Sequence:**
1. 安裝 Supabase 依賴
2. 設置 Supabase 項目 + 創建 `daily_practices` 表
3. 創建 `services/supabaseService.ts`
4. 創建 `api/cron/daily-practice.ts`
5. 實現前端組件 (`components/coding-efficiency/`)
6. 配置 `vercel.json` Cron
7. 部署並測試

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** 開始使用此架構文檔進行 Story 開發

**Document Maintenance:** 實現過程中有重大技術決策時更新此架構

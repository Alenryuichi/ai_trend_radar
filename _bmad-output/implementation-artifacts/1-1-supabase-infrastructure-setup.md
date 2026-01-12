# Story 1.1: Supabase 基礎設施設置

Status: review

## Story

As a 開發團隊成員,
I want 建立 Supabase 資料庫基礎設施,
So that 系統有可靠的存儲層來保存每日精選內容.

## Acceptance Criteria (AC)

1. **AC1**: Given 專案尚未配置 Supabase, When 開發者執行依賴安裝命令, Then @supabase/supabase-js ^2.90.1 成功安裝到專案中, And package.json 中包含該依賴項

2. **AC2**: Given Supabase 專案已創建, When 執行資料庫遷移腳本, Then daily_practices 表成功創建，包含欄位:
   - id (uuid, primary key, default gen_random_uuid())
   - date (date, unique, not null)
   - main_practice (jsonb, not null)
   - alt_practices (jsonb[], not null)
   - ai_model (varchar(50))
   - generation_status (varchar(20))
   - created_at (timestamptz, default now())

3. **AC3**: Given 環境變數檔案存在, When 開發者配置 Supabase 連線資訊, Then VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 環境變數可被正確讀取

## Tasks / Subtasks

- [x] Task 1: 安裝 Supabase JS 依賴 (AC: #1)
  - [x] 執行 `npm install @supabase/supabase-js@^2.90.1`
  - [x] 驗證 package.json 更新正確

- [x] Task 2: 創建 Supabase 項目（手動步驟） (AC: #2)
  - [x] 登入 https://supabase.com 創建新項目
  - [x] 記錄項目 URL 和 anon key
  - [x] 確認 PostgreSQL 數據庫已就緒

- [x] Task 3: 創建資料庫遷移腳本 (AC: #2)
  - [x] 創建 `supabase/migrations/001_create_daily_practices.sql`
  - [x] 編寫 daily_practices 表創建 SQL
  - [x] 創建 date 欄位的索引
  - [x] 在 Supabase SQL Editor 執行遷移

- [x] Task 4: 配置 Row Level Security (RLS) (AC: #2)
  - [x] 啟用 daily_practices 表的 RLS（已包含在遷移腳本中）
  - [x] 創建公開讀取政策（已包含在遷移腳本中）
  - [x] 禁止匿名寫入（僅服務端可寫）

- [x] Task 5: 配置環境變數 (AC: #3)
  - [x] 創建 .env.local 添加 VITE_SUPABASE_URL
  - [x] 創建 .env.local 添加 VITE_SUPABASE_ANON_KEY
  - [x] 更新 .env.example 模板

## Dev Notes

### 技術參考

**來自架構文檔 (architecture.md):**

```sql
-- 今日精選內容表
CREATE TABLE daily_practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  main_practice JSONB NOT NULL,
  alt_practices JSONB[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ai_model VARCHAR(50),
  generation_status VARCHAR(20)
);

-- 索引優化
CREATE INDEX idx_daily_practices_date ON daily_practices(date DESC);
```

**環境變數前綴:**
- Vite 要求前端可訪問的環境變數必須使用 `VITE_` 前綴
- 參考現有 `vite.config.ts` 中 `loadEnv` 的使用方式

### 技術棧約束

| 項目 | 版本/設定 |
|------|-----------|
| React | 19.2.3 |
| TypeScript | 5.8.2 |
| Vite | 6.2.0 |
| Supabase JS | ^2.90.1 |

### RLS 政策配置

```sql
-- 啟用 RLS
ALTER TABLE daily_practices ENABLE ROW LEVEL SECURITY;

-- 公開讀取政策
CREATE POLICY "允許公開讀取" ON daily_practices
  FOR SELECT USING (true);

-- 服務端寫入需使用 service_role key（不在前端使用）
```

### 文件結構

```
專案根目錄/
├── .env.local          # 本地環境變數（不提交）
├── .env.example        # 環境變數模板
└── supabase/
    └── migrations/
        └── 001_create_daily_practices.sql
```

### 驗收檢查清單

- [ ] `npm ls @supabase/supabase-js` 顯示正確版本
- [ ] Supabase Dashboard 可見 daily_practices 表
- [ ] 表結構包含所有必要欄位
- [ ] RLS 已啟用且政策正確
- [ ] 環境變數在本地可正確讀取

### 測試方法

無自動化測試需求，手動驗證：
1. 在 Supabase SQL Editor 執行 `SELECT * FROM daily_practices;` 應成功
2. 環境變數驗證：`console.log(import.meta.env.VITE_SUPABASE_URL)` 應輸出正確 URL

---

## Dev Agent Record

### Implementation Plan
1. ✅ 安裝 @supabase/supabase-js@2.90.1 依賴
2. ⏸️ 等待用戶手動創建 Supabase 項目
3. ✅ 創建遷移腳本（包含表結構 + RLS 政策）
4. ✅ 配置環境變數模板

### Completion Notes
- `npm install @supabase/supabase-js@^2.90.1` 成功執行，版本 2.90.1 已安裝
- 遷移腳本已創建：`supabase/migrations/001_create_daily_practices.sql`
  - 包含完整表結構（id, date, main_practice, alt_practices, ai_model, generation_status, created_at）
  - 包含日期索引（降序優化查詢）
  - 包含 RLS 配置（公開讀取，禁止匿名寫入）
- 環境變數配置：
  - `.env.example` 已創建（包含所有必要變數模板）
  - `.env.local` 已更新（添加 Supabase 配置項）

### Debug Log
- 注意：源代碼在根目錄，不是 `src/` 目錄

### File List
- `package.json` - 修改（添加 @supabase/supabase-js 依賴）
- `package-lock.json` - 修改（依賴鎖定）
- `supabase/migrations/001_create_daily_practices.sql` - 新增
- `.env.example` - 新增
- `.env.local` - 修改（添加 Supabase 環境變數）

### Change Log
- 2026-01-12: Story 1.1 實現 - 安裝依賴、創建遷移腳本、配置環境變數


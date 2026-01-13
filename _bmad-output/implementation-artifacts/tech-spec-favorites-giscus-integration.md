---
title: '收藏功能數據庫配置 + Giscus 評論集成'
slug: 'favorites-giscus-integration'
created: '2026-01-12'
status: 'dev-complete'
stepsCompleted: [1, 2, 3, 4]
tech_stack:
  - Supabase (PostgreSQL + Auth + RLS)
  - React 19
  - TypeScript
  - Giscus (@giscus/react)
  - Tailwind CSS
files_to_modify:
  - supabase/migrations/002_create_user_tables.sql (NEW)
  - components/comments/GiscusComments.tsx (NEW)
  - components/coding-efficiency/DailyPracticeCard.tsx (MODIFY - add FavoriteButton + Giscus)
  - package.json (ADD @giscus/react)
code_patterns:
  - Supabase RLS policies (see 001_create_daily_practices.sql)
  - React functional components with TypeScript
  - Tailwind CSS utility classes
  - Custom hooks pattern (useAuth, useFavorites)
test_patterns:
  - Manual testing via Supabase Dashboard
  - Browser console verification
---

# Tech-Spec: 收藏功能數據庫配置 + Giscus 評論集成

**Created:** 2026-01-12

## Overview

### Problem Statement

前端收藏組件（FavoriteButton, useFavorites hook）已完成，但缺少 Supabase 數據庫表（user_profiles, favorites）和 Row Level Security (RLS) 策略，導致收藏功能無法正常工作。

評論功能已有自建組件（CommentSection, CommentItem, useComments），但維護成本高、缺少 spam 防護和進階功能。經團隊討論，決定用 Giscus（基於 GitHub Discussions）替代自建方案。

### Solution

1. **數據庫配置**：創建 SQL 遷移腳本，包含 `user_profiles` 和 `favorites` 表、RLS 策略、以及 OAuth 登錄時自動創建 user_profiles 的觸發器。

2. **Giscus 集成**：集成 Giscus 評論組件，替換現有自建評論系統。

### Scope

**In Scope:**
- ✅ 創建 `user_profiles` 表（含 OAuth 登錄自動創建觸發器）
- ✅ 創建 `favorites` 表 + RLS 策略
- ✅ 配置必要的索引和觸發器
- ✅ 集成 Giscus 評論組件
- ✅ 替換現有評論組件引用

**Out of Scope:**
- ❌ 自建評論系統（comments 表、useComments hook）
- ❌ user_practice_status 表（後續功能）
- ❌ Google OAuth 配置（當前只需 GitHub）
- ❌ 評論組件的刪除（保留代碼但不使用）

## Context for Development

### Codebase Patterns

- **數據庫遷移**：使用 `supabase/migrations/` 目錄下的 SQL 文件
- **認證**：使用 Supabase Auth + GitHub OAuth，已有 AuthProvider 和 useAuth hook
- **組件結構**：React 函數組件 + TypeScript，使用 Tailwind CSS
- **服務層**：直接使用 `supabase` client 進行數據庫操作

### Files to Reference

| File | Purpose | Status |
| ---- | ------- | ------ |
| `_bmad-output/planning-artifacts/user-auth-architecture.md` | 數據庫設計參考（SQL schema, RLS） | 參考 |
| `supabase/migrations/001_create_daily_practices.sql` | 現有遷移模式參考 | 參考 |
| `hooks/useFavorites.ts` | 收藏 hook，已實現前端邏輯 | ✅ 已完成 |
| `hooks/useAuth.ts` | 認證 hook，查詢 user_profiles 表 | ✅ 已完成 |
| `components/FavoriteButton.tsx` | 收藏按鈕組件 | ✅ 已完成 |
| `components/comments/CommentSection.tsx` | 自建評論組件（將被 Giscus 替代） | ⚠️ 不使用 |
| `components/coding-efficiency/DailyPracticeCard.tsx` | 需要集成收藏和評論 | 🔧 待修改 |
| `types.ts` | 類型定義，包含 UserProfile, Favorite | ✅ 已完成 |

### Technical Decisions

| 決策 | 選擇 | 理由 |
|------|------|------|
| 評論方案 | Giscus | 零維護、功能完善、與 GitHub OAuth 完美契合 |
| 收藏方案 | 自建 | 無替代方案、已有前端代碼 |
| user_profiles 創建 | 觸發器自動創建 | OAuth 登錄時自動建立用戶配置 |
| Giscus 位置 | DailyPracticeCard 展開區域 | 與內容關聯，不干擾主視圖 |

### Investigation Findings

**1. CommentSection 使用情況**
- 組件已完成但**尚未被任何頁面引用**
- 可以直接用 Giscus 替代，無需修改現有引用

**2. DailyPracticeCard 結構**
- 卡片有展開/收起功能
- 收藏按鈕和評論區應放在展開區域底部
- 需要傳入 `practice.id` 作為 Giscus 的 discussion mapping

**3. useAuth Hook**
- 已實現 `fetchUserProfile()` 查詢 `user_profiles` 表
- 需要數據庫表和觸發器才能正常工作

**4. useFavorites Hook**
- 已實現樂觀更新邏輯
- 查詢 `favorites` 表，需要數據庫表才能工作

## Implementation Plan

### Tasks

**Phase 1: 數據庫配置**

- [x] **Task 1: 創建數據庫遷移文件**
  - File: `supabase/migrations/002_create_user_tables.sql`
  - Action: 創建完整的 SQL 遷移腳本，包含：
    - `user_profiles` 表（id, display_name, avatar_url, provider, created_at, updated_at）
    - `favorites` 表（id, user_id, practice_id, created_at）
    - `update_updated_at_column()` 觸發器函數
    - `handle_new_user()` 函數 + 觸發器（OAuth 登錄自動創建 profile）
    - RLS 策略：用戶只能讀寫自己的數據
    - 唯一約束：`favorites(user_id, practice_id)`
  - Notes: 參考 `_bmad-output/planning-artifacts/user-auth-architecture.md` 中的 SQL 設計
  - **修正**: `practice_id` 使用 `VARCHAR(50)` 而非 UUID，因為 practice.id 是 AI 生成的字符串格式

- [x] **Task 2: 執行數據庫遷移**
  - Action: 在 Supabase Dashboard 或通過 CLI 執行遷移
  - Notes: 驗證表結構和 RLS 策略生效

**Phase 2: Giscus 集成**

- [x] **Task 3: 啟用 GitHub Discussions**
  - Action: 在 GitHub repo 設置中啟用 Discussions 功能
  - Notes: 創建 "Practice Comments" category（可選）

- [x] **Task 4: 安裝 Giscus React 組件**
  - File: `package.json`
  - Action: `npm install @giscus/react`

- [x] **Task 5: 創建 Giscus 包裝組件**
  - File: `components/comments/GiscusComments.tsx` (NEW)
  - Action: 創建 React 組件包裝 Giscus，配置：
    - `repo`: "Alenryuichi/ai_trend_radar"
    - `mapping`: "specific"
    - `term`: practiceId prop
    - `theme`: "dark_dimmed"
    - `lang`: "zh-CN"
  - Notes: 從 https://giscus.app 獲取 repoId 和 categoryId

- [x] **Task 6: 更新 comments 導出**
  - File: `components/comments/index.ts`
  - Action: 添加 `export { GiscusComments } from './GiscusComments';`

**Phase 3: UI 集成**

- [x] **Task 7: 修改 DailyPracticeCard 添加收藏和評論**
  - File: `components/coding-efficiency/DailyPracticeCard.tsx`
  - Action:
    - 導入 `FavoriteButton` 和 `GiscusComments`
    - 在展開區域底部添加操作區（FavoriteButton）
    - 在操作區下方添加 GiscusComments（Lazy Load，僅展開時渲染）
  - Notes: 使用 `practice.id` 作為 FavoriteButton 和 GiscusComments 的 practiceId

### Acceptance Criteria

**收藏功能：**

- [x] **AC 1**: Given 用戶未登錄, when 點擊收藏按鈕, then 顯示 LoginPromptModal 引導登錄
- [x] **AC 2**: Given 用戶已登錄且未收藏該內容, when 點擊收藏按鈕, then 圖標變為實心愛心，數據存入 `favorites` 表
- [x] **AC 3**: Given 用戶已登錄且已收藏該內容, when 點擊收藏按鈕, then 圖標變為空心愛心，數據從 `favorites` 表刪除
- [x] **AC 4**: Given 用戶已收藏某內容, when 刷新頁面, then 收藏狀態保持（從數據庫讀取）

**用戶配置：**

- [x] **AC 5**: Given 新用戶首次 OAuth 登錄, when 登錄成功, then `user_profiles` 表自動創建該用戶記錄
- [x] **AC 6**: Given 用戶已登錄, when 調用 useAuth hook, then 能正確獲取 profile 信息

**評論功能（Giscus）：**

- [x] **AC 7**: Given 任意用戶, when 展開 DailyPracticeCard, then 顯示 Giscus 評論區
- [x] **AC 8**: Given 用戶未登錄 GitHub, when 點擊評論輸入框, then 跳轉到 GitHub 授權頁面
- [x] **AC 9**: Given 用戶已登錄 GitHub, when 發表評論, then 評論顯示在 Giscus 中且存入 GitHub Discussions

**RLS 安全：**

- [x] **AC 10**: Given 用戶 A 已登錄, when 嘗試查詢用戶 B 的收藏, then 返回空結果（RLS 阻止）

## Additional Context

### Dependencies

| 依賴 | 版本 | 狀態 | 用途 |
|------|------|------|------|
| `@supabase/supabase-js` | v2.90.1 | ✅ 已安裝 | 數據庫操作 |
| `@giscus/react` | latest | ❌ 需安裝 | Giscus React 組件 |
| GitHub Discussions | - | ❌ 需啟用 | Giscus 後端 |

### Testing Strategy

**數據庫驗證：**
1. 在 Supabase Dashboard > Table Editor 確認 `user_profiles` 和 `favorites` 表已創建
2. 在 Supabase Dashboard > Authentication > Policies 確認 RLS 策略生效
3. 測試 OAuth 登錄後 `user_profiles` 自動創建

**收藏功能：**
1. 未登錄狀態點擊收藏 → 彈出登錄提示
2. 登錄後點擊收藏 → 控制台無錯誤，按鈕狀態變化
3. 刷新頁面 → 收藏狀態保持
4. Supabase Dashboard 確認數據正確存入

**Giscus 評論：**
1. 展開卡片 → Giscus iframe 載入
2. 發表評論 → 評論顯示，GitHub Discussions 有對應記錄

### Notes

**高風險項目：**
- Giscus 需要正確的 `repoId` 和 `categoryId`，錯誤會導致無法載入
- OAuth 觸發器需要正確引用 `auth.users` 表

**已知限制：**
- Giscus 評論需要 GitHub 帳號，非 GitHub 用戶無法評論
- 收藏數據與 Supabase Auth 用戶綁定，用戶刪除後收藏會級聯刪除

**未來考慮（範圍外）：**
- 收藏列表頁面（FavoritesPage）
- 用戶實踐狀態追蹤（user_practice_status 表）
- Google OAuth 支持


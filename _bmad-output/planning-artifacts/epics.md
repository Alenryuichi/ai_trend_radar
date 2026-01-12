---
stepsCompleted: [1, 2, 3, 4]
status: complete
completedAt: '2026-01-11'
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
workflowType: 'epics'
project_name: 'LLMPulse'
user_name: 'alenryuichi'
date: '2026-01-11'
---

# LLMPulse - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for LLMPulse Coding Efficiency 功能增強, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**今日精選展示 (Daily Practice Display)**
- FR1: 用戶可以在 Coding Efficiency 頁面查看今日主推精選
- FR2: 用戶可以查看今日的 2 個備選精選
- FR3: 用戶可以查看每個精選的難度等級標識 (入門/中級/高級)
- FR4: 用戶可以查看每個精選的預估完成時間
- FR5: 用戶可以查看每個精選的可信來源信息
- FR6: 用戶可以點擊來源鏈接跳轉到原始資料

**實踐指南 (Practice Guidance)**
- FR7: 用戶可以查看精選的實踐步驟指南 (1-2-3 步驟)
- FR8: 用戶可以查看為什麼這個實踐有價值的說明
- FR9: 用戶可以查看實踐適用的工具/場景

**實踐追蹤 (Practice Tracking)**
- FR10: 用戶可以將精選標記為「已實踐」
- FR11: 用戶可以取消已標記的「已實踐」狀態
- FR12: 系統可以在本地持久化用戶的實踐狀態
- FR13: 用戶可以在頁面刷新後保留實踐狀態

**歷史精選 (History)**
- FR14: 用戶可以瀏覽最近 7-14 天的歷史精選
- FR15: 用戶可以查看歷史精選的已實踐狀態
- FR16: 用戶可以點擊歷史精選查看詳情

**內容自動化 (Content Automation)**
- FR17: 系統可以每日自動生成新的精選內容
- FR18: 系統可以從多個可信來源獲取 AI 編程最佳實踐
- FR19: 系統可以將生成的內容存儲到數據庫
- FR20: 系統可以在 AI 生成失敗時使用備用模型

**用戶界面適配 (UI Adaptation)**
- FR21: 用戶可以在移動設備上正常使用今日精選功能
- FR22: 用戶可以在平板設備上正常使用今日精選功能
- FR23: 用戶可以在桌面設備上正常使用今日精選功能

**錯誤處理 (Error Handling)**
- FR24: 用戶在網絡異常時可以看到緩存的今日精選內容
- FR25: 用戶在內容加載失敗時可以看到友好的錯誤提示
- FR26: 用戶可以在錯誤狀態下手動重試加載

### NonFunctional Requirements

**性能 (Performance)**
- NFR1: 首屏加載 (LCP) < 2.5 秒
- NFR2: 交互響應 (FID) < 100 毫秒
- NFR3: 布局穩定 (CLS) < 0.1
- NFR4: API 響應時間 < 500 毫秒
- NFR5: 今日精選加載 < 1 秒

**可靠性 (Reliability)**
- NFR6: 系統可用性 99%
- NFR7: Cron 任務成功率 > 95%
- NFR8: AI 生成失敗時自動切換備用模型

**無障礙 (Accessibility)**
- NFR9: 語義化 HTML (heading 層級、button、article)
- NFR10: 鍵盤導航 (Tab 可訪問所有交互元素)
- NFR11: 顏色對比度 > 4.5:1
- NFR12: 可見的 Focus 指示器

**數據存儲 (Data & Storage)**
- NFR13: 數據保留 90 天
- NFR14: 存儲使用 < 100MB (Supabase 免費層)

### Additional Requirements

**來自架構文檔的技術需求：**

- 安裝 @supabase/supabase-js ^2.90.1 作為第一個實現步驟
- 創建 Supabase 項目並配置 daily_practices 表
- 創建 services/supabaseService.ts 服務層
- 創建 api/cron/daily-practice.ts Vercel Cron API Route
- 配置環境變數: SUPABASE_URL, SUPABASE_ANON_KEY, CRON_SECRET
- 創建 vercel.json 配置 Cron 任務 (每日 UTC 00:00)
- 組件放置於 components/coding-efficiency/ 目錄
- 使用 LocalStorage 緩存策略 (key: llmpulse_daily_practice_${date})
- 遵循現有 React useState 狀態管理模式
- 使用 Tailwind CSS 響應式類
- 實現多模型 fallback (DeepSeek → Zhipu → Aliyun)
- 配置 Supabase RLS: 公開讀取，禁止匿名寫入

**Starter Template:** 無 (Brownfield 項目增量擴展)

### FR Coverage Map

| FR | Epic | 描述 |
|----|------|------|
| FR1 | Epic 2 | 查看今日主推精選 |
| FR2 | Epic 2 | 查看 2 個備選精選 |
| FR3 | Epic 2 | 查看難度等級標識 |
| FR4 | Epic 2 | 查看預估完成時間 |
| FR5 | Epic 2 | 查看可信來源信息 |
| FR6 | Epic 2 | 點擊來源跳轉 |
| FR7 | Epic 2 | 查看實踐步驟指南 |
| FR8 | Epic 2 | 查看價值說明 |
| FR9 | Epic 2 | 查看適用工具/場景 |
| FR10 | Epic 3 | 標記「已實踐」 |
| FR11 | Epic 3 | 取消已實踐狀態 |
| FR12 | Epic 3 | 本地持久化實踐狀態 |
| FR13 | Epic 3 | 頁面刷新後保留狀態 |
| FR14 | Epic 3 | 瀏覽歷史精選 |
| FR15 | Epic 3 | 查看歷史已實踐狀態 |
| FR16 | Epic 3 | 點擊歷史精選查看詳情 |
| FR17 | Epic 1 | 每日自動生成精選 |
| FR18 | Epic 1 | 從可信來源獲取內容 |
| FR19 | Epic 1 | 存儲到數據庫 |
| FR20 | Epic 1 | AI 失敗時使用備用模型 |
| FR21 | Epic 4 | 移動設備正常使用 |
| FR22 | Epic 4 | 平板設備正常使用 |
| FR23 | Epic 4 | 桌面設備正常使用 |
| FR24 | Epic 4 | 網絡異常顯示緩存 |
| FR25 | Epic 4 | 加載失敗顯示錯誤提示 |
| FR26 | Epic 4 | 手動重試加載 |

## Epic List

### Epic 1: 基礎設施與內容生成
建立每日自動生成 AI Coding 精選內容的系統能力。系統每日自動產生高質量 AI 編程實踐內容。
**FRs covered:** FR17, FR18, FR19, FR20

### Epic 2: 今日精選展示
用戶能查看並理解今日 AI Coding 精選實踐。用戶打開頁面即可看到今日精選卡片，包含難度、時間、來源和實踐步驟。
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9

### Epic 3: 實踐追蹤與歷史
用戶能標記已完成的實踐並瀏覽歷史精選。用戶可標記「已實踐」並瀏覽過去 7-14 天的歷史精選。
**FRs covered:** FR10, FR11, FR12, FR13, FR14, FR15, FR16

### Epic 4: 響應式與錯誤處理
用戶在任何設備和網絡條件下都能正常使用。移動/平板/桌面設備無縫體驗，網絡異常時優雅降級。
**FRs covered:** FR21, FR22, FR23, FR24, FR25, FR26

---

## Epic 1: 基礎設施與內容生成

建立每日自動生成 AI Coding 精選內容的系統能力。

### Story 1.1: Supabase 基礎設施設置

As a **開發團隊成員**,
I want **建立 Supabase 資料庫基礎設施**,
So that **系統有可靠的存儲層來保存每日精選內容**.

**Acceptance Criteria:**

**Given** 專案尚未配置 Supabase
**When** 開發者執行依賴安裝命令
**Then** @supabase/supabase-js ^2.90.1 成功安裝到專案中
**And** package.json 中包含該依賴項

**Given** Supabase 專案已創建
**When** 執行資料庫遷移腳本
**Then** daily_practices 表成功創建，包含以下欄位：
  - id (uuid, primary key)
  - date (date, unique, not null)
  - main_practice (jsonb, not null)
  - alt_practices (jsonb[], not null)
  - ai_model (varchar(50))
  - generation_status (varchar(20))
  - created_at (timestamptz, default now())

**Given** 環境變數檔案存在
**When** 開發者配置 Supabase 連線資訊
**Then** VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 環境變數可被正確讀取

### Story 1.2: Supabase 服務層實現

As a **後端開發者**,
I want **擁有封裝好的 Supabase 服務模組**,
So that **可以透過統一介面操作 daily_practices 資料**.

**Acceptance Criteria:**

**Given** Supabase 基礎設施已設置完成
**When** 建立 services/supabaseService.ts
**Then** 模組匯出 supabase client 實例
**And** 模組提供以下方法：
  - `saveDailyPractice(data)`: 儲存每日精選內容
  - `getDailyPractice(date)`: 根據日期查詢精選內容
  - `getPracticeHistory(days)`: 獲取歷史精選列表

**Given** 呼叫 saveDailyPractice 方法
**When** 傳入有效的精選內容資料
**Then** 資料成功寫入 daily_practices 表
**And** 回傳包含 id 的完整記錄

**Given** 呼叫 getDailyPractice 方法
**When** 傳入存在的日期
**Then** 回傳該日期的精選內容
**When** 傳入不存在的日期
**Then** 回傳 null

### Story 1.3: AI 內容生成服務（含多模型 Fallback）

As a **系統**,
I want **能夠呼叫 AI 模型生成編程精選內容，並在失敗時自動切換備用模型**,
So that **確保每日內容生成的高可用性**.

**Acceptance Criteria:**

**Given** 內容生成服務已建立
**When** 呼叫主要模型 (DeepSeek) 成功
**Then** 回傳生成的 AI Coding 精選內容
**And** 記錄使用的模型為 "deepseek"

**Given** 主要模型 (DeepSeek) 呼叫失敗
**When** 系統自動嘗試第一備用模型 (Zhipu)
**Then** 若成功則回傳內容並記錄模型為 "zhipu"

**Given** DeepSeek 和 Zhipu 都失敗
**When** 系統自動嘗試第二備用模型 (Aliyun)
**Then** 若成功則回傳內容並記錄模型為 "aliyun"

**Given** 所有三個模型都失敗
**When** 內容生成請求完成
**Then** 拋出明確的錯誤訊息，包含所有失敗原因

### Story 1.4: Vercel Cron API Route 實現

As a **系統管理員**,
I want **每日自動觸發內容生成流程**,
So that **無需人工介入即可產出每日精選內容**.

**Acceptance Criteria:**

**Given** api/cron/daily-practice.ts 已建立
**When** 收到帶有正確 CRON_SECRET 的請求
**Then** 執行每日內容生成流程
**And** 回傳 200 狀態碼與成功訊息

**Given** 收到請求但 CRON_SECRET 不匹配
**When** 驗證授權
**Then** 回傳 401 狀態碼
**And** 不執行任何生成邏輯

**Given** 今日內容尚未生成
**When** Cron 觸發執行
**Then** 呼叫 AI 生成內容（1 主推 + 2 備選）
**And** 儲存到 daily_practices 表

**Given** vercel.json 配置
**When** 部署到 Vercel
**Then** Cron 排程設定為每日 UTC 00:00 執行

---

## Epic 2: 今日精選展示

用戶能查看並理解今日 AI Coding 精選實踐。

### Story 2.1: 今日主推精選卡片基礎展示

As a 開發者用戶,
I want 在 Coding Efficiency 頁面看到今日主推的 AI Coding 精選實踐卡片，包含標題、摘要、難度等級和預估完成時間,
So that 我可以快速了解今天推薦的實踐主題並評估是否適合我當前的時間和能力.

**Acceptance Criteria:**

**Given** 用戶進入 Coding Efficiency 頁面
**When** 頁面載入完成
**Then** 用戶可以看到一張主推精選卡片，顯示於頁面醒目位置
**And** 卡片顯示精選的標題 (title)
**And** 卡片顯示精選的摘要說明 (summary)
**And** 卡片顯示難度等級標識，使用視覺化徽章區分「入門」/「中級」/「高級」
**And** 卡片顯示預估完成時間（格式：約 X 分鐘）
**And** 主推卡片有明顯的視覺標識（如「今日推薦」標籤）

### Story 2.2: 備選精選卡片展示

As a 開發者用戶,
I want 在主推精選下方看到 2 個備選精選卡片,
So that 如果主推不適合我，我可以從備選中選擇其他感興趣的實踐.

**Acceptance Criteria:**

**Given** 用戶在 Coding Efficiency 頁面查看今日精選
**When** 頁面載入完成
**Then** 用戶可以在主推卡片下方看到 2 張備選精選卡片
**And** 備選卡片與主推卡片使用相同的資訊結構（標題、摘要、難度、預估時間）
**And** 備選卡片視覺上略小於主推卡片，形成明確的主次層級

### Story 2.3: 精選來源資訊與外部連結

As a 開發者用戶,
I want 查看每個精選的資料來源，並能點擊連結跳轉到原始資料,
So that 我可以驗證資訊的可信度並深入閱讀原始內容.

**Acceptance Criteria:**

**Given** 用戶正在查看任一精選卡片（主推或備選）
**When** 用戶查看卡片底部資訊區域
**Then** 用戶可以看到來源名稱（sourceName）顯示於卡片上
**And** 來源名稱旁有可點擊的連結圖標或「查看原文」文字
**And** 點擊來源連結後，在新瀏覽器分頁開啟原始資料頁面 (sourceUrl)
**And** 連結使用 rel="noopener noreferrer" 確保安全性

### Story 2.4: 實踐步驟指南展示

As a 開發者用戶,
I want 查看精選的具體實踐步驟（1-2-3 步驟指南）,
So that 我知道如何開始執行這個實踐，不需要額外查找資料.

**Acceptance Criteria:**

**Given** 用戶點擊展開或查看某個精選的詳細內容
**When** 詳細內容區域展開/顯示
**Then** 用戶可以看到清晰編號的實踐步驟列表（steps 陣列）
**And** 每個步驟前有數字編號（1. 2. 3. ...）
**And** 步驟按順序垂直排列，易於閱讀和跟隨
**And** 步驟區域有明確的標題「實踐步驟」或類似標識

### Story 2.5: 實踐價值說明與工具標籤展示

As a 開發者用戶,
I want 了解為什麼這個實踐對我有價值，以及適用的工具和場景,
So that 我可以判斷這個實踐是否值得投入時間.

**Acceptance Criteria:**

**Given** 用戶正在查看某個精選的詳細內容
**When** 詳細內容區域展開/顯示
**Then** 用戶可以看到「為什麼重要」區塊，顯示 whyItMatters 內容
**And** 用戶可以看到適用工具列表（tools 陣列），以標籤形式展示
**And** 用戶可以看到相關標籤（tags 陣列），以標籤形式展示

### Story 2.6: 精選資料本地快取機制

As a 開發者用戶,
I want 今日精選資料被快取在本地,
So that 重新開啟頁面時能快速載入，且同一天內不會看到不同的內容.

**Acceptance Criteria:**

**Given** 用戶首次在當天訪問 Coding Efficiency 頁面
**When** 今日精選資料載入成功
**Then** 資料被儲存到 LocalStorage，key 格式為 `llmpulse_daily_practice_${date}`
**And** 下次訪問時優先從 LocalStorage 讀取資料
**And** 日期變更時，自動載入新資料

---

## Epic 3: 實踐追蹤與歷史

用戶能標記已完成的實踐並瀏覽歷史精選。

### Story 3.1: 實踐狀態標記功能

As a 開發者用戶,
I want 將今日精選標記為「已實踐」或取消標記,
So that 我可以追蹤自己的學習進度並保持練習動力.

**Acceptance Criteria:**

**Given** 用戶正在查看今日精選卡片
**When** 用戶點擊「標記為已實踐」按鈕
**Then** 按鈕狀態變更為「已完成」樣式（帶有勾選圖標）
**And** 顯示簡短的成功反饋（如：✓ 已記錄）

**Given** 用戶已將精選標記為「已實踐」
**When** 用戶再次點擊該按鈕
**Then** 按鈕恢復為「標記為已實踐」初始狀態
**And** 實踐記錄被移除

### Story 3.2: 實踐狀態本地持久化

As a 開發者用戶,
I want 我的實踐記錄在頁面刷新後仍然保留,
So that 我不會因為意外關閉瀏覽器而丟失學習進度.

**Acceptance Criteria:**

**Given** 用戶標記或取消一個精選的實踐狀態
**When** 狀態變更發生
**Then** 系統立即將狀態保存至 LocalStorage (key: `llmpulse_completed_practices`)
**And** 保存操作不阻塞用戶界面

**Given** 用戶之前已標記某些精選為「已實踐」
**When** 用戶刷新頁面或重新訪問應用
**Then** 所有之前的實踐標記正確恢復顯示

### Story 3.3: 歷史精選瀏覽

As a 開發者用戶,
I want 瀏覽最近 7-14 天的歷史精選,
So that 我可以回顧錯過的內容或重新練習之前的題目.

**Acceptance Criteria:**

**Given** 用戶在今日精選頁面
**When** 用戶查看歷史區域
**Then** 顯示最近 7 天的精選列表（按日期降序排列）
**And** 每項顯示日期、標題、難度標籤
**And** 每個精選項目顯示其實踐狀態（已完成/未完成）

**Given** 沒有歷史精選數據
**When** 用戶查看歷史區域
**Then** 顯示友好的空狀態提示

### Story 3.4: 歷史精選詳情查看

As a 開發者用戶,
I want 點擊歷史精選查看完整詳情,
So that 我可以回顧或重新練習之前的內容.

**Acceptance Criteria:**

**Given** 用戶在歷史列表中看到某個精選
**When** 用戶點擊該精選項目
**Then** 展開顯示完整的精選內容（與今日精選格式一致）
**And** 包含實踐步驟、價值說明、工具標籤

**Given** 用戶正在查看歷史精選詳情
**When** 該精選尚未標記為已實踐
**Then** 顯示「標記為已實踐」按鈕
**And** 點擊後可正常標記並持久化

---

## Epic 4: 響應式與錯誤處理

用戶在任何設備和網絡條件下都能正常使用。

### Story 4.1: 響應式布局適配

As a 開發者用戶,
I want 在不同尺寸的設備上都能正常瀏覽今日精選內容,
So that 無論我使用手機、平板還是電腦，都能獲得良好的使用體驗.

**Acceptance Criteria:**

**Given** 用戶使用寬度小於 640px 的移動設備訪問今日精選頁面
**When** 頁面載入完成
**Then** 今日精選卡片以單欄垂直堆疊方式顯示
**And** 字體大小、間距適合觸控操作

**Given** 用戶使用寬度在 640-1024px 的平板設備訪問今日精選頁面
**When** 頁面載入完成
**Then** 今日精選卡片以雙欄網格方式顯示

**Given** 用戶使用寬度大於 1024px 的桌面設備訪問今日精選頁面
**When** 頁面載入完成
**Then** 完整顯示側邊導航和輔助信息
**And** LCP < 2.5 秒, CLS < 0.1

### Story 4.2: Skeleton Loading 狀態

As a 開發者用戶,
I want 在內容載入時看到骨架屏動畫,
So that 我知道內容正在載入中，而不是頁面卡住了.

**Acceptance Criteria:**

**Given** 用戶進入今日精選頁面
**When** API 數據尚未返回
**Then** 顯示與實際內容布局一致的骨架屏組件
**And** 骨架屏有平滑的脈動動畫效果

**Given** 骨架屏正在顯示
**When** API 數據成功返回
**Then** 骨架屏平滑過渡為實際內容
**And** 過渡動畫時長不超過 300ms

### Story 4.3: 離線緩存降級

As a 開發者用戶,
I want 在網絡不穩定時仍能查看之前載入過的今日精選內容,
So that 即使在離線或弱網環境下也能繼續學習.

**Acceptance Criteria:**

**Given** 用戶在離線狀態下訪問今日精選頁面
**When** 頁面嘗試載入數據
**Then** 自動讀取並顯示 LocalStorage 中的緩存數據
**And** 頁面頂部顯示「離線模式 - 顯示緩存內容」提示條

**Given** 用戶首次訪問且處於離線狀態
**When** 頁面嘗試載入數據
**Then** 顯示「暫無緩存內容，請連接網絡後重試」的友好提示

### Story 4.4: 錯誤狀態展示與重試

As a 開發者用戶,
I want 在內容載入失敗時看到友好的錯誤提示並能手動重試,
So that 我能了解發生了什麼問題並知道如何處理.

**Acceptance Criteria:**

**Given** 用戶訪問今日精選頁面
**When** API 請求返回錯誤
**Then** 顯示錯誤狀態組件，包含：
  - 清晰的錯誤圖示
  - 錯誤標題「載入失敗」
  - 錯誤描述
  - 「重試」按鈕

**Given** 頁面顯示錯誤狀態
**When** 用戶點擊「重試」按鈕
**Then** 按鈕顯示載入中狀態
**And** 重新發起 API 請求

**Given** 用戶點擊重試按鈕
**When** 重試請求成功
**Then** 錯誤狀態消失，顯示正常內容
**And** FID < 100 毫秒


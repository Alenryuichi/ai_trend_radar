# LLMPulse 项目指南

## 项目概述

**LLMPulse** 是一个专注于 AI 辅助编程效率提升的学习平台。

- **技术栈**: React 19 + TypeScript + Vite + Tailwind CSS
- **后端**: Supabase (PostgreSQL) + Vercel Serverless Functions
- **AI 模型**: DeepSeek → ZhiPu → Aliyun (多模型 Fallback)

---

## 常用脚本

### 触发每日精选生成

```bash
# 生产环境（自动读取 CRON_SECRET）
./scripts/trigger-daily-practice.sh

# 本地开发环境
./scripts/trigger-daily-practice.sh --local

# 只显示命令，不执行
./scripts/trigger-daily-practice.sh --dry-run
```

### 手动 curl 命令

```bash
# 需要先获取 CRON_SECRET
vercel env pull .env.production.local --environment=production

# 触发生成
source .env.production.local
curl -X GET "https://ai-trend-radar.vercel.app/api/cron/daily-practice" \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## 渐进式引用方法

在对话中引用项目资源时，使用以下格式快速定位：

### 1. 文件引用

| 简写 | 完整路径 | 说明 |
|------|----------|------|
| `@App` | `App.tsx` | 主应用组件 |
| `@types` | `types.ts` | TypeScript 类型定义 |
| `@cron` | `api/cron/daily-practice.ts` | 每日内容生成 API |
| `@supabase` | `services/supabaseService.ts` | Supabase 服务 |
| `@storage` | `services/practiceStorageService.ts` | 本地存储服务 |
| `@skillTree` | `config/skillTree.ts` | 技能树配置 |

### 2. 组件引用

| 简写 | 路径 | 说明 |
|------|------|------|
| `@Card` | `components/coding-efficiency/DailyPracticeCard.tsx` | 精选卡片 |
| `@Section` | `components/coding-efficiency/DailyPracticeSection.tsx` | 精选区块 |
| `@Progress` | `components/coding-efficiency/ProgressDashboard.tsx` | 进度仪表板 |
| `@SkillTree` | `components/coding-efficiency/SkillTree.tsx` | 技能树组件 |
| `@Filter` | `components/coding-efficiency/ScenarioFilter.tsx` | 场景筛选器 |
| `@History` | `components/coding-efficiency/PracticeHistory.tsx` | 历史记录 |
| `@Network` | `components/coding-efficiency/NetworkBanner.tsx` | 网络状态 |

### 3. 功能模块引用

```
@feature:场景标签    → ScenarioFilter + DailyPracticeCard 中的场景显示
@feature:技能树      → SkillTree + config/skillTree.ts
@feature:进度追踪    → ProgressDashboard + practiceStorageService
@feature:离线缓存    → NetworkBanner + cacheService
```

### 4. 数据库引用

```
@db:daily_practices  → Supabase daily_practices 表
@db:schema           → 查看 types.ts 中的 DailyPracticeRecord
```

### 5. 使用示例

```
用户: 修改 @Card 的难度标签颜色
→ 定位到 DailyPracticeCard.tsx 的 DifficultyBadge 组件

用户: 更新 @cron 的生成逻辑
→ 定位到 api/cron/daily-practice.ts

用户: 查看 @feature:技能树 的里程碑配置
→ 定位到 config/skillTree.ts 的 SKILL_BRANCHES
```

---

## 项目结构

```
ai_trend_radar/
├── api/
│   └── cron/
│       └── daily-practice.ts    # 每日内容生成 Cron Job
├── components/
│   └── coding-efficiency/
│       ├── DailyPracticeCard.tsx
│       ├── DailyPracticeSection.tsx
│       ├── ProgressDashboard.tsx
│       ├── SkillTree.tsx
│       ├── ScenarioFilter.tsx
│       ├── PracticeHistory.tsx
│       ├── PracticeProgress.tsx
│       └── NetworkBanner.tsx
├── config/
│   └── skillTree.ts             # 技能分支配置
├── services/
│   ├── supabaseService.ts       # Supabase 数据服务
│   └── practiceStorageService.ts # 本地存储服务
├── scripts/
│   └── trigger-daily-practice.sh # 触发脚本
├── App.tsx                       # 主应用
├── types.ts                      # 类型定义
└── claude.md                     # 本文件
```

---

## 环境变量

| 变量名 | 用途 | 环境 |
|--------|------|------|
| `VITE_SUPABASE_URL` | Supabase URL | 全部 |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | 全部 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 | Production |
| `CRON_SECRET` | Cron Job 验证密钥 | Production |
| `DEEPSEEK_API_KEY` | DeepSeek API | Production |
| `ZHIPU_API_KEY` | 智谱 API | Production |
| `ALIYUN_API_KEY` | 阿里云 API | Production |

---

## 快速命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 类型检查
npx tsc --noEmit

# 部署
vercel --prod

# 拉取生产环境变量
vercel env pull .env.production.local --environment=production
```


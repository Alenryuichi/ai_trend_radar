# AI Trend Radar (LLMPulse) - Development Guide

## Project Overview

LLMPulse is a real-time AI trend tracking dashboard that aggregates intelligence from multiple LLM providers and displays it through an interactive radar visualization.

### Tech Stack
- **Runtime:** Node.js
- **Framework:** React 19.2.3
- **Language:** TypeScript 5.8.2
- **Build Tool:** Vite 6.2.0
- **Charting:** Recharts 3.6.0
- **AI SDK:** @google/genai 1.35.0
- **Database:** Supabase
- **Styling:** Tailwind CSS (via CDN)
- **Deployment:** Vercel

## Directory Structure

```
/
├── App.tsx                 # Main application component
├── index.html              # Entry HTML with Tailwind CDN
├── index.tsx               # React mount point
├── types.ts                # TypeScript interfaces & constants
├── components/
│   ├── RadarChart.tsx      # Recharts radar visualization
│   ├── TrendCard.tsx       # Individual trend display
│   ├── GitHubRepoCard.tsx  # Repository card
│   └── coding-efficiency/  # Coding efficiency module components
│       ├── DailyPracticeCard.tsx
│       ├── DailyPracticeSection.tsx
│       ├── PracticeHistory.tsx
│       ├── ProgressDashboard.tsx
│       └── SkillTree.tsx
├── services/
│   ├── geminiService.ts       # Multi-provider AI service layer
│   ├── supabaseService.ts     # Supabase client integration
│   ├── practiceStorageService.ts
│   └── practicesCacheService.ts
├── api/                    # Vercel serverless functions
│   ├── cron/
│   │   └── daily-practice.ts
│   └── services/
│       ├── aiGenerationService.ts
│       └── supabaseServerService.ts
├── config/
│   └── skillTree.ts        # Skill tree configuration
├── hooks/
│   └── useNetworkStatus.ts
└── docs/
    └── architecture.md     # Architecture documentation
```

## Common Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Required environment variables (set in `.env.local`):
- `GEMINI_API_KEY` - Required for Gemini provider
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

## AI Providers

The app integrates with 5 AI providers:

| Provider | Endpoint | Use Case |
|----------|----------|----------|
| **Gemini** | @google/genai SDK | Primary (supports search grounding) |
| **DeepSeek** | api.deepseek.com | Alternative LLM |
| **SiliconFlow** | api.siliconflow.cn | DS-V3 model |
| **Zhipu** | open.bigmodel.cn | GLM-4 model |
| **Aliyun** | dashscope.aliyuncs.com | Qwen model |

## Key Data Models

### AICategory
```typescript
enum AICategory {
  LLM, ROBOTICS, GEN_ART, AGENTS, ETHICS, HARDWARE, CODING_EFFICIENCY
}
```

### TrendItem
```typescript
interface TrendItem {
  id: string;
  title: string;
  summary: string;
  category: AICategory;
  relevanceScore: number;  // 0-100
  timestamp: string;
  sources: GroundingSource[];
}
```

## State Management

Uses React useState hooks in App.tsx (no external state library):
- `trends` - Fetched trend items
- `radarData` - Radar chart data
- `githubRepos` - Trending repositories
- `favorites` - User-saved items (localStorage)
- `language` - UI language ('en' | 'zh')
- `selectedModel` - Active AI provider

## Pre-Commit Checklist

Before committing changes:
- [ ] Run `npm run build` to verify no build errors
- [ ] Test changes locally with `npm run dev`
- [ ] Ensure TypeScript types are correct
- [ ] Update `docs/architecture.md` if structure changes

## API Development

Serverless functions are in `/api` directory using Vercel Node.js runtime:
- Use `@vercel/node` for request/response types
- Database access via `api/services/supabaseServerService.ts`
- AI generation via `api/services/aiGenerationService.ts`

## Testing

Currently no test framework configured. When adding tests:
- Consider Vitest (Vite-native)
- Jest with React Testing Library for component tests

---

## Skill 管理规则

**当某个命令或工作流满足以下条件时，应将其封装为 Skill：**
1. 命令较为复杂（多步骤、多参数）
2. 使用频率较高（预计会重复执行）
3. 容易出错或需要特定顺序执行

### Skill 目录结构

```
_bmad/custom/skills/
└── skill-name/
    ├── SKILL.md           # Skill 定义（包含 name, description frontmatter）
    ├── scripts/           # 支持脚本（可选）
    └── references/        # 参考文档（可选）
```

### 创建 Skill 后必须更新 CLAUDE.md

在下方「项目专用 Skills」章节添加描述和引用链接。

---

## 项目专用 Skills

<!-- 当创建新 Skill 时，在此处添加条目 -->

| Skill | 描述 | 路径 |
|-------|------|------|
| *暂无* | - | - |


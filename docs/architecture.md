# LLMPulse - Architecture Documentation

> **Project Type:** Web Application (SPA)
> **Architecture Pattern:** Component-based React SPA
> **Generated:** 2026-01-10

---

## 1. System Overview

LLMPulse is a real-time AI trend tracking dashboard that aggregates intelligence from multiple LLM providers and displays it through an interactive radar visualization.

### Core Capabilities
- **Multi-Provider AI Integration**: Connects to 5 AI providers (Gemini, DeepSeek, SiliconFlow, Zhipu, Aliyun)
- **Real-time Trend Tracking**: Fetches and displays latest AI news within 48 hours
- **Interactive Radar Chart**: Visual representation of AI category activity
- **GitHub Trending Repos**: Tracks trending AI repositories
- **Bilingual Support**: English and Chinese (i18n)

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Runtime** | Node.js | (implied) |
| **Framework** | React | 19.2.3 |
| **Language** | TypeScript | 5.8.2 |
| **Build Tool** | Vite | 6.2.0 |
| **Charting** | Recharts | 3.6.0 |
| **AI SDK** | @google/genai | 1.35.0 |
| **Markdown** | react-markdown + remark-gfm | 9.0.0 / 4.0.0 |
| **Styling** | Tailwind CSS | (via CDN in index.html) |

---

## 3. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        LLMPulse Frontend                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   App.tsx   │  │   types.ts  │  │     index.html          │  │
│  │ (Main View) │  │  (Models)   │  │ (Tailwind + FontAwesome)│  │
│  └──────┬──────┘  └─────────────┘  └─────────────────────────┘  │
│         │                                                       │
│  ┌──────┴───────────────────────────────────────────────────┐   │
│  │                     Components/                          │   │
│  │  ┌───────────────┐ ┌───────────────┐ ┌────────────────┐  │   │
│  │  │  RadarChart   │ │   TrendCard   │ │ GitHubRepoCard │  │   │
│  │  │ (Recharts)    │ │ (News Item)   │ │ (Repo Display) │  │   │
│  │  └───────────────┘ └───────────────┘ └────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│         │                                                       │
│  ┌──────┴───────────────────────────────────────────────────┐   │
│  │                   services/geminiService.ts              │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │  fetchAITrends | getRadarData | fetchDetailedAnalysis│ │   │
│  │  │  fetchTrendingRepos | callOpenAICompatible          │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     External AI Providers                       │
├───────────┬───────────┬──────────┬──────────┬──────────────────┤
│  Gemini   │ DeepSeek  │SiliconFlow│  Zhipu  │     Aliyun       │
│(+Grounding│           │(DS-V3)   │ (GLM-4) │    (Qwen)        │
└───────────┴───────────┴──────────┴──────────┴──────────────────┘
```

---

## 4. Data Flow

```
User Query → App.tsx (state: query, modelId)
    │
    ▼
geminiService.ts → Selects Provider → API Call
    │
    ├─ Gemini: GoogleGenAI SDK + Search Grounding
    └─ Others: OpenAI-compatible REST API (fetch)
    │
    ▼
Parse Response → TrendItem[] | RadarPoint[] | GitHubRepo[]
    │
    ▼
App.tsx (state update) → Re-render Components
    │
    ├─ RadarChart: Category activity visualization
    ├─ TrendCard[]: News items with sources
    └─ GitHubRepoCard[]: Trending repositories
```

---

## 5. Key Data Models

### AICategory (Enum)
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

### IntelligenceCore (Provider Config)
```typescript
interface IntelligenceCore {
  id: string;           // Model ID for API
  name: string;         // Display name
  provider: 'gemini' | 'deepseek' | 'siliconflow' | 'zhipu' | 'aliyun';
  supportsGrounding: boolean;  // Only Gemini supports search grounding
}
```

---

## 7. External Dependencies

### AI Provider APIs

| Provider | Endpoint | Authentication |
|----------|----------|----------------|
| **Gemini** | `@google/genai` SDK | `GEMINI_API_KEY` env var |
| **DeepSeek** | `api.deepseek.com` | Bearer token (hardcoded) |
| **SiliconFlow** | `api.siliconflow.cn` | Bearer token (hardcoded) |
| **Zhipu** | `open.bigmodel.cn` | Bearer token (hardcoded) |
| **Aliyun** | `dashscope.aliyuncs.com` | Bearer token (hardcoded) |

### CDN Dependencies (index.html)
- Tailwind CSS v3
- Font Awesome 6.4.0
- Google Fonts (Inter, JetBrains Mono)

---

## 8. State Management

**Pattern:** React useState hooks in App.tsx (no external state library)

| State Variable | Type | Purpose |
|----------------|------|---------|
| `trends` | `TrendItem[]` | Fetched trend items |
| `radarData` | `RadarPoint[]` | Radar chart data |
| `githubRepos` | `GitHubRepo[]` | Trending repositories |
| `favorites` | `TrendItem[]` | User-saved items (localStorage) |
| `tokenUsage` | `TokenUsage` | API consumption tracking |
| `language` | `'en' \| 'zh'` | UI language |
| `selectedModel` | `string` | Active AI provider |
| `activeCategory` | `string \| null` | Radar filter |

---

## 9. Security Considerations

⚠️ **Current Issues:**
1. **Hardcoded API Keys**: All non-Gemini API keys are hardcoded in `geminiService.ts`
2. **Client-side API Calls**: All AI API calls are made directly from browser
3. **No Authentication**: No user auth system

**Recommendations:**
- Move API keys to environment variables
- Implement a backend proxy for API calls
- Add rate limiting

---

## 10. Build & Deployment

```bash
# Development
npm install
npm run dev          # Starts at http://localhost:3000

# Production Build
npm run build        # Outputs to dist/
npm run preview      # Preview production build
```

**Environment Variables:**
- `GEMINI_API_KEY` - Required for Gemini provider

---

## Appendix: Component API Reference

### RadarChart
```tsx
<RadarChart
  data={RadarPoint[]}
  activeCategory={string | null}
  onSelectCategory={(category: string) => void}
/>
```

### TrendCard
```tsx
<TrendCard
  item={TrendItem}
  language={Language}
  isFavorited={boolean}
  onToggleFavorite={(e, item) => void}
  onClick={(item) => void}
/>
```

### GitHubRepoCard
```tsx
<GitHubRepoCard repo={GitHubRepo} />
```


---

## 6. File Structure

```
/
├── index.html          # Entry HTML with Tailwind CDN
├── index.tsx           # React mount point
├── App.tsx             # Main application (665 lines)
├── types.ts            # TypeScript interfaces & constants
├── vite.config.ts      # Vite + env configuration
├── tsconfig.json       # TypeScript config
├── package.json        # Dependencies
├── components/
│   ├── RadarChart.tsx  # Recharts radar visualization
│   ├── TrendCard.tsx   # Individual trend display
│   └── GitHubRepoCard.tsx  # Repository card
├── services/
│   └── geminiService.ts  # Multi-provider AI service layer
└── docs/
    ├── architecture.md     # This file
    └── project-scan-report.json  # Workflow state
```


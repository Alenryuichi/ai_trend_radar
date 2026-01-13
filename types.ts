import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type Language = 'en' | 'zh';

// ============================================================
// Auth Types (用户认证)
// ============================================================

/**
 * 用户配置信息（来自 user_profiles 表）
 */
export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  provider: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 认证状态
 */
export interface AuthState {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * 认证上下文类型
 */
export interface AuthContextType extends AuthState {
  signInWithGitHub: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/**
 * 评论
 */
export interface Comment {
  id: string;
  user_id: string;
  practice_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  // 关联的用户信息（JOIN 查询）
  user_profiles?: UserProfile;
}

/**
 * 收藏
 */
export interface Favorite {
  id: string;
  user_id: string;
  practice_id: string;
  created_at: string;
}

/**
 * 用户实践状态（云端存储）
 */
export interface UserPracticeStatus {
  id: string;
  user_id: string;
  practice_id: string;
  status: 'completed' | 'skipped';
  completed_at: string;
}

// ============================================================
// Daily Practice Types (今日精选)
// ============================================================

/**
 * 今日精選內容 - 前端使用的業務模型
 */
/**
 * 場景標籤類型
 */
export type ScenarioTag =
  | 'debugging'      // 調試
  | 'refactoring'    // 重構
  | 'code-review'    // 代碼審查
  | 'testing'        // 測試
  | 'documentation'  // 文檔
  | 'learning'       // 學習
  | 'productivity'   // 生產力
  | 'prompt-engineering'; // 提示工程

export interface DailyPractice {
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
  /** 場景標籤 - 用於場景化篩選 */
  scenarioTags?: ScenarioTag[];
}

/**
 * 數據庫記錄 - Supabase daily_practices 表結構
 */
export interface DailyPracticeRecord {
  id: string;
  date: string; // YYYY-MM-DD
  main_practice: DailyPractice;
  alt_practices: DailyPractice[];
  ai_model: string | null;
  generation_status: 'success' | 'failed' | 'pending' | null;
  created_at: string;
}

/**
 * 用戶練習狀態
 */
export type PracticeStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

/**
 * 用戶練習狀態記錄（LocalStorage 存儲格式）
 */
export interface PracticeStatusRecord {
  date: string;
  practiceId: string;
  status: PracticeStatus;
  updatedAt: string;
}

/**
 * 通用 API 響應格式
 */
export interface ApiResult<T> {
  data: T | null;
  error: string | null;
  fromCache: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface IntelligenceCore {
  id: string;
  name: string;
  description: string;
  icon: string;
  isDeep: boolean;
  supportsGrounding: boolean;
  provider: 'gemini' | 'deepseek' | 'siliconflow' | 'zhipu' | 'aliyun';
}

export interface TrendItem {
  id: string;
  title: string;
  summary: string;
  category: AICategory;
  relevanceScore: number;
  timestamp: string;
  sources: GroundingSource[];
  usage?: TokenUsage;
}

export interface GitHubRepo {
  name: string;
  url: string;
  description: string;
  stars?: string;
  language?: string;
}

export enum AICategory {
  LLM = 'Large Language Models',
  ROBOTICS = 'Robotics & Embodied AI',
  GEN_ART = 'Generative Media',
  AGENTS = 'AI Agents',
  ETHICS = 'Policy & Ethics',
  HARDWARE = 'Compute & Hardware',
  CODING_EFFICIENCY = 'Coding Efficiency'
}

export interface RadarPoint {
  subject: string;
  A: number;
}

export const INTELLIGENCE_CORES: IntelligenceCore[] = [
  {
    id: 'deepseek-chat',
    name: 'DeepSeek (DS)',
    description: 'Specialized deep reasoning model.',
    icon: 'fa-microchip',
    isDeep: true,
    supportsGrounding: false,
    provider: 'deepseek'
  },
  {
    id: 'deepseek-ai/DeepSeek-V3',
    name: 'SiliconFlow (DS-V3)',
    description: 'High-speed Open Source aggregator.',
    icon: 'fa-server',
    isDeep: false,
    supportsGrounding: false,
    provider: 'siliconflow'
  },
  {
    id: 'glm-4-plus',
    name: 'Zhipu GLM-4',
    description: 'Expert in Chinese technical context.',
    icon: 'fa-leaf',
    isDeep: true,
    supportsGrounding: false,
    provider: 'zhipu'
  },
  {
    id: 'qwen-max',
    name: 'Aliyun Qwen',
    description: 'Top-tier reasoning & long context.',
    icon: 'fa-cloud',
    isDeep: true,
    supportsGrounding: false,
    provider: 'aliyun'
  },
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash',
    description: 'High-speed, efficient intelligence.',
    icon: 'fa-bolt',
    isDeep: false,
    supportsGrounding: true,
    provider: 'gemini'
  }
];

export const TRANSLATIONS = {
  en: {
    radar: "Sector Dominance",
    clusters: "Navigation Clusters",
    digests: "Automated Digests",
    digestDesc: "Our engine synthesizes hundreds of technical signals into concise 2-sentence summaries.",
    summariesGenerated: "Summaries Generated",
    globalPulse: "Global AI Pulse",
    favorites: "Saved Insights",
    noFavorites: "You haven't saved any insights yet.",
    placeholder: "Query technical trends or specific models...",
    analyze: "Analyze",
    refresh: "Refresh Feed",
    sync: "Last Sync",
    live: "Live Intelligence Stream Active",
    signal: "Signal",
    sources: "Verified Sources",
    modelSynthesis: "Model Synthesis Knowledge",
    showMore: "Show All Sources",
    showLess: "Show Less",
    endOfStream: "End of Grounded Stream",
    reset: "Reset Global Feed",
    signalLost: "Signal Lost",
    noTrends: "No significant trends detected for this cluster.",
    devLab: "Coding Efficiency Lab",
    trendingRepos: "Trending Dev Repos",
    repoSummary: "AI-driven coding tools for maximum productivity.",
    sourceFocus: "Source: every.to, Anthropic, Google, Cursor",
    coreSelect: "Intelligence Core",
    groundingActive: "Search Grounding Active",
    groundingDisabled: "Grounding Unavailable (Standard LLM)",
    usageMonitor: "Telemetry Monitor",
    tokens: "Tokens Consumed",
    resetUsage: "Reset Telemetry",
    costEst: "Est. Computation Cost",
  },
  zh: {
    radar: "技术领域热度",
    clusters: "内容分类",
    digests: "自动化摘要",
    digestDesc: "我们的引擎将数百个技术信号合成为简洁的两句式摘要，助您快速掌握核心内容。",
    summariesGenerated: "摘要已生成",
    globalPulse: "全球 AI 动态",
    favorites: "已收藏见解",
    noFavorites: "您还没有收藏任何见解。",
    placeholder: "查询技术趋势或特定模型...",
    analyze: "深度分析",
    refresh: "刷新动态",
    sync: "最后同步时间",
    live: "实时情报流已激活",
    signal: "信号强度",
    sources: "验证来源",
    modelSynthesis: "模型合成知识",
    showMore: "展示全部来源",
    showLess: "收起来源",
    endOfStream: "情报流结束",
    reset: "重置全局流",
    signalLost: "信号丢失",
    noTrends: "未在该分类下检测到显著趋势，请尝试扩大查询范围。",
    devLab: "编程提效实验室",
    trendingRepos: "热门 GitHub 仓库",
    repoSummary: "专注于 AI 编程提效的开源神器。",
    sourceFocus: "聚焦: every.to, Claude, Gemini, Cursor 专家文章",
    coreSelect: "智能内核",
    groundingActive: "实时搜索增强已开启",
    groundingDisabled: "无法使用搜索增强 (标准模型)",
    usageMonitor: "资源消耗监控",
    tokens: "累计 Token 消耗",
    resetUsage: "清空统计",
    costEst: "预估计算成本",
  }
};


export type Language = 'en' | 'zh';

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

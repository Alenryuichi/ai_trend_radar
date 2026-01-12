/**
 * AI 內容生成服務 - Vercel Serverless 環境
 * 用於每日精選內容的自動生成，支持多模型 Fallback
 * 
 * Fallback 順序: DeepSeek → Zhipu → Aliyun
 */

// ============================================================
// Types
// ============================================================

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
}

export interface GenerationResult {
  mainPractice: DailyPractice;
  altPractices: DailyPractice[];
  modelUsed: 'deepseek' | 'zhipu' | 'aliyun';
}

// ============================================================
// API Configuration (Serverless 環境使用 process.env)
// ============================================================

const API_CONFIG = {
  deepseek: {
    url: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    getKey: () => process.env.DEEPSEEK_API_KEY || ''
  },
  zhipu: {
    url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4-plus',
    getKey: () => process.env.ZHIPU_API_KEY || ''
  },
  aliyun: {
    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model: 'qwen-plus',
    getKey: () => process.env.ALIYUN_API_KEY || ''
  }
} as const;

type ModelProvider = keyof typeof API_CONFIG;

// ============================================================
// Prompt Template
// ============================================================

const GENERATION_PROMPT = `你是一位 AI 輔助編程專家。請生成今日的「AI 編程最佳實踐」推薦。

要求：
1. 生成 1 個主推薦和 2 個備選推薦
2. 每個推薦必須包含：
   - id: 唯一標識符（格式: practice-YYYYMMDD-序號）
   - title: 標題（15字以內）
   - summary: 簡述（50字以內）
   - difficulty: 難度（beginner/intermediate/advanced）
   - estimatedMinutes: 預計時間（分鐘數字）
   - steps: 實踐步驟（3-5步的數組）
   - whyItMatters: 為何重要（50字以內）
   - sourceUrl: 參考來源 URL
   - sourceName: 來源名稱
   - tools: 相關工具（數組）
   - tags: 標籤（數組）

3. 內容應聚焦於：
   - AI 輔助編程工具使用技巧
   - Prompt Engineering 最佳實踐
   - AI Code Review 方法
   - AI 輔助調試技巧
   - 生產力提升方法

請以 JSON 格式輸出（不要包含 markdown 代碼塊標記）：
{
  "mainPractice": {...},
  "altPractices": [{...}, {...}]
}`;

// ============================================================
// Model-specific API Calls
// ============================================================

async function callOpenAICompatibleAPI(
  provider: ModelProvider,
  prompt: string
): Promise<{ mainPractice: DailyPractice; altPractices: DailyPractice[] }> {
  const config = API_CONFIG[provider];
  const apiKey = config.getKey();
  
  if (!apiKey) {
    throw new Error(`${provider} API key not configured`);
  }

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `${provider} API error: ${response.status} - ${errorData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error(`${provider} returned empty content`);
  }

  // Parse JSON response
  const parsed = JSON.parse(content);
  return {
    mainPractice: parsed.mainPractice,
    altPractices: parsed.altPractices || []
  };
}

// ============================================================
// Individual Model Functions
// ============================================================

async function generateWithDeepSeek(): Promise<{ mainPractice: DailyPractice; altPractices: DailyPractice[] }> {
  return callOpenAICompatibleAPI('deepseek', GENERATION_PROMPT);
}

async function generateWithZhipu(): Promise<{ mainPractice: DailyPractice; altPractices: DailyPractice[] }> {
  return callOpenAICompatibleAPI('zhipu', GENERATION_PROMPT);
}

async function generateWithAliyun(): Promise<{ mainPractice: DailyPractice; altPractices: DailyPractice[] }> {
  return callOpenAICompatibleAPI('aliyun', GENERATION_PROMPT);
}

// ============================================================
// Main Generation Function with Fallback
// ============================================================

/**
 * 生成每日精選內容，支持多模型 Fallback
 * Fallback 順序: DeepSeek → Zhipu → Aliyun
 */
export async function generateDailyContent(): Promise<GenerationResult> {
  const errors: string[] = [];
  const providers: Array<{ name: ModelProvider; fn: () => Promise<{ mainPractice: DailyPractice; altPractices: DailyPractice[] }> }> = [
    { name: 'deepseek', fn: generateWithDeepSeek },
    { name: 'zhipu', fn: generateWithZhipu },
    { name: 'aliyun', fn: generateWithAliyun }
  ];

  for (const provider of providers) {
    try {
      console.log(`[AI Generation] Trying ${provider.name}...`);
      const result = await provider.fn();
      console.log(`[AI Generation] Success with ${provider.name}`);
      return {
        mainPractice: result.mainPractice,
        altPractices: result.altPractices,
        modelUsed: provider.name
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${provider.name}: ${message}`);
      console.error(`[AI Generation] ${provider.name} failed:`, message);
    }
  }

  throw new Error(`所有模型都失敗: ${errors.join('; ')}`);
}

/**
 * 驗證生成的內容是否符合 DailyPractice 結構
 */
export function validateDailyPractice(practice: unknown): practice is DailyPractice {
  if (!practice || typeof practice !== 'object') return false;

  const p = practice as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.title === 'string' &&
    typeof p.summary === 'string' &&
    ['beginner', 'intermediate', 'advanced'].includes(p.difficulty as string) &&
    typeof p.estimatedMinutes === 'number' &&
    Array.isArray(p.steps) &&
    typeof p.whyItMatters === 'string' &&
    Array.isArray(p.tools) &&
    Array.isArray(p.tags)
  );
}


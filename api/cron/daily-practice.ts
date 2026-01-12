/**
 * Vercel Cron API Route - 每日精選內容生成
 * 
 * 執行時間: 每日 UTC 00:00 (北京時間 08:00)
 * 路徑: /api/cron/daily-practice
 * 
 * 注意：所有代碼內聯以避免 Vercel Serverless 模組解析問題
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// Types
// ============================================================

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

interface GenerationResult {
  mainPractice: DailyPractice;
  altPractices: DailyPractice[];
  modelUsed: 'deepseek' | 'zhipu' | 'aliyun';
}

interface DailyPracticeRecord {
  id: string;
  date: string;
  main_practice: DailyPractice;
  alt_practices: DailyPractice[];
  ai_model: string | null;
  generation_status: 'success' | 'failed' | 'pending' | null;
  created_at: string;
}

// ============================================================
// Supabase Client (Lazy Init)
// ============================================================

let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!url || !key) {
      throw new Error(`Supabase config missing: URL=${!!url}, Key=${!!key}`);
    }
    
    supabaseInstance = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return supabaseInstance;
}

async function getDailyPractice(date: string): Promise<DailyPracticeRecord | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('daily_practices')
    .select('*')
    .eq('date', date)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('getDailyPractice error:', error);
    return null;
  }
  return data as DailyPracticeRecord;
}

async function saveDailyPractice(
  date: string,
  mainPractice: DailyPractice,
  altPractices: DailyPractice[],
  aiModel: string
): Promise<DailyPracticeRecord | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('daily_practices')
    .insert({
      date,
      main_practice: mainPractice,
      alt_practices: altPractices,
      ai_model: aiModel,
      generation_status: 'success'
    })
    .select()
    .single();

  if (error) {
    console.error('saveDailyPractice error:', error);
    throw new Error(`Failed to save: ${error.message}`);
  }
  return data as DailyPracticeRecord;
}

// ============================================================
// AI Generation
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
   - sourceUrl: 參考來源 URL（可以是空字串）
   - sourceName: 來源名稱（可以是空字串）
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

async function callAI(provider: ModelProvider): Promise<{ mainPractice: DailyPractice; altPractices: DailyPractice[] }> {
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
      messages: [{ role: 'user', content: GENERATION_PROMPT }],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`${provider} API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error(`${provider} returned empty content`);
  }

  // 清理可能的 markdown 代碼塊
  const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleanContent);
  
  return {
    mainPractice: parsed.mainPractice,
    altPractices: parsed.altPractices || []
  };
}

async function generateDailyContent(): Promise<GenerationResult> {
  const errors: string[] = [];
  const providers: ModelProvider[] = ['deepseek', 'zhipu', 'aliyun'];

  for (const provider of providers) {
    try {
      console.log(`[AI] Trying ${provider}...`);
      const result = await callAI(provider);
      console.log(`[AI] Success with ${provider}`);
      return { ...result, modelUsed: provider };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${provider}: ${message}`);
      console.error(`[AI] ${provider} failed:`, message);
    }
  }

  throw new Error(`所有模型都失敗: ${errors.join('; ')}`);
}

// ============================================================
// Handler
// ============================================================

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const CRON_SECRET = process.env.CRON_SECRET;
  const authHeader = request.headers.authorization;
  
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    console.error('[Cron] Unauthorized request');
    return response.status(401).json({ error: 'Unauthorized' });
  }

  console.log('[Cron] Starting daily practice generation...');

  try {
    const today = new Date().toISOString().split('T')[0];
    console.log(`[Cron] Checking if content exists for ${today}...`);

    const existing = await getDailyPractice(today);
    if (existing) {
      console.log(`[Cron] Content already exists for ${today}`);
      return response.status(200).json({
        success: true,
        message: 'Content already generated for today',
        date: today,
        skipped: true
      });
    }

    console.log('[Cron] Generating new content...');
    const content = await generateDailyContent();
    console.log(`[Cron] Content generated using model: ${content.modelUsed}`);

    console.log('[Cron] Saving to Supabase...');
    const saved = await saveDailyPractice(
      today,
      content.mainPractice,
      content.altPractices,
      content.modelUsed
    );

    console.log(`[Cron] Successfully saved with ID: ${saved?.id}`);

    return response.status(200).json({
      success: true,
      message: 'Daily practice generated successfully',
      date: today,
      model: content.modelUsed,
      recordId: saved?.id
    });

  } catch (error) {
    console.error('[Cron] Error:', error);
    
    return response.status(500).json({
      success: false,
      error: 'Generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

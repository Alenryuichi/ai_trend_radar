/**
 * Vercel Cron API Route - 每日精选内容生成
 *
 * 执行时间: 每日 UTC 00:00 (北京时间 08:00)
 * 路径: /api/cron/daily-practice
 *
 * 注意：所有代码内联以避免 Vercel Serverless 模块解析问题
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// Types
// ============================================================

type ScenarioTag =
  | 'debugging'      // 调试
  | 'refactoring'    // 重构
  | 'code-review'    // 代码审查
  | 'testing'        // 测试
  | 'documentation'  // 文档
  | 'learning'       // 学习
  | 'productivity'   // 生产力
  | 'prompt-engineering'; // 提示工程

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
  scenarioTags: ScenarioTag[];
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

interface RawTrend {
  source: string;
  title: string;
  link: string;
  content?: string;
  publishedAt?: string;
  inferredTags?: ScenarioTag[];
}

interface RSSSource {
  id: string;
  name: string;
  url: string;
  tags: ScenarioTag[];
}

// ============================================================
// RSS Configuration
// ============================================================

const RSSHUB_BASE_URL = process.env.RSSHUB_BASE_URL || 'https://rsshub.app';
const FETCH_TIMEOUT_MS = 8000; // 增加 timeout 應對 RSSHub 延遲

const RSS_SOURCES: RSSSource[] = [
  {
    id: 'hackernews',
    name: 'Hacker News AI',
    url: 'https://hnrss.org/newest?q=AI&count=20', // 放寬搜索條件
    tags: []
  },
  {
    id: 'github',
    name: 'GitHub Trending',
    url: `${RSSHUB_BASE_URL}/github/trending/daily/javascript`,
    tags: ['productivity', 'refactoring']
  },
  {
    id: 'anthropic',
    name: 'Anthropic News',
    url: `${RSSHUB_BASE_URL}/anthropic/news`,
    tags: ['prompt-engineering', 'learning']
  }
];

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
// RSS 採集函數
// ============================================================

async function fetchRSSFeed(source: RSSSource): Promise<RawTrend[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'LLMPulse/1.0' }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    // 簡單 XML 解析 - 提取 <item> 或 <entry>
    const items: RawTrend[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>|<entry>([\s\S]*?)<\/entry>/gi;
    let match;

    while ((match = itemRegex.exec(text)) !== null && items.length < 10) {
      const content = match[1] || match[2];
      const title = content.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i)?.[1] || '';
      const link = content.match(/<link[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/i)?.[1]
                || content.match(/<link[^>]*href="([^"]+)"/i)?.[1] || '';
      const desc = content.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1]
                || content.match(/<content[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content>/i)?.[1] || '';
      const pubDate = content.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i)?.[1]
                   || content.match(/<published[^>]*>(.*?)<\/published>/i)?.[1];

      if (title && link) {
        items.push({
          source: source.id,
          title: title.replace(/<[^>]+>/g, '').trim(),
          link: link.trim(),
          content: desc.replace(/<[^>]+>/g, '').substring(0, 500),
          publishedAt: pubDate ? new Date(pubDate).toISOString() : undefined,
          inferredTags: source.tags.length > 0 ? source.tags : undefined
        });
      }
    }

    console.log(`[RSS] ${source.name}: ${items.length} items`);
    return items;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function fetchAllRSSFeeds(): Promise<{ trends: RawTrend[]; errors: string[] }> {
  console.log(`[RSS] Fetching ${RSS_SOURCES.length} sources...`);

  const results = await Promise.allSettled(
    RSS_SOURCES.map(source => fetchRSSFeed(source))
  );

  const trends: RawTrend[] = [];
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      trends.push(...result.value);
    } else {
      errors.push(`${RSS_SOURCES[index].name}: ${result.reason?.message || 'Failed'}`);
      console.error(`[RSS] ${RSS_SOURCES[index].name} failed:`, result.reason?.message);
    }
  });

  console.log(`[RSS] Total: ${trends.length} items, ${errors.length} errors`);
  return { trends, errors };
}

async function cleanupOldTrends(): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('raw_trends')
    .delete()
    .lt('fetched_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('[Cleanup] Failed to cleanup old trends:', error);
  } else {
    console.log('[Cleanup] Old trends cleaned up');
  }
}

async function saveRawTrends(trends: RawTrend[]): Promise<number> {
  if (trends.length === 0) return 0;

  const supabase = getSupabase();
  const records = trends.map(t => ({
    source: t.source,
    title: t.title,
    link: t.link,
    content: t.content || null,
    published_at: t.publishedAt || null,
    inferred_tags: t.inferredTags || null
  }));

  const { data, error } = await supabase
    .from('raw_trends')
    .upsert(records, { onConflict: 'link', ignoreDuplicates: true })
    .select();

  if (error) {
    console.error('[RSS] Failed to save trends:', error);
    return 0;
  }

  console.log(`[RSS] Saved ${data?.length || 0} new trends`);
  return data?.length || 0;
}

async function getRecentTrends(limit: number = 10): Promise<RawTrend[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('raw_trends')
    .select('*')
    .order('fetched_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[RSS] Failed to get recent trends:', error);
    return [];
  }

  return (data || []).map(r => ({
    source: r.source,
    title: r.title,
    link: r.link,
    content: r.content || undefined,
    publishedAt: r.published_at || undefined,
    inferredTags: r.inferred_tags || undefined
  }));
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

function buildPrompt(trendContext: string): string {
  const basePrompt = `你是一位 AI 辅助编程专家。请生成今日的「AI 编程最佳实践」推荐。

要求：
1. 生成 1 个主推荐和 2 个备选推荐
2. 每个推荐必须包含：
   - id: 唯一标识符（格式: practice-YYYYMMDD-序号）
   - title: 标题（15字以内）
   - summary: 简述（50字以内）
   - difficulty: 难度（beginner/intermediate/advanced）
   - estimatedMinutes: 预计时间（分钟数字）
   - steps: 实践步骤（3-5步的数组）
   - whyItMatters: 为何重要（50字以内）
   - sourceUrl: 参考来源 URL（必须来自真实数据，否则留空）
   - sourceName: 来源名称（必须来自真实数据，否则留空）
   - tools: 相关工具（数组）
   - tags: 标签（数组）
   - scenarioTags: 场景标签（数组，从以下选项中选择 1-3 个最相关的）:
     * "debugging" - 调试场景
     * "refactoring" - 重构场景
     * "code-review" - 代码审查场景
     * "testing" - 测试场景
     * "documentation" - 文档场景
     * "learning" - 学习场景
     * "productivity" - 生产力场景
     * "prompt-engineering" - 提示工程场景

3. 内容应聚焦于：
   - AI 辅助编程工具使用技巧
   - Prompt Engineering 最佳实践
   - AI Code Review 方法
   - AI 辅助调试技巧
   - 生产力提升方法

4. 每日推荐应尽量覆盖不同场景和难度，让不同阶段的开发者都能受益。

5. 请务必使用简体中文输出所有内容。

请以 JSON 格式输出（不要包含 markdown 代码块标记）：
{
  "mainPractice": {...},
  "altPractices": [{...}, {...}]
}`;

  if (trendContext) {
    return `${basePrompt}

【重要】以下是今日真实热点数据，请优先基于这些内容生成推荐：

${trendContext}

要求：
- sourceUrl 和 sourceName 必须来自上述真实数据
- 如数据不足或不相关，可补充 AI 知识，但 sourceUrl 必须留空`;
  }

  return basePrompt;
}

async function callAI(provider: ModelProvider, prompt: string): Promise<{ mainPractice: DailyPractice; altPractices: DailyPractice[] }> {
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

  // 清理可能的 markdown 代码块
  const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleanContent);

  return {
    mainPractice: parsed.mainPractice,
    altPractices: parsed.altPractices || []
  };
}

async function generateDailyContent(trendContext: string = ''): Promise<GenerationResult> {
  const errors: string[] = [];
  const providers: ModelProvider[] = ['deepseek', 'zhipu', 'aliyun'];
  const prompt = buildPrompt(trendContext);

  for (const provider of providers) {
    try {
      console.log(`[AI] Trying ${provider}...`);
      const result = await callAI(provider, prompt);
      console.log(`[AI] Success with ${provider}`);
      return { ...result, modelUsed: provider };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${provider}: ${message}`);
      console.error(`[AI] ${provider} failed:`, message);
    }
  }

  throw new Error(`所有模型都失败: ${errors.join('; ')}`);
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

  console.log('[Cron] Starting daily practice generation with RSS integration...');

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

    // Step 1: 清理 30 天前的舊數據
    console.log('[Cron] Cleaning up old trends...');
    await cleanupOldTrends();

    // Step 2: 採集 RSS 數據
    console.log('[Cron] Fetching RSS feeds...');
    const { trends: newTrends, errors: rssErrors } = await fetchAllRSSFeeds();

    // Step 3: 保存新採集的數據
    if (newTrends.length > 0) {
      console.log(`[Cron] Saving ${newTrends.length} new trends...`);
      await saveRawTrends(newTrends);
    }

    // Step 4: 獲取最近的趨勢數據用於 AI 生成
    const recentTrends = await getRecentTrends(10);
    let trendContext = '';

    if (recentTrends.length > 0) {
      console.log(`[Cron] Using ${recentTrends.length} trends for AI context`);
      trendContext = recentTrends
        .map(t => `- [${t.source}] ${t.title}\n  URL: ${t.link}`)
        .join('\n');
    } else {
      console.log('[Cron] No trends available, using pure AI generation');
    }

    // Step 5: 生成內容（帶 RSS 上下文）
    console.log('[Cron] Generating content with AI...');
    const content = await generateDailyContent(trendContext);
    console.log(`[Cron] Content generated using model: ${content.modelUsed}`);

    // Step 6: 保存生成的內容
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
      recordId: saved?.id,
      rss: {
        trendsCollected: newTrends.length,
        trendsUsed: recentTrends.length,
        errors: rssErrors.length > 0 ? rssErrors : undefined
      }
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

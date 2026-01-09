
import { GoogleGenAI, Type } from "@google/genai";
import { AICategory, TrendItem, GroundingSource, Language, GitHubRepo, INTELLIGENCE_CORES, TokenUsage, RadarPoint, BenchmarkData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Simple In-Memory Cache
const responseCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// API 密钥配置
const KEYS = {
  deepseek: "sk-431b5aec7cba4d1094554e8cf908d1cd",
  siliconflow: "sk-azlnezxwjauxzragjfykkyezsvaltumcwfqtqpmfqspxabzo", 
  zhipu: "3938a544bd084365983adaf16f307d4d.8ruJvQoplkQC2WhG",           
  aliyun: "sk-df088ac3731e4fa8a3858c7c58a64384"          
};

const PROVIDERS: Record<string, { url: string }> = {
  deepseek: { url: "https://api.deepseek.com/chat/completions" },
  siliconflow: { url: "https://api.siliconflow.cn/v1/chat/completions" },
  zhipu: { url: "https://open.bigmodel.cn/api/paas/v4/chat/completions" },
  aliyun: { url: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions" }
};

interface AIResponse<T> {
  data: T;
  usage: TokenUsage;
}

/**
 * Retry wrapper with exponential backoff for handling 429s
 */
async function runWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.message?.includes('429') || error?.status === 429 || error?.code === 429;
    if (isRateLimit && retries > 0) {
      console.warn(`Rate limit hit (429). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return runWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

const callOpenAICompatible = async (prompt: string, modelId: string, provider: string): Promise<{ text: string, usage: TokenUsage }> => {
  const config = PROVIDERS[provider];
  const key = (KEYS as any)[provider];
  
  return runWithRetry(async () => {
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: prompt }],
        stream: false,
        temperature: 0.1 
      })
    });
    
    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(`${provider} API error (${response.status}): ${errData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      }
    };
  });
};

export const fetchAITrends = async (query: string, lang: Language, modelId: string = 'deepseek-chat', category?: string): Promise<AIResponse<TrendItem[]>> => {
  const cacheKey = `trends-${lang}-${modelId}-${category || 'none'}-${query}`;
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

  const isZh = lang === 'zh';
  const core = INTELLIGENCE_CORES.find(c => c.id === modelId) || INTELLIGENCE_CORES[0];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const isCoding = category === AICategory.CODING_EFFICIENCY;
  const prompt = isZh 
    ? `你是顶级AI情报专家。今天是 ${todayStr}。
      任务：搜索并总结【过去48小时内】发生的AI领域重大突破。
      ${isCoding ? '特别关注：编程提效工具（Cursor, Windsurf, Trae, DeepSeek-V3/R1）。严格禁止输出2024年12月之前的信息。' : ''}
      回复格式（严格）：
      [TITLE]: 标题
      [CATEGORY]: 从 (Large Language Models, Robotics & Embodied AI, Generative Media, AI Agents, Policy & Ethics, Compute & Hardware, Coding Efficiency) 选择
      [SUMMARY]: 两句技术摘要。
      [SCORE]: 0-100得分
      ---END_ITEM---`
    : `Expert AI pulse. Today is ${todayStr}. 
      Task: Summarize AI breakthroughs from the LAST 48 HOURS ONLY. 
      ${isCoding ? 'Focus on AI Coding Efficiency (Cursor, Windsurf, Trae, DeepSeek-V3/R1). Strictly NO data before Dec 2024.' : ''}
      Format:
      [TITLE]: Headline
      [CATEGORY]: Category
      [SUMMARY]: 2-sentence technical summary.
      [SCORE]: 0-100
      ---END_ITEM---`;

  try {
    const result = await runWithRetry(async () => {
      let text = "";
      let usage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
      let groundingChunks: any[] = [];

      if (core.provider === 'gemini') {
        const response = await ai.models.generateContent({
          model: modelId,
          contents: prompt,
          config: { tools: [{ googleSearch: {} }] },
        });
        text = response.text || "";
        groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const u = response.usageMetadata;
        if (u) {
          usage = {
            promptTokens: u.promptTokenCount || 0,
            completionTokens: u.candidatesTokenCount || 0,
            totalTokens: u.totalTokenCount || 0
          };
        }
      } else {
        const res = await callOpenAICompatible(prompt, modelId, core.provider);
        text = res.text;
        usage = res.usage;
      }

      const items: TrendItem[] = [];
      const rawItems = text.split('---END_ITEM---').filter(i => i.trim().length > 10);
      const extractedSources: GroundingSource[] = groundingChunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({ title: chunk.web.title || "Latest Source", uri: chunk.web.uri }));

      rawItems.forEach((raw, index) => {
        const title = raw.match(/\[TITLE\]:\s*(.*)/)?.[1] || (isZh ? "最新 AI 进展" : "Latest AI Update");
        const summary = raw.match(/\[SUMMARY\]:\s*([\s\S]*?)(?=\n\[|$)/)?.[1] || "";
        const catRaw = raw.match(/\[CATEGORY\]:\s*(.*)/)?.[1] || "Large Language Models";
        const score = parseInt(raw.match(/\[SCORE\]:\s*(\d+)/)?.[1] || "85");

        let categoryEnum = AICategory.LLM;
        for (const val of Object.values(AICategory)) {
          if (catRaw.toLowerCase().includes(val.toLowerCase()) || val.toLowerCase().includes(catRaw.toLowerCase())) {
            categoryEnum = val;
            break;
          }
        }

        items.push({
          id: `trend-${Date.now()}-${index}`,
          title: title.trim(),
          summary: summary.trim(),
          category: categoryEnum,
          relevanceScore: score,
          timestamp: new Date().toISOString(),
          sources: extractedSources
        });
      });

      return { data: items, usage };
    });

    responseCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error("Error fetching AI trends:", error);
    return { data: [], usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
  }
};

export const fetchCodingBenchmarks = async (lang: Language, modelId: string = 'gemini-3-flash-preview'): Promise<AIResponse<BenchmarkData[]>> => {
  const cacheKey = `benchmarks-${lang}-${modelId}`;
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

  const core = INTELLIGENCE_CORES.find(c => c.id === modelId) || INTELLIGENCE_CORES[0];
  const prompt = `Return a JSON array of the top 5 coding models as of 2025 and their HumanEval scores. 
    Models to evaluate: DeepSeek-V3, Claude 3.5 Sonnet, Gemini 2.0 Flash, GPT-4o, DeepSeek-R1. 
    Format only as JSON: [{"model": "string", "score": number, "metric": "HumanEval"}]`;

  try {
    const result = await runWithRetry(async () => {
      let text = "";
      let usage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

      if (core.provider === 'gemini') {
        const response = await ai.models.generateContent({
          model: modelId,
          contents: prompt,
          config: { 
            responseMimeType: 'application/json',
            tools: [{ googleSearch: {} }]
          }
        });
        text = response.text || "[]";
        const u = response.usageMetadata;
        usage = { 
          promptTokens: u?.promptTokenCount || 0, 
          completionTokens: u?.candidatesTokenCount || 0, 
          totalTokens: u?.totalTokenCount || 0 
        };
      } else {
        const res = await callOpenAICompatible(prompt, modelId, core.provider);
        text = res.text;
        usage = res.usage;
      }
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      return { data: JSON.parse(jsonMatch ? jsonMatch[0] : "[]"), usage };
    });
    
    responseCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch {
    return { data: [], usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
  }
};

export const fetchTrendingRepos = async (lang: Language, modelId: string = 'deepseek-chat'): Promise<AIResponse<GitHubRepo[]>> => {
  const cacheKey = `repos-${lang}-${modelId}`;
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

  const core = INTELLIGENCE_CORES.find(c => c.id === modelId) || INTELLIGENCE_CORES[0];
  const prompt = `Return 3 trending AI repos for AI Coding Efficiency as RAW JSON. Language: ${lang}.`;

  try {
    const result = await runWithRetry(async () => {
      let text = "";
      let usage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

      if (core.provider === 'gemini') {
        const response = await ai.models.generateContent({
          model: modelId,
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json"
          },
        });
        text = response.text || "";
        const u = response.usageMetadata;
        if (u) {
          usage = {
            promptTokens: u.promptTokenCount || 0,
            completionTokens: u.candidatesTokenCount || 0,
            totalTokens: u.totalTokenCount || 0
          };
        }
      } else {
        const res = await callOpenAICompatible(prompt, modelId, core.provider);
        text = res.text;
        usage = res.usage;
      }
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      return { data: JSON.parse(jsonMatch ? jsonMatch[0] : "[]"), usage };
    });
    responseCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    return { data: [], usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
  }
};

export const fetchDetailedAnalysis = async (item: TrendItem, lang: Language, modelId: string = 'deepseek-chat'): Promise<AIResponse<string>> => {
  const cacheKey = `analysis-${lang}-${modelId}-${item.id}`;
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

  const core = INTELLIGENCE_CORES.find(c => c.id === modelId) || INTELLIGENCE_CORES[0];
  
  try {
    const result = await runWithRetry(async () => {
      let text = "";
      let usage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

      if (core.provider === 'gemini') {
        const response = await ai.models.generateContent({
          model: modelId,
          contents: `Deep technical analysis for: ${item.title}. Focus on efficiency gains. Use Markdown. Language: ${lang === 'zh' ? 'Chinese' : 'English'}.`,
          config: { tools: [{ googleSearch: {} }] },
        });
        text = response.text || "";
        const u = response.usageMetadata;
        usage = { 
          promptTokens: u?.promptTokenCount || 0, 
          completionTokens: u?.candidatesTokenCount || 0, 
          totalTokens: u?.totalTokenCount || 0 
        };
      } else {
        const res = await callOpenAICompatible(`Deep technical analysis for: ${item.title}. Use Markdown. Language: ${lang}.`, modelId, core.provider);
        text = res.text;
        usage = res.usage;
      }

      return { data: text, usage };
    });
    responseCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    return { data: "Fetch failed", usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
  }
};

export const getRadarData = async (lang: Language, modelId: string = 'deepseek-chat'): Promise<AIResponse<RadarPoint[]>> => {
  const cacheKey = `radar-${lang}-${modelId}`;
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

  const core = INTELLIGENCE_CORES.find(c => c.id === modelId) || INTELLIGENCE_CORES[0];
  const prompt = `AI R&D intensity (0-100) for sectors. JSON: [{subject: string, A: number}]. Language: ${lang}.`;

  try {
    const result = await runWithRetry(async () => {
      let text = "";
      let usage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

      if (core.provider === 'gemini') {
        const response = await ai.models.generateContent({
          model: modelId,
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
        text = response.text || "";
        const u = response.usageMetadata;
        if (u) {
          usage = {
            promptTokens: u.promptTokenCount || 0,
            completionTokens: u.candidatesTokenCount || 0,
            totalTokens: u.totalTokenCount || 0
          };
        }
      } else {
        const res = await callOpenAICompatible(prompt, modelId, core.provider);
        text = res.text;
        usage = res.usage;
      }
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      return { data: JSON.parse(jsonMatch ? jsonMatch[0] : "[]"), usage };
    });
    responseCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    return { data: [], usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
  }
};

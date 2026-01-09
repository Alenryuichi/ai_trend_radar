
import { GoogleGenAI, Type } from "@google/genai";
import { AICategory, TrendItem, GroundingSource, Language, GitHubRepo, INTELLIGENCE_CORES, TokenUsage, RadarPoint } from "../types";

// Always use the standard initialization pattern for GoogleGenAI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

const callOpenAICompatible = async (prompt: string, modelId: string, provider: string): Promise<{ text: string, usage: TokenUsage }> => {
  const config = PROVIDERS[provider];
  const key = (KEYS as any)[provider];
  
  try {
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
        temperature: 0.1 // 降低随机性以减少日期幻觉
      })
    });
    
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(`${provider} API error: ${errData.error?.message || response.statusText}`);
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
  } catch (error: any) {
    console.error(`${provider} call failed:`, error);
    throw error;
  }
};

export const fetchAITrends = async (query: string, lang: Language, modelId: string = 'deepseek-chat', category?: string): Promise<AIResponse<TrendItem[]>> => {
  const isZh = lang === 'zh';
  const core = INTELLIGENCE_CORES.find(c => c.id === modelId) || INTELLIGENCE_CORES[0];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  // 优化搜索关键词，加入时间限定
  let searchQuery = category 
    ? `Latest AI breakthroughs in ${category} after 2024-12-01: ${query}`
    : `Major AI breakthroughs and tech news in last 48 hours (Today: ${todayStr}): ${query}`;

  const prompt = isZh 
    ? `你是顶级AI情报专家。今天是 ${todayStr}。
      任务：搜索并总结【过去48小时内】发生的AI领域重大突破。
      要求：
      1. 禁止包含陈旧消息（如Gemini 1.5旧发布、GPT-4旧闻）。
      2. 聚焦 DeepSeek-V3/R1, Gemini 2.0, Claude最新更新, Sora进展, 具身智能新突破。
      3. 确保日期真实，不得虚构。
      回复格式（严格）：
      [TITLE]: 标题
      [CATEGORY]: 从 (Large Language Models, Robotics & Embodied AI, Generative Media, AI Agents, Policy & Ethics, Compute & Hardware, Coding Efficiency) 选择
      [SUMMARY]: 两句技术摘要（禁止空话）。
      [SCORE]: 0-100得分
      ---END_ITEM---`
    : `Expert AI pulse. Today is ${todayStr}. 
      Task: Summarize AI breakthroughs from the LAST 48 HOURS ONLY. 
      Focus on DeepSeek-V3/R1, Gemini 2.0, latest Claude, Sora, and embodied AI.
      NO STALE NEWS (e.g., old Gemini 1.5 alerts).
      Format:
      [TITLE]: Headline
      [CATEGORY]: One of (Large Language Models, Robotics & Embodied AI, Generative Media, AI Agents, Policy & Ethics, Compute & Hardware, Coding Efficiency)
      [SUMMARY]: 2-sentence technical summary.
      [SCORE]: 0-100
      ---END_ITEM---`;

  try {
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
      .map((chunk: any) => ({
        title: chunk.web.title || "Latest Source",
        uri: chunk.web.uri
      }));

    rawItems.forEach((raw, index) => {
      const title = raw.match(/\[TITLE\]:\s*(.*)/)?.[1] || (isZh ? "最新 AI 进展" : "Latest AI Update");
      const summary = raw.match(/\[SUMMARY\]:\s*([\s\S]*?)(?=\n\[|$)/)?.[1] || (isZh ? "暂无详细摘要内容。" : "Analysis of recent developments.");
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
  } catch (error) {
    console.error("Error fetching AI trends:", error);
    return { data: [], usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
  }
};

export const fetchTrendingRepos = async (lang: Language, modelId: string = 'deepseek-chat'): Promise<AIResponse<GitHubRepo[]>> => {
  const isZh = lang === 'zh';
  const core = INTELLIGENCE_CORES.find(c => c.id === modelId) || INTELLIGENCE_CORES[0];
  const todayStr = new Date().toISOString().split('T')[0];
  const prompt = `Return 3 trending AI GitHub repos for ${todayStr} (name, url, desc, stars, lang) as RAW JSON ARRAY ONLY. ${isZh ? 'Desc in Chinese.' : ''}`;

  try {
    let text = "";
    let usage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    if (core.provider === 'gemini') {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                url: { type: Type.STRING },
                description: { type: Type.STRING },
                stars: { type: Type.STRING },
                language: { type: Type.STRING },
              },
              required: ["name", "url", "description"]
            }
          }
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
  } catch (error) {
    return { data: [], usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
  }
};

export const fetchDetailedAnalysis = async (item: TrendItem, lang: Language, modelId: string = 'deepseek-chat'): Promise<AIResponse<string>> => {
  const isZh = lang === 'zh';
  const core = INTELLIGENCE_CORES.find(c => c.id === modelId) || INTELLIGENCE_CORES[0];
  const todayStr = new Date().toISOString().split('T')[0];
  const prompt = `Current Date: ${todayStr}. Deep technical analysis for: ${item.title}. 
    Focus on WHY this is important TODAY.
    Use sections (##), bullets, and Markdown tables. 
    Language: ${isZh ? 'Chinese' : 'English'}.`;

  try {
    if (core.provider === 'gemini') {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] },
      });
      const u = response.usageMetadata;
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sourcesMd = groundingChunks
        .filter((c: any) => c.web)
        .map((c: any) => `- [${c.web.title || c.web.uri}](${c.web.uri})`)
        .join('\n');
      
      const text = response.text || "";
      const finalData = sourcesMd ? `${text}\n\n### ${lang === 'zh' ? '实时参考来源' : 'Real-time Sources'}\n${sourcesMd}` : text;

      return { 
        data: finalData, 
        usage: { 
          promptTokens: u?.promptTokenCount || 0, 
          completionTokens: u?.candidatesTokenCount || 0, 
          totalTokens: u?.totalTokenCount || 0 
        } 
      };
    } else {
      const res = await callOpenAICompatible(prompt, modelId, core.provider);
      return { data: res.text, usage: res.usage };
    }
  } catch (error) {
    return { data: isZh ? "获取失败" : "Fetch failed", usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
  }
};

export const getRadarData = async (lang: Language, modelId: string = 'deepseek-chat'): Promise<AIResponse<RadarPoint[]>> => {
  const isZh = lang === 'zh';
  const core = INTELLIGENCE_CORES.find(c => c.id === modelId) || INTELLIGENCE_CORES[0];
  const todayStr = new Date().toISOString().split('T')[0];
  const prompt = `Current Date: ${todayStr}. AI R&D intensity (0-100) for categories right now. Return RAW JSON ARRAY: [{subject: string, A: number}]. ${isZh ? 'Subjects in Chinese.' : ''}`;

  try {
    let text = "";
    let usage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    if (core.provider === 'gemini') {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                A: { type: Type.NUMBER },
              },
              required: ["subject", "A"]
            }
          }
        }
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
  } catch (error) {
    return { data: [], usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
  }
};

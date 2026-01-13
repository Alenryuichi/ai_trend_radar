/**
 * RSS 數據採集服務
 * 
 * 並行採集多個 RSS 源，支持超時控制和錯誤隔離
 */

import Parser from 'rss-parser';

// ============================================================
// Types
// ============================================================

type ScenarioTag =
  | 'debugging'
  | 'refactoring'
  | 'code-review'
  | 'testing'
  | 'documentation'
  | 'learning'
  | 'productivity'
  | 'prompt-engineering';

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
// Configuration
// ============================================================

const RSSHUB_BASE_URL = process.env.RSSHUB_BASE_URL || 'https://rsshub.app';
const FETCH_TIMEOUT_MS = 2000; // 每源 2 秒超時

/**
 * RSS 數據源配置
 * 按優先級排列，每個源配置預分配的場景標籤
 */
const RSS_SOURCES: RSSSource[] = [
  {
    id: 'hackernews',
    name: 'Hacker News AI',
    url: 'https://hnrss.org/newest?q=AI+LLM+coding&count=20&points=10',
    tags: [] // HN 內容多樣，需 AI 判斷
  },
  {
    id: 'github',
    name: 'GitHub Trending',
    url: `${RSSHUB_BASE_URL}/github/trending/daily`,
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
// Parser Instance
// ============================================================

const parser = new Parser({
  timeout: FETCH_TIMEOUT_MS,
  headers: {
    'User-Agent': 'LLMPulse/1.0 (RSS Aggregator)'
  }
});

// ============================================================
// Core Functions
// ============================================================

/**
 * 帶超時的 fetch wrapper
 */
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Parser.Output<Record<string, unknown>>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const feed = await parser.parseURL(url);
    clearTimeout(timeoutId);
    return feed;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * 採集單個 RSS 源
 */
async function fetchSingleSource(source: RSSSource): Promise<RawTrend[]> {
  console.log(`[RSS] Fetching ${source.name}...`);
  
  const feed = await fetchWithTimeout(source.url, FETCH_TIMEOUT_MS);
  const items = feed.items || [];
  
  console.log(`[RSS] ${source.name}: ${items.length} items fetched`);
  
  return items.slice(0, 10).map(item => ({
    source: source.id,
    title: item.title || 'Untitled',
    link: item.link || '',
    content: item.contentSnippet || item.content || '',
    publishedAt: item.isoDate || item.pubDate || undefined,
    inferredTags: source.tags.length > 0 ? source.tags : undefined
  }));
}

/**
 * 並行採集所有 RSS 源
 * 使用 Promise.allSettled 確保單個源失敗不影響其他源
 */
export async function fetchRSSFeeds(): Promise<{
  trends: RawTrend[];
  errors: string[];
  stats: { total: number; success: number; failed: number };
}> {
  console.log(`[RSS] Starting parallel fetch of ${RSS_SOURCES.length} sources...`);
  
  const results = await Promise.allSettled(
    RSS_SOURCES.map(source => fetchSingleSource(source))
  );
  
  const trends: RawTrend[] = [];
  const errors: string[] = [];
  let successCount = 0;
  
  results.forEach((result, index) => {
    const source = RSS_SOURCES[index];
    if (result.status === 'fulfilled') {
      trends.push(...result.value);
      successCount++;
    } else {
      const errorMsg = `${source.name}: ${result.reason?.message || 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(`[RSS] ${errorMsg}`);
    }
  });
  
  console.log(`[RSS] Fetch complete: ${successCount}/${RSS_SOURCES.length} sources, ${trends.length} total items`);
  
  return {
    trends,
    errors,
    stats: {
      total: RSS_SOURCES.length,
      success: successCount,
      failed: RSS_SOURCES.length - successCount
    }
  };
}


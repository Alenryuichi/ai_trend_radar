-- ============================================================
-- Migration: 002_create_raw_trends
-- Description: 創建 raw_trends 表用於存儲 RSS/RSSHub 採集的原始數據
-- Date: 2026-01-12
-- ============================================================

-- 創建 raw_trends 表
CREATE TABLE IF NOT EXISTS raw_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  link TEXT UNIQUE NOT NULL,
  content TEXT,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  inferred_tags TEXT[]
);

-- 添加表註釋
COMMENT ON TABLE raw_trends IS 'RSS/RSSHub 採集的原始趨勢數據';
COMMENT ON COLUMN raw_trends.id IS '主鍵 UUID';
COMMENT ON COLUMN raw_trends.source IS '數據來源標識 (e.g., hackernews, github, anthropic)';
COMMENT ON COLUMN raw_trends.title IS '文章/條目標題';
COMMENT ON COLUMN raw_trends.link IS '原文鏈接，唯一約束防止重複';
COMMENT ON COLUMN raw_trends.content IS '內容摘要或描述';
COMMENT ON COLUMN raw_trends.published_at IS '原文發布時間';
COMMENT ON COLUMN raw_trends.fetched_at IS '採集時間';
COMMENT ON COLUMN raw_trends.inferred_tags IS '推斷的場景標籤數組';

-- 創建索引優化查詢
CREATE INDEX IF NOT EXISTS idx_raw_trends_fetched_at 
  ON raw_trends(fetched_at DESC);

CREATE INDEX IF NOT EXISTS idx_raw_trends_source 
  ON raw_trends(source);

-- ============================================================
-- Row Level Security (RLS) 配置
-- ============================================================

-- 啟用 RLS
ALTER TABLE raw_trends ENABLE ROW LEVEL SECURITY;

-- 公開讀取政策：允許讀取採集的趨勢數據
CREATE POLICY "允許公開讀取 raw_trends" 
  ON raw_trends
  FOR SELECT 
  USING (true);

-- 注意：寫入操作需要使用 service_role key（在 Vercel Serverless 環境中使用）


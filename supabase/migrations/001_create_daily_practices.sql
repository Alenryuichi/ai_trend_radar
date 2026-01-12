-- ============================================================
-- Migration: 001_create_daily_practices
-- Description: 創建 daily_practices 表用於存儲每日 AI Coding 精選內容
-- Date: 2026-01-12
-- ============================================================

-- 創建 daily_practices 表
CREATE TABLE IF NOT EXISTS daily_practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  main_practice JSONB NOT NULL,
  alt_practices JSONB[] NOT NULL,
  ai_model VARCHAR(50),
  generation_status VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加表註釋
COMMENT ON TABLE daily_practices IS '每日 AI Coding 精選內容表';
COMMENT ON COLUMN daily_practices.id IS '主鍵 UUID';
COMMENT ON COLUMN daily_practices.date IS '精選日期，唯一約束';
COMMENT ON COLUMN daily_practices.main_practice IS '今日主推精選 (JSON 格式)';
COMMENT ON COLUMN daily_practices.alt_practices IS '備選精選列表 (JSON 數組)';
COMMENT ON COLUMN daily_practices.ai_model IS '生成內容使用的 AI 模型名稱';
COMMENT ON COLUMN daily_practices.generation_status IS '生成狀態: success, failed, pending';
COMMENT ON COLUMN daily_practices.created_at IS '記錄創建時間';

-- 創建日期索引（降序，優化最近日期查詢）
CREATE INDEX IF NOT EXISTS idx_daily_practices_date 
  ON daily_practices(date DESC);

-- ============================================================
-- Row Level Security (RLS) 配置
-- ============================================================

-- 啟用 RLS
ALTER TABLE daily_practices ENABLE ROW LEVEL SECURITY;

-- 公開讀取政策：任何人都可以讀取精選內容
CREATE POLICY "允許公開讀取 daily_practices" 
  ON daily_practices
  FOR SELECT 
  USING (true);

-- 注意：寫入操作需要使用 service_role key（在 Vercel Serverless 環境中使用）
-- 不創建 INSERT/UPDATE/DELETE 的匿名政策，確保前端無法直接修改數據


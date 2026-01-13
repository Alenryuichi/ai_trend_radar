-- ============================================================
-- Migration: 003_create_comments_table
-- Description: 創建 comments 表，支持自建評論系統
-- Date: 2026-01-13
-- ============================================================

-- ============================================================
-- 1. 評論表
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  practice_id VARCHAR(50) NOT NULL,  -- AI 生成的 practice ID，如 "practice-20260112-1"
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加表註釋
COMMENT ON TABLE comments IS '用戶評論表';
COMMENT ON COLUMN comments.user_id IS '評論者 ID，關聯 auth.users';
COMMENT ON COLUMN comments.practice_id IS '評論的練習 ID（AI 生成的字符串格式）';
COMMENT ON COLUMN comments.content IS '評論內容，最多 500 字';

-- 索引
CREATE INDEX IF NOT EXISTS idx_comments_practice_id ON comments(practice_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 觸發器：自動更新 updated_at
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. Row Level Security (RLS) 配置
-- ============================================================

-- 啟用 RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 所有人可讀取評論（公開）
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

-- 登錄用戶可發表評論
CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用戶只能更新自己的評論
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

-- 用戶只能刪除自己的評論
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);


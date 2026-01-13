-- ============================================================
-- Migration: 002_create_user_tables
-- Description: 創建 user_profiles 和 favorites 表，支持用戶收藏功能
-- Date: 2026-01-12
-- ============================================================

-- ============================================================
-- 1. 輔助函數：自動更新 updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- ============================================================
-- 2. 用戶配置表 (擴展 Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  provider VARCHAR(20),      -- 'github' | 'google'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加表註釋
COMMENT ON TABLE user_profiles IS '用戶配置表，擴展 Supabase auth.users';
COMMENT ON COLUMN user_profiles.id IS '主鍵 UUID，關聯 auth.users';
COMMENT ON COLUMN user_profiles.display_name IS '用戶顯示名稱';
COMMENT ON COLUMN user_profiles.avatar_url IS '用戶頭像 URL';
COMMENT ON COLUMN user_profiles.provider IS 'OAuth 提供商: github, google';

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- 觸發器：自動更新 updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. OAuth 登錄自動創建用戶配置觸發器
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, avatar_url, provider)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    NEW.raw_app_meta_data->>'provider'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 在 auth.users 插入時觸發
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 4. 收藏表
-- ============================================================
-- 注意：practice_id 使用 VARCHAR 而非 UUID，因為 practice.id 是 AI 生成的字符串格式
-- 例如：practice-20260112-1（存儲在 daily_practices.main_practice JSONB 中）
-- 而非 daily_practices.id（UUID 主鍵）
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  practice_id VARCHAR(50) NOT NULL,  -- AI 生成的 practice ID，如 "practice-20260112-1"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, practice_id)
);

-- 添加表註釋
COMMENT ON TABLE favorites IS '用戶收藏表';
COMMENT ON COLUMN favorites.user_id IS '用戶 ID，關聯 auth.users';
COMMENT ON COLUMN favorites.practice_id IS '收藏的練習 ID（AI 生成的字符串格式，如 practice-20260112-1）';

-- 索引
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_practice_id ON favorites(practice_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- ============================================================
-- 5. Row Level Security (RLS) 配置
-- ============================================================

-- 啟用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- user_profiles: 用戶只能管理自己的配置，所有人可讀公開信息
-- ------------------------------------------------------------
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- ------------------------------------------------------------
-- favorites: 僅用戶自己可讀寫
-- ------------------------------------------------------------
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);


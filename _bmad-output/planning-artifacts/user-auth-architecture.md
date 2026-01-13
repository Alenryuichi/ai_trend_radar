---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: complete
completedAt: '2026-01-12'
inputDocuments:
  - "_bmad-output/planning-artifacts/user-auth-prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "services/supabaseService.ts"
  - "services/practiceStorageService.ts"
workflowType: 'architecture'
project_name: 'LLMPulse User Auth'
user_name: 'alenryuichi'
date: '2026-01-12'
---

# User Authentication Architecture Document

_This document defines the technical architecture for LLMPulse's user authentication, comment, and favorite systems._

## 1. Architecture Overview

### 1.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React SPA)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  useAuth    │  │ AuthContext │  │ LoginButton │  │ UserMenu            │ │
│  │  Hook       │  │ Provider    │  │ Component   │  │ Component           │ │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘  └─────────────────────┘ │
│         │                │                                                   │
│  ┌──────▼────────────────▼───────────────────────────────────────────────┐  │
│  │                    State Layer (React Context)                         │  │
│  │  • user: User | null                                                   │  │
│  │  • session: Session | null                                             │  │
│  │  • isLoading: boolean                                                  │  │
│  │  • isAuthenticated: boolean                                            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│  ┌─────────────┐  ┌────────────┐  │  ┌─────────────┐  ┌─────────────────┐   │
│  │ authService │  │commentServ.│  ▼  │favoriteServ.│  │practiceStorage │   │
│  │             │  │            │     │             │  │(升級版)         │   │
│  └──────┬──────┘  └──────┬─────┘     └──────┬──────┘  └───────┬─────────┘   │
└─────────┼────────────────┼──────────────────┼─────────────────┼─────────────┘
          │                │                  │                 │
          ▼                ▼                  ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE BACKEND                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────────────────────────┐   │
│  │  Supabase Auth  │  │              PostgreSQL Database                │   │
│  │  • GitHub OAuth │  │  ┌────────────┐ ┌──────────┐ ┌────────────────┐ │   │
│  │  • Google OAuth │  │  │user_profiles│ │comments  │ │favorites       │ │   │
│  │  • Session Mgmt │  │  └────────────┘ └──────────┘ └────────────────┘ │   │
│  └────────┬────────┘  │  ┌────────────────────┐ ┌─────────────────────┐ │   │
│           │           │  │user_practice_status│ │daily_practices      │ │   │
│           ▼           │  └────────────────────┘ └─────────────────────┘ │   │
│  ┌─────────────────┐  │                                                 │   │
│  │  Row Level      │  │  All tables protected by RLS policies          │   │
│  │  Security (RLS) │  │                                                 │   │
│  └─────────────────┘  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Responsibilities

| 層級 | 組件 | 職責 |
|------|------|------|
| **UI Layer** | `LoginButton` | 展示登錄按鈕，觸發 OAuth 流程 |
| | `UserMenu` | 登錄後顯示用戶信息、登出選項 |
| | `CommentList` | 評論列表展示 |
| | `CommentInput` | 評論輸入框 |
| | `FavoriteButton` | 收藏按鈕 (星標切換) |
| | `FavoriteList` | 收藏列表頁面 |
| | `LoginPromptModal` | 登錄引導彈窗 |
| **State Layer** | `AuthContext` | 全局認證狀態管理 |
| | `useAuth` | 認證狀態 Hook |
| **Service Layer** | `authService` | 認證操作封裝 |
| | `commentService` | 評論 CRUD |
| | `favoriteService` | 收藏 CRUD |
| | `practiceStorageService` | 實踐狀態 (雲端 + LocalStorage) |
| **Data Layer** | Supabase Auth | OAuth 認證管理 |
| | PostgreSQL | 數據持久化 |
| | RLS | 數據訪問控制 |

## 2. Authentication Architecture

### 2.1 Supabase Auth Integration

**選用 Supabase Auth 的理由：**
- 與現有 Supabase 數據庫無縫集成
- 原生 OAuth 支持，無需自建認證服務
- 內建 Session 管理和 JWT Token
- RLS 與 `auth.uid()` 天然整合

**OAuth 提供商配置：**

| Provider | Client ID Source | Callback URL |
|----------|-----------------|--------------|
| GitHub | GitHub Developer Settings | `https://<project>.supabase.co/auth/v1/callback` |
| Google | Google Cloud Console | `https://<project>.supabase.co/auth/v1/callback` |

### 2.2 OAuth Flow Diagram

```
┌──────────┐    1. Click Login    ┌───────────────┐
│  User    │ ──────────────────▶  │  LoginButton  │
└──────────┘                      └───────┬───────┘
     ▲                                    │
     │                   2. signInWithOAuth()
     │                                    ▼
     │                            ┌───────────────┐
     │  6. Redirect to App        │ Supabase Auth │
     │     with Session           └───────┬───────┘
     │                                    │
     │                   3. Redirect to OAuth Provider
     │                                    ▼
     │                            ┌───────────────┐
     │                            │ GitHub/Google │
     │                            │  OAuth Page   │
     └────────────────────────────┴───────┬───────┘
                                          │
                         4. User Authorizes
                                          │
                         5. Callback to Supabase
                                          ▼
                                  ┌───────────────┐
                                  │ Supabase Auth │
                                  │ Creates User  │
                                  │ + Session     │
                                  └───────────────┘
```

### 2.3 Session Management Strategy

| 策略 | 實現方式 |
|------|----------|
| **Session 存儲** | Supabase Auth 自動管理 (localStorage) |
| **Session 刷新** | Supabase SDK 自動刷新 Access Token |
| **Session 有效期** | Access Token: 1 小時, Refresh Token: 7 天 |
| **跨 Tab 同步** | `supabase.auth.onAuthStateChange` 監聽 |
| **登出清理** | `supabase.auth.signOut()` 清除所有 Session |

### 2.4 Frontend Auth State Management (useAuth Hook)

```typescript
// hooks/useAuth.ts
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGitHub: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// AuthProvider 實現見 components/auth/AuthProvider.tsx
```

**AuthProvider 組件設計：**

```typescript
// components/auth/AuthProvider.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 初始化時獲取 Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && session) {
          // 觸發 LocalStorage 數據遷移
          await migrateLocalStorageData(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGitHub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAuthenticated: !!user,
      signInWithGitHub,
      signInWithGoogle,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## 3. Database Schema Design

### 3.1 New Tables DDL

```sql
-- ============================================================
-- 1. 用戶配置表 (擴展 Supabase auth.users)
-- ============================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  provider VARCHAR(20),      -- 'github' | 'google'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- 觸發器：自動更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. 評論表
-- ============================================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  practice_id UUID REFERENCES daily_practices(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) >= 5 AND char_length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_comments_practice_id ON comments(practice_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. 收藏表
-- ============================================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  practice_id UUID REFERENCES daily_practices(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, practice_id)
);

-- 索引
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_practice_id ON favorites(practice_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- ============================================================
-- 4. 用戶實踐狀態表 (替代 LocalStorage)
-- ============================================================
CREATE TABLE user_practice_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  practice_id UUID REFERENCES daily_practices(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'skipped')),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, practice_id)
);

-- 索引
CREATE INDEX idx_user_practice_status_user_id ON user_practice_status(user_id);
CREATE INDEX idx_user_practice_status_practice_id ON user_practice_status(practice_id);
CREATE INDEX idx_user_practice_status_completed_at ON user_practice_status(completed_at DESC);
```

### 3.2 Row Level Security (RLS) Policies

```sql
-- ============================================================
-- RLS 啟用
-- ============================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_practice_status ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- user_profiles: 用戶只能管理自己的配置，所有人可讀公開信息
-- ============================================================
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- comments: 所有人可讀，登錄用戶可發表，作者可刪除
-- ============================================================
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- favorites: 僅用戶自己可讀寫
-- ============================================================
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- user_practice_status: 僅用戶自己可讀寫
-- ============================================================
CREATE POLICY "Users can view own practice status"
  ON user_practice_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own practice status"
  ON user_practice_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own practice status"
  ON user_practice_status FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own practice status"
  ON user_practice_status FOR DELETE
  USING (auth.uid() = user_id);
```

### 3.3 Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐
│   auth.users    │         │ daily_practices │
│   (Supabase)    │         │   (現有表)       │
├─────────────────┤         ├─────────────────┤
│ id (UUID) PK    │◄────┐   │ id (UUID) PK    │◄────┐
│ email           │     │   │ date            │     │
│ ...             │     │   │ main_practice   │     │
└─────────────────┘     │   │ alt_practices   │     │
        │               │   │ ...             │     │
        ▼               │   └─────────────────┘     │
┌─────────────────┐     │           │               │
│  user_profiles  │     │           │               │
├─────────────────┤     │           │               │
│ id (UUID) PK/FK │─────┘           │               │
│ display_name    │                 │               │
│ avatar_url      │                 │               │
│ provider        │                 │               │
└─────────────────┘                 │               │
                                    │               │
        ┌───────────────────────────┼───────────────┤
        │                           │               │
        ▼                           ▼               │
┌─────────────────┐         ┌─────────────────┐     │
│    comments     │         │   favorites     │     │
├─────────────────┤         ├─────────────────┤     │
│ id (UUID) PK    │         │ id (UUID) PK    │     │
│ user_id FK      │─────────│ user_id FK      │─────┘
│ practice_id FK  │─────────│ practice_id FK  │
│ content         │         │ created_at      │
│ created_at      │         │ UNIQUE(user_id, │
│ updated_at      │         │   practice_id)  │
└─────────────────┘         └─────────────────┘

┌─────────────────────┐
│ user_practice_status│
├─────────────────────┤
│ id (UUID) PK        │
│ user_id FK          │───────▶ auth.users
│ practice_id FK      │───────▶ daily_practices
│ status              │
│ completed_at        │
│ UNIQUE(user_id,     │
│   practice_id)      │
└─────────────────────┘
```


## 4. API Design

### 4.1 API 策略決策

**決策：直接使用 Supabase Client，無需額外 Serverless Functions**

| 功能 | 實現方式 | 理由 |
|------|----------|------|
| 認證 | Supabase Auth SDK | 原生支持，無需額外 API |
| 評論 CRUD | Supabase Client | RLS 保護，直連安全 |
| 收藏 CRUD | Supabase Client | RLS 保護，直連安全 |
| 實踐狀態 | Supabase Client | RLS 保護，直連安全 |

**不需要 Serverless Functions 的原因：**
1. RLS 已提供足夠的數據隔離
2. 無複雜業務邏輯需要服務端處理
3. 減少架構複雜度和延遲

### 4.2 Comment Service API

```typescript
// services/commentService.ts
import { supabase } from './supabaseService';

export interface Comment {
  id: string;
  user_id: string;
  practice_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  // JOIN 結果
  user_profile?: {
    display_name: string;
    avatar_url: string;
  };
}

export interface CommentCreateInput {
  practice_id: string;
  content: string;
}

/**
 * 獲取精選的評論列表
 */
export async function getCommentsByPractice(
  practiceId: string
): Promise<ApiResult<Comment[]>> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user_profile:user_profiles(display_name, avatar_url)
    `)
    .eq('practice_id', practiceId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message, fromCache: false };
  }
  return { data: data as Comment[], error: null, fromCache: false };
}

/**
 * 發表評論
 */
export async function createComment(
  input: CommentCreateInput
): Promise<ApiResult<Comment>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: '請先登錄', fromCache: false };
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: user.id,
      practice_id: input.practice_id,
      content: input.content.trim()
    })
    .select(`
      *,
      user_profile:user_profiles(display_name, avatar_url)
    `)
    .single();

  if (error) {
    return { data: null, error: error.message, fromCache: false };
  }
  return { data: data as Comment, error: null, fromCache: false };
}

/**
 * 刪除評論
 */
export async function deleteComment(commentId: string): Promise<ApiResult<null>> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    return { data: null, error: error.message, fromCache: false };
  }
  return { data: null, error: null, fromCache: false };
}

/**
 * 獲取評論數量
 */
export async function getCommentCount(practiceId: string): Promise<number> {
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('practice_id', practiceId);

  if (error) return 0;
  return count ?? 0;
}
```

### 4.3 Favorite Service API

```typescript
// services/favoriteService.ts
import { supabase } from './supabaseService';
import { DailyPracticeRecord, ApiResult } from '../types';

export interface Favorite {
  id: string;
  user_id: string;
  practice_id: string;
  created_at: string;
  // JOIN 結果
  practice?: DailyPracticeRecord;
}

/**
 * 檢查是否已收藏
 */
export async function isFavorited(practiceId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('practice_id', practiceId)
    .single();

  return !error && !!data;
}

/**
 * 添加收藏
 */
export async function addFavorite(practiceId: string): Promise<ApiResult<Favorite>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: '請先登錄', fromCache: false };
  }

  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: user.id,
      practice_id: practiceId
    })
    .select()
    .single();

  if (error) {
    // 已存在時忽略錯誤
    if (error.code === '23505') {
      return { data: null, error: null, fromCache: false };
    }
    return { data: null, error: error.message, fromCache: false };
  }
  return { data: data as Favorite, error: null, fromCache: false };
}

/**
 * 取消收藏
 */
export async function removeFavorite(practiceId: string): Promise<ApiResult<null>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: '請先登錄', fromCache: false };
  }

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('practice_id', practiceId);

  if (error) {
    return { data: null, error: error.message, fromCache: false };
  }
  return { data: null, error: null, fromCache: false };
}

/**
 * 切換收藏狀態（返回新狀態）
 */
export async function toggleFavorite(practiceId: string): Promise<boolean> {
  const currentlyFavorited = await isFavorited(practiceId);
  if (currentlyFavorited) {
    await removeFavorite(practiceId);
    return false;
  } else {
    await addFavorite(practiceId);
    return true;
  }
}

/**
 * 獲取用戶收藏列表
 */
export async function getFavorites(): Promise<ApiResult<Favorite[]>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: [], error: null, fromCache: false };
  }

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      practice:daily_practices(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message, fromCache: false };
  }
  return { data: data as Favorite[], error: null, fromCache: false };
}

/**
 * 批量獲取收藏狀態
 */
export async function getFavoriteStatuses(
  practiceIds: string[]
): Promise<Record<string, boolean>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return practiceIds.reduce((acc, id) => ({ ...acc, [id]: false }), {});
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('practice_id')
    .eq('user_id', user.id)
    .in('practice_id', practiceIds);

  if (error) {
    return practiceIds.reduce((acc, id) => ({ ...acc, [id]: false }), {});
  }

  const favoriteSet = new Set(data?.map(f => f.practice_id) || []);
  return practiceIds.reduce((acc, id) => ({
    ...acc,
    [id]: favoriteSet.has(id)
  }), {});
}
```

## 5. Frontend Architecture

### 5.1 New Components

| 組件 | 位置 | 職責 |
|------|------|------|
| `AuthProvider` | `components/auth/AuthProvider.tsx` | 認證上下文提供者 |
| `LoginButton` | `components/auth/LoginButton.tsx` | 登錄按鈕 (GitHub/Google) |
| `UserMenu` | `components/auth/UserMenu.tsx` | 用戶菜單 (頭像 + 登出) |
| `LoginPromptModal` | `components/auth/LoginPromptModal.tsx` | 登錄引導彈窗 |
| `CommentSection` | `components/comments/CommentSection.tsx` | 評論區容器 |
| `CommentList` | `components/comments/CommentList.tsx` | 評論列表 |
| `CommentItem` | `components/comments/CommentItem.tsx` | 單條評論 |
| `CommentInput` | `components/comments/CommentInput.tsx` | 評論輸入框 |
| `FavoriteButton` | `components/favorites/FavoriteButton.tsx` | 收藏按鈕 |
| `FavoritesPage` | `components/favorites/FavoritesPage.tsx` | 收藏列表頁 |
| `MigrationProgress` | `components/auth/MigrationProgress.tsx` | 數據遷移進度 |

### 5.2 Component Hierarchy

```
App.tsx
├── AuthProvider                    # 認證上下文
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── AuthSection             # 新增
│   │       ├── LoginButton         # 未登錄時顯示
│   │       └── UserMenu            # 已登錄時顯示
│   │
│   ├── MainContent
│   │   ├── DailyPracticeCard       # 現有，需修改
│   │   │   ├── PracticeContent
│   │   │   ├── PracticeActions
│   │   │   │   ├── CompleteButton  # 現有
│   │   │   │   └── FavoriteButton  # 新增
│   │   │   └── CommentSection      # 新增
│   │   │       ├── CommentList
│   │   │       │   └── CommentItem (多個)
│   │   │       └── CommentInput
│   │   │
│   │   └── FavoritesPage           # 新增路由頁
│   │       └── FavoriteList
│   │
│   └── LoginPromptModal            # 全局彈窗
│
└── MigrationProgress               # 遷移進度提示 (Toast 風格)
```

### 5.3 State Management

**全局狀態 (Context):**

| Context | 內容 | 使用場景 |
|---------|------|----------|
| `AuthContext` | user, session, isLoading, isAuthenticated | 所有需要認證狀態的組件 |

**組件本地狀態:**

| 組件 | 狀態 | 類型 |
|------|------|------|
| `CommentSection` | comments, isLoading, error | `Comment[]`, `boolean`, `string \| null` |
| `CommentInput` | content, isSubmitting | `string`, `boolean` |
| `FavoriteButton` | isFavorited, isLoading | `boolean`, `boolean` |
| `FavoritesPage` | favorites, isLoading | `Favorite[]`, `boolean` |

### 5.4 Integration with Existing Components

**需要修改的現有文件：**

| 文件 | 修改內容 |
|------|----------|
| `App.tsx` | 包裹 `AuthProvider`，添加收藏頁路由 |
| `index.tsx` | 無需修改 |
| `components/coding-efficiency/DailyPracticeCard.tsx` | 添加 `FavoriteButton` 和 `CommentSection` |
| `services/supabaseService.ts` | 導出 supabase client 供 auth 使用 |
| `services/practiceStorageService.ts` | 添加雲端同步邏輯 |
| `types.ts` | 添加 User, Comment, Favorite 類型 |



## 6. Data Migration Strategy

### 6.1 Migration Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LocalStorage → Cloud Migration Flow                   │
└─────────────────────────────────────────────────────────────────────────┘

用戶首次登錄
      │
      ▼
┌─────────────────┐     ┌─────────────────┐
│ onAuthStateChange│────▶│ 檢測 LocalStorage │
│ event: SIGNED_IN│     │ 是否有數據        │
└─────────────────┘     └────────┬────────┘
                                 │
                     ┌───────────┴───────────┐
                     │                       │
                     ▼ 有數據                 ▼ 無數據
         ┌─────────────────────┐      ┌─────────────┐
         │ 顯示遷移進度 Toast   │      │ 跳過遷移    │
         └──────────┬──────────┘      └─────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │ 讀取 LocalStorage    │
         │ 實踐記錄             │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │ 批量 UPSERT 到       │
         │ user_practice_status │
         │ (忽略衝突)           │
         └──────────┬──────────┘
                    │
          ┌────────┴────────┐
          │                 │
          ▼ 成功             ▼ 失敗
┌─────────────────┐   ┌─────────────────┐
│ 清除 LocalStorage│   │ 保留 LocalStorage│
│ 顯示成功提示     │   │ 顯示錯誤 + 重試   │
└─────────────────┘   └─────────────────┘
```

### 6.2 Migration Service Implementation

```typescript
// services/migrationService.ts
import { supabase } from './supabaseService';
import { loadCompletedPractices, clearAllPractices } from './practiceStorageService';

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  skippedCount: number;  // 因衝突跳過的
  errors: string[];
}

export interface MigrationProgress {
  status: 'idle' | 'checking' | 'migrating' | 'success' | 'error';
  message: string;
  progress: number;  // 0-100
}

/**
 * 檢查是否需要遷移
 */
export function needsMigration(): boolean {
  const localData = loadCompletedPractices();
  return Object.keys(localData).length > 0;
}

/**
 * 執行 LocalStorage 到雲端的數據遷移
 */
export async function migrateLocalStorageData(
  userId: string,
  onProgress?: (progress: MigrationProgress) => void
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    skippedCount: 0,
    errors: []
  };

  try {
    // 1. 讀取 LocalStorage 數據
    onProgress?.({ status: 'checking', message: '檢查本地數據...', progress: 10 });

    const localData = loadCompletedPractices();
    const practiceIds = Object.keys(localData);

    if (practiceIds.length === 0) {
      onProgress?.({ status: 'success', message: '無需遷移', progress: 100 });
      return result;
    }

    // 2. 準備批量插入數據
    onProgress?.({ status: 'migrating', message: `正在遷移 ${practiceIds.length} 條記錄...`, progress: 30 });

    const records = practiceIds.map(practiceId => ({
      user_id: userId,
      practice_id: practiceId,
      status: 'completed' as const,
      completed_at: localData[practiceId].completedAt
    }));

    // 3. 批量 UPSERT (忽略衝突 = 雲端數據優先)
    const { data, error } = await supabase
      .from('user_practice_status')
      .upsert(records, {
        onConflict: 'user_id,practice_id',
        ignoreDuplicates: true  // 已存在則跳過
      })
      .select();

    if (error) {
      result.errors.push(error.message);
      result.success = false;
      onProgress?.({ status: 'error', message: `遷移失敗: ${error.message}`, progress: 100 });
      return result;
    }

    // 4. 計算結果
    result.migratedCount = data?.length ?? 0;
    result.skippedCount = practiceIds.length - result.migratedCount;

    // 5. 清理 LocalStorage
    onProgress?.({ status: 'migrating', message: '清理本地數據...', progress: 90 });
    clearAllPractices();

    onProgress?.({
      status: 'success',
      message: `成功遷移 ${result.migratedCount} 條記錄`,
      progress: 100
    });

    return result;

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '遷移過程中發生未知錯誤';
    result.errors.push(errorMessage);
    result.success = false;
    onProgress?.({ status: 'error', message: errorMessage, progress: 100 });
    return result;
  }
}

/**
 * 手動重試遷移
 */
export async function retryMigration(
  userId: string,
  onProgress?: (progress: MigrationProgress) => void
): Promise<MigrationResult> {
  return migrateLocalStorageData(userId, onProgress);
}
```

### 6.3 Migration Trigger Point

```typescript
// 在 AuthProvider 中觸發遷移
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // 首次登錄時觸發遷移
      if (event === 'SIGNED_IN' && session) {
        const shouldMigrate = needsMigration();
        if (shouldMigrate) {
          setMigrationStatus('migrating');
          const result = await migrateLocalStorageData(
            session.user.id,
            (progress) => setMigrationProgress(progress)
          );
          setMigrationStatus(result.success ? 'success' : 'error');
        }
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

### 6.4 Conflict Resolution Strategy

| 場景 | 處理方式 | 理由 |
|------|----------|------|
| 本地有，雲端無 | 插入雲端 | 保留用戶歷史 |
| 本地有，雲端也有 | 保留雲端 | 雲端數據更可靠 |
| 本地無，雲端有 | 無需處理 | 正常情況 |

### 6.5 Rollback Strategy

**遷移失敗時：**
- LocalStorage 數據保留（不清除）
- 用戶可繼續使用本地存儲
- 顯示「重試遷移」按鈕
- 下次登錄時再次嘗試

**完全回滾（緊急情況）：**
```sql
-- 如需回滾，刪除用戶的雲端實踐狀態
DELETE FROM user_practice_status WHERE user_id = '<user_id>';
```

## 7. Security Considerations

### 7.1 RLS Policy Validation

**測試用例：**

```sql
-- 測試 1: 匿名用戶不能插入評論
-- 預期: 失敗
INSERT INTO comments (user_id, practice_id, content)
VALUES ('random-uuid', 'practice-uuid', 'test comment');

-- 測試 2: 用戶只能刪除自己的評論
-- 預期: 只刪除自己的
DELETE FROM comments WHERE id = '<comment_id>';

-- 測試 3: 用戶只能看到自己的收藏
-- 預期: 只返回自己的收藏
SELECT * FROM favorites WHERE user_id != auth.uid();  -- 應返回空
```

### 7.2 XSS Protection

```typescript
// 評論內容轉義 (React 默認處理)
// 但對於 dangerouslySetInnerHTML 需要額外處理

// 使用 DOMPurify 清理 HTML (如果允許富文本)
import DOMPurify from 'dompurify';

function sanitizeContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [],  // 禁止所有 HTML
    ALLOWED_ATTR: []
  });
}

// 服務端驗證 (RLS + CHECK 約束)
// content TEXT NOT NULL CHECK (char_length(content) >= 5 AND char_length(content) <= 500)
```

### 7.3 CSRF Protection

**Supabase Auth 內建保護：**
- PKCE 流程防止授權碼截取
- State 參數防止 CSRF
- HttpOnly cookies (可選)

### 7.4 Rate Limiting

**前端防抖：**

```typescript
// 評論提交防抖
import { useCallback, useRef } from 'react';

function useRateLimitedSubmit() {
  const lastSubmitTime = useRef(0);
  const COOLDOWN_MS = 5000; // 5 秒冷卻

  const submit = useCallback(async (fn: () => Promise<void>) => {
    const now = Date.now();
    if (now - lastSubmitTime.current < COOLDOWN_MS) {
      throw new Error('請稍後再試');
    }
    lastSubmitTime.current = now;
    await fn();
  }, []);

  return submit;
}
```

**後端限制（Supabase Edge Functions，可選）：**

```typescript
// api/rate-limit.ts (如需更嚴格限制)
const RATE_LIMIT = {
  comments: { max: 5, windowMs: 60 * 1000 },  // 5 條/分鐘
  favorites: { max: 20, windowMs: 60 * 1000 } // 20 次/分鐘
};
```

### 7.5 Input Validation

| 字段 | 驗證規則 |
|------|----------|
| 評論內容 | 5-500 字符，去除首尾空格 |
| Practice ID | UUID 格式驗證 |
| User ID | 從 Session 獲取，不信任前端 |

```typescript
// 驗證函數
function validateCommentContent(content: string): { valid: boolean; error?: string } {
  const trimmed = content.trim();
  if (trimmed.length < 5) {
    return { valid: false, error: '評論至少需要 5 個字符' };
  }
  if (trimmed.length > 500) {
    return { valid: false, error: '評論不能超過 500 個字符' };
  }
  return { valid: true };
}
```

## 8. Implementation Patterns

### 8.1 Optimistic Update Pattern (收藏按鈕)

```typescript
// components/favorites/FavoriteButton.tsx
import { useState, useCallback } from 'react';
import { toggleFavorite } from '../../services/favoriteService';
import { useAuth } from '../../hooks/useAuth';

interface FavoriteButtonProps {
  practiceId: string;
  initialFavorited: boolean;
  onAuthRequired: () => void;
}

export function FavoriteButton({
  practiceId,
  initialFavorited,
  onAuthRequired
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(async () => {
    // 未登錄時顯示登錄引導
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    // 樂觀更新
    const previousState = isFavorited;
    setIsFavorited(!isFavorited);
    setIsLoading(true);

    try {
      const newState = await toggleFavorite(practiceId);
      // 服務端結果可能與樂觀結果不同，以服務端為準
      setIsFavorited(newState);
    } catch (error) {
      // 回滾到原始狀態
      setIsFavorited(previousState);
      console.error('收藏操作失敗:', error);
    } finally {
      setIsLoading(false);
    }
  }, [practiceId, isFavorited, isAuthenticated, onAuthRequired]);

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        p-2 rounded-full transition-colors
        ${isFavorited
          ? 'text-yellow-500 hover:text-yellow-600'
          : 'text-gray-400 hover:text-gray-500'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={isFavorited ? '取消收藏' : '收藏'}
    >
      <svg
        className="w-6 h-6"
        fill={isFavorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    </button>
  );
}
```

### 8.2 Error Handling Pattern

```typescript
// utils/errorHandler.ts

export interface AppError {
  code: string;
  message: string;
  userMessage: string;  // 用戶友好的錯誤信息
}

const ERROR_MESSAGES: Record<string, string> = {
  'PGRST116': '數據不存在',
  '23505': '數據已存在',
  '42501': '沒有操作權限',
  '22P02': '數據格式錯誤',
  'NETWORK_ERROR': '網絡連接失敗，請檢查網絡',
  'AUTH_REQUIRED': '請先登錄',
  'RATE_LIMITED': '操作太頻繁，請稍後再試',
};

export function handleError(error: unknown): AppError {
  // Supabase 錯誤
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: string }).code;
    const message = (error as { message?: string }).message || '未知錯誤';
    return {
      code,
      message,
      userMessage: ERROR_MESSAGES[code] || message
    };
  }

  // 網絡錯誤
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      code: 'NETWORK_ERROR',
      message: error.message,
      userMessage: ERROR_MESSAGES.NETWORK_ERROR
    };
  }

  // 一般錯誤
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN',
      message: error.message,
      userMessage: error.message
    };
  }

  return {
    code: 'UNKNOWN',
    message: String(error),
    userMessage: '發生未知錯誤，請稍後再試'
  };
}
```

### 8.3 Login Prompt Modal Pattern

```typescript
// components/auth/LoginPromptModal.tsx
import { useAuth } from '../../hooks/useAuth';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionText?: string;  // 例如: "評論" 或 "收藏"
}

export function LoginPromptModal({
  isOpen,
  onClose,
  actionText = '使用此功能'
}: LoginPromptModalProps) {
  const { signInWithGitHub, signInWithGoogle } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          登錄後{actionText}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          登錄後您可以{actionText}，並在任何設備上同步您的數據。
        </p>

        <div className="space-y-3">
          <button
            onClick={signInWithGitHub}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition"
          >
            <GitHubIcon className="w-5 h-5" />
            使用 GitHub 登錄
          </button>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition"
          >
            <GoogleIcon className="w-5 h-5" />
            使用 Google 登錄
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-gray-500 hover:text-gray-700 text-sm"
        >
          稍後再說
        </button>
      </div>
    </div>
  );
}
```

### 8.4 Practice Storage Service Upgrade

```typescript
// services/practiceStorageService.ts (升級版)
import { supabase } from './supabaseService';

// ... 保留現有 LocalStorage 函數 ...

/**
 * 獲取實踐狀態（自動選擇雲端或本地）
 */
export async function getPracticeStatus(practiceId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // 已登錄：從雲端獲取
    const { data } = await supabase
      .from('user_practice_status')
      .select('id')
      .eq('user_id', user.id)
      .eq('practice_id', practiceId)
      .single();
    return !!data;
  } else {
    // 未登錄：從 LocalStorage 獲取
    return isPracticeCompleted(practiceId);
  }
}

/**
 * 保存實踐狀態（自動選擇雲端或本地）
 */
export async function savePracticeStatusUnified(
  practiceId: string,
  isCompleted: boolean
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // 已登錄：保存到雲端
    if (isCompleted) {
      await supabase
        .from('user_practice_status')
        .upsert({
          user_id: user.id,
          practice_id: practiceId,
          status: 'completed',
          completed_at: new Date().toISOString()
        }, { onConflict: 'user_id,practice_id' });
    } else {
      await supabase
        .from('user_practice_status')
        .delete()
        .eq('user_id', user.id)
        .eq('practice_id', practiceId);
    }
  } else {
    // 未登錄：保存到 LocalStorage
    savePracticeStatus(practiceId, isCompleted);
  }
}

/**
 * 批量獲取實踐狀態
 */
export async function getBatchPracticeStatus(
  practiceIds: string[]
): Promise<Set<string>> {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data } = await supabase
      .from('user_practice_status')
      .select('practice_id')
      .eq('user_id', user.id)
      .in('practice_id', practiceIds);
    return new Set(data?.map(d => d.practice_id) || []);
  } else {
    return getCompletedPracticeIds();
  }
}
```


## 9. Project Structure & File Changes

### 9.1 Complete Directory Structure

```
LLMPulse/
├── index.html                           # 現有
├── index.tsx                            # 現有
├── App.tsx                              # 修改 - 添加 AuthProvider
├── types.ts                             # 修改 - 添加 Auth 類型
├── vite.config.ts                       # 現有
├── package.json                         # 現有
├── vercel.json                          # 現有
│
├── hooks/                               # 新增目錄
│   └── useAuth.ts                       # 新增 - 認證 Hook
│
├── components/
│   ├── auth/                            # 新增目錄
│   │   ├── AuthProvider.tsx             # 新增 - 認證上下文
│   │   ├── LoginButton.tsx              # 新增 - 登錄按鈕
│   │   ├── UserMenu.tsx                 # 新增 - 用戶菜單
│   │   ├── LoginPromptModal.tsx         # 新增 - 登錄引導彈窗
│   │   └── MigrationProgress.tsx        # 新增 - 遷移進度
│   │
│   ├── comments/                        # 新增目錄
│   │   ├── CommentSection.tsx           # 新增 - 評論區容器
│   │   ├── CommentList.tsx              # 新增 - 評論列表
│   │   ├── CommentItem.tsx              # 新增 - 單條評論
│   │   └── CommentInput.tsx             # 新增 - 評論輸入
│   │
│   ├── favorites/                       # 新增目錄
│   │   ├── FavoriteButton.tsx           # 新增 - 收藏按鈕
│   │   └── FavoritesPage.tsx            # 新增 - 收藏列表頁
│   │
│   └── coding-efficiency/
│       ├── DailyPracticeCard.tsx        # 修改 - 添加評論和收藏
│       ├── PracticeSteps.tsx            # 現有
│       ├── PracticeHistory.tsx          # 現有
│       └── PracticeProgress.tsx         # 現有
│
├── services/
│   ├── supabaseService.ts               # 修改 - 添加 Auth 方法
│   ├── authService.ts                   # 新增 - 認證服務
│   ├── commentService.ts                # 新增 - 評論服務
│   ├── favoriteService.ts               # 新增 - 收藏服務
│   ├── migrationService.ts              # 新增 - 遷移服務
│   ├── practiceStorageService.ts        # 修改 - 添加雲端同步
│   └── geminiService.ts                 # 現有
│
├── utils/                               # 新增目錄
│   └── errorHandler.ts                  # 新增 - 錯誤處理
│
└── api/
    └── cron/
        └── daily-practice.ts            # 現有
```

### 9.2 File Change Summary

**新增文件 (16 個):**

| 文件路徑 | 職責 | 估時 |
|----------|------|------|
| `hooks/useAuth.ts` | 認證狀態 Hook | 1h |
| `components/auth/AuthProvider.tsx` | 認證上下文提供者 | 2h |
| `components/auth/LoginButton.tsx` | OAuth 登錄按鈕 | 1h |
| `components/auth/UserMenu.tsx` | 用戶菜單下拉 | 1h |
| `components/auth/LoginPromptModal.tsx` | 登錄引導彈窗 | 1h |
| `components/auth/MigrationProgress.tsx` | 遷移進度 Toast | 1h |
| `components/comments/CommentSection.tsx` | 評論區容器 | 2h |
| `components/comments/CommentList.tsx` | 評論列表 | 2h |
| `components/comments/CommentItem.tsx` | 單條評論 | 1h |
| `components/comments/CommentInput.tsx` | 評論輸入框 | 2h |
| `components/favorites/FavoriteButton.tsx` | 收藏按鈕 | 1h |
| `components/favorites/FavoritesPage.tsx` | 收藏列表頁 | 3h |
| `services/authService.ts` | 認證服務封裝 | 2h |
| `services/commentService.ts` | 評論 CRUD | 2h |
| `services/favoriteService.ts` | 收藏 CRUD | 2h |
| `services/migrationService.ts` | 數據遷移 | 2h |
| `utils/errorHandler.ts` | 錯誤處理工具 | 1h |

**修改文件 (5 個):**

| 文件路徑 | 修改內容 | 估時 |
|----------|----------|------|
| `App.tsx` | 包裹 AuthProvider，添加路由 | 1h |
| `types.ts` | 添加 User, Comment, Favorite 類型 | 0.5h |
| `services/supabaseService.ts` | 確保 supabase 導出可用於 Auth | 0.5h |
| `services/practiceStorageService.ts` | 添加雲端同步函數 | 2h |
| `components/coding-efficiency/DailyPracticeCard.tsx` | 集成 FavoriteButton 和 CommentSection | 2h |

### 9.3 Type Definitions to Add

```typescript
// types.ts 新增內容

// ============================================================
// User & Auth Types
// ============================================================

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  provider: 'github' | 'google';
  created_at: string;
  updated_at: string;
}

// ============================================================
// Comment Types
// ============================================================

export interface Comment {
  id: string;
  user_id: string;
  practice_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface CommentCreateInput {
  practice_id: string;
  content: string;
}

// ============================================================
// Favorite Types
// ============================================================

export interface Favorite {
  id: string;
  user_id: string;
  practice_id: string;
  created_at: string;
  practice?: DailyPracticeRecord;
}

// ============================================================
// User Practice Status Types
// ============================================================

export interface UserPracticeStatus {
  id: string;
  user_id: string;
  practice_id: string;
  status: 'completed' | 'skipped';
  completed_at: string;
}

// ============================================================
// Migration Types
// ============================================================

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  skippedCount: number;
  errors: string[];
}

export interface MigrationProgress {
  status: 'idle' | 'checking' | 'migrating' | 'success' | 'error';
  message: string;
  progress: number;
}
```

## 10. Architecture Validation

### 10.1 Requirements Coverage

| PRD 需求 | 架構支持 | 對應組件 |
|----------|----------|----------|
| FR1-2: OAuth 登錄 | ✅ | Supabase Auth + LoginButton |
| FR3: 登錄狀態展示 | ✅ | UserMenu + useAuth |
| FR4: 登出 | ✅ | Supabase Auth signOut |
| FR5: Session 持久化 | ✅ | Supabase Auth 自動管理 |
| FR6: OAuth 錯誤提示 | ✅ | errorHandler + Toast |
| FR7-13: 評論功能 | ✅ | CommentSection + commentService |
| FR14-19: 收藏功能 | ✅ | FavoriteButton + favoriteService |
| FR20-24: 數據遷移 | ✅ | migrationService + MigrationProgress |
| FR25-28: 游客模式 | ✅ | LocalStorage 降級 + LoginPromptModal |

### 10.2 Non-Functional Requirements Validation

| NFR | 目標 | 架構保證 |
|-----|------|----------|
| OAuth < 3s | ✅ | Supabase Auth 原生性能 |
| 登錄檢查 < 100ms | ✅ | LocalStorage Session + getUser() |
| 評論加載 < 500ms | ✅ | 索引優化 + 直連 |
| 收藏操作 < 200ms | ✅ | 樂觀更新 |
| RLS 數據隔離 | ✅ | 完整 RLS 策略 |
| XSS 防護 | ✅ | React 默認 + DOMPurify |
| CSRF 防護 | ✅ | Supabase PKCE |
| Rate Limiting | ✅ | 前端防抖 + 可選後端 |

### 10.3 Integration Points Validation

| 集成點 | 驗證狀態 |
|--------|----------|
| Supabase Auth ↔ PostgreSQL | ✅ auth.uid() RLS 整合 |
| useAuth ↔ 所有需認證組件 | ✅ Context 全局可用 |
| LocalStorage ↔ Cloud | ✅ 遷移服務 + 統一 API |
| 現有 DailyPracticeCard ↔ 新組件 | ✅ Props 傳遞 |

## 11. Implementation Sequence

### 11.1 Recommended Order

```
Phase 1: 基礎設施 (第 1 週)
├── 1. Supabase Auth 配置 (GitHub/Google OAuth)
├── 2. 數據庫遷移 (4 個新表 + RLS)
├── 3. types.ts 類型擴展
├── 4. hooks/useAuth.ts
├── 5. components/auth/AuthProvider.tsx
└── 6. App.tsx 包裹 AuthProvider

Phase 2: 認證 UI (第 1 週)
├── 7. components/auth/LoginButton.tsx
├── 8. components/auth/UserMenu.tsx
├── 9. components/auth/LoginPromptModal.tsx
└── 10. 集成到 App Header

Phase 3: 數據遷移 (第 2 週前半)
├── 11. services/migrationService.ts
├── 12. components/auth/MigrationProgress.tsx
└── 13. services/practiceStorageService.ts 升級

Phase 4: 評論功能 (第 2 週後半)
├── 14. services/commentService.ts
├── 15. components/comments/CommentItem.tsx
├── 16. components/comments/CommentList.tsx
├── 17. components/comments/CommentInput.tsx
├── 18. components/comments/CommentSection.tsx
└── 19. DailyPracticeCard 集成

Phase 5: 收藏功能 (第 3 週)
├── 20. services/favoriteService.ts
├── 21. components/favorites/FavoriteButton.tsx
├── 22. components/favorites/FavoritesPage.tsx
├── 23. DailyPracticeCard 集成
└── 24. 路由配置

Phase 6: 測試與優化 (第 4 週)
├── 25. 端到端測試
├── 26. RLS 安全測試
├── 27. 性能優化
└── 28. 錯誤處理完善
```

### 11.2 Dependencies Graph

```
                    ┌─────────────────┐
                    │ Supabase Auth   │
                    │ Configuration   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │ Database │   │  types.ts │   │ useAuth  │
       │  Schema  │   │  updates  │   │   hook   │
       └────┬─────┘   └─────┬────┘   └────┬─────┘
            │               │             │
            └───────────────┼─────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ AuthProvider  │
                    └───────┬───────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
   ┌───────────┐     ┌───────────┐      ┌───────────┐
   │ LoginBtn  │     │ UserMenu  │      │ LoginModal│
   └───────────┘     └───────────┘      └─────┬─────┘
                                              │
              ┌───────────────────────────────┤
              │                               │
              ▼                               ▼
       ┌──────────────┐               ┌──────────────┐
       │ commentServ. │               │ favoriteServ.│
       └──────┬───────┘               └──────┬───────┘
              │                               │
              ▼                               ▼
       ┌──────────────┐               ┌──────────────┐
       │CommentSection│               │FavoriteButton│
       └──────────────┘               └──────────────┘
```

---

## Architecture Completion Summary

### Workflow Status

**Architecture Decision Workflow:** COMPLETED ✅
**Date Completed:** 2026-01-12
**Document Location:** `_bmad-output/planning-artifacts/user-auth-architecture.md`

### Deliverables Checklist

- [x] **Architecture Overview** - 系統架構圖 + 組件職責
- [x] **Authentication Architecture** - Supabase Auth 集成 + OAuth 流程 + Session 管理
- [x] **Database Schema Design** - 4 個新表 DDL + RLS 策略 + 索引
- [x] **API Design** - 評論/收藏 Service API (TypeScript)
- [x] **Frontend Architecture** - 新組件清單 + 層次結構 + 狀態管理
- [x] **Data Migration Strategy** - 遷移流程 + 衝突處理 + 回滾方案
- [x] **Security Considerations** - RLS 驗證 + XSS/CSRF + Rate Limiting
- [x] **Implementation Patterns** - 樂觀更新 + 錯誤處理 + 代碼模板
- [x] **Project Structure** - 新增/修改文件清單
- [x] **Implementation Sequence** - 開發順序 + 依賴圖

### Key Architecture Decisions

| 決策領域 | 選擇 | 理由 |
|----------|------|------|
| 認證方案 | Supabase Auth | 與現有 Supabase 無縫集成 |
| OAuth 提供商 | GitHub + Google | 覆蓋目標用戶 90%+ |
| API 架構 | 直連 Supabase | RLS 足夠，無需額外後端 |
| 狀態管理 | React Context | 保持簡單，避免過度工程 |
| 數據遷移 | 首次登錄觸發 | 無縫體驗 |
| 收藏更新 | 樂觀更新 | 即時反饋 |

### Next Steps

1. 在 Supabase Dashboard 配置 GitHub/Google OAuth Provider
2. 執行數據庫遷移 SQL
3. 按照 Implementation Sequence 開發
4. 完成後執行 RLS 安全測試

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**For AI Agents:** 此架構文檔是實現 LLMPulse 用戶認證系統的完整指南。請嚴格遵循所有決策、模式和結構。
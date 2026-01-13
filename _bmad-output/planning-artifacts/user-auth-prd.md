---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
status: complete
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "docs/architecture.md"
workflowType: 'prd'
lastStep: 11
documentCounts:
  brief: 0
  research: 0
  brainstorming: 0
  projectDocs: 3
projectType: "brownfield"
prdScope: "用户登录与社交功能"
featureScope: "P0 - 用户认证 + 评论 + 收藏"
technicalApproach: "Supabase Auth + Supabase RLS"
---

# Product Requirements Document - LLMPulse 用户系统与社交功能

**Author:** alenryuichi
**Date:** 2026-01-12
**Version:** 1.0

## Executive Summary

### 产品愿景

将 LLMPulse 从「个人实践工具」升级为「社区驱动的 AI 编程学习平台」。

**核心理念：** 实践不再孤独，学习因分享而增值。

### 目标用户痛点

| 痛点 | 描述 |
|------|------|
| 数据丢失 | 换设备后实践记录丢失，LocalStorage 无法跨设备同步 |
| 缺乏交流 | 看完精选后有疑问或心得无处分享 |
| 内容难找 | 优质内容刷过就忘，无法保存供日后参考 |
| 成就感弱 | 缺乏社区认可，实践成果无人见证 |

### What Makes This Special

**范式转变：** 从「单人修炼」到「社区共学」

| 当前模式 | 升级后模式 |
|----------|------------|
| LocalStorage 本地存储 | 云端同步，跨设备无缝切换 |
| 只看不说 | 评论讨论，分享心得 |
| 用完即忘 | 收藏精选，打造个人知识库 |
| 独自成长 | 社区互动，共同进步 |

**核心价值主张：**
> 「登录后，你的每一次实践都被记录，每一条心得都有回响」

**用户「正是我需要的」时刻：**
- 换了新电脑 → 登录后实践记录还在
- 有疑问 → 发评论 5 分钟内收到社区回复
- 好内容 → 一键收藏，随时回顾

## Project Classification

| 维度 | 内容 |
|------|------|
| **技术类型** | Web App (SPA) - 功能扩展 |
| **领域** | General (通用软件开发) |
| **复杂度** | Medium (认证 + 社交功能) |
| **项目上下文** | Brownfield - 扩展现有 LLMPulse 系统 |

### 技术方案

| 组件 | 选型 | 理由 |
|------|------|------|
| 用户认证 | Supabase Auth | 原生支持 OAuth，与现有 Supabase 无缝集成 |
| OAuth 提供商 | GitHub + Google | 开发者首选，覆盖 90%+ 目标用户 |
| 用户数据存储 | Supabase PostgreSQL | 复用现有数据库，RLS 保护用户数据 |
| 评论系统 | Supabase Realtime | 实时评论更新，无需轮询 |
| 收藏功能 | Supabase PostgreSQL | 关联 daily_practices 表 |

### PRD 范围

| 包含 | 不包含 |
|------|--------|
| ✅ GitHub/Google OAuth 登录 | ❌ 邮箱/密码注册 |
| ✅ 评论功能（发表、查看） | ❌ 评论回复嵌套 |
| ✅ 收藏功能 | ❌ 收藏夹分组 |
| ✅ LocalStorage 数据迁移 | ❌ 社区贡献内容 |
| ✅ 游客模式（未登录用户）| ❌ 用户主页/个人资料页 |

## Success Criteria

### User Success

| 指标 | 目标 | 衡量方式 |
|------|------|----------|
| 登录转化率 | > 30% | 访问用户中完成登录的比例 |
| 评论参与率 | > 10% | 登录用户中发表过评论的比例 |
| 收藏使用率 | > 25% | 登录用户中使用过收藏的比例 |
| 跨设备同步满意度 | > 4/5 | 用户反馈评分 |

**「aha!」时刻定义：**
- 认证：用户在新设备登录后，看到所有历史实践记录还在
- 评论：用户发表评论后 5 分钟内收到他人回复
- 收藏：用户找到一周前收藏的内容并解决了实际问题

**用户说「这值了」：**
> 「终于不用担心换电脑丢数据了，还能看到别人怎么用这些技巧的」

### Business Success

| 指标 | 3 个月 | 12 个月 |
|------|--------|---------|
| 注册用户数 | 500 | 5,000 |
| 日活用户 (DAU) | 150 | 1,500 |
| 评论总数 | 1,000 | 20,000 |
| 收藏总数 | 2,000 | 50,000 |


### Measurable Outcomes

| 里程碑 | 时间 | 成功标准 |
|--------|------|----------|
| MVP 上线 | 第 3 周 | OAuth 登录 + 评论 + 收藏功能完成 |
| 数据迁移 | 第 4 周 | 95%+ 用户 LocalStorage 数据成功迁移 |
| 社区活跃 | 第 8 周 | 50+ 周活跃评论用户 |
| 产品市场契合 | 第 12 周 | 30%+ D30 留存率 |

## Product Scope

### MVP - Minimum Viable Product

**必须包含：**

#### 1. 用户认证系统
- GitHub OAuth 登录
- Google OAuth 登录
- 登录状态持久化（Supabase Session）
- 用户基本信息展示（头像 + 用户名）
- 登出功能

#### 2. 评论功能
- 发表评论（关联到 daily_practice）
- 查看评论列表（按时间排序）
- 删除自己的评论
- 评论字数限制（500 字）

#### 3. 收藏功能
- 收藏/取消收藏今日精选
- 收藏列表页面
- 收藏状态同步（云端 + 本地缓存）

#### 4. 数据迁移
- LocalStorage 实践记录迁移到云端
- 首次登录时自动触发迁移
- 迁移冲突处理（以云端数据为准）

#### 5. 游客模式
- 未登录用户可浏览所有精选内容
- 未登录用户可查看评论
- 未登录用户使用 LocalStorage 存储实践状态
- 引导未登录用户登录（评论/收藏时）

**不包含：**
- 邮箱/密码注册
- 密码重置流程
- 用户个人主页
- 评论回复/嵌套
- 评论点赞
- 收藏夹分组管理
- 用户关注/粉丝系统
- 私信功能

### Growth Features (Post-MVP)

- 评论回复嵌套（二级评论）
- 评论点赞功能
- 用户个人主页
- 收藏夹分组
- 社交分享（分享到 Twitter/LinkedIn）
- 用户成就系统

### Vision (Future)

- 社区贡献精选内容
- 用户关注/粉丝系统
- 私信功能
- 内容审核机制
- 用户信誉系统

## User Journeys

### Journey 1: 小明 - 新设备无缝衔接

**用户画像：** 3 年经验全栈开发者，家里和公司各有一台电脑

**故事：**
小明在家里电脑上用 LLMPulse 完成了一周的每日实践，积累了 7 个「已实践」徽章。

周一到公司，他打开 LLMPulse，发现页面右上角有一个「Login with GitHub」按钮。他点击登录，授权后看到了熟悉的界面 —— 更重要的是，他之前的 7 个实践记录都在！

「终于不用担心数据丢失了」，小明满意地开始今天的实践。

**情感弧线：** 期待 → 惊喜 → 安心 → 满足

### Journey 2: 小红 - 评论互动交流

**用户画像：** 技术团队 Lead，喜欢分享和交流

**故事：**
小红看完今日精选「使用 Cursor 的 @codebase 功能快速理解遗留代码」，她有一个疑问：这个功能在大型 monorepo 中效果如何？

她点击评论区，发现已经有 3 条评论。其中一条正好提到：「亲测在 100K+ 行代码的 monorepo 中效果不错，但首次索引需要 2-3 分钟」。

小红也发表了自己的心得：「在 Java 项目中尝试了，配合 @file 更精准」。5 分钟后她收到了一条回复。

**情感弧线：** 好奇 → 发现 → 分享 → 连接

### Journey 3: 小张 - 收藏备用

**用户画像：** 初级开发者，正在系统学习 AI 编程

**故事：**
小张每天都会看今日精选，但有些高级技巧他暂时用不到。他希望能保存起来以后学。

看到今日精选「使用 Claude 的 Artifacts 功能生成可交互原型」，他觉得很有价值但目前项目用不上。他点击了「收藏」按钮，图标变成了实心的星星。

一个月后，小张接到了一个需要快速原型的项目。他打开收藏列表，找到了那条精选，按照步骤完成了原型，大获好评。

**情感弧线：** 发现 → 保存 → 遗忘 → 重拾 → 成就

### Journey Requirements Summary

| 能力 | 来源旅程 | MVP 优先级 |
|------|----------|-----------|
| GitHub OAuth 登录 | J1 | ✅ P0 |
| Google OAuth 登录 | J1 | ✅ P0 |
| 数据云端同步 | J1 | ✅ P0 |
| LocalStorage 迁移 | J1 | ✅ P0 |
| 发表评论 | J2 | ✅ P0 |
| 查看评论 | J2 | ✅ P0 |
| 收藏精选 | J3 | ✅ P0 |
| 收藏列表 | J3 | ✅ P0 |
| 评论回复 | J2 | ⚠️ P1 |
| 评论通知 | J2 | ⚠️ P1 |

## Functional Requirements

### 用户认证 (Authentication)

- FR1: 用户可以通过 GitHub OAuth 登录
- FR2: 用户可以通过 Google OAuth 登录
- FR3: 用户可以查看自己的登录状态（头像 + 用户名）
- FR4: 用户可以登出
- FR5: 系统可以在用户关闭浏览器后保持登录状态（Session 持久化）
- FR6: 系统在 OAuth 失败时显示友好错误提示

### 评论功能 (Comments)

- FR7: 已登录用户可以对今日精选发表评论
- FR8: 所有用户（包括游客）可以查看精选的评论列表
- FR9: 用户可以删除自己发表的评论
- FR10: 评论内容限制为 500 字以内
- FR11: 评论列表按发表时间降序排列
- FR12: 评论显示作者头像、用户名、发表时间
- FR13: 未登录用户点击评论时引导登录

### 收藏功能 (Favorites)

- FR14: 已登录用户可以收藏今日精选
- FR15: 已登录用户可以取消收藏
- FR16: 已登录用户可以查看收藏列表
- FR17: 收藏列表按收藏时间降序排列
- FR18: 收藏状态在精选卡片上有视觉反馈（星标图标）
- FR19: 未登录用户点击收藏时引导登录

### 数据迁移 (Data Migration)

- FR20: 用户首次登录时，系统自动检测 LocalStorage 中的实践记录
- FR21: 系统将 LocalStorage 数据迁移到云端用户数据
- FR22: 迁移完成后清理 LocalStorage 中的旧数据
- FR23: 迁移过程中显示进度提示
- FR24: 迁移冲突时以云端数据为准（保护已同步的数据）

### 游客模式 (Guest Mode)

- FR25: 未登录用户可以浏览所有精选内容
- FR26: 未登录用户可以查看评论
- FR27: 未登录用户的实践状态存储在 LocalStorage
- FR28: 未登录用户进行需登录操作时，显示登录引导弹窗

## Non-Functional Requirements

### Security

| 要求 | 实现方式 |
|------|----------|
| OAuth 安全 | 使用 Supabase Auth PKCE 流程 |
| 数据隔离 | Supabase RLS 确保用户只能访问自己的数据 |
| XSS 防护 | 评论内容转义，禁止 HTML 注入 |
| CSRF 防护 | Supabase Auth 内置 CSRF token |
| Rate Limiting | 评论发表限制：5 条/分钟/用户 |

### Performance

| 指标 | 目标 |
|------|------|
| OAuth 登录流程 | < 3 秒（含授权页） |
| 登录状态检查 | < 100ms |
| 评论列表加载 | < 500ms |
| 收藏列表加载 | < 500ms |
| 收藏操作响应 | < 200ms |

### Reliability

| 指标 | 目标 |
|------|------|
| Supabase Auth 可用性 | 99.9% |
| 数据迁移成功率 | 100% |
| 评论提交成功率 | 99% |

### Accessibility

| 要求 | 实现方式 |
|------|----------|
| 登录按钮 | 清晰的 ARIA 标签 |
| 评论输入 | 支持键盘导航 |
| 状态反馈 | 屏幕阅读器友好 |

## Technical Considerations

### Supabase Auth 集成方案

```typescript
// 初始化 Supabase Auth Client
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// OAuth 登录
async function signInWithGitHub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
}

// 监听认证状态变化
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // 触发 LocalStorage 数据迁移
    migrateLocalStorageData(session.user.id)
  }
})
```

### 数据库 Schema 设计建议

```sql
-- 用户配置表（扩展 Supabase auth.users）
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 评论表
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  practice_id UUID REFERENCES daily_practices(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 收藏表
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  practice_id UUID REFERENCES daily_practices(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, practice_id)
);

-- 用户实践记录表（替代 LocalStorage）
CREATE TABLE user_practice_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  practice_id UUID REFERENCES daily_practices(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, practice_id)
);

-- RLS 策略
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_practice_status ENABLE ROW LEVEL SECURITY;

-- 评论: 所有人可读，作者可写/删
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments"
  ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE USING (auth.uid() = user_id);

-- 收藏: 仅作者可读写
CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL USING (auth.uid() = user_id);

-- 实践状态: 仅作者可读写
CREATE POLICY "Users can manage own practice status"
  ON user_practice_status FOR ALL USING (auth.uid() = user_id);
```

### LocalStorage 数据迁移策略

```typescript
interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
}

async function migrateLocalStorageData(userId: string): Promise<MigrationResult> {
  const result: MigrationResult = { success: true, migratedCount: 0, errors: [] };

  try {
    // 1. 读取 LocalStorage 中的实践记录
    const localData = loadCompletedPractices(); // 现有函数
    const practiceIds = Object.keys(localData);

    if (practiceIds.length === 0) {
      return result;
    }

    // 2. 批量插入到云端（忽略冲突）
    const { data, error } = await supabase
      .from('user_practice_status')
      .upsert(
        practiceIds.map(practiceId => ({
          user_id: userId,
          practice_id: practiceId,
          status: 'completed',
          completed_at: localData[practiceId].completedAt
        })),
        { onConflict: 'user_id,practice_id', ignoreDuplicates: true }
      );

    if (error) {
      result.errors.push(error.message);
      result.success = false;
      return result;
    }

    // 3. 清理 LocalStorage
    clearAllPractices();

    result.migratedCount = practiceIds.length;
    return result;
  } catch (e) {
    result.errors.push(e.message);
    result.success = false;
    return result;
  }
}
```

### 防垃圾评论策略

| 策略 | 实现方式 |
|------|----------|
| Rate Limiting | Supabase Edge Functions 限制频率 |
| 最小字数 | 评论至少 5 个字符 |
| 新用户冷却 | 新注册用户需等待 5 分钟才能评论 |
| 关键词过滤 | 敏感词过滤（后期可扩展） |
| 举报机制 | Post-MVP 实现 |

## User Stories

### Epic 1: 用户认证

| ID | 用户故事 | 优先级 | 估时 |
|----|----------|--------|------|
| US1.1 | 作为用户，我想通过 GitHub 登录，以便快速开始使用 | P0 | 4h |
| US1.2 | 作为用户，我想通过 Google 登录，以便有更多登录选择 | P0 | 2h |
| US1.3 | 作为用户，我想看到我的头像和用户名，以便确认登录状态 | P0 | 2h |
| US1.4 | 作为用户，我想登出账号，以便在公共设备上保护隐私 | P0 | 1h |
| US1.5 | 作为用户，我希望关闭浏览器后登录状态保持，以便下次无需重新登录 | P0 | 2h |

### Epic 2: 评论功能

| ID | 用户故事 | 优先级 | 估时 |
|----|----------|--------|------|
| US2.1 | 作为登录用户，我想对今日精选发表评论，以便分享我的心得 | P0 | 4h |
| US2.2 | 作为用户，我想查看精选下的所有评论，以便了解他人的经验 | P0 | 3h |
| US2.3 | 作为登录用户，我想删除我发表的评论，以便纠正错误 | P0 | 2h |
| US2.4 | 作为游客，我想在尝试评论时看到登录引导，以便知道如何参与 | P0 | 1h |

### Epic 3: 收藏功能

| ID | 用户故事 | 优先级 | 估时 |
|----|----------|--------|------|
| US3.1 | 作为登录用户，我想收藏今日精选，以便日后查看 | P0 | 3h |
| US3.2 | 作为登录用户，我想取消收藏，以便管理我的收藏列表 | P0 | 1h |
| US3.3 | 作为登录用户，我想查看收藏列表，以便快速找到保存的内容 | P0 | 4h |
| US3.4 | 作为游客，我想在尝试收藏时看到登录引导，以便知道如何使用 | P0 | 1h |

### Epic 4: 数据迁移

| ID | 用户故事 | 优先级 | 估时 |
|----|----------|--------|------|
| US4.1 | 作为用户，我希望首次登录时自动迁移本地数据，以便不丢失历史记录 | P0 | 4h |
| US4.2 | 作为用户，我希望看到数据迁移的进度，以便了解同步状态 | P0 | 2h |
| US4.3 | 作为用户，我希望迁移后在任何设备登录都能看到我的数据 | P0 | 2h |

## Implementation Phases

### Phase 1: 基础认证（第 1 周）

**目标：** 完成 OAuth 登录基础设施

| 任务 | 说明 | 估时 |
|------|------|------|
| Supabase Auth 配置 | 启用 GitHub/Google Provider | 2h |
| 数据库迁移 | 创建 user_profiles, comments, favorites, user_practice_status 表 | 3h |
| 认证 Hook | useAuth hook，管理登录状态 | 4h |
| 登录 UI | 登录按钮、用户信息展示 | 4h |
| 登出功能 | 登出逻辑 + UI | 1h |

**里程碑：** 用户可以通过 GitHub/Google 登录/登出

### Phase 2: 数据迁移（第 2 周前半）

**目标：** 完成 LocalStorage 到云端的数据迁移

| 任务 | 说明 | 估时 |
|------|------|------|
| 迁移服务 | migrateLocalStorageData 函数 | 4h |
| 首次登录检测 | 在 onAuthStateChange 中触发 | 2h |
| 迁移 UI | 进度提示组件 | 2h |
| 实践状态服务改造 | 登录用户使用云端，游客使用 LocalStorage | 4h |

**里程碑：** 用户登录后，LocalStorage 数据自动迁移到云端

### Phase 3: 评论功能（第 2 周后半）

**目标：** 完成评论发表和查看功能

| 任务 | 说明 | 估时 |
|------|------|------|
| 评论服务 | CRUD 操作封装 | 4h |
| 评论列表组件 | 显示评论 + 作者信息 | 4h |
| 评论输入组件 | 输入框 + 提交逻辑 | 3h |
| 登录引导 | 游客操作时的登录弹窗 | 2h |
| 删除评论 | 删除逻辑 + 确认弹窗 | 2h |

**里程碑：** 用户可以发表、查看、删除评论

### Phase 4: 收藏功能（第 3 周）

**目标：** 完成收藏功能

| 任务 | 说明 | 估时 |
|------|------|------|
| 收藏服务 | add/remove/list 封装 | 3h |
| 收藏按钮组件 | 星标图标 + 状态切换 | 2h |
| 收藏列表页 | 独立页面展示收藏内容 | 4h |
| 状态同步 | 本地缓存 + 云端同步 | 3h |

**里程碑：** 用户可以收藏精选，查看收藏列表

### Phase 5: 测试与优化（第 4 周）

**目标：** 全面测试，优化用户体验

| 任务 | 说明 | 估时 |
|------|------|------|
| 端到端测试 | Playwright 自动化测试 | 6h |
| 性能优化 | 加载优化，缓存策略 | 4h |
| 错误处理 | 边界情况处理，错误提示 | 4h |
| 用户体验优化 | 动画，反馈，引导 | 4h |

**里程碑：** 功能稳定，可上线发布

## Risk Mitigation

### 技术风险

| 风险 | 可能性 | 影响 | 缓解策略 |
|------|--------|------|----------|
| OAuth 配置错误 | 低 | 高 | 本地环境充分测试，参考 Supabase 官方文档 |
| 数据迁移失败 | 中 | 高 | 迁移前备份 LocalStorage，提供手动重试 |
| RLS 配置错误导致数据泄露 | 低 | 极高 | 单元测试验证 RLS 策略，代码审查 |

### 用户体验风险

| 风险 | 可能性 | 影响 | 缓解策略 |
|------|--------|------|----------|
| 用户不愿登录 | 中 | 中 | 保持游客模式完整体验，渐进式引导 |
| 垃圾评论泛滥 | 中 | 中 | Rate limiting + 举报机制 |
| 评论区无人互动 | 高 | 中 | 初期管理员主动参与，引导社区氛围 |

## Appendix

### 现有代码依赖分析

需要修改的现有文件：
- `services/practiceStorageService.ts` - 添加云端同步逻辑
- `components/coding-efficiency/DailyPracticeCard.tsx` - 添加评论和收藏按钮
- `services/supabaseService.ts` - 添加 Auth 相关方法

需要新增的文件：
- `services/authService.ts` - 认证相关服务
- `services/commentService.ts` - 评论服务
- `services/favoriteService.ts` - 收藏服务
- `hooks/useAuth.ts` - 认证状态 Hook
- `components/auth/LoginButton.tsx` - 登录按钮
- `components/auth/UserMenu.tsx` - 用户菜单
- `components/comments/CommentList.tsx` - 评论列表
- `components/comments/CommentInput.tsx` - 评论输入
- `components/favorites/FavoriteButton.tsx` - 收藏按钮
- `components/favorites/FavoriteList.tsx` - 收藏列表

### OAuth Provider 配置清单

**GitHub OAuth:**
1. 在 GitHub Developer Settings 创建 OAuth App
2. 设置 Callback URL: `https://<project>.supabase.co/auth/v1/callback`
3. 在 Supabase Dashboard 配置 Client ID 和 Client Secret

**Google OAuth:**
1. 在 Google Cloud Console 创建 OAuth 2.0 Client
2. 添加授权重定向 URI: `https://<project>.supabase.co/auth/v1/callback`
3. 在 Supabase Dashboard 配置 Client ID 和 Client Secret


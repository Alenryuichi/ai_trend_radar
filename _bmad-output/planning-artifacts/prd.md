---
stepsCompleted: [1, 2, 3, 4, 7, 8, 9, 10, 11]
status: complete
inputDocuments:
  - "_bmad-output/analysis/brainstorming-session-2026-01-10.md"
  - "docs/architecture.md"
  - "docs/index.md"
workflowType: 'prd'
lastStep: 2
documentCounts:
  brief: 0
  research: 0
  brainstorming: 1
  projectDocs: 2
projectType: "brownfield"
prdScope: "Coding Efficiency 专区增强"
featureScope: "P0 - 今日精选 (Daily Practice)"
technicalApproach: "Supabase + Vercel Cron"
---

# Product Requirements Document - LLMPulse

**Author:** alenryuichi
**Date:** 2026-01-10

## Executive Summary

### 产品愿景

将 LLMPulse 的 Coding Efficiency 专区从「AI 编程资讯展示」升级为「AI Coding 每日行动指南」。

**核心理念：** 用户不需要更多信息，而是需要每日一个可执行的最佳实践。

### 目标用户痛点

| 痛点 | 描述 |
|------|------|
| 信息分散 | AI coding 最佳实践散落各处，难以找到 |
| 迭代太快 | 技术变化速度快，难以跟上 |
| 缺乏行动 | 看完资讯后不知道具体该做什么 |

### What Makes This Special

**范式转变：** 从「信息聚合」到「行动指南」

| 传统模式 | 新模式 |
|----------|--------|
| 新闻 → 阅读 → 遗忘 | 精选 → 实践 → 成长 |
| 大量信息轰炸 | 每日一个精选实践 |
| 被动消费 | 主动实践 + 追踪成长 |

**核心价值主张：**
> 「每日一个 AI Coding 最佳实践，可信来源，立即可用」

**用户「正是我需要的」时刻：**
- 早上打开网站 → 2分钟内看到今日精选
- 5分钟内完成一次实践
- 标记「已实践」获得成就感

## Project Classification

| 维度 | 内容 |
|------|------|
| **技术类型** | Web App (SPA) - 功能增强 |
| **领域** | General (通用软件开发) |
| **复杂度** | Low (标准需求) |
| **项目上下文** | Brownfield - 扩展现有 LLMPulse 系统 |

### 技术方案

| 组件 | 选型 | 理由 |
|------|------|------|
| 内容存储 | Supabase PostgreSQL | 免费层 500MB，足够 MVP |
| 定时任务 | Vercel Cron | 免费层支持每日 1 次 |
| AI 生成 | 现有多模型 (默认 DeepSeek) | 复用现有能力 |
| 用户数据 | LocalStorage | 零成本，无需登录 |

### PRD 范围

| 包含 | 不包含 |
|------|--------|
| ✅ P0: 今日精选 (Daily Practice) | ❌ P1: 工具效率榜、本周热点 |
| ✅ Coding Efficiency 专区增强 | ❌ 其他 LLMPulse 模块 |
| ✅ Supabase + Vercel Cron 集成 | ❌ 用户认证系统 |

## Success Criteria

### User Success

| 指标 | 目标 | 衡量方式 |
|------|------|----------|
| 首次价值感知时间 | < 2 分钟 | 打开页面到理解今日精选 |
| 实践完成率 | > 40% | 查看后标记「已实践」比例 |
| 7日留存率 (D7) | > 30% | 7天后仍每日访问比例 |
| 习惯形成周期 | 21 天 | 连续使用天数 |

**「aha!」时刻定义：**
用户第一次使用今日精选的技巧成功解决实际编程问题。

**用户说「这值了」：**
> 「我每天早上花 5 分钟看今日精选，一周后 AI 编程效率明显提升了」

### Business Success

| 指标 | 3 个月 | 12 个月 |
|------|--------|---------|
| 日活用户 (DAU) | 100 | 1,000 |
| 周活用户 (WAU) | 300 | 3,000 |
| 平均访问时长 | 3 分钟 | 5 分钟 |
| 实践完成总数 | 1,000 | 30,000 |
| 内容库规模 | 90 条 | 365 条 |

**北极星指标：** 每日实践完成数

### Technical Success

| 指标 | 目标 |
|------|------|
| 页面加载时间 | < 2 秒 |
| AI 生成成功率 | > 95% |
| 内容质量分 | > 4/5 |
| 系统可用性 | 99% |
| Supabase 使用量 | < 100MB (3个月) |

### Measurable Outcomes

| 里程碑 | 时间 | 成功标准 |
|--------|------|----------|
| MVP 上线 | 第 2 周 | 每日自动生成精选内容 |
| 早期验证 | 第 4 周 | 10+ DAU，30%+ 实践率 |
| 产品市场契合 | 第 12 周 | 100 DAU，40%+ 实践率 |

## Product Scope

### MVP - Minimum Viable Product

**必须包含：**
- 今日精选卡片 (1 主推 + 2 备选)
- 实践步骤展示
- 标记「已实践」功能
- 历史精选列表
- Vercel Cron 每日自动生成
- Supabase 内容存储

**不包含：**
- 用户登录/注册
- 个性化推荐
- 社区贡献机制

### Growth Features (Post-MVP)

- 收藏功能
- 标签筛选
- 分享到社交媒体
- 实践统计看板

### Vision (Future)

- 个性化学习路径
- AI 驱动的内容推荐
- 社区贡献 + 审核机制
- 实践成就系统

## User Journeys

### Journey 1: 小明 - 每日晨间 AI 编程修炼

**用户画像：** 3 年经验全栈开发者，大量使用 AI 辅助编程，想系统性提升效率

**故事：**
早上 8:45，小明端着咖啡坐到工位前。和往常一样，他先打开 LLMPulse 的 Coding Efficiency 页面 —— 这已经成为他每天开工前的固定仪式。

今天的精选立刻吸引了他的注意：「Claude Code: 使用 /compact 命令优化长对话」。来源是 Anthropic 官方文档，难度标记为入门级，预计 2 分钟可完成。

小明点开详情，看到清晰的三步实践指南。他立刻打开终端试了一下 —— token 使用量从 85% 降到了 40%，对话质量明显提升。

小明满意地点击「✅ 已实践」按钮，看到自己本周已经完成了 4 个实践。开始了新一天的工作。

**情感弧线：** 期待 → 好奇 → 惊喜 → 满足 → 成就感

### Journey 2: 小红 - 周末回顾补课

**用户画像：** 技术团队 Lead，工作日繁忙，周末批量学习

**故事：**
周六下午，小红终于有了学习时间。她打开 LLMPulse，发现这周已经错过了 3 天的今日精选。

她滚动到「历史精选」区域，快速浏览本周的内容。两条引起了她的兴趣，花了 15 分钟完成实践并标记。她还把一条对团队有价值的精选分享到了团队群里。

**情感弧线：** 愧疚 → 专注 → 高效 → 分享欲 → 满足

### Journey 3: 小张 - 首次发现的惊喜

**用户画像：** 初级开发者，刚开始使用 AI 编程工具，被同事推荐

**故事：**
小张好奇地打开 LLMPulse，直接点进「Coding Efficiency」标签。映入眼帘的是一个简洁的卡片：「⭐ 入门级 | ⏱️ 2分钟」—— 这让他立刻放下了心理负担。

他发现简洁的操作指南、清晰的学习理由、可信的官方来源。「这比我自己翻文档找技巧高效多了」，小张决定把这个页面加入书签。

**情感弧线：** 好奇 → 担忧 → 释然 → 认可 → 期待

### Journey Requirements Summary

| 能力 | 来源旅程 | MVP 优先级 |
|------|----------|-----------|
| 今日精选卡片展示 | J1, J3 | ✅ P0 |
| 实践步骤详情 | J1, J3 | ✅ P0 |
| 标记「已实践」| J1, J2 | ✅ P0 |
| 历史精选列表 | J2, J3 | ✅ P0 |
| 难度 + 时间标识 | J1, J3 | ✅ P0 |
| 来源信息展示 | J1, J3 | ✅ P0 |
| 实践统计 | J1 | ⚠️ P1 |
| 分享功能 | J2 | ⚠️ P1 |

## Web App Specific Requirements

### Project-Type Overview

LLMPulse Coding Efficiency 功能是一个 **单页应用 (SPA)** 增强模块，基于现有 React 19 + TypeScript + Vite 技术栈构建。

### Browser Support Matrix

| 浏览器 | 最低版本 | 优先级 |
|--------|----------|--------|
| Chrome | 最新 2 版本 | ✅ 主要 |
| Firefox | 最新 2 版本 | ✅ 主要 |
| Safari | 最新 2 版本 | ✅ 主要 |
| Edge | 最新 2 版本 | ✅ 主要 |
| IE11 | ❌ 不支持 | - |

### Responsive Design

| 断点 | 宽度 | 布局适配 |
|------|------|----------|
| Mobile | < 640px | 单列卡片，触摸优化 |
| Tablet | 640px - 1024px | 双列布局 |
| Desktop | > 1024px | 完整布局，侧边栏 |

**现有设计：** 继承 LLMPulse 现有响应式布局策略 (Tailwind CSS)

### Performance Targets

| 指标 | 目标 | 衡量方式 |
|------|------|----------|
| 首屏加载 (LCP) | < 2.5s | Lighthouse |
| 交互响应 (FID) | < 100ms | Lighthouse |
| 布局稳定 (CLS) | < 0.1 | Lighthouse |
| Lighthouse 总分 | > 80 | Performance audit |

### SEO Strategy

**策略：** 不需要 SEO 优化

- 工具型应用，用户通过直接链接访问
- SPA 架构，无需服务端渲染
- 专注于用户体验而非搜索引擎可见性

### Accessibility Requirements

**级别：** 基础无障碍支持

| 要求 | 实现方式 |
|------|----------|
| 语义化 HTML | 使用正确的 heading 层级、button、article 等标签 |
| 键盘导航 | Tab 键可访问所有交互元素 |
| 颜色对比 | 文字与背景对比度 > 4.5:1 |
| Focus 状态 | 可见的 focus 指示器 |

### Technical Architecture Considerations

| 方面 | 决策 |
|------|------|
| 状态管理 | React useState (现有模式) |
| 数据获取 | fetch API + Supabase Client |
| 样式方案 | Tailwind CSS (CDN，现有) |
| 构建工具 | Vite 6 (现有) |

### Implementation Considerations

| 考虑点 | 策略 |
|--------|------|
| 代码分割 | 按 Tab 懒加载 Coding Efficiency 组件 |
| 缓存策略 | LocalStorage 缓存今日精选，减少 Supabase 请求 |
| 错误处理 | 优雅降级，显示缓存内容或占位符 |
| 加载状态 | Skeleton loading 提升感知性能 |

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP 类型：** Experience MVP (体验型)

> 交付关键用户体验「每日打开 → 5分钟实践 → 成就感」，用最基础的功能支撑完整体验循环。

**资源需求：**

| 角色 | 人数 | 职责 |
|------|------|------|
| 全栈开发 | 1 | 前端组件 + Supabase + Cron |
| 预估周期 | 2 周 | 从开发到上线 |

### MVP Feature Set (Phase 1)

**支持的核心旅程：**

| 旅程 | 支持程度 |
|------|----------|
| J1: 每日晨间实践 | ✅ 完整支持 |
| J2: 周末回顾补课 | ✅ 基础支持 (历史列表) |
| J3: 首次发现 | ✅ 完整支持 |

**Must-Have 能力：**

| 能力 | 优先级 | 说明 |
|------|--------|------|
| 今日精选卡片 | P0 | 1 主推 + 2 备选 |
| 实践步骤展示 | P0 | 清晰的 1-2-3 步骤指南 |
| 标记「已实践」| P0 | LocalStorage 存储状态 |
| 历史精选列表 | P0 | 最近 7-14 天内容 |
| 难度 + 时间标识 | P0 | ⭐入门/中级/高级 + ⏱️分钟 |
| 来源信息展示 | P0 | 可信来源链接 |
| Vercel Cron 每日生成 | P0 | 每日 8:00 自动触发 |
| Supabase 内容存储 | P0 | PostgreSQL + REST API |

### Post-MVP Features

**Phase 2 - Growth (第 1-3 个月后)：**

| 功能 | 价值 | 复杂度 |
|------|------|--------|
| 实践统计看板 | 可视化成长轨迹 | 中 |
| 收藏功能 | 保存精选内容 | 低 |
| 分享到社交媒体 | 自然传播 | 低 |
| 标签筛选 | 按类别浏览历史 | 中 |

**Phase 3 - Expansion (第 3-6 个月后)：**

| 功能 | 价值 | 复杂度 |
|------|------|--------|
| 用户登录系统 | 跨设备同步 | 高 |
| 个性化推荐 | 基于历史偏好 | 高 |
| 社区贡献机制 | UGC 内容 | 高 |
| 实践成就系统 | 游戏化激励 | 中 |
| AI 驱动学习路径 | 个性化成长 | 高 |

### Risk Mitigation Strategy

**技术风险：**

| 风险 | 缓解策略 |
|------|----------|
| AI 生成内容质量不稳定 | 多模型 fallback + 人工抽查 |
| Vercel Cron 失败 | 错误通知 + 手动补发机制 |
| Supabase 免费层限制 | 监控使用量，提前规划升级 |

**市场风险：**

| 风险 | 验证方式 |
|------|----------|
| 用户不需要每日精选 | 早期 10 用户访谈，追踪 D7 留存 |
| 内容同质化无差异 | 聚焦「可执行实践」差异点 |

**资源风险：**

| 风险 | 应对策略 |
|------|----------|
| 开发时间不足 | 优先完成 P0 核心能力，延后次要功能 |
| 最小化回退方案 | 仅今日精选卡片 + 手动更新 JSON |

### Scope Boundaries Summary

| ✅ IN SCOPE | ❌ OUT OF SCOPE |
|-------------|-----------------|
| 今日精选展示 | 用户认证系统 |
| 实践步骤指南 | 个性化推荐 |
| 已实践标记 (LocalStorage) | 社区贡献 |
| 历史精选列表 | 收藏/分享 |
| Vercel Cron 自动化 | 实践统计看板 |
| Supabase 存储 | 多语言内容 |

## Functional Requirements

### 今日精选展示 (Daily Practice Display)

- FR1: 用户可以在 Coding Efficiency 页面查看今日主推精选
- FR2: 用户可以查看今日的 2 个备选精选
- FR3: 用户可以查看每个精选的难度等级标识 (入门/中级/高级)
- FR4: 用户可以查看每个精选的预估完成时间
- FR5: 用户可以查看每个精选的可信来源信息
- FR6: 用户可以点击来源链接跳转到原始资料

### 实践指南 (Practice Guidance)

- FR7: 用户可以查看精选的实践步骤指南 (1-2-3 步骤)
- FR8: 用户可以查看为什么这个实践有价值的说明
- FR9: 用户可以查看实践适用的工具/场景

### 实践追踪 (Practice Tracking)

- FR10: 用户可以将精选标记为「已实践」
- FR11: 用户可以取消已标记的「已实践」状态
- FR12: 系统可以在本地持久化用户的实践状态
- FR13: 用户可以在页面刷新后保留实践状态

### 历史精选 (History)

- FR14: 用户可以浏览最近 7-14 天的历史精选
- FR15: 用户可以查看历史精选的已实践状态
- FR16: 用户可以点击历史精选查看详情

### 内容自动化 (Content Automation)

- FR17: 系统可以每日自动生成新的精选内容
- FR18: 系统可以从多个可信来源获取 AI 编程最佳实践
- FR19: 系统可以将生成的内容存储到数据库
- FR20: 系统可以在 AI 生成失败时使用备用模型

### 用户界面适配 (UI Adaptation)

- FR21: 用户可以在移动设备上正常使用今日精选功能
- FR22: 用户可以在平板设备上正常使用今日精选功能
- FR23: 用户可以在桌面设备上正常使用今日精选功能

### 错误处理 (Error Handling)

- FR24: 用户在网络异常时可以看到缓存的今日精选内容
- FR25: 用户在内容加载失败时可以看到友好的错误提示
- FR26: 用户可以在错误状态下手动重试加载

## Non-Functional Requirements

### Performance

| 指标 | 目标 | 衡量方式 |
|------|------|----------|
| 首屏加载 (LCP) | < 2.5 秒 | Lighthouse |
| 交互响应 (FID) | < 100 毫秒 | Lighthouse |
| 布局稳定 (CLS) | < 0.1 | Lighthouse |
| API 响应时间 | < 500 毫秒 | Supabase 监控 |
| 今日精选加载 | < 1 秒 | 用户感知 |

**优化策略：**
- LocalStorage 缓存减少网络请求
- Skeleton loading 提升感知性能
- 按需加载 Coding Efficiency 组件

### Reliability

| 指标 | 目标 | 说明 |
|------|------|------|
| 系统可用性 | 99% | 月度 uptime |
| Cron 任务成功率 | > 95% | 每日内容生成 |
| 错误恢复 | 自动重试 | AI 生成失败时切换备用模型 |

**降级策略：**
- AI 生成失败 → 使用备用模型
- Supabase 不可用 → 显示 LocalStorage 缓存
- 网络异常 → 友好错误提示 + 手动重试

### Accessibility

| 要求 | 标准 | 实现 |
|------|------|------|
| 语义化 HTML | 基础 | heading 层级、button、article |
| 键盘导航 | 基础 | Tab 可访问所有交互元素 |
| 颜色对比 | WCAG AA | 文字对比度 > 4.5:1 |
| Focus 指示器 | 可见 | 明确的 focus 样式 |

### Integration

| 集成点 | 要求 | SLA |
|--------|------|-----|
| Supabase PostgreSQL | REST API 连接 | 99% 可用性 (Supabase 免费层) |
| Vercel Cron | 每日 8:00 触发 | 1 次/天 (免费层限制) |
| AI 模型 API | 多模型 fallback | DeepSeek 主 → 备用模型 |

**集成错误处理：**
- Supabase 连接失败 → 3 次重试 + 告警
- Cron 任务失败 → 邮件通知 + 手动补发
- AI API 超时 → 30 秒超时 + 切换模型

### Data & Storage

| 指标 | 目标 | 说明 |
|------|------|------|
| 数据保留 | 90 天 | 历史精选内容 |
| 存储使用 | < 100MB | Supabase 免费层 (500MB) |
| 备份策略 | 每周 | Supabase 自动备份 |

### Monitoring & Observability

| 监控项 | 方式 | 告警 |
|--------|------|------|
| Cron 任务状态 | Vercel Dashboard | 失败时邮件通知 |
| Supabase 使用量 | Supabase Dashboard | 接近限额时告警 |
| 页面性能 | Lighthouse CI | 分数低于 80 时告警 |
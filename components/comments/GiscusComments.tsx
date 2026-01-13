/**
 * GiscusComments - Giscus 評論組件包裝
 *
 * 使用 GitHub Discussions 作為評論後端，無需自建評論系統
 *
 * @see https://giscus.app/
 */

import React from 'react';
import Giscus from '@giscus/react';

export interface GiscusCommentsProps {
  /**
   * 用於映射 Discussion 的唯一標識符
   * 通常使用 practice.id 作為 term
   */
  term: string;

  /**
   * 自定義 className
   */
  className?: string;
}

/**
 * Giscus 評論組件
 *
 * 特點：
 * - 基於 GitHub Discussions，無維護成本
 * - 自動 Spam 防護
 * - 支持 Markdown
 * - 支持 Reactions
 * - 深色主題
 */
export function GiscusComments({ term, className = '' }: GiscusCommentsProps) {
  return (
    <div className={`giscus-comments ${className}`}>
      <Giscus
        id="comments"
        repo="Alenryuichi/ai_trend_radar"
        repoId="R_kgDOQ2d_fA"
        category="General"
        categoryId="DIC_kwDOQ2d_fM4C035P"
        mapping="specific"
        term={term}
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme="dark_dimmed"
        lang="zh-CN"
        loading="lazy"
      />
    </div>
  );
}

export default GiscusComments;


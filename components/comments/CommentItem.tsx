/**
 * CommentItem
 * 单条评论展示组件
 */

import React from 'react';
import { Comment } from '../../types';

interface CommentItemProps {
  comment: Comment;
  onDelete?: (commentId: string) => void;
  canDelete: boolean;
}

/**
 * 格式化相对时间
 */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  if (diffDay < 7) return `${diffDay}天前`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}周前`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)}个月前`;
  return `${Math.floor(diffDay / 365)}年前`;
}

/**
 * 获取用户显示名
 */
function getDisplayName(comment: Comment): string {
  return comment.user_profiles?.display_name || '匿名用户';
}

/**
 * 获取头像 URL
 */
function getAvatarUrl(comment: Comment): string | null {
  return comment.user_profiles?.avatar_url || null;
}

export function CommentItem({ comment, onDelete, canDelete }: CommentItemProps) {
  const displayName = getDisplayName(comment);
  const avatarUrl = getAvatarUrl(comment);
  const relativeTime = formatRelativeTime(comment.created_at);

  const handleDelete = () => {
    if (onDelete && window.confirm('确定要删除这条评论吗？')) {
      onDelete(comment.id);
    }
  };

  return (
    <div className="flex gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
      {/* 头像 */}
      <div className="flex-shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
            <i className="fa-solid fa-user text-gray-400 text-xs" />
          </div>
        )}
      </div>

      {/* 内容区 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-white truncate">
            {displayName}
          </span>
          <span className="text-xs text-gray-500">{relativeTime}</span>
        </div>
        <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>

      {/* 删除按钮 */}
      {canDelete && (
        <button
          onClick={handleDelete}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs p-1 transition-opacity"
          title="删除评论"
        >
          <i className="fa-solid fa-trash" />
        </button>
      )}
    </div>
  );
}

export default CommentItem;


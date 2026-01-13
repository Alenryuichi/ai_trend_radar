/**
 * CommentSection
 * 评论区容器组件
 */

import React, { useState } from 'react';
import { useAuthContext, LoginPromptModal } from '../auth';
import { useComments } from '../../hooks/useComments';
import { CommentItem } from './CommentItem';

interface CommentSectionProps {
  practiceId: string;
  className?: string;
}

export function CommentSection({ practiceId, className = '' }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuthContext();
  const { comments, isLoading, addComment, deleteComment } = useComments(practiceId);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 处理发送评论
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!inputValue.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(inputValue);
      setInputValue('');
    } catch (error) {
      console.error('发表评论失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理键盘事件: Enter 发送, Shift+Enter 换行
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 处理删除评论
  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error('删除评论失败:', error);
    }
  };

  const charCount = inputValue.length;
  const isOverLimit = charCount > 500;

  return (
    <div className={className}>
      {/* 标题 - 与其他区块（为何重要、实践步骤）保持一致 */}
      <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <i className="fa-regular fa-comments text-blue-400" />
        <span>评论</span>
        {comments.length > 0 && (
          <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-400 normal-case">
            {comments.length}
          </span>
        )}
      </h4>

      {/* 评论列表 */}
      <div className="space-y-1 mb-4">
        {isLoading ? (
          <div className="text-center py-6 text-gray-500">
            <i className="fa-solid fa-spinner fa-spin mr-2" />
            加载中...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">
            <i className="fa-regular fa-comment-dots text-2xl mb-2 block" />
            暂无评论，来发表第一条吧
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={handleDelete}
              canDelete={user?.id === comment.user_id}
            />
          ))
        )}
      </div>

      {/* 输入区域 */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={isAuthenticated ? '写下你的评论...' : '登录后可发表评论'}
            disabled={!isAuthenticated || isSubmitting}
            className={`
              w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm
              text-white placeholder-gray-500
              focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              ${isOverLimit ? 'border-red-500/50' : ''}
            `}
          />
          {inputValue && (
            <span className={`absolute top-1/2 -translate-y-1/2 right-3 text-xs ${isOverLimit ? 'text-red-400' : 'text-gray-500'}`}>
              {charCount}/500
            </span>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={!inputValue.trim() || isOverLimit || isSubmitting}
          className="
            bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-3 py-2
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center text-sm
            h-[34px] w-[34px]
          "
        >
          {isSubmitting ? (
            <i className="fa-solid fa-spinner fa-spin" />
          ) : (
            <i className="fa-solid fa-paper-plane" />
          )}
        </button>
      </div>

      {/* 登录提示 */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="登录后即可发表评论"
      />
    </div>
  );
}

export default CommentSection;


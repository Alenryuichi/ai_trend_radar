/**
 * CommentSection
 * 评论区容器组件
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuthContext, LoginPromptModal } from '../auth';
import { useComments } from '../../hooks/useComments';
import { CommentItem } from './CommentItem';

interface CommentSectionProps {
  practiceId: string;
  className?: string;
}

export function CommentSection({ practiceId, className = '' }: CommentSectionProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { comments, isLoading, addComment, deleteComment } = useComments(practiceId);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整 textarea 高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

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
    <div className={`glass-card rounded-2xl p-4 ${className}`}>
      {/* 标题 */}
      <div className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
        <i className="fa-regular fa-comments" />
        <span>评论</span>
        {comments.length > 0 && (
          <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
            {comments.length}
          </span>
        )}
      </div>

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
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isAuthenticated ? '写下你的评论...' : '登录后可发表评论'}
            disabled={!isAuthenticated || isSubmitting}
            rows={1}
            className={`
              w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm
              text-white placeholder-gray-500
              focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30
              disabled:opacity-50 disabled:cursor-not-allowed
              resize-none transition-colors
              ${isOverLimit ? 'border-red-500/50' : ''}
            `}
          />
          {inputValue && (
            <span className={`absolute bottom-1 right-2 text-xs ${isOverLimit ? 'text-red-400' : 'text-gray-500'}`}>
              {charCount}/500
            </span>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={!inputValue.trim() || isOverLimit || isSubmitting}
          className={`
            bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4 py-2
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-1 text-sm font-medium
          `}
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


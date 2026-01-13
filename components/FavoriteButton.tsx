/**
 * FavoriteButton
 * 收藏按钮组件 - 心形图标切换
 */

import React, { useState } from 'react';
import { useAuthContext, LoginPromptModal } from './auth';
import { useFavorites } from '../hooks/useFavorites';

interface FavoriteButtonProps {
  practiceId: string;
  className?: string;
  showCount?: boolean; // 是否显示收藏数（未来功能）
}

/**
 * 收藏按钮
 * - 未收藏: 空心心形 (fa-regular fa-heart), 灰色
 * - 已收藏: 实心心形 (fa-solid fa-heart), 粉色
 * - 未登录时显示 LoginPromptModal
 * - 点击动画 (scale)
 */
export function FavoriteButton({
  practiceId,
  className = '',
  showCount = false,
}: FavoriteButtonProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { isFavorited, toggleFavorite, isLoading: favLoading } = useFavorites();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const favorited = isFavorited(practiceId);
  const isLoading = authLoading || favLoading || isToggling;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止冒泡到父元素

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (isToggling) return;

    setIsToggling(true);
    try {
      await toggleFavorite(practiceId);
    } catch (error) {
      console.error('切换收藏状态失败:', error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          p-2 rounded-lg 
          hover:bg-white/5 
          transition-all duration-200
          active:scale-90
          disabled:cursor-wait
          ${favorited ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'}
          ${className}
        `}
        aria-label={favorited ? '取消收藏' : '添加收藏'}
        title={favorited ? '取消收藏' : '添加收藏'}
      >
        {isToggling ? (
          <i className="fa-solid fa-spinner fa-spin" />
        ) : (
          <i className={favorited ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} />
        )}
      </button>

      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="登录后即可收藏你喜欢的内容"
      />
    </>
  );
}

export default FavoriteButton;


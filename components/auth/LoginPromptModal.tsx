/**
 * LoginPromptModal
 * 登录提示模态框组件
 * 提示用户登录以使用特定功能
 */

import React, { useEffect, useCallback } from 'react';
import { useAuthContext } from './AuthProvider';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

/**
 * 登录提示模态框
 * - 显示登录提示信息
 * - 提供 GitHub 登录按钮
 * - 支持 ESC 键关闭
 * - 支持点击背景关闭
 */
export function LoginPromptModal({
  isOpen,
  onClose,
  message = '登录后即可使用此功能',
}: LoginPromptModalProps) {
  const { signInWithGitHub } = useAuthContext();
  const [isLoading, setIsLoading] = React.useState(false);

  // ESC 键关闭
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // 防止背景滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // 点击背景关闭
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // GitHub 登录
  const handleGitHubLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error('GitHub 登录失败:', error);
      setIsLoading(false);
    }
    // 成功时不重置 isLoading，因为页面会重定向
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-sm relative">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          aria-label="关闭"
        >
          <i className="fa-solid fa-xmark text-lg" />
        </button>

        {/* 标题 */}
        <h2
          id="login-modal-title"
          className="text-xl font-bold text-white mb-2"
        >
          登录以继续
        </h2>

        {/* 说明文字 */}
        <p className="text-gray-400 text-sm mb-6">{message}</p>

        {/* GitHub 登录按钮 */}
        <button
          onClick={handleGitHubLogin}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white text-sm font-bold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" />
              <span>登录中...</span>
            </>
          ) : (
            <>
              <i className="fa-brands fa-github text-lg" />
              <span>Login with GitHub</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default LoginPromptModal;


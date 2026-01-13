/**
 * LoginButton
 * GitHub OAuth 登录按钮组件
 */

import React, { useState } from 'react';
import { useAuthContext } from './AuthProvider';

interface LoginButtonProps {
  className?: string;
}

/**
 * GitHub 登录按钮
 * 显示 GitHub 图标，点击后调用 signInWithGitHub
 * 支持加载状态和错误处理
 */
export function LoginButton({ className = '' }: LoginButtonProps) {
  const { signInWithGitHub } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error('GitHub 登录失败:', error);
      setIsLoading(false);
    }
    // 注意：成功时不重置 isLoading，因为页面会重定向
  };

  const baseStyles = 'inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${baseStyles} ${className}`}
    >
      {isLoading ? (
        <>
          <i className="fa-solid fa-spinner fa-spin" />
          <span>登录中...</span>
        </>
      ) : (
        <>
          <i className="fa-brands fa-github" />
          <span>Login with GitHub</span>
        </>
      )}
    </button>
  );
}

export default LoginButton;


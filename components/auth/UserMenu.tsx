/**
 * UserMenu
 * 用户头像下拉菜单组件
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuthContext } from './AuthProvider';

/**
 * 用户菜单组件
 * 显示用户头像，点击显示下拉菜单（包含登出选项）
 */
export function UserMenu() {
  const { profile, signOut } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    try {
      await signOut();
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  // 获取显示名称，优先使用 display_name，否则使用默认值
  const displayName = profile?.display_name || '用户';

  // 获取头像 URL，如果没有则使用默认占位符
  const avatarUrl = profile?.avatar_url || undefined;

  return (
    <div ref={menuRef} className="relative">
      {/* 头像按钮 */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 focus:outline-none"
        aria-label="用户菜单"
        aria-expanded={isOpen}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full border-2 border-emerald-500/50 cursor-pointer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500/50 cursor-pointer bg-emerald-500/20 flex items-center justify-center">
            <i className="fa-solid fa-user text-emerald-500 text-sm" />
          </div>
        )}
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-50 p-2">
          {/* 用户信息 */}
          <div className="px-4 py-2 border-b border-white/10 mb-2">
            <p className="text-sm text-white font-medium truncate">{displayName}</p>
          </div>

          {/* 登出按钮 */}
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-right-from-bracket" />
            <span>登出</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;


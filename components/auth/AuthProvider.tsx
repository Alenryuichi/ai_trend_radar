/**
 * AuthProvider
 * 全局认证上下文提供者
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, UseAuthReturn } from '../../hooks/useAuth';

// 创建 Context
const AuthContext = createContext<UseAuthReturn | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 认证上下文 Provider
 * 在应用根部包裹，提供全局认证状态
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 使用认证上下文的 Hook
 * @throws 如果在 AuthProvider 外部使用会抛出错误
 */
export function useAuthContext(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;


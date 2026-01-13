/**
 * useAuth Hook
 * 封装 Supabase Auth 操作，提供认证状态管理
 */

import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseService';
import { UserProfile, AuthState } from '../types';

/**
 * 获取用户 Profile
 */
async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('获取用户信息失败:', error.message);
    return null;
  }

  return data as UserProfile;
}

/**
 * 认证状态 Hook
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // 更新状态辅助函数
  const updateState = useCallback((user: User | null, session: Session | null, profile: UserProfile | null) => {
    setState({
      user,
      profile,
      session,
      isLoading: false,
      isAuthenticated: !!user,
    });
  }, []);

  // 刷新用户 Profile
  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const profile = await fetchUserProfile(state.user.id);
    if (profile) {
      setState(prev => ({ ...prev, profile }));
    }
  }, [state.user]);

  // GitHub 登录
  const signInWithGitHub = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
    if (error) {
      console.error('GitHub 登录失败:', error.message);
      throw error;
    }
  }, []);

  // Google 登录
  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
    if (error) {
      console.error('Google 登录失败:', error.message);
      throw error;
    }
  }, []);

  // 登出
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('登出失败:', error.message);
      throw error;
    }
    updateState(null, null, null);
  }, [updateState]);

  // 初始化：获取当前 Session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          updateState(session.user, session, profile);
        } else {
          updateState(null, null, null);
        }
      } catch (error) {
        console.error('初始化认证失败:', error);
        updateState(null, null, null);
      }
    };

    initAuth();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          updateState(session.user, session, profile);
        } else {
          updateState(null, null, null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [updateState]);

  return {
    ...state,
    signInWithGitHub,
    signInWithGoogle,
    signOut,
    refreshProfile,
  };
}

export type UseAuthReturn = ReturnType<typeof useAuth>;


/**
 * useFavorites Hook
 * 管理用户收藏状态，支持乐观更新
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabaseService';
import { useAuthContext } from '../components/auth';
import { Favorite } from '../types';

export interface UseFavoritesReturn {
  favorites: Set<string>; // practice_id 集合
  isLoading: boolean;
  isFavorited: (practiceId: string) => boolean;
  toggleFavorite: (practiceId: string) => Promise<void>;
  favoritesCount: number;
}

/**
 * 收藏管理 Hook
 * - 获取当前用户的所有收藏
 * - 检查某个 practice 是否已收藏
 * - 添加/取消收藏 (乐观更新)
 */
export function useFavorites(): UseFavoritesReturn {
  const { user, isAuthenticated } = useAuthContext();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // 获取用户收藏列表
  const fetchFavorites = useCallback(async () => {
    if (!user?.id) {
      setFavoriteIds(new Set());
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('practice_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('获取收藏列表失败:', error.message);
        return;
      }

      const ids = new Set(data?.map((f: { practice_id: string }) => f.practice_id) || []);
      setFavoriteIds(ids);
    } catch (error) {
      console.error('获取收藏列表异常:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // 初始化和用户变化时获取收藏
  useEffect(() => {
    setIsLoading(true);
    fetchFavorites();
  }, [fetchFavorites]);

  // 检查是否已收藏
  const isFavorited = useCallback(
    (practiceId: string): boolean => {
      return favoriteIds.has(practiceId);
    },
    [favoriteIds]
  );

  // 切换收藏状态 (乐观更新)
  const toggleFavorite = useCallback(
    async (practiceId: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('用户未登录');
      }

      const wasInFavorites = favoriteIds.has(practiceId);

      // 乐观更新 UI
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasInFavorites) {
          next.delete(practiceId);
        } else {
          next.add(practiceId);
        }
        return next;
      });

      try {
        if (wasInFavorites) {
          // 取消收藏
          const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('practice_id', practiceId);

          if (error) {
            throw error;
          }
        } else {
          // 添加收藏
          const { error } = await supabase.from('favorites').insert({
            user_id: user.id,
            practice_id: practiceId,
          });

          if (error) {
            throw error;
          }
        }
      } catch (error) {
        // 回滚状态
        console.error('收藏操作失败:', error);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (wasInFavorites) {
            next.add(practiceId);
          } else {
            next.delete(practiceId);
          }
          return next;
        });
        throw error;
      }
    },
    [user?.id, favoriteIds]
  );

  // 收藏数量
  const favoritesCount = useMemo(() => favoriteIds.size, [favoriteIds]);

  return {
    favorites: favoriteIds,
    isLoading,
    isFavorited,
    toggleFavorite,
    favoritesCount,
  };
}

export default useFavorites;


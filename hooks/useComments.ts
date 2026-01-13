/**
 * useComments Hook
 * 管理 practice 评论：获取、发表、删除
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseService';
import { useAuthContext } from '../components/auth';
import { Comment } from '../types';

export interface UseCommentsReturn {
  comments: Comment[];
  isLoading: boolean;
  addComment: (content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * 评论管理 Hook
 * @param practiceId - Practice ID
 */
export function useComments(practiceId: string): UseCommentsReturn {
  const { user } = useAuthContext();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 获取评论列表（含用户信息）
  const fetchComments = useCallback(async () => {
    if (!practiceId) {
      setComments([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, user_profiles(*)')
        .eq('practice_id', practiceId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('获取评论失败:', error.message);
        return;
      }

      setComments((data as Comment[]) || []);
    } catch (error) {
      console.error('获取评论异常:', error);
    } finally {
      setIsLoading(false);
    }
  }, [practiceId]);

  // 初始化加载
  useEffect(() => {
    setIsLoading(true);
    fetchComments();
  }, [fetchComments]);

  // 发表评论
  const addComment = useCallback(
    async (content: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('用户未登录');
      }

      if (!content.trim()) {
        throw new Error('评论内容不能为空');
      }

      if (content.length > 500) {
        throw new Error('评论内容不能超过500字');
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          practice_id: practiceId,
          content: content.trim(),
        })
        .select('*, user_profiles(*)')
        .single();

      if (error) {
        console.error('发表评论失败:', error.message);
        throw new Error('发表评论失败');
      }

      // 添加到列表末尾
      setComments((prev) => [...prev, data as Comment]);
    },
    [user?.id, practiceId]
  );

  // 删除评论
  const deleteComment = useCallback(
    async (commentId: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('用户未登录');
      }

      // 乐观更新
      const originalComments = comments;
      setComments((prev) => prev.filter((c) => c.id !== commentId));

      try {
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', commentId)
          .eq('user_id', user.id); // 确保只能删除自己的评论

        if (error) {
          throw error;
        }
      } catch (error) {
        // 回滚
        console.error('删除评论失败:', error);
        setComments(originalComments);
        throw new Error('删除评论失败');
      }
    },
    [user?.id, comments]
  );

  // 刷新评论
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchComments();
  }, [fetchComments]);

  return {
    comments,
    isLoading,
    addComment,
    deleteComment,
    refresh,
  };
}

export default useComments;


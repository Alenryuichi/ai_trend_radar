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
      // Step 1: 获取评论
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('practice_id', practiceId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('获取评论失败:', commentsError.message);
        return;
      }

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        return;
      }

      // Step 2: 获取用户信息
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) {
        console.error('获取用户信息失败:', profilesError.message);
      }

      // Step 3: 合并数据
      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, p])
      );

      const commentsWithProfiles = commentsData.map(comment => ({
        ...comment,
        user_profiles: profilesMap.get(comment.user_id) || null,
      }));

      setComments(commentsWithProfiles as Comment[]);
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

      // Step 1: 插入评论
      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          practice_id: practiceId,
          content: content.trim(),
        })
        .select('*')
        .single();

      if (commentError) {
        console.error('发表评论失败:', commentError.message);
        throw new Error('发表评论失败');
      }

      // Step 2: 获取用户信息
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Step 3: 合并数据并添加到列表
      const commentWithProfile = {
        ...commentData,
        user_profiles: profileData || null,
      };

      setComments((prev) => [...prev, commentWithProfile as Comment]);
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


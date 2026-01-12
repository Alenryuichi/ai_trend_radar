/**
 * Supabase Service Layer
 * 提供 daily_practices 表的 CRUD 操作
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DailyPractice, DailyPracticeRecord, ApiResult } from '../types';

// ============================================================
// Supabase Client 初始化
// ============================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 環境變數未配置，部分功能可能無法使用');
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// ============================================================
// 數據操作方法
// ============================================================

/**
 * 獲取指定日期的今日精選
 * @param date 日期（格式: YYYY-MM-DD）
 * @returns 精選內容或 null
 */
export async function getDailyPractice(date: string): Promise<ApiResult<DailyPracticeRecord>> {
  try {
    const { data, error } = await supabase
      .from('daily_practices')
      .select('*')
      .eq('date', date)
      .single();

    if (error) {
      // PGRST116 表示未找到記錄，不算錯誤
      if (error.code === 'PGRST116') {
        return { data: null, error: null, fromCache: false };
      }
      return { data: null, error: error.message, fromCache: false };
    }

    return { data: data as DailyPracticeRecord, error: null, fromCache: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : '網絡連接失敗';
    return { data: null, error: message, fromCache: false };
  }
}

/**
 * 保存今日精選內容
 * @param date 日期（格式: YYYY-MM-DD）
 * @param mainPractice 主推精選
 * @param altPractices 備選精選列表
 * @param aiModel 生成使用的 AI 模型
 * @returns 保存的記錄
 */
export async function saveDailyPractice(
  date: string,
  mainPractice: DailyPractice,
  altPractices: DailyPractice[],
  aiModel: string
): Promise<ApiResult<DailyPracticeRecord>> {
  try {
    const { data, error } = await supabase
      .from('daily_practices')
      .insert({
        date,
        main_practice: mainPractice,
        alt_practices: altPractices,
        ai_model: aiModel,
        generation_status: 'success'
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, fromCache: false };
    }

    return { data: data as DailyPracticeRecord, error: null, fromCache: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : '保存失敗';
    return { data: null, error: message, fromCache: false };
  }
}

/**
 * 獲取最近 N 天的歷史精選
 * @param days 天數（預設 7）
 * @returns 歷史精選列表，按日期降序
 */
export async function getPracticeHistory(days: number = 7): Promise<ApiResult<DailyPracticeRecord[]>> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_practices')
      .select('*')
      .gte('date', startDateStr)
      .order('date', { ascending: false });

    if (error) {
      return { data: null, error: error.message, fromCache: false };
    }

    return { data: (data || []) as DailyPracticeRecord[], error: null, fromCache: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : '獲取歷史失敗';
    return { data: null, error: message, fromCache: false };
  }
}

/**
 * 獲取今日精選（便捷方法）
 * @returns 今日精選內容
 */
export async function getTodayPractice(): Promise<ApiResult<DailyPracticeRecord>> {
  const today = new Date().toISOString().split('T')[0];
  return getDailyPractice(today);
}


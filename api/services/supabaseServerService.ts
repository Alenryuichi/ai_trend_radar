/**
 * Supabase Server Service - Vercel Serverless 環境
 * 使用 service_role key 進行寫入操作
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { DailyPractice } from './aiGenerationService';

// ============================================================
// Types
// ============================================================

export interface DailyPracticeRecord {
  id: string;
  date: string;
  main_practice: DailyPractice;
  alt_practices: DailyPractice[];
  ai_model: string | null;
  generation_status: 'success' | 'failed' | 'pending' | null;
  created_at: string;
}

// ============================================================
// Supabase Client 初始化 (Serverless 環境使用 process.env)
// ============================================================

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 使用 service_role key 繞過 RLS
export const supabaseServer: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// ============================================================
// 數據操作方法
// ============================================================

/**
 * 獲取指定日期的今日精選
 */
export async function getDailyPractice(date: string): Promise<DailyPracticeRecord | null> {
  const { data, error } = await supabaseServer
    .from('daily_practices')
    .select('*')
    .eq('date', date)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // 未找到記錄
    }
    console.error('getDailyPractice error:', error);
    return null;
  }

  return data as DailyPracticeRecord;
}

/**
 * 保存今日精選內容
 */
export async function saveDailyPractice(
  date: string,
  mainPractice: DailyPractice,
  altPractices: DailyPractice[],
  aiModel: string
): Promise<DailyPracticeRecord | null> {
  const { data, error } = await supabaseServer
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
    console.error('saveDailyPractice error:', error);
    throw new Error(`Failed to save: ${error.message}`);
  }

  return data as DailyPracticeRecord;
}


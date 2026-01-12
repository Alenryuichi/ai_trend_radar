/**
 * Vercel Cron API Route - 每日精選內容生成
 *
 * 執行時間: 每日 UTC 00:00 (北京時間 08:00)
 * 路徑: /api/cron/daily-practice
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateDailyContent } from '../services/aiGenerationService';
import { getDailyPractice, saveDailyPractice } from '../services/supabaseServerService';

// ============================================================
// Handler
// ============================================================

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // 僅允許 GET 請求（Vercel Cron 使用 GET）
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  // ============================================================
  // 驗證授權
  // ============================================================
  const CRON_SECRET = process.env.CRON_SECRET;
  const authHeader = request.headers.authorization;

  // Vercel Cron 會自動帶上 Authorization: Bearer <CRON_SECRET>
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    console.error('[Cron] Unauthorized request');
    return response.status(401).json({ error: 'Unauthorized' });
  }

  console.log('[Cron] Starting daily practice generation...');

  try {

    // ============================================================
    // 檢查今日是否已生成
    // ============================================================
    const today = new Date().toISOString().split('T')[0];
    console.log(`[Cron] Checking if content exists for ${today}...`);

    const existing = await getDailyPractice(today);
    if (existing) {
      console.log(`[Cron] Content already exists for ${today}, skipping generation`);
      return response.status(200).json({
        success: true,
        message: 'Content already generated for today',
        date: today,
        skipped: true
      });
    }

    // ============================================================
    // 生成新內容
    // ============================================================
    console.log('[Cron] Generating new content...');
    const content = await generateDailyContent();
    console.log(`[Cron] Content generated using model: ${content.modelUsed}`);

    // ============================================================
    // 儲存到 Supabase
    // ============================================================
    console.log('[Cron] Saving to Supabase...');
    const saved = await saveDailyPractice(
      today,
      content.mainPractice,
      content.altPractices,
      content.modelUsed
    );

    console.log(`[Cron] Successfully saved with ID: ${saved?.id}`);

    return response.status(200).json({
      success: true,
      message: 'Daily practice generated successfully',
      date: today,
      model: content.modelUsed,
      recordId: saved?.id
    });

  } catch (error) {
    console.error('[Cron] Error:', error);
    
    return response.status(500).json({
      success: false,
      error: 'Generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}


/**
 * 診斷測試端點
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const envCheck = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    CRON_SECRET: !!process.env.CRON_SECRET,
    DEEPSEEK_API_KEY: !!process.env.DEEPSEEK_API_KEY,
    ZHIPU_API_KEY: !!process.env.ZHIPU_API_KEY,
    ALIYUN_API_KEY: !!process.env.ALIYUN_API_KEY,
  };

  return response.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: envCheck
  });
}


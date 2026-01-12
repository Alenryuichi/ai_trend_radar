/**
 * ProgressDashboard - 個人效率儀表板
 * 
 * 顯示學習進度統計、連續打卡、完成歷史等
 */

import React, { useState, useEffect } from 'react';
import { getDetailedStats, getCompletionHistory, DetailedStats } from '../../services/practiceStorageService';

// ============================================================
// Stat Card Component
// ============================================================

interface StatCardProps {
  icon: string;
  iconColor: string;
  label: string;
  value: string | number;
  subLabel?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, iconColor, label, value, subLabel }) => (
  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
    <div className="flex items-center gap-3 mb-2">
      <div className={`w-8 h-8 rounded-lg ${iconColor} flex items-center justify-center`}>
        <i className={`fa-solid ${icon} text-sm text-white`}></i>
      </div>
      <span className="text-gray-400 text-xs">{label}</span>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    {subLabel && <div className="text-xs text-gray-500 mt-1">{subLabel}</div>}
  </div>
);

// ============================================================
// Progress Ring Component  
// ============================================================

interface ProgressRingProps {
  progress: number;  // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ progress, size = 120, strokeWidth = 8, label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-white">{progress}%</span>
        {label && <span className="text-xs text-gray-400">{label}</span>}
      </div>
    </div>
  );
};

// ============================================================
// Activity Chart (Simple Bar Chart)
// ============================================================

interface ActivityChartProps {
  data: Array<{ date: string; count: number }>;
}

const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <h3 className="text-sm font-medium text-gray-300 mb-4">
        <i className="fa-solid fa-chart-simple text-emerald-400 mr-2"></i>
        最近 7 天活動
      </h3>
      <div className="flex items-end justify-between gap-2 h-24">
        {data.map((item, index) => {
          const height = (item.count / maxCount) * 100;
          const dayName = new Date(item.date).toLocaleDateString('zh-TW', { weekday: 'short' });
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all duration-300"
                style={{ height: `${Math.max(height, 4)}%`, minHeight: item.count > 0 ? '8px' : '4px' }}
              ></div>
              <span className="text-[10px] text-gray-500">{dayName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// Main Component
// ============================================================

const ProgressDashboard: React.FC = () => {
  const [stats, setStats] = useState<DetailedStats | null>(null);
  const [activityData, setActivityData] = useState<Array<{ date: string; count: number }>>([]);
  
  useEffect(() => {
    setStats(getDetailedStats());
    setActivityData(getCompletionHistory(7));
  }, []);

  if (!stats) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-white/5 rounded-xl"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-white/5 rounded-xl"></div>
          <div className="h-24 bg-white/5 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // 計算週目標進度（假設每週 5 個技巧）
  const weeklyGoal = 5;
  const weeklyProgress = Math.min(Math.round((stats.thisWeek / weeklyGoal) * 100), 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <i className="fa-solid fa-chart-pie text-emerald-500 text-lg"></i>
        <h2 className="text-xl font-bold text-white">我的進度</h2>
      </div>

      {/* Weekly Progress Ring + Stats */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="flex-shrink-0">
          <ProgressRing progress={weeklyProgress} label="本週目標" />
        </div>
        <div className="flex-1 grid grid-cols-2 gap-3 w-full">
          <StatCard
            icon="fa-fire"
            iconColor="bg-orange-500"
            label="連續打卡"
            value={`${stats.streak} 天`}
            subLabel={stats.longestStreak > stats.streak ? `最長 ${stats.longestStreak} 天` : undefined}
          />
          <StatCard
            icon="fa-check-double"
            iconColor="bg-emerald-500"
            label="總完成數"
            value={stats.total}
            subLabel={`本週 ${stats.thisWeek} 個`}
          />
        </div>
      </div>

      {/* Activity Chart */}
      <ActivityChart data={activityData} />

      {/* Monthly Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon="fa-calendar-week"
          iconColor="bg-blue-500"
          label="本週"
          value={stats.thisWeek}
        />
        <StatCard
          icon="fa-calendar"
          iconColor="bg-purple-500"
          label="本月"
          value={stats.thisMonth}
        />
        <StatCard
          icon="fa-trophy"
          iconColor="bg-yellow-500"
          label="最長連續"
          value={`${stats.longestStreak} 天`}
        />
      </div>

      {/* Recent Completions */}
      {stats.recentCompletions.length > 0 && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            <i className="fa-solid fa-clock-rotate-left text-blue-400 mr-2"></i>
            最近完成
          </h3>
          <div className="space-y-2">
            {stats.recentCompletions.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-gray-300 truncate flex-1">
                  <i className="fa-solid fa-check text-emerald-400 mr-2 text-xs"></i>
                  {item.id.replace('practice-', '').replace(/-/g, ' ').slice(0, 30)}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {new Date(item.completedAt).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.total === 0 && (
        <div className="text-center py-8">
          <i className="fa-solid fa-seedling text-gray-600 text-4xl mb-3"></i>
          <p className="text-gray-500">還沒有完成任何技巧</p>
          <p className="text-gray-600 text-xs mt-1">開始實踐今日精選吧！</p>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;


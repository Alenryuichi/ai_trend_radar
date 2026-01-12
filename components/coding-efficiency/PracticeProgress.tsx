/**
 * PracticeProgress - 實踐狀態標記按鈕
 * 
 * 允許用戶標記今日精選為「已實踐」並持久化到 LocalStorage
 */

import React, { useState, useEffect } from 'react';

// ============================================================
// Types
// ============================================================

export interface PracticeProgressProps {
  practiceId: string;
  isCompleted: boolean;
  onToggle: (practiceId: string, newStatus: boolean) => void;
  size?: 'sm' | 'md';
}

// ============================================================
// Main Component
// ============================================================

const PracticeProgress: React.FC<PracticeProgressProps> = ({
  practiceId,
  isCompleted,
  onToggle,
  size = 'md'
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    const newStatus = !isCompleted;
    onToggle(practiceId, newStatus);
    
    // 顯示成功反饋
    if (newStatus) {
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
    }
    
    // 動畫結束
    setTimeout(() => setIsAnimating(false), 300);
  };

  // 尺寸配置
  const sizeStyles = size === 'sm' 
    ? 'px-3 py-1.5 text-xs gap-1.5'
    : 'px-4 py-2 text-sm gap-2';

  // 狀態樣式
  const buttonStyles = isCompleted
    ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white';

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={handleClick}
        className={`
          flex items-center ${sizeStyles} rounded-xl font-medium
          border transition-all duration-200
          ${buttonStyles}
          ${isAnimating ? 'scale-95' : 'scale-100'}
        `}
      >
        {isCompleted ? (
          <>
            <i className="fa-solid fa-circle-check"></i>
            <span>已完成</span>
          </>
        ) : (
          <>
            <i className="fa-regular fa-circle"></i>
            <span>標記為已實踐</span>
          </>
        )}
      </button>

      {/* 成功反饋提示 */}
      {showFeedback && (
        <span 
          className="absolute -right-2 -top-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full animate-bounce"
        >
          ✓ 已記錄
        </span>
      )}
    </div>
  );
};

export default PracticeProgress;


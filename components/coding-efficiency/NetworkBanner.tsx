/**
 * NetworkBanner - 網絡狀態提示條
 * 
 * 顯示離線/恢復連線狀態
 */

import React from 'react';

interface NetworkBannerProps {
  isOffline: boolean;
  wasOffline: boolean;
  isFromCache?: boolean;
}

const NetworkBanner: React.FC<NetworkBannerProps> = ({
  isOffline,
  wasOffline,
  isFromCache = false
}) => {
  // 已恢復連線提示
  if (wasOffline && !isOffline) {
    return (
      <div className="mb-4 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-center animate-pulse">
        <span className="text-green-400 text-sm font-medium">
          <i className="fa-solid fa-wifi mr-2"></i>
          已恢復連線
        </span>
      </div>
    );
  }

  // 離線模式提示
  if (isOffline) {
    return (
      <div className="mb-4 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-center">
        <span className="text-yellow-400 text-sm font-medium">
          <i className="fa-solid fa-cloud-slash mr-2"></i>
          離線模式 {isFromCache ? '- 顯示緩存內容' : '- 無法載入內容'}
        </span>
      </div>
    );
  }

  return null;
};

export default NetworkBanner;


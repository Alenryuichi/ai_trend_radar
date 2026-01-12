/**
 * NetworkBanner - 网络状态提示条
 *
 * 显示离线/恢复连线状态
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
  // 已恢复连线提示
  if (wasOffline && !isOffline) {
    return (
      <div className="mb-4 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-center animate-pulse">
        <span className="text-green-400 text-sm font-medium">
          <i className="fa-solid fa-wifi mr-2"></i>
          已恢复连线
        </span>
      </div>
    );
  }

  // 离线模式提示
  if (isOffline) {
    return (
      <div className="mb-4 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-center">
        <span className="text-yellow-400 text-sm font-medium">
          <i className="fa-solid fa-cloud-slash mr-2"></i>
          离线模式 {isFromCache ? '- 显示缓存内容' : '- 无法加载内容'}
        </span>
      </div>
    );
  }

  return null;
};

export default NetworkBanner;



import React from 'react';
import { GitHubRepo } from '../types';

interface GitHubRepoCardProps {
  repo: GitHubRepo;
}

const GitHubRepoCard: React.FC<GitHubRepoCardProps> = ({ repo }) => {
  return (
    <a 
      href={repo.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="glass-card rounded-2xl p-6 border border-white/5 hover:border-blue-500/40 hover:bg-white/[0.03] transition-all group block relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <i className="fa-brands fa-github text-5xl"></i>
      </div>
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
            <i className="fa-solid fa-code-branch text-blue-500"></i>
          </div>
          <div>
            <h4 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors truncate max-w-[150px]">
              {repo.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              {repo.language && (
                <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                  {repo.language}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {repo.stars && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/5 rounded-lg">
            <i className="fa-solid fa-star text-amber-500 text-[10px]"></i>
            <span className="text-[10px] font-mono font-bold text-gray-400">{repo.stars}</span>
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">
        {repo.description}
      </p>
      
      <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
        View Repository
        <i className="fa-solid fa-arrow-right text-[8px]"></i>
      </div>
    </a>
  );
};

export default GitHubRepoCard;

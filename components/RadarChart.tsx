
import React from 'react';
import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Text } from 'recharts';
import { RadarPoint, AICategory } from '../types';

interface RadarChartProps {
  data: RadarPoint[];
  activeCategory: string | null;
  onSelectCategory: (category: string) => void;
}

const RadarChart: React.FC<RadarChartProps> = ({ data, activeCategory, onSelectCategory }) => {
  if (!data || data.length === 0) return (
    <div className="h-64 flex flex-col items-center justify-center text-gray-600 gap-3">
      <i className="fa-solid fa-spinner fa-spin text-blue-500"></i>
      <span className="text-[10px] uppercase tracking-widest font-mono">Initializing Array...</span>
    </div>
  );

  const renderCustomTick = (props: any) => {
    const { x, y, payload } = props;
    const isSelected = activeCategory === payload.value || 
                       (activeCategory === null && false);

    return (
      <g 
        onClick={() => onSelectCategory(payload.value)} 
        className="cursor-pointer group select-none"
      >
        <defs>
          <filter id="glow-label" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Label Background Pill */}
        <rect
          x={x - 45}
          y={y - 12}
          width={90}
          height={24}
          fill={isSelected ? "rgba(59, 130, 246, 0.15)" : "rgba(255, 255, 255, 0.03)"}
          stroke={isSelected ? "#3b82f6" : "rgba(255, 255, 255, 0.1)"}
          strokeWidth={isSelected ? 1.5 : 1}
          rx={6}
          className="transition-all duration-500"
        />

        <Text
          x={x}
          y={y + 1}
          textAnchor="middle"
          verticalAnchor="middle"
          fill={isSelected ? "#60a5fa" : "#9ca3af"}
          style={{
            fontSize: '9px',
            fontWeight: isSelected ? '800' : '500',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: 'JetBrains Mono, monospace',
            filter: isSelected ? 'url(#glow-label)' : 'none'
          }}
          className="transition-colors duration-300"
        >
          {payload.value}
        </Text>
      </g>
    );
  };

  return (
    <div className="w-full h-[320px] relative group overflow-hidden rounded-xl bg-[#0a0a0a]/50 border border-white/5">
      {/* Background Radar Scanning Animation */}
      <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
        <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_10s_linear_infinite]">
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="0.5" strokeDasharray="1 4" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1="50" y1="50" x2="50" y2="2" stroke="url(#sweep-gradient)" strokeWidth="1.5" />
          <defs>
            <linearGradient id="sweep-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar cx="50%" cy="50%" outerRadius="70%" data={data}>
          <defs>
            <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.2} />
            </linearGradient>
            <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          <PolarGrid stroke="#1a1a1a" strokeWidth={1} />
          
          <PolarAngleAxis 
            dataKey="subject" 
            tick={renderCustomTick}
          />
          
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false} 
          />
          
          <Radar
            name="Technical Activity"
            dataKey="A"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#radarFill)"
            fillOpacity={0.6}
            animationBegin={0}
            animationDuration={1500}
            filter="url(#radarGlow)"
          />
        </RechartsRadar>
      </ResponsiveContainer>

      {/* Decorative corners */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-blue-500/30"></div>
      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-blue-500/30"></div>
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-blue-500/30"></div>
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-blue-500/30"></div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none">
        <span className="text-[7px] text-gray-600 font-mono uppercase tracking-[0.3em] bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm border border-white/5">
          Interaction Mode: Active
        </span>
      </div>
    </div>
  );
};

export default RadarChart;

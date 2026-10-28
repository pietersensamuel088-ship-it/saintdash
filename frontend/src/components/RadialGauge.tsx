import React from 'react';

interface RadialGaugeProps {
  label: string;
  value: number; // 0 to 100
  color?: string;
  size?: number;
  strokeWidth?: number;
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  label,
  value,
  color,
  size = 200,
  strokeWidth = 18,
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  // Determine dynamic color if not provided
  let arcColor = color;
  if (!arcColor) {
    if (clampedValue < 50) {
      arcColor = '#22c55e'; // Green
    } else if (clampedValue < 80) {
      arcColor = '#f59e0b'; // Amber / Orange
    } else {
      arcColor = '#ef4444'; // Red
    }
  }

  // Radius and arc math
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2 + 10;
  
  // Circumference of semi-circle
  const arcLength = Math.PI * radius;
  // Filled arc length
  const strokeDashoffset = arcLength * (1 - clampedValue / 100);

  return (
    <div className="flex flex-col items-start w-full">
      <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
        {label}
      </span>
      <div className="relative flex items-center justify-center w-full" style={{ height: size / 2 + 30 }}>
        <svg
          width={size}
          height={size / 2 + 25}
          viewBox={`0 0 ${size} ${size / 2 + 25}`}
          className="overflow-visible"
        >
          {/* Background Track Arc */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
            fill="none"
            stroke="#1b202e"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active Value Arc */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
            fill="none"
            stroke={arcColor}
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease',
              filter: `drop-shadow(0 0 6px ${arcColor}40)`,
            }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div
          className="absolute flex items-baseline justify-center"
          style={{ bottom: 12, left: 0, right: 0 }}
        >
          <span className="text-3xl font-bold tracking-tight text-white font-mono">
            {clampedValue.toFixed(2)}
          </span>
          <span className="text-lg font-semibold ml-0.5 text-slate-300">%</span>
        </div>
      </div>
    </div>
  );
};

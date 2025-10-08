import React from 'react';

interface LogoIconProps {
  className?: string;
  size?: number;
}

export function LogoIcon({ className = '', size = 40 }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 背景渐变 */}
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>

      {/* 圆角矩形背景 */}
      <rect width="40" height="40" rx="8" fill="url(#logo-gradient)" />

      {/* 像素风格的画笔/铅笔图标 */}
      <g transform="translate(8, 8)">
        {/* 铅笔主体 */}
        <path
          d="M3 21L6 18L18 6L21 9L9 21L3 21Z"
          fill="white"
          fillOpacity="0.9"
        />
        {/* 铅笔尖 */}
        <path
          d="M3 21L6 18L4.5 16.5L3 21Z"
          fill="white"
          fillOpacity="0.6"
        />
        {/* 铅笔顶部 */}
        <path
          d="M18 6L21 9L22.5 7.5C23.5 6.5 23.5 4.5 22.5 3.5C21.5 2.5 19.5 2.5 18.5 3.5L18 6Z"
          fill="white"
          fillOpacity="0.9"
        />
        {/* 像素装饰点 */}
        <rect x="11" y="11" width="2" height="2" fill="white" fillOpacity="0.4" />
        <rect x="14" y="8" width="2" height="2" fill="white" fillOpacity="0.4" />
      </g>
    </svg>
  );
}

// 简化版本 - 只有字母 P
export function LogoIconSimple({ className = '', size = 40 }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-gradient-simple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>

      {/* 圆角矩形背景 */}
      <rect width="40" height="40" rx="8" fill="url(#logo-gradient-simple)" />

      {/* 字母 P */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="white"
        fontSize="26"
        fontWeight="bold"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        P
      </text>
    </svg>
  );
}

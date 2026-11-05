import React from 'react';

export const AnimatedMovingBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0B0F19]">
      {/* 1. Ambient Diffuse Background Glow Orbs */}
      {/* Top-Left Orb: Purple/Indigo shade (#581c87 / opacity-20) 20s drift */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[#581c87] opacity-25 blur-[140px] animate-orb-a"
        style={{ willChange: 'transform' }}
      />

      {/* Center-Right Indigo Glow to match Cognix template */}
      <div
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#4338ca] opacity-20 blur-[150px] animate-orb-a"
        style={{ willChange: 'transform' }}
      />

      {/* Bottom-Right Ambient Orb: Deep Blue/Navy shade (#1e3a8a / opacity-20) 25s drift */}
      <div
        className="absolute -bottom-36 -right-36 w-[650px] h-[650px] rounded-full bg-[#1e3a8a] opacity-25 blur-[150px] animate-orb-b"
        style={{ willChange: 'transform' }}
      />

      {/* 2. EXACT TWO ANIMATED CURVING NEON LINES (Magenta/Pink & Cyan/Blue) FROM COGNIX TEMPLATE */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Magenta neon linear gradient fading at extremes */}
          <linearGradient id="magentaNeonGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0" />
            <stop offset="15%" stopColor="#ec4899" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#f43f5e" stopOpacity="1" />
            <stop offset="75%" stopColor="#d946ef" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
          </linearGradient>

          {/* Cyan neon linear gradient fading at extremes */}
          <linearGradient id="cyanNeonGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="15%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="45%" stopColor="#0ea5e9" stopOpacity="0.95" />
            <stop offset="75%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>

          {/* Neon Bloom Filters */}
          <filter id="neonBlurPink" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur1" />
            <feGaussianBlur stdDeviation="16" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="neonBlurCyan" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur1" />
            <feGaussianBlur stdDeviation="16" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* LINE 1: Elegant S-curve in Magenta / Hot Pink on Left-Center (behind hero title/cards) */}
        <g className="animate-curve-magenta" style={{ transformOrigin: '28% 50%' }}>
          {/* Subtle outer neon halo */}
          <path
            d="M 390 0 C 440 280 340 600 450 900"
            fill="none"
            stroke="url(#magentaNeonGlow)"
            strokeWidth="8"
            opacity="0.4"
            filter="url(#neonBlurPink)"
          />
          {/* Crisp glowing core line */}
          <path
            d="M 390 0 C 440 280 340 600 450 900"
            fill="none"
            stroke="url(#magentaNeonGlow)"
            strokeWidth="2.2"
            opacity="0.95"
          />
        </g>

        {/* LINE 2: Elegant Curving Laser in Electric Cyan on Right (framing the phone mockup) */}
        <g className="animate-curve-cyan" style={{ transformOrigin: '68% 50%' }}>
          {/* Subtle outer neon halo */}
          <path
            d="M 960 0 C 930 260 1020 580 990 900"
            fill="none"
            stroke="url(#cyanNeonGlow)"
            strokeWidth="8"
            opacity="0.4"
            filter="url(#neonBlurCyan)"
          />
          {/* Crisp glowing core line */}
          <path
            d="M 960 0 C 930 260 1020 580 990 900"
            fill="none"
            stroke="url(#cyanNeonGlow)"
            strokeWidth="2.2"
            opacity="0.95"
          />
        </g>
      </svg>

      {/* 3. Subtle Digital Grid Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
};

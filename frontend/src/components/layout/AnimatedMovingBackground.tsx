import React from 'react';

export const AnimatedMovingBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0B0F19]">
      {/* 1. Top-Left Ambient Orb: Purple/Indigo shade (#581c87 / opacity-20) 20s drift */}
      <div
        className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-[#581c87] opacity-20 blur-[130px] animate-orb-a"
        style={{ willChange: 'transform' }}
      />

      {/* 2. Bottom-Right Ambient Orb: Deep Blue/Navy shade (#1e3a8a / opacity-20) 25s drift */}
      <div
        className="absolute -bottom-36 -right-36 w-[620px] h-[620px] rounded-full bg-[#1e3a8a] opacity-20 blur-[140px] animate-orb-b"
        style={{ willChange: 'transform' }}
      />

      {/* 3. Subtle Cyber Grid Shimmer Lines */}
      <div className="absolute inset-0 flex justify-around opacity-40">
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-fuchsia-500/20 to-transparent animate-shimmer-line" style={{ animationDelay: '0s' }} />
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-shimmer-line hidden md:block" style={{ animationDelay: '3s' }} />
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent animate-shimmer-line" style={{ animationDelay: '6s' }} />
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-pink-500/20 to-transparent animate-shimmer-line hidden md:block" style={{ animationDelay: '9s' }} />
      </div>

      {/* 4. Fine Digital Noise Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};

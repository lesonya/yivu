import React from 'react';

interface DeviceMockupProps {
  children?: React.ReactNode;
  activeSubject?: string;
  gradeLabel?: string;
}

export const DeviceMockup: React.FC<DeviceMockupProps> = ({
  activeSubject = 'Mathematics Attainment',
  gradeLabel = 'Standard 5',
}) => {
  return (
    <div className="relative mx-auto w-full max-w-[320px] sm:max-w-[340px] select-none">
      {/* Outer Glow Halo */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-600/30 via-pink-600/20 to-blue-600/30 rounded-[48px] blur-xl opacity-75" />

      {/* iPhone Chassis Chassis Wrapper */}
      <div className="relative rounded-[46px] p-3 bg-gradient-to-b from-slate-700/80 via-slate-900 to-slate-950 border border-white/20 shadow-2xl backdrop-blur-xl">
        {/* Antenna bands */}
        <div className="absolute top-20 -left-[2px] w-[3px] h-3 bg-slate-600/60 rounded-r" />
        <div className="absolute top-32 -left-[2px] w-[3px] h-8 bg-slate-600/60 rounded-r" />
        <div className="absolute top-44 -left-[2px] w-[3px] h-8 bg-slate-600/60 rounded-r" />
        <div className="absolute top-28 -right-[2px] w-[3px] h-12 bg-slate-600/60 rounded-l" />

        {/* Screen Bezel */}
        <div className="relative rounded-[38px] bg-[#0A0D14] overflow-hidden border border-black/40 shadow-inner flex flex-col h-[540px]">
          {/* Dynamic Island / Speaker Notch */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30">
            <div className="w-24 h-5 bg-black rounded-full flex items-center justify-between px-2.5 shadow-md">
              <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-blue-500/80" />
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[11px] font-semibold text-slate-300 tracking-tight z-20">
            <span>09:41</span>
            <div className="flex items-center space-x-1.5 text-xs text-slate-300">
              <iconify-icon icon="solar:signal-bold" width="12"></iconify-icon>
              <iconify-icon icon="solar:wifi-bold" width="12"></iconify-icon>
              <iconify-icon icon="solar:battery-charge-bold" width="14" class="text-emerald-400"></iconify-icon>
            </div>
          </div>

          {/* Screen Content: Synapse Flow & Gradient Wave */}
          <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden relative">
            {/* Header: Synapse Flow */}
            <div className="space-y-1 z-10 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest uppercase text-pink-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping" />
                  <span>Synapse Flow</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  {gradeLabel}
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-white tracking-tight truncate">
                {activeSubject}
              </h4>
            </div>

            {/* Vibrant Multi-Stop Deep Purple to Hot Pink Velvet Gradient Wave Container */}
            <div className="my-auto relative rounded-2xl overflow-hidden p-4 border border-white/15 shadow-xl bg-gradient-to-br from-[#2e0854] via-[#700b68] to-[#db2777] animate-wave-flow">
              {/* Wave SVG mesh overlay */}
              <div className="absolute inset-0 opacity-25 mix-blend-overlay">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,30 C30,60 70,10 100,40 L100,100 L0,100 Z" fill="white" />
                  <path d="M0,60 C40,20 60,80 100,50 L100,100 L0,100 Z" fill="#ff70a6" opacity="0.5" />
                </svg>
              </div>

              {/* Cognitive Metric Cards */}
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between text-white">
                  <span className="text-[11px] font-medium text-pink-100/90">Cognitive Focus</span>
                  <span className="text-xs font-black tracking-wider text-white bg-black/30 px-2 py-0.5 rounded-md">
                    98.4%
                  </span>
                </div>

                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden p-[1px]">
                  <div className="h-full bg-gradient-to-r from-pink-300 to-white rounded-full w-[88%]" />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                  <div className="bg-black/30 backdrop-blur-sm rounded-xl p-2 border border-white/10">
                    <div className="text-[10px] text-pink-200/80">Velocity</div>
                    <div className="text-xs font-black text-white">1.8s / Q</div>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm rounded-xl p-2 border border-white/10">
                    <div className="text-[10px] text-pink-200/80">Streak Rate</div>
                    <div className="text-xs font-black text-white">12 Waves</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Interactive Quick CTA */}
            <div className="space-y-2 z-10">
              <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                    <iconify-icon icon="solar:brain-bold-duotone" width="16"></iconify-icon>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white leading-tight">Adaptive Exam Qs</div>
                    <div className="text-[9px] text-slate-400">Botswana Curriculum Sync</div>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {/* Bottom Home Indicator */}
              <div className="pt-2 flex justify-center">
                <div className="w-28 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

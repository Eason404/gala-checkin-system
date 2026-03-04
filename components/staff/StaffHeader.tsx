
import React from 'react';
import { Sparkles, BarChart3 } from 'lucide-react';

interface StaffHeaderProps {
  setMode: (mode: any) => void;
  triggerHaptic: (pattern: number) => void;
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({ setMode, triggerHaptic }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-cny-gold/20 to-orange-500/20 p-2.5 rounded-2xl border border-cny-gold/30 shadow-inner">
          <Sparkles className="text-cny-gold w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">签到台</h2>
          <p className="text-cny-gold/80 font-bold uppercase tracking-[0.2em] text-[10px] mt-0.5">Staff Check-in</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => { setMode('dashboard'); triggerHaptic(10); }}
          className="bg-white/10 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg tracking-wider hover:bg-white/20 transition-colors flex items-center gap-1"
        >
          <BarChart3 className="w-4 h-4 mr-1" /> 工作台 <span className="text-sm ml-1">Stats</span>
        </button>
        <button
          onClick={() => { setMode('walkin'); triggerHaptic(20); }}
          className="bg-cny-gold text-cny-dark px-4 py-2 rounded-xl font-bold text-xs uppercase shadow-lg tracking-wider hover:bg-white transition-colors"
        >
          现场购票 <span className="text-sm ml-1">Walk-In</span>
        </button>
      </div>
    </div>
  );
};

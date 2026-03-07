
import React from 'react';
import { Sparkles, BarChart3, MapPin } from 'lucide-react';

interface StaffHeaderProps {
  setMode: (mode: any) => void;
  triggerHaptic: (pattern: number) => void;
  onShowWalkInQr?: () => void;
  currentLane?: string;
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({ setMode, triggerHaptic, onShowWalkInQr, currentLane }) => {

  return (
    <div className="flex justify-between items-center mb-6 px-1">
      <div className="flex flex-col">
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md pl-1">
          {currentLane || 'Portal'}
        </h2>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => { setMode('dashboard'); triggerHaptic(10); }}
          className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-white/10 text-white rounded-full shadow-lg hover:bg-white/20 transition-all border border-white/5 active:scale-95"
          title="Stats Dashboard"
        >
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        {onShowWalkInQr && (
          <button
            onClick={onShowWalkInQr}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-white/10 text-white rounded-full shadow-lg hover:bg-white/20 transition-all border border-white/5 active:scale-95"
            title="Show Walk-In QR Code"
          >
            <span className="text-[10px] sm:text-xs font-black tracking-widest text-cny-gold">QR</span>
          </button>
        )}
        <button
          onClick={() => { setMode('walkin'); triggerHaptic(20); }}
          className="px-4 sm:px-5 h-10 sm:h-11 flex items-center justify-center bg-cny-gold text-cny-dark rounded-full font-black text-[10px] sm:text-xs uppercase shadow-lg shadow-cny-gold/20 hover:bg-white transition-all active:scale-95 ml-1"
        >
          Walk-In
        </button>
      </div>
    </div>
  );
};

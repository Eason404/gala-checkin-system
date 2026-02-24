
import React from 'react';
import { Sparkles } from 'lucide-react';

interface StaffHeaderProps {
  setMode: (mode: any) => void;
  triggerHaptic: (pattern: number) => void;
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({ setMode, triggerHaptic }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Sparkles className="text-cny-gold w-6 h-6" /> 签到台 Staff
      </h2>
      <button 
        onClick={() => { setMode('walkin'); triggerHaptic(20); }} 
        className="bg-cny-gold text-cny-dark px-4 py-2 rounded-xl font-bold text-xs uppercase shadow-lg tracking-wider hover:bg-white transition-colors"
      >
        现场购票 Walk-In
      </button>
    </div>
  );
};

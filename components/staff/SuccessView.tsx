
import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Reservation } from '../../types';
import { ConfettiBurst } from '../registration/ConfettiBurst';

interface SuccessViewProps {
  selectedRes: Reservation;
  resetToNext: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ selectedRes, resetToNext }) => {
  return (
    <div className="animate-in fade-in zoom-in duration-500">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border-t-8 border-green-500 relative overflow-hidden">
        <ConfettiBurst />
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 animate-bounce">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2 relative z-10 tracking-tight">签到成功!</h3>
        <p className="text-sm font-bold text-gray-400 uppercase mb-8 relative z-10 tracking-wider">Confirmed for {selectedRes.contactName}</p>

        <div className="space-y-4 mb-10 relative z-10">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">分配抽奖号 (Raffle Numbers)</span>
          <div className="flex flex-wrap justify-center gap-3">
            {selectedRes.lotteryNumbers?.map(n => (
              <span key={n} className="bg-cny-gold text-cny-red px-6 py-3 rounded-2xl font-bold text-2xl border border-cny-red/20 shadow-sm leading-none">{n}</span>
            ))}
          </div>
        </div>

        <button
          onClick={resetToNext}
          className="w-full py-6 bg-gray-900 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all relative z-10 hover:bg-black"
        >
          <span>扫描下一位 Next Guest</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

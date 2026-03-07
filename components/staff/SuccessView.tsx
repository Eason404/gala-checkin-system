
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
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-t-8 border-green-500 relative">
        <ConfettiBurst />
        <div className="p-8 text-center space-y-6">
          <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto mb-2 relative z-10 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>

          <div className="relative z-10">
            <h3 className="text-4xl font-black text-green-500 tracking-tight leading-none mb-2">Success!</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Confirmed for {selectedRes.contactName}</p>
          </div>

          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex flex-col gap-4 relative z-10 mt-4 mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Raffle Numbers</span>
            <div className="flex flex-wrap justify-center gap-3">
              {selectedRes.lotteryNumbers?.map(n => (
                <span key={n} className="bg-cny-gold text-cny-red px-6 py-4 rounded-2xl font-black text-3xl border border-cny-red/20 shadow-sm leading-none">{n}</span>
              ))}
            </div>
          </div>

          <button
            onClick={resetToNext}
            className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-gray-900/20 active:scale-[0.98] transition-all relative z-10 hover:bg-black"
          >
            <span className="text-xl font-black tracking-tight">Next Guest</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

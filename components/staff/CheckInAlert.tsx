
import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Reservation } from '../../types';

interface CheckInAlertProps {
  selectedRes: Reservation;
  resetToNext: () => void;
}

export const CheckInAlert: React.FC<CheckInAlertProps> = ({ selectedRes, resetToNext }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-t-8 border-orange-500">
        <div className="p-8 text-center space-y-6">
          <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center mx-auto mb-2 rotate-3 hover:rotate-0 transition-all">
            <AlertTriangle className="w-12 h-12 text-orange-500" />
          </div>

          <div>
            <h3 className="text-4xl font-black text-orange-500 tracking-tight leading-none mb-2">Checked In</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Duplicate Scan</p>
          </div>

          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex flex-col gap-2 relative mt-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Guest</span>
              <span className="font-black text-gray-900 text-lg tracking-tight">{selectedRes.contactName}</span>
            </div>
            <div className="w-full h-px bg-gray-200 my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Size</span>
              <span className="font-black text-gray-900 text-lg tracking-tight">{selectedRes.totalPeople} People</span>
            </div>
          </div>

          <button
            onClick={resetToNext}
            className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-gray-900/20 active:scale-[0.98] transition-all hover:bg-black mt-4"
          >
            <span className="text-xl font-black tracking-tight">OK, Next</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

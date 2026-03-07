
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
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2"><span className="text-3xl font-black text-orange-500">Checked In</span></h3>
          <p className="text-sm font-semibold text-gray-400">Duplicate Scan</p>

          <div className="my-8 bg-gray-50 rounded-2xl p-6 text-left border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Guest</span>
              <span className="font-bold text-gray-900 text-base">{selectedRes.contactName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Size</span>
              <span className="font-bold text-gray-900 text-base">{selectedRes.totalPeople} People</span>
            </div>
          </div>

          <button
            onClick={resetToNext}
            className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all hover:bg-black"
          >
            <span>OK, Next</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

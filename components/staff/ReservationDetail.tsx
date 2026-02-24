
import React from 'react';
import { Banknote } from 'lucide-react';
import { Reservation } from '../../types';

interface ReservationDetailProps {
  selectedRes: Reservation;
  setShowPayModal: (val: boolean) => void;
  setMode: (mode: any) => void;
}

export const ReservationDetail: React.FC<ReservationDetailProps> = ({ selectedRes, setShowPayModal, setMode }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-t-8 border-cny-red">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{selectedRes.contactName}</h3>
              <p className="text-sm font-bold text-gray-400 font-mono tracking-tight mt-1">{selectedRes.phoneNumber} · {selectedRes.id}</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-gray-300 uppercase mb-1 tracking-wider">应收 (Total)</div>
              <div className="text-4xl font-bold text-cny-red tracking-tighter">${selectedRes.totalAmount}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase block mb-1 tracking-widest">成人 Adults</span>
              <span className="text-2xl font-bold">{selectedRes.adultsCount}</span>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase block mb-1 tracking-widest">儿童 Kids</span>
              <span className="text-2xl font-bold">{selectedRes.childrenCount}</span>
            </div>
          </div>

          <button 
            onClick={() => setShowPayModal(true)} 
            className="w-full py-5 bg-cny-red text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all hover:bg-cny-dark"
          >
            <Banknote className="w-6 h-6" /> 收款并签到
          </button>
          
          <button onClick={() => setMode('search')} className="w-full py-3 text-gray-400 font-bold text-xs uppercase tracking-[0.2em] hover:text-gray-600">
            返回重试 Back
          </button>
        </div>
      </div>
    </div>
  );
};

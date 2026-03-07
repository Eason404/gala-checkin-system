
import React from 'react';
import { Reservation } from '../../types';

interface PaymentModalProps {
  selectedRes: Reservation;
  cashInputRef: React.RefObject<HTMLInputElement | null>;
  cashTendered: string;
  setCashTendered: (val: string) => void;
  handleFamilyCheckIn: () => void;
  setShowPayModal: (val: boolean) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  selectedRes, cashInputRef, cashTendered, setCashTendered, handleFamilyCheckIn, setShowPayModal
}) => {
  const changeDue = Number(cashTendered) - selectedRes.totalAmount;

  return (
    <div className="fixed inset-0 bg-cny-dark/90 text-gray-900 backdrop-blur-xl z-[110] flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setShowPayModal(false)}>
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
        <div className="bg-cny-red p-8 text-white text-center relative">
          <span className="text-xs font-bold uppercase tracking-widest opacity-70">Cash to Collect</span>
          <div className="text-6xl font-black mt-2 tracking-tighter leading-none">${selectedRes.totalAmount}</div>

          {selectedRes.ticketType !== 'WalkInNoFood' && (
            <div className="mt-6 inline-flex flex-col items-center bg-white/20 px-6 py-3 rounded-2xl shadow-sm border border-white/10">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Meal Cards to Give</span>
              <span className="text-4xl font-black leading-none text-cny-gold drop-shadow-sm">{selectedRes.totalPeople}</span>
            </div>
          )}
        </div>
        <div className="p-8 space-y-6">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Cash Received</label>
            <input
              ref={cashInputRef}
              type="number"
              className="w-full p-5 bg-gray-50 rounded-2xl font-black text-4xl border-2 border-transparent focus:border-cny-red outline-none text-center transition-all shadow-inner"
              value={cashTendered}
              onChange={e => setCashTendered(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={`p-6 rounded-3xl text-center border-2 transition-all ${Number(cashTendered) >= selectedRes.totalAmount ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Change</span>
            <div className={`text-6xl font-black mt-1 tracking-tighter leading-none ${Number(cashTendered) >= selectedRes.totalAmount ? 'text-green-500' : 'text-gray-300'}`}>
              ${Math.max(0, changeDue)}
            </div>
          </div>
          <button
            disabled={Number(cashTendered) < selectedRes.totalAmount}
            onClick={handleFamilyCheckIn}
            className="w-full py-5 bg-cny-red text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-cny-red/20 disabled:opacity-30 disabled:grayscale transition-all hover:bg-cny-dark active:scale-[0.98]"
          >
            <span className="text-2xl font-black tracking-tight">Confirm & Check-in</span>
          </button>
          <button onClick={() => setShowPayModal(false)} className="w-full py-5 text-gray-500 font-bold text-xs uppercase tracking-widest hover:bg-gray-100 rounded-2xl transition border-2 border-gray-100 mt-2 active:scale-95 shadow-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

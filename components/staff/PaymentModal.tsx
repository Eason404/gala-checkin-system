
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
    <div className="fixed inset-0 bg-cny-dark/90 backdrop-blur-xl z-[110] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-cny-red p-8 text-white text-center">
          <span className="text-xs font-bold uppercase tracking-widest opacity-70">应收金额 Total Due</span>
          <div className="text-6xl font-bold mt-2 tracking-tighter">${selectedRes.totalAmount}</div>
        </div>
        <div className="p-8 space-y-6">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">实收现金 Cash Received</label>
            <input
              ref={cashInputRef}
              type="number"
              className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-3xl border-2 border-transparent focus:border-cny-red outline-none text-center"
              value={cashTendered}
              onChange={e => setCashTendered(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={`p-6 rounded-2xl text-center border-2 transition-all ${Number(cashTendered) >= selectedRes.totalAmount ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">找零 Change</span>
            <div className={`text-5xl font-bold mt-1 tracking-tighter ${Number(cashTendered) >= selectedRes.totalAmount ? 'text-green-600' : 'text-gray-300'}`}>
              ${Math.max(0, changeDue)}
            </div>
          </div>
          <button
            disabled={Number(cashTendered) < selectedRes.totalAmount}
            onClick={handleFamilyCheckIn}
            className="w-full py-6 bg-cny-red text-white rounded-2xl font-bold text-xl shadow-xl disabled:opacity-30 disabled:grayscale transition-all hover:bg-cny-dark active:scale-95"
          >
            确认收款并完成签到 <span className="text-2xl ml-1 font-black">Confirm Pay & Check-in</span>
          </button>
          <button onClick={() => setShowPayModal(false)} className="w-full py-4 text-gray-500 font-bold text-sm uppercase tracking-widest hover:bg-gray-100 rounded-2xl transition border border-gray-200 mt-2 active:scale-95 shadow-sm">取消 <span className="text-base text-gray-700 ml-1 font-black">Cancel</span></button>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Banknote, Minus, Plus, Save, Loader2 } from 'lucide-react';
import { Reservation, TicketType } from '../../types';
import { updateReservation } from '../../services/dataService';
import { getCurrentUserRole } from '../../services/authService';

interface ReservationDetailProps {
  selectedRes: Reservation;
  setShowPayModal: (val: boolean) => void;
  setMode: (mode: any) => void;
  setSelectedRes: (res: Reservation) => void;
}

export const ReservationDetail: React.FC<ReservationDetailProps> = ({ selectedRes, setShowPayModal, setMode, setSelectedRes }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [adults, setAdults] = useState(selectedRes.adultsCount);
  const [children, setChildren] = useState(selectedRes.childrenCount);
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = getCurrentUserRole() === 'admin';

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const pricePerPerson = selectedRes.ticketType === TicketType.EarlyBird ? 15 : 20;
      const discountAmount = selectedRes.discountAmount || 0;
      const newTotal = Math.max(0, adults * pricePerPerson - discountAmount);
      const newTotalPeople = adults + children;

      const updates: Partial<Reservation> = {
        adultsCount: adults,
        childrenCount: children,
        totalPeople: newTotalPeople,
        totalAmount: newTotal
      };

      await updateReservation(selectedRes.id, updates, selectedRes.firebaseDocId);
      setSelectedRes({ ...selectedRes, ...updates });
      setIsEditing(false);
    } catch (e) {
      console.error("Failed to update reservation", e);
      alert("更新失败，请重试 Update Failed. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

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
              <div className="text-xs font-bold text-gray-300 uppercase mb-1 tracking-wider">应收 <span className="text-sm ml-1">Total Due</span></div>
              <div className="text-4xl font-bold text-cny-red tracking-tighter">${selectedRes.totalAmount}</div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <h4 className="text-sm font-bold text-gray-900">人数信息 Party Size</h4>
            {isAdmin && (
              !isEditing ? (
                <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-cny-red hover:text-cny-dark uppercase tracking-widest bg-cny-red/10 px-3 py-1.5 rounded-full">
                  修改 <span className="ml-1 text-sm">Edit</span>
                </button>
              ) : (
                <button onClick={handleSave} disabled={isSaving} className="text-xs font-bold text-white bg-cny-red hover:bg-cny-dark uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1">
                  {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} 保存 <span className="ml-1 text-sm">Save</span>
                </button>
              )
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col items-center justify-center relative">
              <span className="text-[10px] font-bold text-gray-400 uppercase block mb-2 tracking-widest absolute top-3 left-4">成人 Adults</span>
              {isEditing ? (
                <div className="flex items-center gap-3 mt-4">
                  <button onClick={() => setAdults(Math.max(0, adults - 1))} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"><Minus className="w-4 h-4" /></button>
                  <span className="text-2xl font-black w-8 text-center">{adults}</span>
                  <button onClick={() => setAdults(adults + 1)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"><Plus className="w-4 h-4" /></button>
                </div>
              ) : (
                <span className="text-3xl font-black mt-4">{selectedRes.adultsCount}</span>
              )}
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col items-center justify-center relative">
              <span className="text-[10px] font-bold text-gray-400 uppercase block mb-2 tracking-widest absolute top-3 left-4">儿童 Kids</span>
              {isEditing ? (
                <div className="flex items-center gap-3 mt-4">
                  <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"><Minus className="w-4 h-4" /></button>
                  <span className="text-2xl font-black w-8 text-center">{children}</span>
                  <button onClick={() => setChildren(children + 1)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"><Plus className="w-4 h-4" /></button>
                </div>
              ) : (
                <span className="text-3xl font-black mt-4">{selectedRes.childrenCount}</span>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowPayModal(true)}
            disabled={isEditing || isSaving}
            className="w-full py-5 bg-cny-red text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all hover:bg-cny-dark disabled:opacity-50 disabled:active:scale-100"
          >
            <Banknote className="w-6 h-6" /> 收款并签到 <span className="text-xl ml-1 font-black">Pay & Check-in</span>
          </button>

          <button onClick={() => setMode('search')} className="w-full py-4 text-gray-500 font-bold text-sm uppercase tracking-widest hover:bg-gray-100 rounded-2xl transition border border-gray-200 mt-4 active:scale-95 shadow-sm">
            返回 <span className="text-lg text-gray-700 ml-1 font-black">Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

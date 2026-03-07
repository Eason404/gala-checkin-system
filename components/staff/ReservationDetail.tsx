
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
      alert("Update Failed. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-t-8 border-cny-red">
        <div className="p-6 sm:p-8">

          <div className="flex flex-col gap-1 mb-8">
            <div className="flex justify-between items-start">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none max-w-[65%]">{selectedRes.contactName}</h3>
              <div className="text-right flex flex-col items-end">
                <span className="text-xs font-bold text-cny-red uppercase tracking-widest mb-1">Total due</span>
                <span className="text-4xl font-black text-cny-red tracking-tighter leading-none">${selectedRes.totalAmount}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-gray-400 font-mono text-xs sm:text-sm mt-2 font-bold tracking-tight">
              <span>{selectedRes.phoneNumber}</span>
              <span>#{selectedRes.id.split('-').pop()}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 mb-8 relative">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Party Size</h4>
              {isAdmin && (
                !isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="text-[10px] font-bold text-cny-red hover:text-cny-dark uppercase tracking-widest bg-cny-red/10 px-3 py-1.5 rounded-full active:scale-95 transition">
                    Edit
                  </button>
                ) : (
                  <button onClick={handleSave} disabled={isSaving} className="text-[10px] font-bold text-white bg-cny-red hover:bg-cny-dark uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition">
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                  </button>
                )
              )}
            </div>

            <div className="flex justify-around items-center">
              <div className="flex flex-col items-center">
                {isEditing ? (
                  <div className="flex items-center gap-4 bg-white p-2 border border-gray-200 rounded-2xl shadow-sm">
                    <button onClick={() => setAdults(Math.max(0, adults - 1))} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition"><Minus className="w-5 h-5" /></button>
                    <span className="text-3xl font-black w-8 text-center">{adults}</span>
                    <button onClick={() => setAdults(adults + 1)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition"><Plus className="w-5 h-5" /></button>
                  </div>
                ) : (
                  <span className="text-5xl font-black text-gray-900 tracking-tighter">{selectedRes.adultsCount}</span>
                )}
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Adults</span>
              </div>

              <div className="w-px h-16 bg-gray-200"></div>

              <div className="flex flex-col items-center">
                {isEditing ? (
                  <div className="flex items-center gap-4 bg-white p-2 border border-gray-200 rounded-2xl shadow-sm">
                    <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition"><Minus className="w-5 h-5" /></button>
                    <span className="text-3xl font-black w-8 text-center">{children}</span>
                    <button onClick={() => setChildren(children + 1)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition"><Plus className="w-5 h-5" /></button>
                  </div>
                ) : (
                  <span className="text-5xl font-black text-gray-900 tracking-tighter">{selectedRes.childrenCount}</span>
                )}
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Kids</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setMode('search')}
              className="w-1/3 py-5 text-gray-500 font-bold text-xs uppercase tracking-widest hover:bg-gray-100 rounded-2xl transition active:scale-95 border-2 border-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowPayModal(true)}
              disabled={isEditing || isSaving}
              className="w-2/3 py-5 bg-cny-red text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-cny-red/20 active:scale-[0.98] transition-all hover:bg-cny-dark disabled:opacity-50"
            >
              <Banknote className="w-6 h-6" /> <span className="text-xl font-black tracking-tight">Check In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

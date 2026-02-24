
import React, { useState } from 'react';
import { Reservation, CheckInStatus, Coupon } from '../../../types';
import { X, Star, Ticket, Users, Loader2, Ban, Trash2, Tag, Percent, Coffee, PlusCircle, MinusCircle, Crown } from 'lucide-react';
import { maskOperatorId } from '../../../utils/formatters';
import { updateReservation, sendDiscountEmail } from '../../../services/dataService';

interface DetailModalProps {
  selectedForAction: Reservation | null;
  setSelectedForAction: (res: Reservation | null) => void;
  showConfirmDelete: boolean;
  setShowConfirmDelete: (val: boolean) => void;
  handleCancelReservation: () => void;
  actionLoading: boolean;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  selectedForAction, setSelectedForAction, showConfirmDelete, setShowConfirmDelete, handleCancelReservation, actionLoading
}) => {
  
  const [couponLoading, setCouponLoading] = useState(false);

  const handleAddCoupon = async (type: string) => {
    if (!selectedForAction) return;
    setCouponLoading(true);

    try {
        const pricePerPerson = selectedForAction.pricePerPerson || 20;
        let couponAmount = 0;
        
        // Define coupon value
        if (type === 'SPONSOR') {
            couponAmount = 15; // Sponsor discount is fixed at $15
        } else {
            // Default is to waive 1 ticket cost (VOLUNTEER, PERFORMER, VOLUNTEER_NO_LUNCH)
            couponAmount = pricePerPerson;
        }

        // New coupon object
        const newCoupon: Coupon = {
            code: type,
            amount: couponAmount
        };

        // Current list
        const currentCoupons = selectedForAction.coupons ? [...selectedForAction.coupons] : [];
        const updatedCoupons = [...currentCoupons, newCoupon];

        // Recalculate Totals
        const totalDiscount = updatedCoupons.reduce((sum, c) => sum + c.amount, 0);
        const baseTotal = selectedForAction.adultsCount * pricePerPerson;
        const newTotal = Math.max(0, baseTotal - totalDiscount);

        const updates: Partial<Reservation> = {
            discountAmount: totalDiscount,
            coupons: updatedCoupons,
            totalAmount: newTotal,
            // Update legacy field for compatibility
            couponCode: updatedCoupons.map(c => c.code).join(',') 
        };

        await updateReservation(selectedForAction.id, updates, selectedForAction.firebaseDocId);
        
        const updatedRes = { ...selectedForAction, ...updates };
        setSelectedForAction(updatedRes);
        await sendDiscountEmail(updatedRes);

    } catch (e) {
        console.error("Failed to add coupon", e);
    } finally {
        setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async (index: number) => {
      if (!selectedForAction || !selectedForAction.coupons) return;
      setCouponLoading(true);
      try {
          const pricePerPerson = selectedForAction.pricePerPerson || 20;
          
          const updatedCoupons = [...selectedForAction.coupons];
          updatedCoupons.splice(index, 1);

          const totalDiscount = updatedCoupons.reduce((sum, c) => sum + c.amount, 0);
          const baseTotal = selectedForAction.adultsCount * pricePerPerson;
          const newTotal = Math.max(0, baseTotal - totalDiscount);

          const updates: Partial<Reservation> = {
            discountAmount: totalDiscount,
            coupons: updatedCoupons,
            totalAmount: newTotal,
            couponCode: updatedCoupons.map(c => c.code).join(',')
          };

          await updateReservation(selectedForAction.id, updates, selectedForAction.firebaseDocId);
          setSelectedForAction({ ...selectedForAction, ...updates });
      } catch (e) { console.error(e); } finally { setCouponLoading(false); }
  };

  if (!selectedForAction || showConfirmDelete) return null;

  const currentCoupons = selectedForAction.coupons || [];
  const currentTicketPrice = selectedForAction.pricePerPerson || 20;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/20 animate-in fade-in duration-300">
       <div className="glass-card max-w-md w-full rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="p-8">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">管理预约</h3>
                <button onClick={() => setSelectedForAction(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
             </div>
             <div className="bg-gray-50 p-6 rounded-3xl mb-8 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-xl font-bold text-gray-900 leading-none flex items-center gap-2">
                            {selectedForAction.contactName}
                            {selectedForAction.isPerformer && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cny-gold/20 text-cny-dark text-[10px] font-bold border border-cny-gold/40">
                                    <Star className="w-3 h-3 fill-cny-dark" /> 演职
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-400 font-medium font-mono mt-1">{selectedForAction.phoneNumber}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${selectedForAction.checkInStatus === CheckInStatus.Arrived ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                        {selectedForAction.checkInStatus === CheckInStatus.Arrived ? '已签到' : '待参加'}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                     <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                            <Ticket className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Ticket ID</span>
                        </div>
                        <p className="font-mono font-bold text-gray-900 text-sm truncate" title={selectedForAction.id}>{selectedForAction.id}</p>
                     </div>
                     <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                            <Users className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Party Size</span>
                        </div>
                        <p className="font-bold text-gray-900 text-sm">
                            {selectedForAction.adultsCount} Adt, {selectedForAction.childrenCount} Chd
                        </p>
                     </div>
                </div>
                
                {/* Coupon Section */}
                <div className="bg-white p-4 rounded-2xl border border-dashed border-gray-200 shadow-sm space-y-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <Tag className="w-3 h-3"/> 优惠券 / Coupons ({currentCoupons.length})
                    </p>
                    
                    {/* Active Coupons List */}
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {currentCoupons.map((c, idx) => (
                             <div key={idx} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-xl border border-green-100">
                                <div className="flex items-center gap-2">
                                    <Percent className="w-4 h-4 text-green-600" />
                                    <div>
                                        <p className="text-[10px] font-black text-green-700 uppercase">{c.code.replace(/_/g, ' ')}</p>
                                        <p className="text-[9px] text-green-600 font-bold">-${c.amount}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleRemoveCoupon(idx)} disabled={couponLoading} className="text-gray-400 hover:text-red-500">
                                    <MinusCircle className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {currentCoupons.length === 0 && <p className="text-xs text-gray-300 italic text-center py-2">无优惠 No coupons applied</p>}
                    </div>

                    {/* Add Buttons - Updated to 2 columns to accommodate new button */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                        <button 
                            onClick={() => handleAddCoupon('VOLUNTEER')} 
                            disabled={couponLoading}
                            className="px-2 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-100 rounded-xl text-[9px] font-bold transition-colors flex flex-col items-center gap-1"
                        >
                            <span>+ 志愿者 Vol</span>
                            <span className="text-gray-400 font-normal">(-${currentTicketPrice})</span>
                        </button>
                        <button 
                            onClick={() => handleAddCoupon('PERFORMER')} 
                            disabled={couponLoading}
                            className="px-2 py-2 bg-gray-50 hover:bg-purple-50 hover:text-purple-600 border border-gray-100 rounded-xl text-[9px] font-bold transition-colors flex flex-col items-center gap-1"
                        >
                            <span>+ 演职 Perf</span>
                            <span className="text-gray-400 font-normal">(-${currentTicketPrice})</span>
                        </button>
                         <button 
                            onClick={() => handleAddCoupon('SPONSOR')} 
                            disabled={couponLoading}
                            className="px-2 py-2 bg-gray-50 hover:bg-yellow-50 hover:text-yellow-600 border border-gray-100 rounded-xl text-[9px] font-bold transition-colors flex flex-col items-center gap-1"
                        >
                            <span className="whitespace-nowrap flex items-center gap-0.5"><Crown className="w-2.5 h-2.5" /> 赞助商 Sponsor</span>
                            <span className="text-gray-400 font-normal">(-$15)</span>
                        </button>
                        <button 
                            onClick={() => handleAddCoupon('VOLUNTEER_NO_LUNCH')} 
                            disabled={couponLoading}
                            className="px-2 py-2 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 border border-gray-100 rounded-xl text-[9px] font-bold transition-colors flex flex-col items-center gap-1"
                        >
                            <span className="whitespace-nowrap flex items-center gap-0.5"><Coffee className="w-2.5 h-2.5" /> 义工(无饭)</span>
                            <span className="text-gray-400 font-normal">(Free)</span>
                        </button>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                        <span className="text-xs font-bold text-gray-500">应付总额 Total</span>
                        <span className="text-xl font-black text-cny-red">${selectedForAction.totalAmount}</span>
                    </div>
                </div>

                {selectedForAction.isPerformer && (
                   <div className="bg-cny-red/5 border border-cny-red/10 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-cny-red uppercase tracking-widest mb-1">表演单位 Performance Unit</p>
                      <p className="text-sm font-bold text-gray-900">{selectedForAction.performanceUnit}</p>
                   </div>
                )}

                <div className="pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">经办人 OPERATOR</p>
                        <p className="text-xs font-black text-gray-900 mt-1">{maskOperatorId(selectedForAction.operatorId)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">最后修改 LAST MOD</p>
                        <p className="text-xs font-black text-cny-red mt-1">{maskOperatorId(selectedForAction.lastModifiedBy)}</p>
                    </div>
                </div>
             </div>
             <div className="space-y-3">
                <button onClick={handleCancelReservation} disabled={actionLoading || selectedForAction.checkInStatus === CheckInStatus.Cancelled} className="w-full py-4 flex items-center justify-center gap-2 bg-orange-50 text-orange-600 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-orange-100 disabled:opacity-50">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />} 取消预约
                </button>
                <button onClick={() => setShowConfirmDelete(true)} className="w-full py-4 flex items-center justify-center gap-2 bg-red-50 text-red-600 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-red-100">
                  <Trash2 className="w-4 h-4" /> 永久删除
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

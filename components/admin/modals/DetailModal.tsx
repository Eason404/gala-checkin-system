
import React, { useState, useEffect } from 'react';
import { Reservation, CheckInStatus, Coupon, TicketType, PaymentStatus, PaymentMethod } from '../../../types';
import { X, Star, Ticket, Users, Loader2, Ban, Trash2, Tag, Percent, Coffee, PlusCircle, MinusCircle, Crown, Edit3, Save, History, Clock } from 'lucide-react';
import { maskOperatorId } from '../../../utils/formatters';
import { updateReservation, sendDiscountEmail } from '../../../services/dataService';
import { getCurrentUserCode, getCurrentUserRole } from '../../../services/authService';

interface DetailModalProps {
  selectedForAction: Reservation | null;
  setSelectedForAction: (res: Reservation | null) => void;
  showConfirmDelete: boolean;
  setShowConfirmDelete: (val: boolean) => void;
  handleCancelReservation: () => void;
  actionLoading: boolean;
  fetchData?: () => Promise<void>;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  selectedForAction, setSelectedForAction, showConfirmDelete, setShowConfirmDelete, handleCancelReservation, actionLoading, fetchData
}) => {

  const role = getCurrentUserRole();
  const isAdmin = role === 'admin' || role === 'gm';
  const canDelete = role === 'admin';

  const [couponLoading, setCouponLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCouponType, setSelectedCouponType] = useState('VOLUNTEER');
  const [gmDiscountAmount, setGmDiscountAmount] = useState<number | ''>('');
  const [gmReason, setGmReason] = useState('');
  const [editForm, setEditForm] = useState<Partial<Reservation>>({});
  const [editReason, setEditReason] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (selectedForAction) {
      setEditForm({ ...selectedForAction });
      setEditReason('');
      setIsEditing(false);
    }
  }, [selectedForAction]);

  const handleAdultsChange = (newAdults: number) => {
    const currentTicketType = editForm.ticketType || selectedForAction?.ticketType || TicketType.Regular;
    const pricePerPerson = currentTicketType === TicketType.EarlyBird ? 15 : 20;
    const discountAmount = editForm.discountAmount ?? selectedForAction?.discountAmount ?? 0;
    const newTotal = Math.max(0, newAdults * pricePerPerson - discountAmount);
    setEditForm({ ...editForm, adultsCount: newAdults, totalAmount: newTotal, pricePerPerson });
  };

  const handleTicketTypeChange = (newType: TicketType) => {
    const pricePerPerson = newType === TicketType.EarlyBird ? 15 : 20;
    const adults = editForm.adultsCount ?? selectedForAction?.adultsCount ?? 0;
    const discountAmount = editForm.discountAmount ?? selectedForAction?.discountAmount ?? 0;
    const newTotal = Math.max(0, adults * pricePerPerson - discountAmount);
    setEditForm({ ...editForm, ticketType: newType, totalAmount: newTotal, pricePerPerson });
  };

  const handleSaveEdit = async () => {
    if (!selectedForAction || !editReason.trim()) return;
    setSaveLoading(true);
    try {
      const currentOperator = getCurrentUserCode();
      const newHistoryEntry = {
        timestamp: Date.now(),
        operatorId: currentOperator,
        reason: editReason.trim()
      };

      const updatedHistory = [...(selectedForAction.editHistory || []), newHistoryEntry];

      // Recalculate total people if adults or children changed
      const adults = editForm.adultsCount ?? selectedForAction.adultsCount;
      const children = editForm.childrenCount ?? selectedForAction.childrenCount;
      const totalPeople = adults + children;

      const updates: Partial<Reservation> = {
        ...editForm,
        totalPeople,
        editHistory: updatedHistory,
        lastModifiedBy: currentOperator
      };

      await updateReservation(selectedForAction.id, updates, selectedForAction.firebaseDocId);

      const updatedRes = { ...selectedForAction, ...updates } as Reservation;
      setSelectedForAction(updatedRes);
      if (fetchData) await fetchData();
      setIsEditing(false);
    } catch (e) {
      console.error("Failed to save edits", e);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddCoupon = async (type: string) => {
    if (!selectedForAction) return;
    setCouponLoading(true);

    try {
      const pricePerPerson = selectedForAction.pricePerPerson || 20;
      let couponAmount = 0;

      let couponReason: string | undefined = undefined;

      // Define coupon value
      if (type === 'SPONSOR') {
        couponAmount = 15; // Sponsor discount is fixed at $15
      } else if (type === 'CAST_CREW_PARENT') {
        couponAmount = 0; // Cast/Crew Parent discount is $0
      } else if (type === 'GM_OVERRIDE') {
        couponAmount = Number(gmDiscountAmount);
        couponReason = gmReason.trim();
        if (couponAmount <= 0 || !couponReason) {
          alert('GM discount requires a valid amount greater than 0 and a reason.');
          setCouponLoading(false);
          return;
        }
      } else {
        // Default is to waive 1 ticket cost (VOLUNTEER, PERFORMER, VOLUNTEER_NO_LUNCH)
        couponAmount = pricePerPerson;
      }

      // New coupon object
      const newCoupon: Coupon = {
        code: type,
        amount: couponAmount,
        ...(couponReason && { reason: couponReason })
      };

      // Current list
      const currentCoupons = selectedForAction.coupons ? [...selectedForAction.coupons] : [];
      const updatedCoupons = [...currentCoupons, newCoupon];

      // Recalculate Totals
      const totalDiscount = updatedCoupons.reduce((sum, c) => sum + c.amount, 0);
      const baseTotal = selectedForAction.adultsCount * pricePerPerson;
      const newTotal = Math.max(0, baseTotal - totalDiscount);

      const currentOperator = getCurrentUserCode();
      const newHistoryEntry = type === 'GM_OVERRIDE' ? {
        timestamp: Date.now(),
        operatorId: currentOperator,
        reason: `GM discount applied: discount $${couponAmount} - Reason: ${couponReason}`
      } : undefined;

      const updatedHistory = newHistoryEntry ?
        [...(selectedForAction.editHistory || []), newHistoryEntry] :
        selectedForAction.editHistory;

      const updates: Partial<Reservation> = {
        discountAmount: totalDiscount,
        coupons: updatedCoupons,
        totalAmount: newTotal,
        // Update legacy field for compatibility
        couponCode: updatedCoupons.map(c => c.code).join(','),
        ...(newHistoryEntry && { editHistory: updatedHistory, lastModifiedBy: currentOperator })
      };

      await updateReservation(selectedForAction.id, updates, selectedForAction.firebaseDocId);

      const updatedRes = { ...selectedForAction, ...updates } as Reservation;
      setSelectedForAction(updatedRes);
      if (fetchData) await fetchData();
      await sendDiscountEmail(updatedRes);

    } catch (e) {
      console.error("Failed to add coupon", e);
    } finally {
      setCouponLoading(false);
      if (type === 'GM_OVERRIDE') {
        setGmDiscountAmount('');
        setGmReason('');
        setSelectedCouponType('VOLUNTEER');
      }
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
      if (fetchData) await fetchData();
    } catch (e) { console.error(e); } finally { setCouponLoading(false); }
  };

  if (!selectedForAction || showConfirmDelete) return null;

  const currentCoupons = selectedForAction.coupons || [];
  const currentTicketPrice = selectedForAction.pricePerPerson || 20;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/20 animate-in fade-in duration-300">
      <div className="glass-card max-w-md w-full max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-4 relative">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">{isAdmin ? '管理预约' : '查看预约'}</h3>
          <div className="flex items-center gap-2">
            {isAdmin && (
              !isEditing ? (
                <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
                  <Edit3 className="w-5 h-5" />
                </button>
              ) : (
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
                  <Ban className="w-5 h-5" />
                </button>
              )
            )}
            <button onClick={() => setSelectedForAction(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-8 pt-6">
          <div className="bg-gray-50 p-6 rounded-3xl mb-8 space-y-4">
            {!isEditing ? (
              <>
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
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${selectedForAction.checkInStatus === CheckInStatus.Arrived ? 'bg-green-100 text-green-700' :
                    selectedForAction.checkInStatus === CheckInStatus.Cancelled ? 'bg-red-100 text-red-700' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                    {selectedForAction.checkInStatus === CheckInStatus.Arrived ? '已签到' :
                      selectedForAction.checkInStatus === CheckInStatus.Cancelled ? '已取消' :
                        '待参加'}
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
                    <Tag className="w-3 h-3" /> 优惠券 / Coupons ({currentCoupons.length})
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
                        {isAdmin && (
                          <button onClick={() => handleRemoveCoupon(idx)} disabled={couponLoading} className="text-gray-400 hover:text-red-500">
                            <MinusCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {currentCoupons.length === 0 && <p className="text-xs text-gray-300 italic text-center py-2">无优惠 No coupons applied</p>}
                  </div>

                  {/* Add Coupon Dropdown - Only visible to admin */}
                  {isAdmin && (
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex gap-2 items-center">
                        <select
                          value={selectedCouponType}
                          onChange={(e) => setSelectedCouponType(e.target.value)}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:border-cny-red"
                          disabled={couponLoading}
                        >
                          <option value="VOLUNTEER">志愿者 Vol (-${currentTicketPrice})</option>
                          <option value="PERFORMER">演职 Perf (-${currentTicketPrice})</option>
                          <option value="SPONSOR">赞助商 Sponsor (-$15)</option>
                          <option value="VOLUNTEER_NO_LUNCH">义工(无饭) (Free)</option>
                          <option value="CAST_CREW_PARENT">演职人员父母 Parent ($0)</option>
                          <option value="GM_OVERRIDE">GM discount (Custom adjustment)</option>
                        </select>
                        <button
                          onClick={() => handleAddCoupon(selectedCouponType)}
                          disabled={couponLoading || (selectedCouponType === 'GM_OVERRIDE' && (!gmDiscountAmount || !gmReason.trim()))}
                          className="px-4 py-2 bg-cny-red text-white hover:bg-red-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-1"
                        >
                          {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '添加 Add'}
                        </button>
                      </div>

                      {/* GM discount Conditional Inputs */}
                      {selectedCouponType === 'GM_OVERRIDE' && (
                        <div className="bg-red-50 p-3 rounded-xl border border-red-100 space-y-3 animate-in fade-in zoom-in-95">
                          <div>
                            <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Discount Amount ($)</label>
                            <input
                              type="number"
                              min="0"
                              placeholder="e.g. 50"
                              value={gmDiscountAmount}
                              onChange={(e) => setGmDiscountAmount(e.target.value === '' ? '' : Number(e.target.value))}
                              className="w-full bg-white border border-red-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Reason (Required)</label>
                            <input
                              type="text"
                              placeholder="Why is this discount applied?"
                              value={gmReason}
                              onChange={(e) => setGmReason(e.target.value)}
                              className="w-full bg-white border border-red-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-red-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

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

                {selectedForAction.lotteryNumbers && selectedForAction.lotteryNumbers.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl mt-4">
                    <p className="text-[10px] font-black text-yellow-700 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Star className="w-3 h-3" /> 抽奖号码 Raffle Numbers
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedForAction.lotteryNumbers.map((num, idx) => (
                        <span key={idx} className="bg-white px-3 py-1 rounded-lg border border-yellow-200 text-yellow-800 font-mono font-bold text-sm shadow-sm">
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">姓名 Name</label>
                    <input type="text" value={editForm.contactName || ''} onChange={e => setEditForm({ ...editForm, contactName: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-cny-red" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">电话 Phone</label>
                    <input type="text" value={editForm.phoneNumber || ''} onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-cny-red" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">邮箱 Email</label>
                  <input type="email" value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-cny-red" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">成人 Adults</label>
                    <input type="number" min="0" value={editForm.adultsCount || 0} onChange={e => handleAdultsChange(parseInt(e.target.value) || 0)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-cny-red" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">儿童 Children</label>
                    <input type="number" min="0" value={editForm.childrenCount || 0} onChange={e => setEditForm({ ...editForm, childrenCount: parseInt(e.target.value) || 0 })} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-cny-red" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">票种 Ticket Type</label>
                    <select value={editForm.ticketType || ''} onChange={e => handleTicketTypeChange(e.target.value as TicketType)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-cny-red">
                      <option value={TicketType.EarlyBird}>EarlyBird</option>
                      <option value={TicketType.Regular}>Regular</option>
                      <option value={TicketType.WalkIn}>WalkIn</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">签到状态 Check-In</label>
                    <select value={editForm.checkInStatus || ''} onChange={e => setEditForm({ ...editForm, checkInStatus: e.target.value as CheckInStatus })} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-cny-red">
                      <option value={CheckInStatus.NotArrived}>待参加 (NotArrived)</option>
                      <option value={CheckInStatus.Arrived}>已签到 (Arrived)</option>
                      <option value={CheckInStatus.Cancelled}>已取消 (Cancelled)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">支付状态 Payment</label>
                    <select value={editForm.paymentStatus || ''} onChange={e => setEditForm({ ...editForm, paymentStatus: e.target.value as PaymentStatus })} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-cny-red">
                      <option value={PaymentStatus.Unpaid}>未支付 (Unpaid)</option>
                      <option value={PaymentStatus.Paid}>已支付 (Paid)</option>
                      <option value={PaymentStatus.PartialPaid}>部分支付 (PartialPaid)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">支付方式 Method</label>
                    <select value={editForm.paymentMethod || ''} onChange={e => setEditForm({ ...editForm, paymentMethod: e.target.value as PaymentMethod })} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-cny-red">
                      <option value={PaymentMethod.None}>无 (None)</option>
                      <option value={PaymentMethod.Cash}>现金 (Cash)</option>
                      <option value={PaymentMethod.Check}>支票 (Check)</option>
                      <option value={PaymentMethod.Other}>其他 (Other)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">应付总额 Total Amount</label>
                    <input type="number" min="0" value={editForm.totalAmount || 0} onChange={e => setEditForm({ ...editForm, totalAmount: parseFloat(e.target.value) || 0 })} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-cny-red" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">实付金额 Paid Amount</label>
                    <input type="number" min="0" value={editForm.paidAmount || 0} onChange={e => setEditForm({ ...editForm, paidAmount: parseFloat(e.target.value) || 0 })} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-cny-red" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="isPerformer" checked={editForm.isPerformer || false} onChange={e => setEditForm({ ...editForm, isPerformer: e.target.checked })} className="w-4 h-4 text-cny-red rounded border-gray-300 focus:ring-cny-red" />
                  <label htmlFor="isPerformer" className="text-sm font-bold text-gray-900">演职人员 Performer</label>
                </div>
                {editForm.isPerformer && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">表演单位 Performance Unit</label>
                    <input type="text" value={editForm.performanceUnit || ''} onChange={e => setEditForm({ ...editForm, performanceUnit: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-cny-red" />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">备注 Notes</label>
                  <textarea value={editForm.notes || ''} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-cny-red min-h-[60px]" />
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">修改原因 Edit Reason (Required)</label>
                  <textarea value={editReason} onChange={e => setEditReason(e.target.value)} placeholder="Please provide a reason for this modification..." className="w-full bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-red-500 min-h-[60px]" />
                </div>
              </div>
            )}
          </div>

          {/* Edit History Section */}
          {!isEditing && selectedForAction.editHistory && selectedForAction.editHistory.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-3xl mb-8 space-y-4">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4"><History className="w-4 h-4" /> 修改记录 Edit History</h4>
              <div className="space-y-3">
                {selectedForAction.editHistory.map((entry, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{maskOperatorId(entry.operatorId)}</span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-900">{entry.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {isEditing ? (
              <button onClick={handleSaveEdit} disabled={saveLoading || !editReason.trim()} className="w-full py-4 flex items-center justify-center gap-2 bg-cny-red text-white rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-red-700 disabled:opacity-50">
                {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存修改 Save Changes
              </button>
            ) : isAdmin ? (
              <>
                <button onClick={handleCancelReservation} disabled={actionLoading || selectedForAction.checkInStatus === CheckInStatus.Cancelled} className="w-full py-4 flex items-center justify-center gap-2 bg-orange-50 text-orange-600 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-orange-100 disabled:opacity-50">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />} 取消预约
                </button>
                {canDelete && (
                  <button onClick={() => setShowConfirmDelete(true)} className="w-full py-4 flex items-center justify-center gap-2 bg-red-50 text-red-600 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-red-100">
                    <Trash2 className="w-4 h-4" /> 永久删除
                  </button>
                )}
              </>
            ) : (
              <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest py-4">
                只读模式 Read-Only View
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

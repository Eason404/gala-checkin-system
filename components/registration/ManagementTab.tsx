

import React from 'react';
import { CheckInStatus, Reservation } from '../../types';
import { Loader2, Star, Ban } from 'lucide-react';

interface ManagementTabProps {
  manageName: string;
  setManageName: (val: string) => void;
  managePhone: string;
  setManagePhone: (val: string) => void;
  loading: boolean;
  handleLookup: (e: React.FormEvent) => void;
  myRes: Reservation | null;
  lookupError: string;
  onCancel: () => void;
}

export const ManagementTab: React.FC<ManagementTabProps> = ({
  manageName, setManageName, managePhone, setManagePhone, loading, handleLookup, myRes, lookupError, onCancel
}) => {
  const getStatusBadge = (status: CheckInStatus) => {
    if (status === CheckInStatus.Cancelled) {
      return { label: '已取消 Cancelled', class: 'bg-red-100 text-red-600' };
    }
    if (status === CheckInStatus.Arrived) {
      return { label: '已签到 Checked-In', class: 'bg-green-100 text-green-700' };
    }
    return { label: '待参加 Registered', class: 'bg-cny-gold/20 text-cny-red shadow-inner' };
  };

  const badge = myRes ? getStatusBadge(myRes.checkInStatus) : null;

  return (
    <div className="glass-card rounded-[3rem] shadow-2xl p-8 sm:p-12 border border-white/30 animate-in fade-in slide-in-from-bottom-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-10 tracking-tight text-center">查询我的预约</h3>
      <form onSubmit={handleLookup} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">预约姓名 <span className="text-cny-red">*</span></label>
          <input required className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none font-bold" placeholder="例如: Zhang San" value={manageName} onChange={e => setManageName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">手机号码 <span className="text-cny-red">*</span></label>
          <input type="tel" required className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl font-bold" placeholder="508-xxx-xxxx" value={managePhone} onChange={e => setManagePhone(e.target.value)} />
        </div>
        <button disabled={loading} className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:bg-black transition shadow-xl active:scale-95">
          {loading ? <Loader2 className="animate-spin" /> : "搜索记录 Search"}
        </button>
      </form>

      {myRes && badge && (
        <div className="mt-10 p-8 bg-white/50 rounded-[2.5rem] border-2 border-cny-gold/20 shadow-xl space-y-6 animate-in zoom-in duration-500">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-gray-900 text-2xl">{myRes.contactName}</h4>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {myRes.id}</p>
              {myRes.isPerformer && (
                <div className="flex items-center gap-2 mt-2 text-cny-red">
                  <Star className="w-3 h-3 fill-cny-red" />
                  <span className="text-xs font-bold uppercase tracking-widest">Performer: {myRes.performanceUnit}</span>
                </div>
              )}
            </div>
            <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${badge.class}`}>
              {badge.label}
            </div>
          </div>

          {/* Cancel Button */}
          {myRes.checkInStatus !== CheckInStatus.Arrived && myRes.checkInStatus !== CheckInStatus.Cancelled && (
            <div className="pt-6 border-t border-gray-200/50">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="w-full py-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-100 transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                取消预约 Cancel Reservation
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-3 font-medium">注意：取消后如需参加需重新排队报名</p>
            </div>
          )}
        </div>
      )}
      {lookupError && <p className="mt-6 text-center text-red-500 font-bold text-sm bg-red-50 p-4 rounded-2xl border border-red-100">{lookupError}</p>}
    </div>
  );
};

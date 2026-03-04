
import React from 'react';
import { Reservation, CheckInStatus, PaymentStatus } from '../../types';
import { Search, Filter, Star, Mic2, MoreVertical, ChevronLeft, ChevronRight, Tag, Crown, Users } from 'lucide-react';

interface ReservationListProps {
  reservations: Reservation[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterPerformer: string;
  setFilterPerformer: (val: string) => void;
  filterCoupon: string;
  setFilterCoupon: (val: string) => void;
  paginatedData: Reservation[];
  toggleSort: (key: 'contactName' | 'totalAmount' | 'createdTime') => void;
  setSelectedForAction: (res: Reservation) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

const ROW_HEIGHT = 88;

export const ReservationList: React.FC<ReservationListProps> = ({
  reservations, searchTerm, setSearchTerm, filterStatus, setFilterStatus,
  filterPerformer, setFilterPerformer, filterCoupon, setFilterCoupon,
  paginatedData, toggleSort, setSelectedForAction,
  currentPage, setCurrentPage, totalPages
}) => {
  const adultCounts = React.useMemo(() => {
    let performers = 0;
    let volunteers = 0;
    let guests = 0;
    let sponsors = 0;
    let total = 0;

    reservations.forEach(r => {
      if (r.checkInStatus === CheckInStatus.Cancelled) return;

      const isSponsor = (r.coupons && r.coupons.some(c => c.code === 'SPONSOR')) || (typeof r.couponCode === 'string' && r.couponCode.includes('SPONSOR'));
      const isVolunteer = (r.coupons && r.coupons.some(c => (c.code || '').includes('VOLUNTEER'))) || (typeof r.couponCode === 'string' && r.couponCode.includes('VOLUNTEER'));

      total += r.adultsCount;
      if (r.isPerformer) {
        performers += r.adultsCount;
      } else if (isVolunteer) {
        volunteers += r.adultsCount;
      } else if (isSponsor) {
        sponsors += r.adultsCount;
      } else {
        guests += r.adultsCount;
      }
    });

    return { total, performers, volunteers, guests, sponsors };
  }, [reservations]);

  return (
    <div className="glass-dark p-6 sm:p-10 rounded-[2.5rem] shadow-xl border border-white/10 backdrop-blur-2xl space-y-8">
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
          <input className="w-full pl-14 pr-6 py-5 bg-white/5 rounded-2xl text-sm font-medium text-white border border-white/10 outline-none focus:border-cny-gold focus:bg-white/10 transition-all placeholder:text-white/40 shadow-inner" placeholder="搜索 ID、姓名或电话..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-white/5 px-5 py-3 rounded-2xl border border-white/10 text-white shadow-inner">
            <Filter className="w-4 h-4 text-white/40" />
            <select className="bg-transparent text-xs font-bold outline-none cursor-pointer text-white [&>option]:text-gray-900" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">所有状态 (All)</option>
              <option value={CheckInStatus.NotArrived}>未签到</option>
              <option value={CheckInStatus.Arrived}>已签到</option>
              <option value={CheckInStatus.Cancelled}>已取消</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-5 py-3 rounded-2xl border border-white/10 text-white shadow-inner">
            <Star className="w-4 h-4 text-white/40" />
            <select className="bg-transparent text-xs font-bold outline-none cursor-pointer text-white [&>option]:text-gray-900" value={filterPerformer} onChange={e => setFilterPerformer(e.target.value)}>
              <option value="all">所有人员 (All)</option>
              <option value="yes">仅演职人员 (Performers)</option>
              <option value="no">仅观众 (Guests)</option>
              <option value="sponsor">仅赞助商 (Sponsors)</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-5 py-3 rounded-2xl border border-white/10 text-white shadow-inner">
            <Tag className="w-4 h-4 text-white/40" />
            <select className="bg-transparent text-xs font-bold outline-none cursor-pointer text-white [&>option]:text-gray-900" value={filterCoupon} onChange={e => setFilterCoupon(e.target.value)}>
              <option value="all">所有优惠 (All Coupons)</option>
              <option value="any">有优惠 (Any Coupon)</option>
              <option value="none">无优惠 (No Coupon)</option>
              <option value="SPONSOR">赞助商 (Sponsor)</option>
              <option value="VOLUNTEER">志愿者 (Volunteer)</option>
              <option value="PERFORMER">演职人员 (Performer)</option>
              <option value="CAST_CREW_PARENT">演职人员父母 (Parent)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-white/60 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-inner">
        <span className="text-white uppercase tracking-widest drop-shadow-md">成人人数统计 (Adults):</span>
        <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">总计: {adultCounts.total}</span>
        <span className="bg-purple-900/30 px-3 py-1.5 rounded-lg border border-purple-500/30 text-purple-300">演职人员: {adultCounts.performers}</span>
        <span className="bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-500/30 text-blue-300">志愿者: {adultCounts.volunteers}</span>
        <span className="bg-yellow-900/30 px-3 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-300">赞助商: {adultCounts.sponsors}</span>
        <span className="bg-green-900/30 px-3 py-1.5 rounded-lg border border-green-500/30 text-green-300">观众: {adultCounts.guests}</span>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 shadow-inner">
        <div className="bg-white/5 text-[10px] font-black uppercase text-white/40 tracking-[0.2em] flex items-center px-8 py-5 border-b border-white/10">
          <div className="w-[30%] cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('contactName')}>预约信息</div>
          <div className="w-[20%] px-5">身份/单位</div>
          <div className="w-[15%] px-5 text-right">金额</div>
          <div className="w-[25%] text-center">状态</div>
          <div className="w-[10%]"></div>
        </div>

        <div className="divide-y divide-white/5">
          {paginatedData.length > 0 ? (
            paginatedData.map(res => (
              <div key={res.id} className={`flex items-center px-8 hover:bg-white/5 transition-colors`} style={{ minHeight: `${ROW_HEIGHT}px` }}>
                <div className="w-[30%]">
                  <div className="font-black text-base truncate text-white flex items-center gap-2 drop-shadow-md">
                    {res.contactName}
                    {res.isPerformer && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cny-gold/20 text-cny-gold text-[10px] font-bold border border-cny-gold/40">
                        <Star className="w-3 h-3 fill-cny-gold" /> 演职
                      </span>
                    )}
                    {((typeof res.couponCode === 'string' && res.couponCode.includes('SPONSOR')) || (res.coupons && res.coupons.some(c => c.code === 'SPONSOR'))) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-900/40 text-yellow-300 text-[10px] font-bold border border-yellow-500/40">
                        <Crown className="w-3 h-3" /> 赞助商
                      </span>
                    )}
                    {((typeof res.couponCode === 'string' && res.couponCode.includes('CAST_CREW_PARENT')) || (res.coupons && res.coupons.some(c => c.code === 'CAST_CREW_PARENT'))) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-900/40 text-pink-300 text-[10px] font-bold border border-pink-500/40">
                        <Users className="w-3 h-3" /> 演职父母
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/40 font-bold font-mono mt-1">{res.phoneNumber} · {res.id}</div>
                </div>
                <div className="w-[20%] px-5 flex flex-col justify-center">
                  {res.isPerformer ? (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-cny-gold font-bold text-xs mb-0.5 drop-shadow-md">
                        <Mic2 className="w-3 h-3" />
                        <span>{res.performanceUnit || '演职人员'}</span>
                      </div>
                      <span className="text-[10px] text-white/40 font-medium">Performer Unit</span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white/60">观众 Guest</span>
                      <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">{res.ticketType}</span>
                    </div>
                  )}
                </div>
                <div className="w-[15%] px-5 text-right font-black text-white text-base flex flex-col items-end justify-center drop-shadow-md">
                  <span>${res.totalAmount}</span>
                  {res.couponCode && (
                    <span className="text-[10px] text-green-300 bg-green-900/40 px-1.5 rounded flex items-center gap-0.5 border border-green-500/30 mt-1" title={res.couponCode}>
                      <Tag className="w-3 h-3" /> Off
                    </span>
                  )}
                </div>
                <div className="w-[25%]">
                  <div className="flex items-center justify-center gap-2">
                    <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${res.paymentStatus === PaymentStatus.Paid ? 'bg-green-900/40 text-green-300 border-green-500/30' : 'bg-red-900/40 text-red-300 border-red-500/30'}`}>
                      {res.paymentStatus === PaymentStatus.Paid ? '已付' : '未付'}
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${res.checkInStatus === CheckInStatus.Arrived ? 'bg-blue-900/40 text-blue-300 border-blue-500/30' :
                        res.checkInStatus === CheckInStatus.Cancelled ? 'bg-red-900/40 text-red-300 border-red-500/30' :
                          'bg-white/10 text-white/60 border-white/10'
                      }`}>
                      {res.checkInStatus === CheckInStatus.Arrived ? '到场' :
                        res.checkInStatus === CheckInStatus.Cancelled ? '已取消' :
                          '待到场'}
                    </div>
                  </div>
                </div>
                <div className="w-[10%] text-right">
                  <button onClick={() => setSelectedForAction(res)} className="p-4 text-white/40 hover:text-cny-gold transition-all"><MoreVertical className="w-5 h-5" /></button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-white/40 font-bold uppercase tracking-widest text-xs">无匹配记录 No records</div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-3 bg-white/5 text-white rounded-xl hover:bg-white/10 disabled:opacity-30 border border-white/10 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-3 bg-white/5 text-white rounded-xl hover:bg-white/10 disabled:opacity-30 border border-white/10 transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

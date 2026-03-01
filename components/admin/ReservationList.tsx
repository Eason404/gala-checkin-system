
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
    <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-lg border border-gray-100 space-y-8">
      <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative flex-grow w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-2xl text-sm font-medium border border-gray-100 outline-none focus:ring-2 focus:ring-cny-red/10 focus:bg-white transition-all" placeholder="搜索 ID、姓名或电话..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-2 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select className="bg-transparent text-xs font-bold outline-none cursor-pointer" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                      <option value="all">所有状态 (All)</option>
                      <option value={CheckInStatus.NotArrived}>未签到</option>
                      <option value={CheckInStatus.Arrived}>已签到</option>
                      <option value={CheckInStatus.Cancelled}>已取消</option>
                  </select>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100">
                  <Star className="w-4 h-4 text-gray-400" />
                  <select className="bg-transparent text-xs font-bold outline-none cursor-pointer" value={filterPerformer} onChange={e => setFilterPerformer(e.target.value)}>
                      <option value="all">所有人员 (All)</option>
                      <option value="yes">仅演职人员 (Performers)</option>
                      <option value="no">仅观众 (Guests)</option>
                      <option value="sponsor">仅赞助商 (Sponsors)</option>
                  </select>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <select className="bg-transparent text-xs font-bold outline-none cursor-pointer" value={filterCoupon} onChange={e => setFilterCoupon(e.target.value)}>
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

      <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500 bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <span className="text-gray-900 uppercase tracking-widest">成人人数统计 (Adults):</span>
          <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">总计: {adultCounts.total}</span>
          <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm text-purple-600">演职人员: {adultCounts.performers}</span>
          <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm text-blue-600">志愿者: {adultCounts.volunteers}</span>
          <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm text-yellow-600">赞助商: {adultCounts.sponsors}</span>
          <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm text-green-600">观众: {adultCounts.guests}</span>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-gray-100">
          <div className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] flex items-center px-8 py-5">
              <div className="w-[30%] cursor-pointer hover:text-gray-900 transition-colors" onClick={() => toggleSort('contactName')}>预约信息</div>
              <div className="w-[20%] px-5">身份/单位</div>
              <div className="w-[15%] px-5 text-right">金额</div>
              <div className="w-[25%] text-center">状态</div>
              <div className="w-[10%]"></div>
          </div>

          <div className="bg-white divide-y divide-gray-50">
              {paginatedData.length > 0 ? (
                paginatedData.map(res => (
                    <div key={res.id} className={`flex items-center px-8 hover:bg-gray-50 transition-colors`} style={{ minHeight: `${ROW_HEIGHT}px` }}>
                        <div className="w-[30%]">
                            <div className="font-black text-base truncate text-gray-900 flex items-center gap-2">
                                {res.contactName}
                                {res.isPerformer && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cny-gold/20 text-cny-dark text-[10px] font-bold border border-cny-gold/40">
                                     <Star className="w-3 h-3 fill-cny-dark" /> 演职
                                  </span>
                                )}
                                {((typeof res.couponCode === 'string' && res.couponCode.includes('SPONSOR')) || (res.coupons && res.coupons.some(c => c.code === 'SPONSOR'))) && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold border border-yellow-200">
                                     <Crown className="w-3 h-3" /> 赞助商
                                  </span>
                                )}
                                {((typeof res.couponCode === 'string' && res.couponCode.includes('CAST_CREW_PARENT')) || (res.coupons && res.coupons.some(c => c.code === 'CAST_CREW_PARENT'))) && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold border border-pink-200">
                                     <Users className="w-3 h-3" /> 演职父母
                                  </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-400 font-bold font-mono mt-1">{res.phoneNumber} · {res.id}</div>
                        </div>
                        <div className="w-[20%] px-5 flex flex-col justify-center">
                            {res.isPerformer ? (
                              <div className="flex flex-col">
                                 <div className="flex items-center gap-1 text-cny-dark font-bold text-xs mb-0.5">
                                    <Mic2 className="w-3 h-3" />
                                    <span>{res.performanceUnit || '演职人员'}</span>
                                 </div>
                                 <span className="text-[10px] text-gray-400 font-medium">Performer Unit</span>
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                 <span className="text-xs font-bold text-gray-500">观众 Guest</span>
                                 <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">{res.ticketType}</span>
                              </div>
                            )}
                        </div>
                        <div className="w-[15%] px-5 text-right font-black text-gray-900 text-base flex flex-col items-end justify-center">
                            <span>${res.totalAmount}</span>
                            {res.couponCode && (
                                <span className="text-[10px] text-green-600 bg-green-50 px-1.5 rounded flex items-center gap-0.5" title={res.couponCode}>
                                    <Tag className="w-3 h-3" /> Off
                                </span>
                            )}
                        </div>
                        <div className="w-[25%]">
                            <div className="flex items-center justify-center gap-2">
                                <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${res.paymentStatus === PaymentStatus.Paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                    {res.paymentStatus === PaymentStatus.Paid ? '已付' : '未付'}
                                </div>
                                <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    res.checkInStatus === CheckInStatus.Arrived ? 'bg-blue-100 text-blue-700' : 
                                    res.checkInStatus === CheckInStatus.Cancelled ? 'bg-red-100 text-red-700' : 
                                    'bg-gray-100 text-gray-400'
                                }`}>
                                    {res.checkInStatus === CheckInStatus.Arrived ? '到场' : 
                                     res.checkInStatus === CheckInStatus.Cancelled ? '已取消' : 
                                     '待到场'}
                                </div>
                            </div>
                        </div>
                        <div className="w-[10%] text-right">
                            <button onClick={() => setSelectedForAction(res)} className="p-4 text-gray-300 hover:text-cny-red transition-all"><MoreVertical className="w-5 h-5" /></button>
                        </div>
                    </div>
                ))
              ) : (
                <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">无匹配记录 No records</div>
              )}
          </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

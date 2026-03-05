
import React from 'react';
import { Reservation, CheckInStatus, PaymentStatus } from '../../types';
import { Search, Filter, Star, Mic2, MoreVertical, ChevronLeft, ChevronRight, Tag, Crown, Users } from 'lucide-react';
import { getCurrentUserRole } from '../../services/authService';

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
  const role = getCurrentUserRole();
  const isObserver = role === 'observer';

  const maskPhone = (phone?: string) => {
    if (!phone) return 'N/A';
    if (phone.length <= 4) return phone;
    return '****' + phone.slice(-4);
  };

  const maskId = (id?: string) => {
    if (!id) return 'N/A';
    if (id.length <= 3) return id;
    return '***' + id.slice(-3);
  };

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
    <div className="glass-dark p-4 sm:p-6 rounded-2xl shadow-lg border border-white/10 backdrop-blur-2xl space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
          <input className="w-full pl-11 pr-4 py-3 bg-white/5 rounded-xl text-sm font-medium text-white border border-white/10 outline-none focus:border-cny-gold focus:bg-white/10 transition-all placeholder:text-white/40" placeholder="Search ID, name, phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-2 rounded-xl border border-white/10 text-white">
            <Filter className="w-3.5 h-3.5 text-white/40" />
            <select className="bg-transparent text-xs font-bold outline-none cursor-pointer text-white [&>option]:text-gray-900" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value={CheckInStatus.NotArrived}>Pending</option>
              <option value={CheckInStatus.Arrived}>Arrived</option>
              <option value={CheckInStatus.Cancelled}>Cancelled</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-2 rounded-xl border border-white/10 text-white">
            <Star className="w-3.5 h-3.5 text-white/40" />
            <select className="bg-transparent text-xs font-bold outline-none cursor-pointer text-white [&>option]:text-gray-900" value={filterPerformer} onChange={e => setFilterPerformer(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="yes">Performers</option>
              <option value="no">Guests</option>
              <option value="sponsor">Sponsors</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-2 rounded-xl border border-white/10 text-white">
            <Tag className="w-3.5 h-3.5 text-white/40" />
            <select className="bg-transparent text-xs font-bold outline-none cursor-pointer text-white [&>option]:text-gray-900" value={filterCoupon} onChange={e => setFilterCoupon(e.target.value)}>
              <option value="all">All Coupons</option>
              <option value="any">Has Coupon</option>
              <option value="none">No Coupon</option>
              <option value="SPONSOR">Sponsor</option>
              <option value="VOLUNTEER">Volunteer</option>
              <option value="PERFORMER">Performer</option>
              <option value="CAST_CREW_PARENT">Parent</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-white/50 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
        <span className="text-white/70">Adults:</span>
        <span className="bg-white/10 px-2 py-0.5 rounded">Total {adultCounts.total}</span>
        <span className="bg-purple-900/30 px-2 py-0.5 rounded text-purple-300">Perf {adultCounts.performers}</span>
        <span className="bg-blue-900/30 px-2 py-0.5 rounded text-blue-300">Vol {adultCounts.volunteers}</span>
        <span className="bg-yellow-900/30 px-2 py-0.5 rounded text-yellow-300">Spon {adultCounts.sponsors}</span>
        <span className="bg-green-900/30 px-2 py-0.5 rounded text-green-300">Guest {adultCounts.guests}</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <div className="bg-white/5 text-[9px] font-bold uppercase text-white/40 tracking-wider flex items-center px-4 py-3 border-b border-white/10">
          <div className="w-[30%] cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('contactName')}>Info</div>
          <div className="w-[20%] px-3">Role</div>
          <div className="w-[15%] px-3 text-right">Amount</div>
          <div className="w-[25%] text-center">Status</div>
          <div className="w-[10%]"></div>
        </div>

        <div className="divide-y divide-white/5">
          {paginatedData.length > 0 ? (
            paginatedData.map(res => (
              <div key={res.id} className={`flex items-center px-4 hover:bg-white/5 transition-colors`} style={{ minHeight: `${ROW_HEIGHT}px` }}>
                <div className="w-[30%]">
                  <div className="font-black text-base truncate text-white flex items-center gap-2 drop-shadow-md">
                    {res.contactName}
                    {res.isPerformer && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cny-gold/20 text-cny-gold text-[9px] font-bold border border-cny-gold/40">
                        <Star className="w-2.5 h-2.5 fill-cny-gold" /> Perf
                      </span>
                    )}
                    {((typeof res.couponCode === 'string' && res.couponCode.includes('SPONSOR')) || (res.coupons && res.coupons.some(c => c.code === 'SPONSOR'))) && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-yellow-900/40 text-yellow-300 text-[9px] font-bold border border-yellow-500/40">
                        <Crown className="w-2.5 h-2.5" /> Spon
                      </span>
                    )}
                    {((typeof res.couponCode === 'string' && res.couponCode.includes('CAST_CREW_PARENT')) || (res.coupons && res.coupons.some(c => c.code === 'CAST_CREW_PARENT'))) && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-pink-900/40 text-pink-300 text-[9px] font-bold border border-pink-500/40">
                        <Users className="w-2.5 h-2.5" /> Parent
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/40 font-bold font-mono mt-1">
                    {isObserver ? maskPhone(res.phoneNumber) : res.phoneNumber} · {isObserver ? maskId(res.id) : res.id}
                  </div>
                </div>
                <div className="w-[20%] px-3 flex flex-col justify-center">
                  {res.isPerformer ? (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-cny-gold font-bold text-xs">
                        <Mic2 className="w-3 h-3" />
                        <span className="truncate">{res.performanceUnit || 'Performer'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white/60">Guest</span>
                      <span className="text-[9px] text-white/30 font-bold uppercase">{res.ticketType}</span>
                    </div>
                  )}
                </div>
                <div className="w-[15%] px-3 text-right font-black text-white text-sm flex flex-col items-end justify-center">
                  <span>${res.totalAmount}</span>
                  {res.couponCode && (
                    <span className="text-[9px] text-green-300 bg-green-900/40 px-1 rounded flex items-center gap-0.5 border border-green-500/30 mt-0.5" title={res.couponCode}>
                      <Tag className="w-2.5 h-2.5" /> Off
                    </span>
                  )}
                </div>
                <div className="w-[25%]">
                  <div className="flex items-center justify-center gap-2">
                    <div className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase border ${res.paymentStatus === PaymentStatus.Paid ? 'bg-green-900/40 text-green-300 border-green-500/30' : 'bg-red-900/40 text-red-300 border-red-500/30'}`}>
                      {res.paymentStatus === PaymentStatus.Paid ? 'Paid' : 'Unpaid'}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase border ${res.checkInStatus === CheckInStatus.Arrived ? 'bg-blue-900/40 text-blue-300 border-blue-500/30' :
                      res.checkInStatus === CheckInStatus.Cancelled ? 'bg-red-900/40 text-red-300 border-red-500/30' :
                        'bg-white/10 text-white/60 border-white/10'
                      }`}>
                      {res.checkInStatus === CheckInStatus.Arrived ? 'In' :
                        res.checkInStatus === CheckInStatus.Cancelled ? 'Cancel' :
                          'Pending'}
                    </div>
                  </div>
                </div>
                <div className="w-[10%] text-right">
                  {!isObserver && (
                    <button onClick={() => setSelectedForAction(res)} className="p-4 text-white/40 hover:text-cny-gold transition-all"><MoreVertical className="w-5 h-5" /></button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-white/40 font-bold uppercase text-xs">No matching records</div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <span className="text-[10px] font-bold text-white/40">{currentPage} / {totalPages}</span>
          <div className="flex gap-1.5">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-white/5 text-white rounded-lg hover:bg-white/10 disabled:opacity-30 border border-white/10"><ChevronLeft className="w-4 h-4" /></button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-white/5 text-white rounded-lg hover:bg-white/10 disabled:opacity-30 border border-white/10"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { ScheduleHeader } from '../components/schedule/ScheduleHeader';
import { TimelineSection } from '../components/schedule/TimelineSection';
import { Ticket, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventSchedule: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 antialiased">
      <ScheduleHeader />

      {/* Walk-in Banner */}
      <div className="mb-12 bg-gradient-to-r from-red-600 to-cny-red border-2 border-cny-gold text-white rounded-3xl p-5 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-[0_0_25px_rgba(255,215,0,0.5)] relative overflow-hidden animate-[pulse_3s_ease-in-out_infinite]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-cny-gold text-cny-dark rounded-full flex items-center justify-center shadow-2xl flex-shrink-0 relative z-10 animate-bounce">
          <Ticket className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div className="relative z-10 text-center sm:text-left">
          <h3 className="text-xl sm:text-3xl font-black text-cny-gold mb-2 sm:mb-3 tracking-tight drop-shadow-md">
            【 早鸟票已售罄 · 欢迎现场购票 】<br className="sm:hidden" />
            <span className="text-lg sm:text-2xl sm:ml-2 drop-shadow-md">Early Bird Sold Out • Walk-ins Welcome!</span>
          </h3>
          <div className="text-white/95 font-medium leading-normal sm:leading-relaxed text-[14px] sm:text-[17px] mb-4 space-y-3">
            <p>
              感谢您的支持！早鸟票已售罄，欢迎活动当天现场购票。
              <strong className="text-cny-gold text-base sm:text-lg bg-cny-dark/30 px-2 py-1 sm:px-3 rounded-lg shadow-inner inline-block mt-1 sm:mt-0 sm:ml-2">$20 门票</strong> 包含所有手工制作、精彩表演及地道中式午餐。
            </p>
            <p className="text-[13px] sm:text-[16px] text-white/80 border-t border-white/10 pt-3">
              Thank you for your support! Early bird tickets are sold out. Join us on event day!
              <strong className="text-cny-gold text-base sm:text-lg bg-cny-dark/30 px-2 py-1 sm:px-3 rounded-lg shadow-inner inline-block mt-1 sm:mt-0 sm:ml-2">$20 admission</strong> includes full access to crafting, amazing performances, and an authentic Chinese lunch.
            </p>
          </div>
          <div className="flex justify-center sm:justify-start">
            <Link to="/manage" className="group flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-5 py-2 rounded-xl transition-all border border-white/20 backdrop-blur-md shadow-lg font-bold">
              <Search className="w-4 h-4" />
              查询/取消我的预约 (Manage Reservation)
            </Link>
          </div>
        </div>
      </div>

      <TimelineSection />
    </div>
  );
};

export default EventSchedule;

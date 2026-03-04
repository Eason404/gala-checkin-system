import React from 'react';
import { Stats } from '../../types';
import { Tag } from 'lucide-react';

interface CouponStatsProps {
  stats: Stats;
}

export const CouponStats: React.FC<CouponStatsProps> = ({ stats }) => {
  const couponEntries = Object.entries(stats.couponUsage || {}).sort((a, b) => (b[1] as number) - (a[1] as number));

  if (couponEntries.length === 0) {
    return null;
  }

  return (
    <div className="glass-dark p-8 rounded-[2.5rem] shadow-xl border border-white/10 backdrop-blur-2xl mt-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-purple-500/20 p-3 rounded-2xl border border-purple-500/30">
          <Tag className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white tracking-tight drop-shadow-md">优惠码使用统计</h3>
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Coupon Usage Analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {couponEntries.map(([code, count]) => (
          <div key={code} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors shadow-inner">
            <span className="text-sm font-black text-white mb-2 truncate w-full" title={code}>{code}</span>
            <span className="text-2xl font-black text-purple-400 drop-shadow-md">{count}</span>
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">次使用 (Uses)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

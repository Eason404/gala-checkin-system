import React from 'react';
import { Stats } from '../../types';
import { Tag } from 'lucide-react';

interface CouponStatsProps {
  stats: Stats;
}

export const CouponStats: React.FC<CouponStatsProps> = ({ stats }) => {
  const couponEntries = Object.entries(stats.couponUsage || {}).sort((a, b) => (b[1] as number) - (a[1] as number));

  if (couponEntries.length === 0) return null;

  return (
    <div className="glass-dark p-5 rounded-2xl shadow-lg border border-white/10">
      <h3 className="text-sm font-black text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Tag className="w-4 h-4 text-purple-400" /> Coupons
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {couponEntries.map(([code, count]) => (
          <div key={code} className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold text-white truncate mr-2" title={code}>{code}</span>
            <span className="text-lg font-black text-purple-400">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

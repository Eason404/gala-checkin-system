import React from 'react';
import { Stats } from '../../types';
import { Tag } from 'lucide-react';

interface CouponStatsProps {
  stats: Stats;
}

export const CouponStats: React.FC<CouponStatsProps> = ({ stats }) => {
  const couponEntries = Object.entries(stats.couponUsage || {}).sort((a, b) => b[1] - a[1]);

  if (couponEntries.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 mt-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-purple-100 p-3 rounded-2xl">
          <Tag className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">优惠码使用统计</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Coupon Usage Analytics</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {couponEntries.map(([code, count]) => (
          <div key={code} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center hover:bg-purple-50 hover:border-purple-100 transition-colors">
            <span className="text-sm font-black text-gray-900 mb-2 truncate w-full" title={code}>{code}</span>
            <span className="text-2xl font-black text-purple-600">{count}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">次使用 (Uses)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

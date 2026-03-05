

import React from 'react';
import { Stats, TicketConfig } from '../../types';
import { Users, Utensils, DollarSign, Ticket, Calculator, CheckCircle2, PieChart } from 'lucide-react';

interface StatsGridProps {
  stats: Stats;
  config: TicketConfig | null;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, config }) => {
  const totalTicketsSold = stats.earlyBirdCount + stats.regularCount + stats.walkInCount;
  const ticketCap = config?.totalCapacity || 400;
  const headcountCap = config?.totalHeadcountCap || 450;
  const totalMealCards = config?.totalMealCards || 380;
  const checkInRateRaw = stats.totalPeople > 0 ? (stats.checkedInCount / stats.totalPeople) * 100 : 0;
  const checkInRate = Math.round(checkInRateRaw);
  const ticketSoldRate = Math.min(100, Math.round((totalTicketsSold / ticketCap) * 100));
  const headcountRate = Math.min(100, Math.round((stats.totalPeople / headcountCap) * 100));

  // We map the KPI data so we can reuse a nice visual card layout
  const kpis = [
    {
      label: '预期总人数 (Headcount)',
      val: stats.totalPeople,
      target: headcountCap,
      rate: headcountRate,
      color: 'bg-blue-500',
      textMain: 'text-blue-600',
      icon: <Users className="w-5 h-5" />
    },
    {
      label: '已售门票 (Tickets Sold)',
      val: totalTicketsSold,
      target: ticketCap,
      rate: ticketSoldRate,
      color: 'bg-purple-500',
      textMain: 'text-purple-600',
      icon: <Ticket className="w-5 h-5" />
    },
    {
      label: '签到进度 (Checked-in)',
      val: stats.checkedInCount,
      target: stats.totalPeople,
      rate: checkInRateRaw,
      color: 'bg-emerald-500',
      textMain: 'text-emerald-600',
      icon: <CheckCircle2 className="w-5 h-5" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Visual Capacity KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((k, i) => (
          <div key={i} className="glass-dark rounded-3xl p-6 shadow-2xl border border-white/10 backdrop-blur-2xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-2xl ${k.color} text-white shadow-lg`}>
                {k.icon}
              </div>
              <div className="text-right">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">{k.label}</p>
                <div className="flex items-end gap-1 justify-end">
                  <span className={`text-3xl font-black text-white tracking-tighter drop-shadow-md`}>{k.val}</span>
                  <span className="text-sm font-bold text-white/40 mb-1">/ {k.target}</span>
                </div>
              </div>
            </div>

            <div className="w-full bg-white/5 rounded-full h-3 mb-1 overflow-hidden relative z-10 shadow-inner">
              <div
                className={`h-3 rounded-full ${k.color} transition-all duration-1000 ease-out`}
                style={{ width: `${k.rate}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-bold text-white/40 relative z-10">
              <span>0%</span>
              <span>{Math.round(k.rate)}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Actionable Logistics KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Financials Combined */}
        <div className="glass-dark p-5 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between backdrop-blur-2xl">
          <div className="flex justify-between items-center mb-4">
            <DollarSign className="text-green-400 w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-bold text-white/40 uppercase text-right">Financials</span>
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-2">资金收讫</p>
            <div className="space-y-1 text-sm font-bold">
              <div className="flex justify-between">
                <span className="text-white/60">应收 Expected</span>
                <span className="text-white">${stats.totalRevenueExpected}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">实收 Collected</span>
                <span className="text-green-400">${stats.totalRevenueCollected}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10 mt-1">
                <span className="text-white/60">待收 Unpaid</span>
                <span className="text-red-400">${Math.max(0, stats.totalRevenueExpected - stats.totalRevenueCollected)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets combined */}
        <div className="glass-dark p-5 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between backdrop-blur-2xl">
          <div className="flex justify-between items-center mb-4">
            <Ticket className="text-purple-400 w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-bold text-white/40 uppercase text-right">Ticket Types</span>
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-2">票种分布</p>
            <div className="space-y-1 text-sm font-bold">
              <div className="flex justify-between">
                <span className="text-white/60">早鸟 Early Bird</span>
                <span className="text-white">{stats.earlyBirdCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">常规 Regular</span>
                <span className="text-white">{stats.regularCount}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10 mt-1">
                <span className="text-white/60">现场 Walk-in</span>
                <span className="text-cny-gold">{stats.walkInCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="glass-dark p-5 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between backdrop-blur-2xl">
          <div className="flex justify-between items-center mb-4">
            <CheckCircle2 className="text-blue-400 w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-bold text-white/40 uppercase text-right">Attendance</span>
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-2">出勤状态</p>
            <div className="space-y-1 text-sm font-bold">
              <div className="flex justify-between">
                <span className="text-white/60">已签到 Arrived</span>
                <span className="text-emerald-400">{stats.checkedInCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">未签到 Pending</span>
                <span className="text-orange-400">{Math.max(0, stats.totalPeople - stats.checkedInCount)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10 mt-1">
                <span className="text-white/60">已取消 Cancelled</span>
                <span className="text-white/40">{stats.cancelledCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Meal Tracker - 盒饭追踪 */}
        <div className="glass-dark p-5 rounded-3xl border border-cny-gold/20 shadow-xl flex flex-col justify-between backdrop-blur-2xl md:col-span-2 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <Utensils className="text-orange-400 w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-bold text-white/40 uppercase text-right">🍱 Meal Tracker</span>
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-3">盒饭实时追踪</p>

            {/* Hero: Available for Walk-in */}
            <div className="bg-gradient-to-br from-cny-gold/10 to-orange-500/10 rounded-2xl p-4 border border-cny-gold/20 mb-4 text-center">
              <p className="text-[10px] text-cny-gold/80 uppercase font-black tracking-widest mb-1">🎫 可售 Walk-in Available</p>
              <span className="text-5xl font-black text-cny-gold leading-none drop-shadow-md">
                {Math.max(0, totalMealCards - stats.checkedInMealCount)}
              </span>
              <p className="text-[10px] text-white/30 mt-1">= 总饭卡 {totalMealCards} − 已领取 {stats.checkedInMealCount}</p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/5 rounded-full h-2.5 mb-3 overflow-hidden shadow-inner">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-cny-gold transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, totalMealCards > 0 ? (stats.checkedInMealCount / totalMealCards) * 100 : 0)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-white/30 mb-4">
              <span>已用 {totalMealCards > 0 ? Math.round((stats.checkedInMealCount / totalMealCards) * 100) : 0}%</span>
              <span>总计 {totalMealCards} 张饭卡</span>
            </div>

            {/* Detail rows */}
            <div className="space-y-1.5 text-sm font-bold">
              <div className="flex justify-between">
                <span className="text-white/60">预注册需求 Pre-registered</span>
                <span className="text-white">{stats.lunchBoxCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">已签到领取 Claimed</span>
                <span className="text-emerald-400">{stats.checkedInMealCount}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10 mt-1">
                <span className="text-white/60">未到预留 No-show Reserve</span>
                <span className="text-orange-400">{stats.noShowMealReserve}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

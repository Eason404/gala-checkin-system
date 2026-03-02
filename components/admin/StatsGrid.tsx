

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
          <div key={i} className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-2xl ${k.color} text-white shadow-lg`}>
                {k.icon}
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{k.label}</p>
                <div className="flex items-end gap-1 justify-end">
                  <span className={`text-3xl font-black ${k.textMain} tracking-tighter`}>{k.val}</span>
                  <span className="text-sm font-bold text-gray-400 mb-1">/ {k.target}</span>
                </div>
              </div>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-3 mb-1 overflow-hidden relative z-10">
              <div
                className={`h-3 rounded-full ${k.color} transition-all duration-1000 ease-out`}
                style={{ width: `${k.rate}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-bold text-gray-400 relative z-10">
              <span>0%</span>
              <span>{Math.round(k.rate)}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Actionable Logistics KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Financials Combined */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <DollarSign className="text-green-500 w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-bold text-gray-400 uppercase text-right">Financials</span>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2">资金收讫</p>
            <div className="space-y-1 text-sm font-bold">
              <div className="flex justify-between">
                <span className="text-gray-500">应收 Expected</span>
                <span className="text-gray-900">${stats.totalRevenueExpected}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">实收 Collected</span>
                <span className="text-green-600">${stats.totalRevenueCollected}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-100 mt-1">
                <span className="text-gray-500">待收 Unpaid</span>
                <span className="text-red-500">${Math.max(0, stats.totalRevenueExpected - stats.totalRevenueCollected)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets combined */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <Ticket className="text-purple-500 w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-bold text-gray-400 uppercase text-right">Ticket Types</span>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2">票种分布</p>
            <div className="space-y-1 text-sm font-bold">
              <div className="flex justify-between">
                <span className="text-gray-500">早鸟 Early Bird</span>
                <span className="text-gray-900">{stats.earlyBirdCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">常规 Regular</span>
                <span className="text-gray-900">{stats.regularCount}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-100 mt-1">
                <span className="text-gray-500">现场 Walk-in</span>
                <span className="text-cny-gold">{stats.walkInCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <CheckCircle2 className="text-blue-500 w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-bold text-gray-400 uppercase text-right">Attendance</span>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2">出勤状态</p>
            <div className="space-y-1 text-sm font-bold">
              <div className="flex justify-between">
                <span className="text-gray-500">已签到 Arrived</span>
                <span className="text-emerald-600">{stats.checkedInCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">未签到 Pending</span>
                <span className="text-orange-500">{Math.max(0, stats.totalPeople - stats.checkedInCount)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-100 mt-1">
                <span className="text-gray-500">已取消 Cancelled</span>
                <span className="text-gray-400">{stats.cancelledCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lunch Boxes */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <Utensils className="text-orange-500 w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-bold text-gray-400 uppercase text-right">Catering</span>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">盒饭需求</p>
            <div className="flex items-end gap-2 mt-4">
              <span className="text-4xl font-black text-gray-900 leading-none">{stats.lunchBoxCount}</span>
              <span className="text-sm font-bold text-gray-400 mb-1">份 (Boxes)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};



import React from 'react';
import { Stats, TicketConfig } from '../../types';
import { Users, Utensils, DollarSign, Ticket, CheckCircle2 } from 'lucide-react';

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
  const ticketSoldRate = Math.min(100, Math.round((totalTicketsSold / ticketCap) * 100));
  const headcountRate = Math.min(100, Math.round((stats.totalPeople / headcountCap) * 100));

  const kpis = [
    { label: 'Headcount', val: stats.totalPeople, target: headcountCap, rate: headcountRate, color: 'bg-blue-500', icon: <Users className="w-4 h-4" /> },
    { label: 'Tickets Sold', val: totalTicketsSold, target: ticketCap, rate: ticketSoldRate, color: 'bg-purple-500', icon: <Ticket className="w-4 h-4" /> },
    { label: 'Checked In', val: stats.checkedInCount, target: stats.totalPeople, rate: checkInRateRaw, color: 'bg-emerald-500', icon: <CheckCircle2 className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-4">
      {/* KPI Progress Cards */}
      <div className="grid grid-cols-3 gap-3">
        {kpis.map((k, i) => (
          <div key={i} className="glass-dark rounded-2xl p-4 shadow-lg border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded-lg ${k.color} text-white`}>{k.icon}</div>
              <span className="text-white/50 text-[10px] font-bold uppercase">{k.label}</span>
            </div>
            <div className="flex items-end gap-1 mb-2">
              <span className="text-2xl font-black text-white">{k.val}</span>
              <span className="text-xs font-bold text-white/30 mb-0.5">/ {k.target}</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <div className={`h-2 rounded-full ${k.color} transition-all duration-1000`} style={{ width: `${k.rate}%` }} />
            </div>
            <div className="text-right text-[10px] font-bold text-white/30 mt-1">{Math.round(k.rate)}%</div>
          </div>
        ))}
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        {/* Financials */}
        <div className="glass-dark p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="text-green-400 w-4 h-4" />
            <span className="text-xs font-bold text-white/40">Revenue</span>
          </div>
          <div className="space-y-1.5 text-sm font-bold">
            <div className="flex justify-between">
              <span className="text-white/50">Expected</span>
              <span className="text-white">${stats.totalRevenueExpected}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Collected</span>
              <span className="text-green-400">${stats.totalRevenueCollected}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-white/10">
              <span className="text-white/50">Unpaid</span>
              <span className="text-red-400">${Math.max(0, stats.totalRevenueExpected - stats.totalRevenueCollected)}</span>
            </div>
          </div>
        </div>

        {/* Ticket Types */}
        <div className="glass-dark p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Ticket className="text-purple-400 w-4 h-4" />
            <span className="text-xs font-bold text-white/40">Tickets</span>
          </div>
          <div className="space-y-1.5 text-sm font-bold">
            <div className="flex justify-between">
              <span className="text-white/50">Early Bird</span>
              <span className="text-white">{stats.earlyBirdCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Regular</span>
              <span className="text-white">{stats.regularCount}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-white/10">
              <span className="text-white/50">Walk-in</span>
              <span className="text-cny-gold">{stats.walkInCount}</span>
            </div>
          </div>
        </div>

        {/* Attendance */}
        <div className="glass-dark p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="text-blue-400 w-4 h-4" />
            <span className="text-xs font-bold text-white/40">Attendance</span>
          </div>
          <div className="space-y-1.5 text-sm font-bold">
            <div className="flex justify-between">
              <span className="text-white/50">Arrived</span>
              <span className="text-emerald-400">{stats.checkedInCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Pending</span>
              <span className="text-orange-400">{Math.max(0, stats.totalPeople - stats.checkedInCount)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-white/10">
              <span className="text-white/50">Cancelled</span>
              <span className="text-white/30">{stats.cancelledCount}</span>
            </div>
          </div>
        </div>

        {/* Meal Tracker */}
        <div className="glass-dark p-4 rounded-2xl border border-cny-gold/20 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="text-orange-400 w-4 h-4" />
            <span className="text-xs font-bold text-white/40">🍱 Meals</span>
          </div>

          <div className="bg-cny-gold/10 rounded-xl p-3 border border-cny-gold/20 mb-3 text-center">
            <p className="text-[10px] text-cny-gold/70 font-bold uppercase mb-0.5">Available</p>
            <span className="text-3xl font-black text-cny-gold leading-none">
              {Math.max(0, totalMealCards - stats.checkedInMealCount)}
            </span>
          </div>

          <div className="w-full bg-white/5 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-cny-gold transition-all duration-1000"
              style={{ width: `${Math.min(100, totalMealCards > 0 ? (stats.checkedInMealCount / totalMealCards) * 100 : 0)}%` }}
            />
          </div>

          <div className="space-y-1 text-xs font-bold">
            <div className="flex justify-between">
              <span className="text-white/50">Reserved</span>
              <span className="text-white">{stats.lunchBoxCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Claimed</span>
              <span className="text-emerald-400">{stats.checkedInMealCount}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-white/10">
              <span className="text-white/50">No-show</span>
              <span className="text-orange-400">{stats.noShowMealReserve}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

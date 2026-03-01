

import React from 'react';
import { Stats, TicketConfig } from '../../types';
import { Users, Utensils, Star, DollarSign, Ticket, Calculator, CheckCircle2, PieChart } from 'lucide-react';

interface StatsGridProps {
  stats: Stats;
  config: TicketConfig | null;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, config }) => {
  
  const totalTicketsSold = stats.earlyBirdCount + stats.regularCount + stats.walkInCount;
  const ticketCap = config?.totalCapacity || 400;
  const headcountCap = config?.totalHeadcountCap || 450;
  const checkInRate = stats.totalPeople > 0 ? Math.round((stats.checkedInCount / stats.totalPeople) * 100) : 0;

  const kpis = [
    { 
      label: '预计总人数', 
      val: `${stats.totalPeople} / ${headcountCap}`, 
      sub: 'Headcount vs Cap', 
      bgColor: 'bg-blue-500', 
      icon: <Users className="text-blue-500 w-4 h-4" /> 
    },
    { 
      label: '人员构成', 
      val: stats.totalGuestsCount, 
      sub: `观众 ${stats.totalGuestsCount} | 演职 ${stats.totalPerformersCount} | 志愿 ${stats.totalVolunteersCount} | 赞助 ${stats.totalSponsorsCount}`, 
      bgColor: 'bg-cny-gold', 
      icon: <PieChart className="text-cny-gold w-4 h-4" /> 
    },
    { 
      label: '已售门票', 
      val: `${totalTicketsSold} / ${ticketCap}`, 
      sub: 'Paid Tickets vs Cap', 
      bgColor: 'bg-purple-500', 
      icon: <Ticket className="text-purple-500 w-4 h-4" /> 
    },
    { 
      label: '签到进度', 
      val: `${stats.checkedInCount} / ${stats.totalPeople}`, 
      sub: `Check-in Rate: ${checkInRate}%`, 
      bgColor: 'bg-emerald-500', 
      icon: <CheckCircle2 className="text-emerald-500 w-4 h-4" /> 
    },
    { 
      label: '盒饭需求数', 
      val: stats.lunchBoxCount, 
      sub: 'Lunch Boxes', 
      bgColor: 'bg-orange-500', 
      icon: <Utensils className="text-orange-500 w-4 h-4" /> 
    },
    { 
      label: '预计总收款', 
      val: `$${stats.totalRevenueExpected}`, 
      sub: 'Total Expected', 
      bgColor: 'bg-indigo-500', 
      icon: <Calculator className="text-indigo-500 w-4 h-4" /> 
    },
    { 
      label: '实收现金', 
      val: `$${stats.totalRevenueCollected}`, 
      sub: 'Cash In Hand', 
      bgColor: 'bg-green-500', 
      icon: <DollarSign className="text-green-500 w-4 h-4" /> 
    },
    { 
      label: '已取消人数', 
      val: stats.cancelledCount, 
      sub: 'Total Cancellations', 
      bgColor: 'bg-red-500', 
      icon: <Users className="text-red-500 w-4 h-4" /> 
    },
  ];

  return (
    <div className="bg-gray-100 border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px]">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 hover:bg-gray-50 transition-colors relative overflow-hidden group">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${kpi.bgColor} opacity-60 group-hover:opacity-100 transition-opacity`}></div>
              <div className="flex items-center gap-2 text-gray-500 mb-3 font-bold uppercase text-[10px] tracking-[0.1em] pl-2">
                {kpi.icon} {kpi.label}
              </div>
              <div className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tighter leading-none whitespace-nowrap pl-2">{kpi.val}</div>
              <div className="text-[10px] text-gray-400 font-medium mt-2 italic pl-2 truncate">{kpi.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

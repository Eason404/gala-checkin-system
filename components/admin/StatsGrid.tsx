

import React from 'react';
import { Stats, TicketConfig } from '../../types';
import { Users, Utensils, Star, DollarSign, Ticket, Calculator } from 'lucide-react';

interface StatsGridProps {
  stats: Stats;
  config: TicketConfig | null;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, config }) => {
  
  const totalTicketsSold = stats.earlyBirdCount + stats.regularCount + stats.walkInCount;
  const ticketCap = config?.totalCapacity || 400;
  const headcountCap = config?.totalHeadcountCap || 450;

  const kpis = [
    { 
      label: '预计总人数', 
      val: `${stats.totalPeople} / ${headcountCap}`, 
      sub: 'Headcount vs Cap', 
      color: 'border-blue-500', 
      icon: <Users className="text-blue-500 w-4 h-4" /> 
    },
    { 
      label: '已售门票', 
      val: `${totalTicketsSold} / ${ticketCap}`, 
      sub: 'Paid Tickets vs Cap', 
      color: 'border-purple-500', 
      icon: <Ticket className="text-purple-500 w-4 h-4" /> 
    },
    { 
      label: '盒饭需求数', 
      val: stats.lunchBoxCount, 
      sub: 'Lunch Boxes', 
      color: 'border-orange-500', 
      icon: <Utensils className="text-orange-500 w-4 h-4" /> 
    },
    { 
      label: '表演者人数', 
      val: stats.totalPerformersCount, 
      sub: 'Performers', 
      color: 'border-cny-gold', 
      icon: <Star className="text-cny-gold fill-cny-gold w-4 h-4" /> 
    },
    { 
      label: '预计总收款', 
      val: `$${stats.totalRevenueExpected}`, 
      sub: 'Total Expected', 
      color: 'border-indigo-500', 
      icon: <Calculator className="text-indigo-500 w-4 h-4" /> 
    },
    { 
      label: '实收现金', 
      val: `$${stats.totalRevenueCollected}`, 
      sub: 'Cash In Hand', 
      color: 'border-green-500', 
      icon: <DollarSign className="text-green-500 w-4 h-4" /> 
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {kpis.map((kpi, idx) => (
        <div key={idx} className={`bg-white p-6 rounded-[2rem] shadow-sm border-l-8 ${kpi.color} hover:shadow-md transition-shadow`}>
            <div className="flex items-center gap-2 text-gray-400 mb-4 font-bold uppercase text-[10px] tracking-[0.1em]">
              {kpi.icon} {kpi.label}
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tighter leading-none whitespace-nowrap">{kpi.val}</div>
            <div className="text-[10px] text-gray-400 font-medium mt-3 italic">{kpi.sub}</div>
        </div>
      ))}
    </div>
  );
};

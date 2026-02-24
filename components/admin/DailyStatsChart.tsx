
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Reservation, CheckInStatus } from '../../types';
import { CalendarDays } from 'lucide-react';

interface DailyStatsChartProps {
  reservations: Reservation[];
}

export const DailyStatsChart: React.FC<DailyStatsChartProps> = ({ reservations }) => {
  const data = useMemo(() => {
    const stats: Record<string, { date: string; displayDate: string; adults: number; children: number }> = {};

    reservations.forEach(res => {
      // Exclude cancelled reservations
      if (res.checkInStatus === CheckInStatus.Cancelled) return;

      const dateObj = new Date(res.createdTime);
      const key = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!stats[key]) {
        stats[key] = {
          date: key,
          displayDate: dateObj.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          adults: 0,
          children: 0
        };
      }
      stats[key].adults += res.adultsCount;
      stats[key].children += res.childrenCount;
    });

    return Object.values(stats)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [reservations]);

  if (data.length === 0) return null;

  return (
    <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-lg border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-cny-red/10 p-3 rounded-2xl">
          <CalendarDays className="w-6 h-6 text-cny-red" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">每日报名统计 Trend</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Adults & Children Registration</p>
        </div>
      </div>
      
      <div className="h-[400px] w-full select-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            barCategoryGap={24}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="displayDate" 
              stroke="#9ca3af" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={11} 
              fontWeight={600}
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip 
              cursor={{ fill: '#f9fafb' }}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px', fontWeight: 'bold' }}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
            <Bar dataKey="adults" name="成人 Adults" stackId="a" fill="#D72638" barSize={32} radius={[0, 0, 0, 0]} />
            <Bar dataKey="children" name="儿童 Children" stackId="a" fill="#F59E0B" barSize={32} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

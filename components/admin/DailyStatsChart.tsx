
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Reservation, CheckInStatus } from '../../types';
import { TrendingUp } from 'lucide-react';

interface DailyStatsChartProps {
  reservations: Reservation[];
}

export const DailyStatsChart: React.FC<DailyStatsChartProps> = ({ reservations }) => {
  const data = useMemo(() => {
    const stats: Record<string, { date: string; displayDate: string; adults: number; children: number; total: number }> = {};

    reservations.forEach(res => {
      if (res.checkInStatus === CheckInStatus.Cancelled) return;

      if (!res.createdTime) return;
      const dateObj = new Date(res.createdTime);
      if (isNaN(dateObj.getTime())) return;

      const key = dateObj.toISOString().split('T')[0];

      if (!stats[key]) {
        stats[key] = {
          date: key,
          displayDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          adults: 0,
          children: 0,
          total: 0
        };
      }
      stats[key].adults += res.adultsCount;
      stats[key].children += res.childrenCount;
      stats[key].total += res.totalPeople;
    });

    return Object.values(stats)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [reservations]);

  if (data.length === 0) return null;

  return (
    <div className="glass-dark p-5 rounded-2xl shadow-lg border border-white/10">
      <h3 className="text-sm font-black text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-cny-gold" /> Daily Trend
      </h3>

      <div className="h-[200px] w-full select-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff15" />
            <XAxis
              dataKey="displayDate"
              stroke="#ffffff60"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis
              stroke="#ffffff60"
              fontSize={9}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.85)', color: 'white', fontSize: '11px', fontWeight: 'bold' }}
              cursor={{ fill: '#ffffff08' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '8px', color: '#ffffff60' }} />
            <Bar dataKey="adults" name="Adults" stackId="a" fill="#D72638" />
            <Bar dataKey="children" name="Kids" stackId="a" fill="#FCE7BB" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

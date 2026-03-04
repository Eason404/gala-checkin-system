
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
      // Exclude cancelled reservations
      if (res.checkInStatus === CheckInStatus.Cancelled) return;

      const dateObj = new Date(res.createdTime);
      const key = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!stats[key]) {
        stats[key] = {
          date: key,
          displayDate: dateObj.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
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
    <div className="glass-dark p-6 sm:p-8 rounded-[2rem] shadow-xl border border-white/10 backdrop-blur-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 drop-shadow-md">
            <TrendingUp className="w-5 h-5 text-cny-gold" />
            每日报名趋势
          </h3>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Daily Registration Trend</p>
        </div>
      </div>

      <div className="h-[240px] w-full select-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff20" />
            <XAxis
              dataKey="displayDate"
              stroke="#ffffff80"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#ffffff80"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.8)', color: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)', fontSize: '12px', fontWeight: 'bold' }}
              cursor={{ fill: '#ffffff10' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px', color: '#ffffff80' }} />
            <Bar
              dataKey="adults"
              name="成人 (Adults)"
              stackId="a"
              fill="#D72638"
            />
            <Bar
              dataKey="children"
              name="儿童 (Children)"
              stackId="a"
              fill="#FCE7BB"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

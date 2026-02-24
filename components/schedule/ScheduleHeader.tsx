
import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

export const ScheduleHeader: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-cny-red rounded-[2.5rem] p-10 mb-12 text-white shadow-2xl border-b-4 border-cny-gold">
      <div className="absolute top-0 right-0 p-4 opacity-10">
         <Calendar className="w-48 h-48" />
      </div>
      <div className="relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">2026 马年春晚安排</h2>
        <p className="text-cny-gold text-lg font-bold opacity-90 tracking-[0.2em] uppercase">Gala Event Schedule</p>
        <div className="mt-10 flex flex-wrap gap-4 text-xs font-bold">
          <div className="flex items-center gap-2 bg-white/15 px-6 py-2.5 rounded-full backdrop-blur-md border border-white/20">
            <Calendar className="w-4 h-4 text-cny-gold" /> 2026年3月8日 (Sunday)
          </div>
          <div className="flex items-center gap-2 bg-white/15 px-6 py-2.5 rounded-full backdrop-blur-md border border-white/20">
            <MapPin className="w-4 h-4 text-cny-gold" /> Natick High School
          </div>
        </div>
      </div>
    </div>
  );
};


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
        <p className="text-cny-gold text-lg font-bold opacity-90 tracking-[0.2em] uppercase">2026 Year of the Horse Gala Schedule</p>
        <div className="mt-10 flex flex-wrap gap-4 text-xs font-bold">
          <a
            href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Natick+CNY+Gala+2026&dates=20260308T150000Z/20260308T193000Z&details=Join+us+for+the+Year+of+the+Horse+Gala!&location=Natick+High+School,+15+West+St,+Natick,+MA+01760"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 bg-white/15 hover:bg-white/20 px-6 py-2.5 rounded-full backdrop-blur-md border border-white/20 transition-colors shadow-sm cursor-pointer"
            title="Add to Google Calendar"
          >
            <Calendar className="w-4 h-4 text-cny-gold group-hover:scale-110 transition-transform" />
            <span>2026年3月8日 (March 8, 2026 Sunday)</span>
          </a>
          <a
            href="https://maps.google.com/?q=Natick+High+School,+15+West+St,+Natick,+MA+01760"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 bg-white/15 hover:bg-white/20 px-6 py-2.5 rounded-full backdrop-blur-md border border-white/20 transition-colors shadow-sm cursor-pointer"
            title="Get Directions"
          >
            <MapPin className="w-4 h-4 text-cny-gold group-hover:scale-110 transition-transform" />
            <span>Natick High School</span>
          </a>
        </div>
      </div>
    </div>
  );
};

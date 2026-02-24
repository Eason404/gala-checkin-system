
import React from 'react';
import { ScheduleHeader } from './schedule/ScheduleHeader';
import { TimelineSection } from './schedule/TimelineSection';
import { ProgramSidebar } from './schedule/ProgramSidebar';

const EventSchedule: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 antialiased">
      <ScheduleHeader />
      <div className="grid md:grid-cols-3 gap-12">
        <TimelineSection />
        <ProgramSidebar />
      </div>
    </div>
  );
};

export default EventSchedule;

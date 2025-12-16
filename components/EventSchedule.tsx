import React from 'react';
import { Clock, MapPin, Utensils, Music, ShoppingBag } from 'lucide-react';

const EventSchedule: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-red-100 mb-8">
      {/* Header */}
      <div className="bg-red-50 p-4 border-b border-red-100 text-center">
        <h3 className="text-xl font-bold text-cny-red flex items-center justify-center gap-2">
           2026 NATICK 春节联欢活动安排
        </h3>
        <p className="text-xs text-cny-dark uppercase tracking-widest mt-1">Event Schedule</p>
      </div>

      <div className="p-6 relative">
        {/* Vertical Line */}
        <div className="absolute left-8 top-6 bottom-6 w-0.5 bg-gray-200"></div>

        {/* Item 1 */}
        <div className="relative pl-12 mb-8">
          <div className="absolute left-6 top-1 -translate-x-1/2 bg-cny-red text-white p-1.5 rounded-full shadow-md z-10">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
             <span className="font-bold text-lg text-cny-dark">10:00 AM - 12:00 PM</span>
             <span className="text-cny-red font-bold text-xl">春节庙会</span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Temple Fair (Games, Cultural Booths, Snacks)</p>
          <div className="flex items-center text-xs text-gray-500 gap-1">
             <MapPin className="w-3 h-3" /> NATICK 高中餐厅 / Cafeteria
          </div>
        </div>

        {/* Item 2 */}
        <div className="relative pl-12 mb-8">
          <div className="absolute left-6 top-1 -translate-x-1/2 bg-cny-gold text-cny-red p-1.5 rounded-full shadow-md z-10">
            <Utensils className="w-4 h-4" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
             <span className="font-bold text-lg text-cny-dark">12:00 PM - 1:00 PM</span>
             <span className="text-cny-red font-bold text-xl">午餐时段</span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Lunch Break (Traditional Chinese Food)</p>
          <div className="flex items-center text-xs text-gray-500 gap-1">
             <MapPin className="w-3 h-3" /> NATICK 高中餐厅 / Cafeteria
          </div>
        </div>

        {/* Item 3 */}
        <div className="relative pl-12">
          <div className="absolute left-6 top-1 -translate-x-1/2 bg-cny-dark text-white p-1.5 rounded-full shadow-md z-10">
            <Music className="w-4 h-4" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
             <span className="font-bold text-lg text-cny-dark">1:00 PM - 2:30 PM</span>
             <span className="text-cny-red font-bold text-xl">春节特别表演</span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Gala Performances (Music, Dance, Skits)</p>
          <div className="flex items-center text-xs text-gray-500 gap-1">
             <MapPin className="w-3 h-3" /> NATICK 高中大礼堂 / Auditorium
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventSchedule;
import React from 'react';
import { MapPin, ShoppingBag, Utensils, Music } from 'lucide-react';

export const TimelineSection: React.FC = () => {
  const scheduleItems = [
    {
      time: '10:00 AM - 12:00 PM',
      titleZh: '春节庙会',
      titleEn: 'Temple Fair & Cultural Fair',
      descZh: '庙会包含丰富多彩的游戏、文化展位、手工制作以及新春零食。适合全家参与。',
      descEn: 'Features cultural booths, crafts, games, and authentic New Year snacks. Fun for the whole family.',
      locationZh: '学校餐厅',
      locationEn: 'Natick High School Cafeteria',
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'bg-orange-500'
    },
    {
      time: '12:00 PM - 1:00 PM',
      titleZh: '春节午餐',
      titleEn: 'Traditional CNY Lunch',
      descZh: '享用“贺岁锦绣”开运午餐。包含地道中式佳肴，需提前预约。',
      descEn: 'Enjoy a traditional Chinese New Year lunch with authentic dishes. Pre-order required.',
      locationZh: '学校餐厅',
      locationEn: 'Natick High School Cafeteria',
      icon: <Utensils className="w-6 h-6" />,
      color: 'bg-green-600'
    },
    {
      time: '1:00 PM - 2:30 PM',
      titleZh: '春节联欢晚会',
      titleEn: 'Gala Performance',
      descZh: '由社区表演者呈现的歌舞、小品、传统器乐演奏等精彩节目。',
      descEn: 'A spectacular showcase of cultural dances, musical performances, and comedy skits.',
      locationZh: '学校礼堂',
      locationEn: 'Natick High School Auditorium',
      icon: <Music className="w-6 h-6" />,
      color: 'bg-cny-red'
    }
  ];

  return (
    <div className="md:col-span-2 space-y-10">
      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
        <div className="w-2 h-8 bg-cny-red rounded-full"></div>
        流程安排 <span className="text-gray-400 font-bold text-xs ml-2 tracking-widest uppercase">AGENDA</span>
      </h3>

      <div className="space-y-8">
        {scheduleItems.map((item, idx) => (
          <div key={idx} className="group relative bg-white rounded-[2.5rem] shadow-xl p-8 border border-cny-gold/5 hover:border-cny-gold/30 transition-all duration-500">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                <div className={`${item.color} text-white p-5 rounded-2xl shadow-lg h-fit festive-float w-fit`}>
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-cny-red/60 uppercase tracking-widest mb-3 leading-none">{item.time}</div>
                  <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-2">
                    <h4 className="text-3xl font-bold text-gray-900 tracking-tight">{item.titleZh}</h4>
                    <h4 className="text-xl font-bold text-gray-500 tracking-tight sm:pb-0.5">{item.titleEn}</h4>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-50">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-8">
                <p className="text-gray-600 text-[15px] leading-relaxed font-medium flex-1">{item.descZh}</p>
                <div className="hidden sm:block w-px bg-gray-100"></div>
                <p className="text-gray-500 text-[14px] leading-relaxed font-medium flex-1">{item.descEn}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-50 w-fit px-4 py-2 rounded-full border border-gray-100">
                  <MapPin className="w-4 h-4 text-cny-red/40" /> {item.locationZh}
                </div>
                <div className="hidden sm:block text-gray-300">•</div>
                <span className="text-xs font-bold text-gray-400 px-2">{item.locationEn}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

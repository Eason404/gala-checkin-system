
import React from 'react';
import { MapPin, ShoppingBag, Utensils, Music } from 'lucide-react';

export const TimelineSection: React.FC = () => {
  const scheduleItems = [
    {
      time: '10:00 AM - 12:00 PM',
      title: '春节庙会',
      subTitle: 'Temple Fair & Cultural Fair',
      desc: '庙会包含丰富多彩的游戏、文化展位、手工制作以及地道的新春零食。适合全家参与。',
      location: 'Natick High School Cafeteria',
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'bg-orange-500'
    },
    {
      time: '12:00 PM - 1:00 PM',
      title: '春节午餐',
      subTitle: 'Traditional CNY Lunch',
      desc: '享用“贺岁锦绣”开运午餐。包含地道中式佳肴，需提前在线预约。',
      location: 'Natick High School Cafeteria',
      icon: <Utensils className="w-6 h-6" />,
      color: 'bg-green-600'
    },
    {
      time: '1:00 PM - 2:30 PM',
      title: '春节联欢晚会',
      subTitle: 'Gala Performance',
      desc: '由社区艺术家呈现的歌舞、小品、传统器乐演奏等精彩节目。',
      location: 'Natick High School Auditorium',
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
              <div className="flex gap-8">
                <div className={`${item.color} text-white p-5 rounded-2xl shadow-lg h-fit festive-float`}>
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-cny-red/60 uppercase tracking-widest mb-3 leading-none">{item.time}</div>
                  <h4 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{item.title}</h4>
                  <p className="text-sm text-gray-400 font-bold tracking-wide uppercase">{item.subTitle}</p>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-50">
              <p className="text-gray-600 text-base leading-relaxed mb-8 font-medium">{item.desc}</p>
              <div className="flex items-center gap-3 text-xs font-bold text-gray-400 bg-gray-50 w-fit px-5 py-2.5 rounded-full border border-gray-100">
                <MapPin className="w-4 h-4 text-cny-red/40" /> {item.location}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

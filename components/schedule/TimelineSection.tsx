import * as React from 'react';
import { MapPin, ShoppingBag, Utensils, Music, ChevronRight, Banknote, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ScheduleItem {
  time: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  locationZh: string;
  locationEn: string;
  icon: React.ReactNode;
  color: string;
  cashOnly?: boolean;
  includedInTicket?: boolean;
  showProgramLink?: boolean;
}

export const TimelineSection: React.FC = () => {
  const scheduleItems: ScheduleItem[] = [
    {
      time: '10:00 AM - 12:00 PM',
      titleZh: '春节庙会',
      titleEn: 'Temple Fair & Cultural Fair',
      descZh: '庙会包含丰富多彩的游戏、文化展位、手工制作以及新春零食。适合全家参与。',
      descEn: 'Features cultural booths, crafts, games, and authentic New Year snacks.',
      locationZh: '学校餐厅',
      locationEn: 'Natick High School Cafeteria',
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'bg-orange-500',
      cashOnly: true
    },
    {
      time: '12:00 PM - 1:00 PM',
      titleZh: '春节午餐',
      titleEn: 'Traditional CNY Lunch',
      descZh: '享用“贺岁锦绣”开运午餐。包含地道中式佳肴。',
      descEn: 'Enjoy a traditional Chinese New Year lunch with authentic dishes.',
      locationZh: '学校餐厅',
      locationEn: 'Natick High School Cafeteria',
      icon: <Utensils className="w-6 h-6" />,
      color: 'bg-green-600',
      includedInTicket: true
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
      color: 'bg-cny-red',
      showProgramLink: true
    }
  ];

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-white flex items-center gap-3 px-2">
        <div className="w-2 h-8 bg-cny-gold rounded-full"></div>
        流程安排 <span className="text-white/40 font-bold text-xs ml-2 tracking-widest uppercase italic">Schedule</span>
      </h3>

      <div className="space-y-6">
        {scheduleItems.map((item, idx) => (
          <div key={idx} className="group relative glass-dark rounded-[2.5rem] p-6 sm:p-8 border border-white/10 hover:border-cny-gold/30 transition-all duration-500 overflow-hidden shadow-xl">
            {/* Background Icon Decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none transform translate-x-12 -translate-y-4">
              {React.cloneElement(item.icon as React.ReactElement, { className: 'w-48 h-48' })}
            </div>

            <div className="relative z-10">
              {/* Header: Time and Badges */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="inline-flex items-center px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-black text-cny-gold tracking-tighter">
                  {item.time}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {item.cashOnly && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cny-gold/20 text-cny-gold rounded-full text-[10px] font-bold uppercase tracking-wider border border-cny-gold/30">
                      <Banknote className="w-3.5 h-3.5" /> 仅限现金 Cash Only
                    </span>
                  )}
                  {item.includedInTicket && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                      <Ticket className="w-3.5 h-3.5" /> 已含在门票内 Included
                    </span>
                  )}
                  {item.showProgramLink && (
                    <Link to="/program" className="inline-flex items-center gap-1.5 px-3 py-1 bg-cny-red/20 text-cny-red rounded-full text-[10px] font-bold uppercase tracking-wider border border-cny-red/30 hover:bg-cny-red hover:text-white transition-all">
                      <Music className="w-3.5 h-3.5" /> 查看节目单 View Program
                    </Link>
                  )}
                </div>
              </div>

              {/* Title Section */}
              <div className="mb-6">
                <h4 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">{item.titleZh}</h4>
                <p className="text-white/40 text-sm font-bold uppercase tracking-[0.2em]">{item.titleEn}</p>
              </div>

              {/* Description Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 border-t border-white/5 pt-6">
                <p className="text-white/80 text-sm sm:text-base leading-relaxed font-medium">
                  {item.descZh}
                </p>
                <p className="text-white/40 text-sm leading-relaxed font-medium italic">
                  {item.descEn}
                </p>
              </div>

              {/* Location Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-bold text-white/50 uppercase tracking-widest group-hover:text-white/80 transition-colors">
                <MapPin className="w-3 h-3 text-cny-red/60" /> {item.locationZh} · {item.locationEn}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

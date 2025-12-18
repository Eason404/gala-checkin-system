import React from 'react';
import { Clock, MapPin, Utensils, Music, ShoppingBag, Calendar, ArrowRight, Star, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventSchedule: React.FC = () => {
  const scheduleItems = [
    {
      time: '10:00 AM - 12:00 PM',
      title: '春节庙会',
      subTitle: 'Temple Fair & Cultural Fair',
      desc: '庙会包含丰富多彩的游戏、文化展位、手工制作以及地道的新春零食。适合全家参与。',
      location: 'Natick High School Cafeteria',
      icon: <ShoppingBag className="w-5 h-5" />,
      color: 'bg-orange-500'
    },
    {
      time: '12:00 PM - 1:00 PM',
      title: '春节午餐',
      subTitle: 'Traditional CNY Lunch',
      desc: '享用精选的中式传统盒饭。需提前在线预约。',
      location: 'Natick High School Cafeteria',
      icon: <Utensils className="w-5 h-5" />,
      color: 'bg-green-600'
    },
    {
      time: '1:00 PM - 2:30 PM',
      title: '春节联欢晚会',
      subTitle: 'Gala Performance',
      desc: '由社区艺术家呈现的歌舞、小品、传统器乐演奏等精彩节目。',
      location: 'Natick High School Auditorium',
      icon: <Music className="w-5 h-5" />,
      color: 'bg-cny-red'
    }
  ];

  const performances = [
    { title: '舞狮开场 (Opening Lion Dance)', duration: '10 min', artist: 'Natick Dragon & Lion Dance Team' },
    { title: '民族舞：春之韵 (Ethnic Dance)', duration: '6 min', artist: 'CACC Dance Group' },
    { title: '少儿合唱 (Children\'s Choir)', duration: '8 min', artist: 'Natick Chinese School' },
    { title: '京剧选段 (Peking Opera Selection)', duration: '12 min', artist: 'Special Guests' },
    { title: '马年大抽奖 (Grand Raffle Draw)', duration: '15 min', artist: 'Committee' }
  ];

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-cny-red rounded-3xl p-8 mb-10 text-white shadow-2xl border-b-4 border-cny-gold">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <Calendar className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">2026 马年春晚安排</h2>
          <p className="text-cny-gold text-lg font-bold opacity-90 tracking-widest uppercase">Gala Event Schedule</p>
          <div className="mt-8 flex flex-wrap gap-4 text-xs font-black">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
              <Calendar className="w-4 h-4 text-cny-gold" /> 2026年3月8日 (Sunday)
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
              <MapPin className="w-4 h-4 text-cny-gold" /> Natick High School
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        {/* Timeline Column */}
        <div className="md:col-span-2 space-y-8">
          <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <div className="w-2 h-8 bg-cny-red rounded-full"></div>
            流程安排 <span className="text-gray-400 font-normal text-sm ml-2">AGENDA</span>
          </h3>

          <div className="space-y-6">
            {scheduleItems.map((item, idx) => (
              <div key={idx} className="group relative bg-white rounded-[2rem] shadow-xl p-6 sm:p-8 border border-cny-gold/5 hover:border-cny-gold/30 transition-all duration-500">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                  <div className="flex gap-6">
                    <div className={`${item.color} text-white p-4 rounded-2xl shadow-lg h-fit festive-float`}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-cny-red/50 uppercase tracking-[0.2em] mb-2">{item.time}</div>
                      <h4 className="text-3xl font-black text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-400 font-bold">{item.subTitle}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-50">
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium">{item.desc}</p>
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-400 bg-gray-50 w-fit px-4 py-2 rounded-full">
                    <MapPin className="w-4 h-4 text-cny-red/40" /> {item.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-cny-cloud/40 border-2 border-dashed border-cny-gold/40 p-10 rounded-[2.5rem] text-center shadow-inner">
             <div className="text-4xl mb-4">🧧</div>
             <p className="text-gray-900 font-black text-xl mb-4">计划参加庙会和午餐？</p>
             <Link to="/" className="inline-flex items-center gap-3 bg-cny-red text-white px-8 py-4 rounded-full font-black hover:bg-cny-dark shadow-xl transition-all hover:scale-105 active:scale-95">
                立即前往预约 Go to Register <ArrowRight className="w-5 h-5" />
             </Link>
          </div>
        </div>

        {/* Sidebar Column: Performances */}
        <div className="space-y-8">
          <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <div className="w-2 h-8 bg-cny-gold rounded-full"></div>
            节目单 <span className="text-gray-400 font-normal text-sm ml-2">HIGHLIGHTS</span>
          </h3>

          <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-cny-gold/5">
            <div className="bg-cny-red/5 p-5 border-b border-gray-100">
               <p className="text-[10px] font-black text-cny-red uppercase tracking-[0.2em]">Live Performances @ 1:00 PM</p>
            </div>
            <div className="divide-y divide-gray-50">
              {performances.map((perf, idx) => (
                <div key={idx} className="p-5 hover:bg-cny-cloud/20 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-black text-gray-800 leading-snug text-sm group-hover:text-cny-red transition-colors">{perf.title}</h5>
                    <span className="text-[10px] font-black bg-gray-100 px-2 py-1 rounded-md text-gray-400 group-hover:bg-cny-gold/20 group-hover:text-cny-red">{perf.duration}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{perf.artist}</p>
                </div>
              ))}
            </div>
            <div className="p-6 bg-gray-50 text-center border-t border-gray-100">
               <p className="text-[10px] text-gray-400 font-bold italic">更多精彩节目更新中... (More coming)</p>
            </div>
          </div>

          {/* Contact Section with Official Email */}
          <div className="bg-cny-dark text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
             <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-cny-gold/10 rounded-full blur-2xl group-hover:bg-cny-gold/20 transition-all duration-700"></div>
             <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                    <Music className="w-6 h-6 text-cny-gold" />
                </div>
                <h4 className="text-xl font-black mb-2">参与演出与招商</h4>
                <p className="text-xs text-white/60 mb-8 leading-relaxed font-medium">我们欢迎各类才艺展示与赞助支持。请联系筹委会报名参与演出或申请庙会摊位。</p>
                <a 
                    href="mailto:natickchineseassociation@gmail.com" 
                    className="flex items-center justify-center gap-2 w-full py-4 bg-cny-gold text-cny-dark rounded-2xl font-black hover:bg-white transition-colors shadow-lg"
                >
                    <Mail className="w-4 h-4" />
                    联系我们 Contact Us
                </a>
                <p className="mt-4 text-[10px] text-center text-white/30 font-bold tracking-widest uppercase">natickchineseassociation@gmail.com</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventSchedule;

import React from 'react';
import { Gift, Sparkles, Star, Zap, ShoppingBag, Clover } from 'lucide-react';

export const ProgramSidebar: React.FC = () => {
  const performances = [
    { title: '舞狮开场 (Opening Lion Dance)', duration: '10 min', artist: 'Natick Dragon & Lion Dance Team' },
    { title: '民族舞：春之韵 (Ethnic Dance)', duration: '6 min', artist: 'CACC Dance Group' },
    { title: '少儿合唱 (Children\'s Choir)', duration: '8 min', artist: 'Natick Chinese School' },
    { title: '京剧选段 (Peking Opera Selection)', duration: '12 min', artist: 'Special Guests' },
    { title: '马年大抽奖 (Grand Raffle Draw)', duration: '15 min', artist: 'Committee' }
  ];

  return (
    <div className="space-y-10">
      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
        <div className="w-2 h-8 bg-cny-gold rounded-full"></div>
        节目单 <span className="text-gray-400 font-bold text-xs ml-2 tracking-widest uppercase">HIGHLIGHTS</span>
      </h3>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-cny-gold/5">
        <div className="bg-cny-red/5 p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <p className="text-xs font-bold text-cny-red uppercase tracking-widest">Live Performances @ 1:00 PM</p>
          <p className="text-[10px] font-bold text-cny-red/70 uppercase tracking-widest hidden sm:block">礼堂汇演</p>
        </div>
        <div className="divide-y divide-gray-50">
          {performances.map((perf, idx) => {
            const splitMatch = perf.title.match(/^(.*?)\s*\((.*?)\)$/);
            const titleZh = splitMatch ? splitMatch[1] : perf.title;
            const titleEn = splitMatch ? splitMatch[2] : '';

            return (
              <div key={idx} className="p-6 hover:bg-cny-cloud/10 transition-colors group">
                <div className="flex justify-between items-start mb-2 gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-1 sm:gap-3">
                    <h5 className="font-bold text-gray-800 leading-snug text-[15px] group-hover:text-cny-red transition-colors tracking-tight">{titleZh}</h5>
                    {titleEn && <span className="text-[13px] font-bold text-gray-400 group-hover:text-cny-red/70 transition-colors tracking-tight hidden sm:block">{titleEn}</span>}
                  </div>
                  <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-400 group-hover:bg-cny-gold/30 group-hover:text-cny-red whitespace-nowrap hidden sm:block">{perf.duration}</span>
                </div>
                {titleEn && <h5 className="font-bold text-gray-400 text-[13px] group-hover:text-cny-red/70 transition-colors tracking-tight sm:hidden mb-2">{titleEn}</h5>}
                <div className="flex justify-between items-center sm:hidden mb-2">
                  <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-400 group-hover:bg-cny-gold/30 group-hover:text-cny-red whitespace-nowrap">{perf.duration}</span>
                </div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider leading-none">{perf.artist}</p>
              </div>
            );
          })}
        </div>
        <div className="p-8 bg-gray-50 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400 font-bold italic">更多精彩节目更新中... (More coming)</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-cny-red to-red-900 text-white shadow-2xl p-8 border-4 border-cny-gold group">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-12 opacity-10"><Sparkles className="w-32 h-32" /></div>

        <div className="relative z-10 text-center">
          <h4 className="text-3xl font-black mb-1 tracking-tighter text-white drop-shadow-md">幸运大抽奖</h4>
          <p className="text-cny-gold text-xs font-bold uppercase tracking-[0.3em] mb-8">Mystery Grand Raffle</p>

          {/* The Wheel Container */}
          <div className="relative w-64 h-64 mx-auto mb-6">
            {/* Pointer (Triangle) */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 drop-shadow-lg">
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-cny-gold"></div>
            </div>

            {/* Rotating Wheel */}
            <div className="w-full h-full rounded-full border-4 border-cny-gold/50 shadow-2xl overflow-hidden relative animate-[spin_8s_linear_infinite]">
              {/* CSS Conic Gradient for segments */}
              <div className="absolute inset-0" style={{
                background: `conic-gradient(
                          #D72638 0deg 60deg,
                          #A61B2B 60deg 120deg,
                          #D72638 120deg 180deg,
                          #A61B2B 180deg 240deg,
                          #D72638 240deg 300deg,
                          #A61B2B 300deg 360deg
                        )`
              }}></div>

              {/* Icons positioned radially */}
              {[<Gift />, <Star />, <Clover />, <Zap />, <ShoppingBag />, <Sparkles />].map((icon, i) => {
                const angle = i * 60 + 30; // Center of each segment
                return (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-8 h-8 -ml-4 -mt-4 flex items-center justify-center text-cny-gold/80"
                    style={{
                      transform: `rotate(${angle}deg) translate(0, -75px) rotate(-${angle}deg)`
                    }}
                  >
                    {React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6 drop-shadow-sm" })}
                  </div>
                );
              })}
            </div>

            {/* Center Hub */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-cny-gold rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] flex items-center justify-center border-4 border-cny-red z-10">
              <span className="text-cny-red font-serif font-black text-3xl pt-1">福</span>
            </div>
          </div>

          <div className="mt-4 pt-6 border-t border-white/10">
            <p className="font-bold text-lg mb-1">现场揭晓惊喜大奖</p>
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
              * 需凭票入场参与 (Ticket Required)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

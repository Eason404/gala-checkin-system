
import React from 'react';

interface RedEnvelopeProps {
  onOpen: () => void;
}

export const RedEnvelope: React.FC<RedEnvelopeProps> = ({ onOpen }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-cny-dark backdrop-blur-xl">
        <div 
          onClick={onOpen}
          className="relative w-full max-sm:max-w-[280px] max-w-sm aspect-[3/4] cursor-pointer group animate-burst"
        >
            <div className="absolute inset-0 bg-cny-red rounded-3xl shadow-2xl border-4 border-cny-gold/20 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/silk.png')]"></div>
            </div>
            
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-cny-red rounded-t-3xl border-b-4 border-cny-gold/40 origin-top z-20 group-hover:bg-red-700 transition-colors" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}></div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                <div className="w-24 h-24 bg-cny-gold text-cny-red rounded-full shadow-2xl flex items-center justify-center text-5xl font-serif font-black border-4 border-white/20 festive-float">
                    福
                </div>
            </div>

            <div className="absolute bottom-12 left-0 right-0 text-center z-10">
                <p className="text-cny-gold font-bold text-base uppercase tracking-[0.3em] mb-2">预约成功</p>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">点击开启好运 | Tap to Open</p>
            </div>
        </div>
    </div>
  );
};

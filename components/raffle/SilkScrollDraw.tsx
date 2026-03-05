import React, { useState, useEffect } from 'react';
import { Phone, Eye, EyeOff } from 'lucide-react';
import { Winner } from '../../types';

interface SilkScrollDrawProps {
    isSpinning: boolean;
    winner: Winner | null;
    currentDisplay: string;
    isAdmin: boolean;
}

export const SilkScrollDraw: React.FC<SilkScrollDrawProps> = ({
    isSpinning,
    winner,
    currentDisplay,
    isAdmin,
}) => {
    const [showPhone, setShowPhone] = useState(false);
    const [unfurled, setUnfurled] = useState(false);

    useEffect(() => {
        // Trigger the scroll unfurling animation on mount
        const timer = setTimeout(() => setUnfurled(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const maskPhone = (phone: string) => {
        const digits = phone.replace(/\D/g, '');
        if (digits.length >= 4) {
            return `***-***-${digits.slice(-4)}`;
        }
        return '****';
    };

    return (
        <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center py-4">

            {/* Wooden Scroll Header */}
            <div className="w-[110%] h-8 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900 rounded-full shadow-2xl z-20 flex justify-between items-center px-2 border-b-2 border-amber-950">
                <div className="w-12 h-12 bg-amber-950 rounded-full border-4 border-amber-800 -ml-4" />
                <div className="w-12 h-12 bg-amber-950 rounded-full border-4 border-amber-800 -mr-4" />
            </div>

            {/* The Scroll Paper Body */}
            <div className={`relative w-full bg-[#f4e2c6] shadow-[0_30px_60px_rgba(0,0,0,0.4)] border-l-4 border-r-4 border-amber-900/40 flex flex-col items-center px-4 md:px-8 overflow-hidden z-10 transition-all duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${unfurled ? 'h-[400px] md:h-[500px] py-8 md:py-12 opacity-100' : 'h-0 py-0 opacity-0'}`}
                style={{ backgroundImage: 'radial-gradient(#d3ba96 1px, transparent 1px)', backgroundSize: '10px 10px' }}
            >
                {/* Subtle Watermark */}
                <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                    <div className="text-[20rem] font-serif writing-vertical-rl">馬</div>
                </div>

                {/* Floating Auspicious Clouds Background */}
                <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
                    <div className="absolute top-10 left-0 w-[200%] flex animate-cloud-flow text-red-900/10 font-serif text-[8rem] select-none">
                        <span className="w-1/2 leading-none whitespace-nowrap">☁ 祥云 ☁ 瑞气 ☁ 吉祥 ☁ 富贵</span>
                        <span className="w-1/2 leading-none whitespace-nowrap">☁ 祥云 ☁ 瑞气 ☁ 吉祥 ☁ 富贵</span>
                    </div>
                </div>

                <div className="relative z-10 text-center flex flex-col items-center w-full">

                    <p className="text-amber-950/40 font-serif tracking-[0.5em] text-xs md:text-sm uppercase mb-8 md:mb-16 ml-4 md:ml-12">
                        圣旨 · Royal Decree
                    </p>

                    <div className="relative w-full flex justify-center h-40 items-center">

                        {/* The sweeping ink brush effect during spinning */}
                        {isSpinning && (
                            <div className="absolute inset-0 z-20 overflow-hidden">
                                <div className="w-24 h-[150%] -top-1/4 bg-black blur-xl opacity-40 animate-[slide_1.5s_ease-in-out_infinite_alternate]" />
                            </div>
                        )}

                        {/* Display Text (Calligraphy styled) */}
                        <div className={`z-10 font-serif tracking-widest text-black transition-all duration-700
              ${isSpinning ? 'text-[4rem] sm:text-[6rem] opacity-30 blur-sm scale-95' : 'text-[6rem] sm:text-[8rem] md:text-[10rem] opacity-90 drop-shadow-md scale-100'}
            `} style={{ fontFamily: '"Ma Shan Zheng", "Kaiti", serif' }}>
                            {currentDisplay}
                        </div>

                    </div>

                    {/* Active Imperial Stamp (Triggers on Winner) */}
                    {winner && !isSpinning && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 border-[8px] md:border-[12px] border-red-700/70 rounded-sm opacity-0 animate-stamp z-0 flex items-center justify-center mix-blend-multiply pointer-events-none scale-100">
                            <div className="border-4 md:border-8 border-red-700/70 w-[90%] h-[90%] flex items-center justify-center p-2">
                                <span className="text-red-700/80 font-serif font-black text-4xl md:text-5xl tracking-[0.3em] text-center" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                                    马到成功
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Winner Text Reveal */}
                    <div className={`mt-8 z-10 transition-all duration-1000 ease-in-out ${winner && !isSpinning ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        {winner && (
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-6">
                                    <div className="h-px w-16 bg-red-800/50" />
                                    <h2 className="text-3xl sm:text-4xl font-bold text-black font-serif" style={{ fontFamily: '"Kaiti", serif' }}>
                                        {winner.firstName}
                                    </h2>
                                    <div className="h-px w-16 bg-red-800/50" />
                                </div>

                                <div className="mt-8 flex items-center gap-3 bg-red-900/10 px-6 py-2 rounded-sm border border-red-900/20">
                                    <Phone className="w-4 h-4 text-red-900/60" />
                                    <span className="text-lg font-mono text-red-900 tracking-widest">
                                        {isAdmin && showPhone ? winner.phone : maskPhone(winner.phone)}
                                    </span>
                                    {isAdmin && (
                                        <button onClick={() => setShowPhone(!showPhone)} className="text-red-900/50 hover:text-red-900 ml-2">
                                            {showPhone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Wooden Scroll Footer */}
            <div className="w-[110%] h-8 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900 rounded-full shadow-2xl z-20 flex justify-between items-center px-2 border-t-2 border-amber-950">
                <div className="w-12 h-12 bg-amber-950 rounded-full border-4 border-amber-800 -ml-4" />
                <div className="w-12 h-12 bg-amber-950 rounded-full border-4 border-amber-800 -mr-4" />
            </div>

        </div>
    );
};

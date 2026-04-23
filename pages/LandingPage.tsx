
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Music2, Users, Sparkles, ArrowRight, Utensils, MapPin, KeyRound, QrCode, Heart } from 'lucide-react';
import QRCode from 'qrcode';

const VideoGallery = lazy(() => import('../components/media/VideoGallery'));
const ImageCarousel = lazy(() => import('../components/media/ImageCarousel'));

const MediaSkeleton = () => (
    <div className="w-full rounded-3xl bg-white/5 border border-white/10 animate-pulse flex items-center justify-center"
        style={{ paddingBottom: '45%' }}>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-cny-gold/30 border-t-cny-gold animate-spin" />
        </div>
    </div>
);

const LandingPage: React.FC = () => {
    const [footerQr, setFooterQr] = useState<string>('');

    useEffect(() => {
        const generateQRs = async () => {
            const qrOptions = {
                width: 120,
                margin: 2,
                color: {
                    dark: '#D4AF37',
                    light: '#00000000'
                }
            };
            try {
                const footer = await QRCode.toDataURL(window.location.href, qrOptions);
                setFooterQr(footer);
            } catch (err) {
                console.error('QR Code generation error:', err);
            }
        };
        generateQRs();
    }, []);

    return (
        <div className="animate-in fade-in duration-700 space-y-10 pb-20">

            {/* Hero Section */}
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/20 bg-black/20">
                <img
                    src="/landing-hero.png"
                    alt="2026 Natick Lunar New Year"
                    className="w-full h-auto max-h-[70vh] object-contain block mx-auto"
                />
            </div>

            {/* Event Overview Metadata */}
            <div className="px-2">
                <div className="glass-dark rounded-[2.5rem] p-4 sm:p-6 border border-white/10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 shadow-xl">
                    <a
                        href="https://maps.google.com/?q=Natick+High+School,+15+West+St,+Natick,+MA+01760"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 group hover:scale-[1.02] transition-transform"
                    >
                        <div className="w-10 h-10 bg-cny-gold/20 text-cny-gold rounded-xl flex items-center justify-center border border-cny-gold/30 group-hover:bg-cny-gold group-hover:text-cny-dark transition-colors">
                            <CalendarDays className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-black text-sm sm:text-base leading-tight">2026年3月8日 星期日</span>
                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">March 8, 2026 · Natick High School</span>
                        </div>
                    </a>

                    <div className="hidden sm:block w-px h-8 bg-white/10" />

                    <a
                        href="https://maps.google.com/?q=Natick+High+School,+15+West+St,+Natick,+MA+01760"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 group hover:scale-[1.02] transition-transform"
                    >
                        <div className="w-10 h-10 bg-cny-red/20 text-cny-red rounded-xl flex items-center justify-center border border-cny-red/30 group-hover:bg-cny-red group-hover:text-white transition-colors">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-black text-sm sm:text-base leading-tight">纳迪克高中礼堂</span>
                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Natick High School Auditorium</span>
                        </div>
                    </a>
                </div>
            </div>

            {/* ── Thank You Banner (replaces old ticketing card) ── */}
            <div className="px-2">
                <div className="relative glass-dark rounded-[2.5rem] p-8 sm:p-10 border border-cny-gold/20 overflow-hidden shadow-2xl shadow-cny-gold/10">
                    {/* Shimmering background accent */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cny-gold/10 via-transparent to-cny-red/10 pointer-events-none" />
                    <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-cny-gold/5 blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 text-center sm:text-left">
                        {/* Icon */}
                        <div className="w-20 h-20 shrink-0 bg-gradient-to-br from-cny-gold to-orange-400 text-cny-dark rounded-3xl flex items-center justify-center shadow-xl rotate-3">
                            <Heart className="w-10 h-10 fill-current" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    感谢大家的参与！
                                </h2>
                                <span className="bg-gradient-to-r from-cny-gold to-orange-400 text-cny-dark px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    EVENT COMPLETE ✓
                                </span>
                            </div>
                            <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-2xl">
                                The 2026 Natick Lunar New Year Gala was a beautiful celebration of culture and community.
                                Thank you to every performer, volunteer, sponsor, and guest who made it unforgettable.&nbsp;
                                <span className="text-cny-gold font-bold">马到成功！🐎</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Video Gallery ── */}
            <div className="px-2">
                <div className="glass-dark rounded-[2.5rem] p-6 sm:p-10 border border-white/10 overflow-hidden shadow-xl">
                    <Suspense fallback={<MediaSkeleton />}>
                        <VideoGallery />
                    </Suspense>
                </div>
            </div>

            {/* ── Image Carousel ── */}
            <div className="px-2">
                <div className="glass-dark rounded-[2.5rem] p-6 sm:p-10 border border-white/10 overflow-hidden shadow-xl">
                    <Suspense fallback={<MediaSkeleton />}>
                        <ImageCarousel />
                    </Suspense>
                </div>
            </div>

            {/* Secondary Grid — Program & Food (archived) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
                {/* Program Card */}
                <Link to="/program" className="group relative glass-dark rounded-[2.5rem] p-8 transition-all hover:scale-[1.02] hover:shadow-2xl border border-white/10 overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Music2 className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-cny-gold text-cny-dark rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:-rotate-6 transition-transform">
                            <Music2 className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">节目单</h3>
                        <p className="text-white/40 text-xs font-medium mb-4 uppercase tracking-widest">Performance Archive</p>
                        <div className="flex items-center text-cny-gold gap-2 font-bold text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                            查看回顾 View <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </Link>

                {/* Food Card */}
                <Link to="/food" className="group relative glass-dark rounded-[2.5rem] p-8 transition-all hover:scale-[1.02] hover:shadow-2xl border border-white/10 overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Utensils className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-cny-gold text-cny-dark rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:-rotate-6 transition-transform">
                            <Utensils className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">新春美食</h3>
                        <p className="text-white/40 text-xs font-medium mb-4 uppercase tracking-widest">Food & Snacks Archive</p>
                        <div className="flex items-center text-cny-gold gap-2 font-bold text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                            查看回顾 View <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </Link>
            </div>

            {/* Raffle & Timeline — hidden for now, preserved for next year */}
            {false && (
                <>
                    {/* Raffle and Timeline sections intentionally hidden post-event */}
                    {/* Restore for 2027 gala */}
                </>
            )}

            {/* Staff Portal */}
            <div className="px-2">
                <Link to="/login" className="glass-dark rounded-[2.5rem] p-6 border border-white/10 overflow-hidden relative group hover:shadow-2xl transition-all block">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="w-24 h-24" />
                    </div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-14 h-14 bg-white/10 text-white/60 rounded-2xl flex items-center justify-center group-hover:bg-cny-red/20 group-hover:text-cny-red transition-colors shrink-0">
                            <KeyRound className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1">工作人员入口</h3>
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Staff / Admin / Host Portal</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                </Link>
            </div>

            {/* QR Code Footer */}
            <div className="flex flex-col items-center justify-center pt-4 pb-4 opacity-70 hover:opacity-100 transition-opacity">
                <div className="glass-dark p-3 rounded-2xl border border-white/10 shadow-xl flex flex-col items-center gap-2">
                    {footerQr ? (
                        <img src={footerQr} alt="Page QR Code" className="w-24 h-24 rounded-lg" />
                    ) : (
                        <div className="w-24 h-24 bg-white/5 rounded-lg animate-pulse flex items-center justify-center">
                            <QrCode className="w-8 h-8 text-white/20" />
                        </div>
                    )}
                    <span className="text-[10px] font-bold text-cny-gold/60 uppercase tracking-widest">扫码分享 Share Page</span>
                </div>
            </div>

        </div>
    );
};

export default LandingPage;

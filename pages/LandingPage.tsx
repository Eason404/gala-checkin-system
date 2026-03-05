
import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Music2, Users, Ticket, ArrowRight, Sparkles, AlertCircle, Utensils, Banknote, MapPin, Search } from 'lucide-react';
import { TimelineSection } from '../components/schedule/TimelineSection';

const LandingPage: React.FC = () => {
    return (
        <div className="animate-in fade-in duration-700 space-y-12 pb-20">
            {/* Hero Section */}
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/20 bg-black/20">
                <img
                    src="/landing-hero.png"
                    alt="2026 Natick Lunar New Year"
                    className="w-full h-auto max-h-[70vh] object-contain block mx-auto"
                    onError={(e) => {
                        // Fallback if image is missing
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&q=80&w=2000';
                    }}
                />
            </div>

            {/* Event Overview Metadata */}
            <div className="px-2">
                <div className="glass-dark rounded-[2.5rem] p-4 sm:p-6 border border-white/10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 shadow-xl">
                    <a
                        href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Natick+CNY+Gala+2026&dates=20260308T150000Z/20260308T193000Z&details=Join+us+for+the+Year+of+the+Horse+Gala!&location=Natick+High+School,+15+West+St,+Natick,+MA+01760"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 group hover:scale-[1.02] transition-transform"
                    >
                        <div className="w-10 h-10 bg-cny-gold/20 text-cny-gold rounded-xl flex items-center justify-center border border-cny-gold/30 group-hover:bg-cny-gold group-hover:text-cny-dark transition-colors">
                            <CalendarDays className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-black text-sm sm:text-base leading-tight">2026年3月8日 星期日</span>
                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">March 8, 2026 (Sun) · 10:00 - 14:30</span>
                        </div>
                    </a>

                    <div className="hidden sm:block w-px h-8 bg-white/10"></div>

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
                            <span className="text-white font-black text-sm sm:text-base leading-tight">纳提克高中礼堂</span>
                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Natick High School Auditorium</span>
                        </div>
                    </a>
                </div>
            </div>

            {/* Content Modules Hierarchy */}
            <div className="flex flex-col gap-6 px-2">

                {/* 1. Primary Highlight (Full Width) */}
                {/* Registration Card (Walk-in Encouraged) */}
                <div className="group relative glass-dark rounded-[2.5rem] p-8 border border-white/10 overflow-hidden shadow-2xl shadow-cny-red/10">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Ticket className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-cny-gold text-cny-dark rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Ticket className="w-7 h-7" />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-3 mb-1">
                                        <h3 className="text-2xl sm:text-3xl font-bold text-white">现场购票</h3>
                                        <span className="bg-gradient-to-r from-cny-red to-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-[pulse_2s_ease-in-out_infinite]">
                                            WALK-INS WELCOME
                                        </span>
                                    </div>
                                    <p className="text-white/60 text-xs sm:text-sm font-medium uppercase tracking-widest">Early Bird Sold Out</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cny-gold/20 text-cny-gold rounded-full text-[10px] font-bold uppercase tracking-wider border border-cny-gold/30">
                                    <Banknote className="w-3 h-3" /> 仅限现金 Cash Only
                                </span>
                            </div>

                            <p className="text-sm sm:text-base text-white/80 font-medium mb-6 md:mb-0 max-w-xl leading-relaxed">
                                <span className="block mb-2 font-bold">感谢支持！早鸟票已售罄。欢迎活动当天现场入场 ($20)。</span>
                                <span className="block text-white/60 text-sm">Thank you for your support! Walk-in admission is $20. Enjoy full access to crafting, performances, and lunch.</span>
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[200px]">
                            <button
                                onClick={() => {
                                    document.getElementById('timeline-section')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="flex items-center justify-center p-4 bg-cny-gold hover:bg-yellow-400 text-cny-dark rounded-2xl font-black text-sm transition-all shadow-lg hover:shadow-xl group/btn2"
                            >
                                流程安排 Schedule <ArrowRight className="w-4 h-4 ml-1 group-hover/btn2:translate-y-1 rotate-90 transition-transform" />
                            </button>

                            <Link to="/manage" className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/15 rounded-2xl border border-white/20 transition-all group/btn">
                                <div className="flex items-center gap-2">
                                    <Search className="w-4 h-4 text-white/60 group-hover/btn:text-white transition-colors" />
                                    <span className="block text-white/80 font-bold text-xs tracking-tight group-hover/btn:text-white transition-colors">查询 / 取消预约 My Reservation</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/40 group-hover/btn:translate-x-1 group-hover/btn:text-white transition-all" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. Secondary Grid (2 Columns) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Program Card */}
                    <Link to="/program" className="group relative glass-dark rounded-[2.5rem] p-8 transition-all hover:scale-[1.02] hover:shadow-2xl border border-white/10 overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Music2 className="w-24 h-24" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-cny-gold text-cny-dark rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:-rotate-6 transition-transform">
                                <Music2 className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">节目单</h3>
                            <p className="text-white/60 text-sm font-medium mb-4 uppercase tracking-widest">Performances</p>
                            <div className="flex items-center text-cny-gold gap-2 font-bold text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                查看详情 View <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </Link>

                    {/* Food & Snacks Card (Coming Soon) */}
                    <div className="group relative glass-dark rounded-[2.5rem] p-8 border border-white/10 overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-gray-500 to-gray-700 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-[pulse_3s_ease-in-out_infinite] z-20 border border-white/10">
                            COMING SOON
                        </div>
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Utensils className="w-24 h-24" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-white/5 text-white/40 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <Utensils className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-white/60 mb-2">新春美食</h3>
                            <p className="text-white/40 text-sm font-medium mb-4 uppercase tracking-widest">Food & Snacks</p>

                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cny-gold/20 text-cny-gold rounded-full text-[10px] font-bold uppercase tracking-wider border border-cny-gold/30">
                                    <Banknote className="w-3 h-3" /> 仅限现金 Cash Only
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 opacity-50 cursor-not-allowed">
                                <span className="block text-white/40 font-bold text-xs tracking-tight">敬请期待 Coming Soon</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Embedded Timeline for Mobile-First Flow */}
            <div id="timeline-section" className="px-2 mt-8">
                <div className="glass-dark rounded-[3rem] p-6 sm:p-12 border border-white/10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <CalendarDays className="w-64 h-64" />
                    </div>
                    <div className="relative z-10 w-full max-w-full overflow-hidden">
                        {/* We override internal TimelineSection text colors for dark mode context */}
                        <div className="[&_h3]:text-white [&_h3_span]:text-white/40 [&_h4]:text-white [&_div.text-gray-500]:text-white/60 [&_p.text-gray-600]:text-white/80 [&_p.text-gray-500]:text-white/60 [&_.bg-white]:bg-white/5 [&_.bg-white]:border-white/10 [&_.border-gray-50]:border-white/10 [&_.bg-gray-50]:bg-white/10 [&_.bg-gray-50]:border-white/10 [&_.text-gray-400]:text-white/60 [&_.text-gray-300]:text-white/20 [&_.bg-gray-100]:bg-white/10 [&_.hover\:border-cny-gold\/30]:hover:border-white/30">
                            <TimelineSection />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tertiary Grid (2 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
                {/* Raffle/Sparkle Teaser */}
                <Link to="/raffle" className="block">
                    <div className="relative glass-dark rounded-[2.5rem] p-8 h-full border border-white/10 overflow-hidden group hover:shadow-2xl transition-all">
                        <div className="absolute inset-0 bg-gradient-to-r from-cny-gold/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 flex flex-col items-center justify-center text-center gap-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-cny-gold to-orange-400 text-cny-dark rounded-3xl flex items-center justify-center shadow-2xl rotate-6 group-hover:rotate-12 transition-transform">
                                <Sparkles className="w-10 h-10" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight mb-2">马年锦鲤抽奖</h2>
                                <p className="text-cny-gold font-bold text-xs uppercase tracking-widest opacity-80">Lucky Raffle</p>
                            </div>
                        </div>
                        <Sparkles className="absolute top-6 right-12 w-8 h-8 text-cny-gold/20 animate-pulse" />
                        <Sparkles className="absolute bottom-8 left-1/4 w-6 h-6 text-cny-gold/10 animate-pulse delay-700" />
                    </div>
                </Link>

                {/* Staff/Admin Group */}
                <div className="glass-dark rounded-[2.5rem] p-8 border border-white/10 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="w-24 h-24" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-white/10 text-white/60 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">内部管理</h3>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Management</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-auto">
                            <Link to="/staff" className="flex flex-col items-center justify-center p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group/staff">
                                <span className="text-white/80 font-bold text-xs mb-1 group-hover/staff:text-white transition-colors tracking-tight">工作人员</span>
                                <span className="text-white/40 text-[9px] font-medium uppercase tracking-tighter">Staff</span>
                            </Link>
                            <Link to="/admin" className="flex flex-col items-center justify-center p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group/observer">
                                <span className="text-white/80 font-bold text-xs mb-1 group-hover/observer:text-white transition-colors tracking-tight">观察员</span>
                                <span className="text-white/40 text-[9px] font-medium uppercase tracking-tighter">Observer</span>
                            </Link>
                            <Link to="/admin" className="flex flex-col items-center justify-center p-3 bg-cny-red/10 hover:bg-cny-red/20 rounded-2xl border border-cny-red/20 transition-all group/admin">
                                <span className="text-cny-red font-bold text-xs mb-1 group-hover/admin:text-red-400 transition-colors tracking-tight">系统管理</span>
                                <span className="text-cny-red/60 text-[9px] font-medium uppercase tracking-tighter">Admin</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;

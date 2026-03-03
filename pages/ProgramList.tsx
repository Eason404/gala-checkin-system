import React, { useState } from 'react';
import { Sparkles, Music2 } from 'lucide-react';

interface Performance {
    typeZh: string;
    typeEn: string;
    titleZh: string;
    titleEn: string;
    artistZh: string;
    artistEn: string;
}

const performances: Performance[] = [
    { typeZh: '歌舞', typeEn: 'Group Singing', titleZh: '我和我的祖国', titleEn: 'My Motherland and Me', artistZh: 'Natick中老年华人居民', artistEn: 'Natick Residents' },
    { typeZh: '朗诵', typeEn: 'Poetry Recitation', titleZh: '水调歌头·明月几时有', titleEn: 'Prelude to Water Melody: When Will the Moon Be Clear and Bright?', artistZh: 'Sunrise Montessori', artistEn: '' },
    { typeZh: '京剧', typeEn: 'Beijing Opera', titleZh: '《野猪林》选段', titleEn: 'Excerpt of Wild Boar Forest', artistZh: '波士顿京剧协会', artistEn: 'Boston Beijing Opera Association' },
    { typeZh: '独舞', typeEn: 'Solo Dance', titleZh: '《鸣唱的鸟儿》', titleEn: 'The Warbling Bird', artistZh: 'Evelyn Wangler', artistEn: '' },
    { typeZh: '团唱', typeEn: 'Group Singing', titleZh: '身边', titleEn: 'By Your Side', artistZh: '张龙, 姜晖', artistEn: 'Long Zhang, Hui Jiang' },
    { typeZh: '四重奏', typeEn: 'Quartet', titleZh: '莫扎特的嬉游曲 + 圣-桑 天鹅', titleEn: 'Mozart Divertimento + Saint-Saëns Swan', artistZh: 'NeoWave音乐工作室', artistEn: 'NeoWave Music Studio' },
    { typeZh: '歌曲串烧', typeEn: 'Song Medley', titleZh: '听我说谢谢你 + 帽衫 + 恭喜恭喜', titleEn: 'Chinese Song Medley', artistZh: 'Natick初中中文班', artistEn: 'Natick Middle School Chinese Class' },
    { typeZh: '团舞', typeEn: 'Group Dance', titleZh: '独一无二', titleEn: 'Style', artistZh: 'CJTDreamDance梦舞团', artistEn: 'CJTDreamDance' },
    { typeZh: '乐器', typeEn: 'Instrument', titleZh: '茉莉芬芳', titleEn: 'Fragrance of Jasmine', artistZh: '江浅之, 胡舍余', artistEn: 'Qianzhi Jiang, Sheyu Hu' },
    { typeZh: '团舞', typeEn: 'Group Dance', titleZh: '葡萄熟了', titleEn: 'When the Grapes Are Ripe', artistZh: '天使舞团', artistEn: 'Angel Dance' },
    { typeZh: '独唱', typeEn: 'Singing', titleZh: '大鱼', titleEn: 'The Giant Fish', artistZh: '余佩文', artistEn: 'Peiwen Yu' },
    { typeZh: '团舞', typeEn: 'Group Dance', titleZh: '街舞串烧', titleEn: 'Street Dance Medley', artistZh: 'Abostract 舞团', artistEn: 'Abostract Dance Team' },
    { typeZh: '男高音独唱', typeEn: 'Tenor Solo', titleZh: '我的太阳', titleEn: 'My Sun', artistZh: '新世界音乐舞蹈学校', artistEn: 'New World Music & Dance School' },
    { typeZh: '诗歌', typeEn: 'Recitation', titleZh: '中文语言艺术', titleEn: 'Chinese Language Art', artistZh: 'Thriving Kids Academy (TKA)', artistEn: 'TKA' },
    { typeZh: '独舞', typeEn: 'Solo Dance', titleZh: '盛世敦煌', titleEn: 'Glorious DunHuang', artistZh: '傅静雯舞苑', artistEn: 'FJW Dance Academy' },
];

const hexColors: Record<string, string> = {
    '歌舞': '#f43f5e', // rose-500
    '四重奏': '#f59e0b', // amber-500
    '朗诵': '#0ea5e9', // sky-500
    '诗歌': '#8b5cf6', // violet-500
    '京剧': '#b91c1c', // red-700
    '独舞': '#a855f7', // purple-500
    '团唱': '#14b8a6', // teal-500
    '团舞': '#ec4899', // pink-500
    '歌曲串烧': '#f97316', // orange-500
    '乐器': '#10b981', // emerald-500
    '独唱': '#6366f1', // indigo-500
    '街舞串烧': '#0891b2', // cyan-600
    '男高音独唱': '#2563eb', // blue-600
};

const ProgramCard: React.FC<{ perf: Performance; idx: number; colorHex: string }> = ({ perf, idx, colorHex }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const displayArtistEn = perf.artistEn && perf.artistEn !== perf.artistZh ? perf.artistEn : '';

    return (
        <div
            className="w-full cursor-pointer mb-5"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ perspective: '1000px' }}
        >
            <div
                className="grid transition-transform duration-500"
                style={{
                    transformStyle: 'preserve-3d',
                    WebkitTransformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
            >
                {/* Front (Title) */}
                <div
                    className="bg-gradient-to-r from-cny-red to-red-900 rounded-2xl shadow-md flex border border-cny-gold/30 overflow-hidden min-h-[110px]"
                    style={{
                        gridArea: '1 / 1',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                    }}
                >
                    {/* Sidebar: Program Type Section */}
                    <div
                        className="w-12 sm:w-14 flex-shrink-0 flex flex-col items-center justify-between py-3 text-white shadow-[inset_-2px_0_6px_rgba(0,0,0,0.2)] border-r border-cny-gold/20"
                        style={{ backgroundColor: colorHex }}
                    >
                        <span className="text-[10px] font-black opacity-80">{idx + 1}</span>
                        <span
                            className="text-[12px] font-bold font-serif tracking-widest drop-shadow-md"
                            style={{ writingMode: 'vertical-rl', WebkitWritingMode: 'vertical-rl' }}
                        >
                            {perf.typeZh}
                        </span>
                    </div>

                    {/* Main Content Area: Left-Right Bilingual Split */}
                    <div className="flex-1 flex min-w-0 relative">
                        {/* Glow effect */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -ml-10 -mt-10 pointer-events-none"></div>

                        {/* Centered Vertical gold divider */}
                        <div className="absolute left-1/2 top-3 bottom-3 w-[1px] bg-gradient-to-b from-transparent via-cny-gold/30 to-transparent z-0"></div>

                        {/* Left Side: Chinese Content */}
                        <div className="w-1/2 p-3 pr-4 flex items-center min-w-0 relative z-10">
                            <h3 className="text-base font-bold font-serif text-white tracking-wide leading-tight drop-shadow-sm break-words">
                                {perf.titleZh}
                            </h3>
                        </div>

                        {/* Right Side: English Content */}
                        <div className="w-1/2 p-3 pl-4 flex flex-col justify-center min-w-0 relative z-10">
                            <div className="text-[8px] font-black text-cny-gold/80 uppercase tracking-widest mb-1 truncate">
                                {perf.typeEn}
                            </div>
                            <p className="text-[11px] font-medium font-sans text-white/90 leading-snug break-words">
                                {perf.titleEn}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Back (Artist/Performers) */}
                <div
                    className="bg-gradient-to-r from-red-900 to-cny-dark rounded-2xl shadow-md flex border border-cny-gold/30 overflow-hidden min-h-[110px]"
                    style={{
                        gridArea: '1 / 1',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                    }}
                >
                    {/* Sidebar: Label Header */}
                    <div
                        className="w-12 sm:w-14 flex-shrink-0 flex flex-col items-center justify-center py-3 text-cny-gold bg-black/20 shadow-[inset_-2px_0_6px_rgba(0,0,0,0.2)] border-r border-cny-gold/20"
                    >
                        <span
                            className="text-[9px] font-black uppercase rotate-180 tracking-[0.2em] opacity-80 drop-shadow-sm"
                            style={{ writingMode: 'vertical-rl', WebkitWritingMode: 'vertical-rl' }}
                        >
                            Performers
                        </span>
                    </div>

                    {/* Content Area: Left-Right Bilingual Split */}
                    <div className="flex-1 flex min-w-0 relative">
                        {/* Glow effect */}
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-cny-gold/5 rounded-full blur-2xl -mr-10 -mb-10 pointer-events-none"></div>

                        {/* Centered Vertical gold divider */}
                        <div className="absolute left-1/2 top-4 bottom-4 w-[1px] bg-gradient-to-b from-transparent via-cny-gold/30 to-transparent z-0"></div>

                        {/* Left Side: Chinese Content */}
                        <div className="w-1/2 p-3 pr-4 flex items-center min-w-0 relative z-10">
                            <div className="text-sm font-bold font-serif text-white leading-snug drop-shadow-sm break-words">
                                {perf.artistZh}
                            </div>
                        </div>

                        {/* Right Side: English Content */}
                        <div className="w-1/2 p-3 pl-4 flex flex-col justify-center min-w-0 relative z-10">
                            <div className="text-[8px] font-black text-cny-gold/60 uppercase tracking-widest mb-1">
                                P-{idx + 1}
                            </div>
                            {displayArtistEn && (
                                <div className="text-[11px] font-medium font-sans text-white/80 leading-snug break-words line-clamp-2">
                                    {displayArtistEn}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProgramList: React.FC = () => {
    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 antialiased">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-cny-red/10 text-cny-red px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                    <Music2 className="w-3.5 h-3.5" />
                    Performance Lineup
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-1">
                    节目单 (Program)
                </h1>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                    2026 Gala Performance
                </p>
            </div>

            {/* Time & Location Banner */}
            <div className="mb-6 bg-gradient-to-r from-cny-red to-red-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="relative z-10 text-center sm:text-left w-full">
                    <p className="text-cny-gold text-[10px] font-bold uppercase tracking-[0.15em] mb-1">1:00 PM – 2:30 PM • NHS Auditorium</p>
                    <p className="text-white/90 text-xs font-medium">点击节目查看详细表演者 (Tap cards for details)</p>
                </div>
            </div>

            {/* Performance List */}
            <div className="px-1">
                {performances.map((perf, idx) => {
                    const colorHex = hexColors[perf.typeZh] || '#9ca3af';
                    return <ProgramCard key={idx} perf={perf} idx={idx} colorHex={colorHex} />;
                })}
            </div>

            {/* Footer */}
            <div className="mt-10 text-center pb-4">
                <div className="inline-flex items-center gap-2 text-gray-300 text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-cny-gold" />
                    <span>节目顺序以当天实际演出为准 (Programme order subject to change)</span>
                    <Sparkles className="w-4 h-4 text-cny-gold" />
                </div>
            </div>
        </div>
    );
};

export default ProgramList;

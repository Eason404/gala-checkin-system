import React from 'react';
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
    { typeZh: '四重奏', typeEn: 'Quartet', titleZh: '莫扎特的嬉游曲 + 圣-桑 天鹅', titleEn: 'Mozart Divertimento + Saint-Saëns Swan', artistZh: 'Monica Li, Angelina Huang, Nina Li, Daming Li', artistEn: '' },
    { typeZh: '朗诵', typeEn: 'Poetry Recitation', titleZh: '水调歌头·明月几时有', titleEn: 'Prelude to Water Melody: When Will the Moon Be Clear and Bright?', artistZh: 'Sunrise Montessori', artistEn: '' },
    { typeZh: '京剧', typeEn: 'Beijing Opera', titleZh: '《野猪林》选段', titleEn: 'Excerpt of Wild Boar Forest', artistZh: '波士顿京剧协会', artistEn: 'Boston Beijing Opera Association' },
    { typeZh: '独舞', typeEn: 'Solo Dance', titleZh: '《鸣唱的鸟儿》', titleEn: 'The Warbling Bird', artistZh: 'Evelyn Wangler', artistEn: '' },
    { typeZh: '团唱', typeEn: 'Group Singing', titleZh: '身边', titleEn: 'By Your Side', artistZh: '张龙, 姜晖', artistEn: 'Long Zhang, Hui Jiang' },
    { typeZh: '团舞', typeEn: 'Group Dance', titleZh: '獨一無二', titleEn: 'Style', artistZh: 'CJTDreamDance梦舞团', artistEn: 'CJTDreamDance' },
    { typeZh: '歌曲串烧', typeEn: 'Song Medley', titleZh: '听我说谢谢你 + 帽衫 + 恭喜恭喜', titleEn: 'Chinese Song Medley', artistZh: 'Natick 初中部学生', artistEn: 'Natick Middle School Chinese Class' },
    { typeZh: '团舞', typeEn: 'Group Dance', titleZh: '葡萄熟了', titleEn: 'When the Grapes Are Ripe', artistZh: '天使舞团', artistEn: 'Angel Dance' },
    { typeZh: '乐器', typeEn: 'Instrument', titleZh: '茉莉芬芳', titleEn: 'Fragrance of Jasmine', artistZh: '江浅之, 胡舍余', artistEn: 'Qianzhi Jiang, Sheyu Hu' },
    { typeZh: '独唱', typeEn: 'Singing', titleZh: '大鱼', titleEn: 'The Giant Fish', artistZh: '余佩文', artistEn: 'Peiwen Yu' },
    { typeZh: '街舞串烧', typeEn: 'Street Dance Medley', titleZh: '街舞串烧', titleEn: 'Street Dance Medley', artistZh: 'Abostract 舞团', artistEn: 'Abostract Dance Team' },
    { typeZh: '男高音独唱', typeEn: 'Tenor Solo', titleZh: '我的太阳', titleEn: 'My Sun', artistZh: '新世界音乐舞蹈学校', artistEn: 'New World Music & Dance School' },
    { typeZh: '诗歌', typeEn: 'Recitation', titleZh: '中文语言艺术', titleEn: 'Chinese Language Art', artistZh: 'Thriving Kids Academy (TKA)', artistEn: 'TKA' },
    { typeZh: '独舞', typeEn: 'Solo Dance', titleZh: '盛世敦煌', titleEn: 'Glorious DunHuang', artistZh: '傅静雯舞苑', artistEn: 'FJW Dance Academy' },
];

const typeColors: Record<string, string> = {
    '歌舞': 'bg-rose-500',
    '四重奏': 'bg-amber-500',
    '朗诵': 'bg-sky-500',
    '京剧': 'bg-red-700',
    '独舞': 'bg-purple-500',
    '团唱': 'bg-teal-500',
    '团舞': 'bg-pink-500',
    '歌曲串烧': 'bg-orange-500',
    '乐器': 'bg-emerald-500',
    '独唱': 'bg-indigo-500',
    '街舞串烧': 'bg-cyan-600',
    '男高音独唱': 'bg-blue-600',
    '诗歌': 'bg-violet-500',
};

const ProgramList: React.FC = () => {
    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 antialiased">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-cny-red/10 text-cny-red px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                    <Music2 className="w-3.5 h-3.5" />
                    Performance Lineup
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-2">
                    节目单
                </h1>
                <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">
                    Gala Performance Programme
                </p>
            </div>

            {/* Time & Location Banner */}
            <div className="mb-10 bg-gradient-to-r from-cny-red to-red-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="relative z-10 text-center sm:text-left w-full">
                    <p className="text-cny-gold text-xs font-bold uppercase tracking-[0.2em] mb-1">1:00 PM – 2:30 PM · Natick High School Auditorium</p>
                    <p className="text-white/80 text-sm font-medium">学校礼堂 · 共 {performances.length} 个精彩节目</p>
                </div>
            </div>

            {/* Performance List */}
            <div className="space-y-4">
                {performances.map((perf, idx) => {
                    const color = typeColors[perf.typeZh] || 'bg-gray-500';
                    const displayArtistEn = perf.artistEn && perf.artistEn !== perf.artistZh ? perf.artistEn : '';
                    return (
                        <div
                            key={idx}
                            className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl p-5 sm:p-7 border border-gray-100 hover:border-cny-gold/30 transition-all duration-300"
                        >
                            <div className="flex items-start gap-4 sm:gap-5">
                                {/* Number */}
                                <div className="flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gray-50 flex items-center justify-center text-sm sm:text-base font-black text-gray-300 group-hover:text-cny-red group-hover:bg-cny-red/5 transition-colors">
                                    {idx + 1}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {/* Type Badge — Chinese + English */}
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className={`${color} text-white text-[10px] font-black tracking-wider px-2.5 py-0.5 rounded-md`}>
                                            {perf.typeZh}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            {perf.typeEn}
                                        </span>
                                    </div>

                                    {/* Titles — Chinese prominent, English below */}
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 tracking-tight group-hover:text-cny-red transition-colors leading-snug">
                                        {perf.titleZh}
                                    </h3>
                                    {perf.titleEn !== perf.titleZh && (
                                        <p className="text-sm text-gray-400 font-medium mt-0.5 leading-snug italic">
                                            {perf.titleEn}
                                        </p>
                                    )}

                                    {/* Artist — Chinese / English */}
                                    <div className="mt-2 pt-2 border-t border-gray-50">
                                        <p className="text-xs sm:text-sm text-gray-500 font-bold leading-relaxed">
                                            {perf.artistZh}
                                        </p>
                                        {displayArtistEn && (
                                            <p className="text-[11px] sm:text-xs text-gray-400 font-medium">
                                                {displayArtistEn}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-10 text-center pb-4">
                <div className="inline-flex items-center gap-2 text-gray-300 text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-cny-gold" />
                    <span>节目顺序以当天实际演出为准</span>
                    <Sparkles className="w-4 h-4 text-cny-gold" />
                </div>
                <p className="text-[10px] text-gray-300 mt-1 font-bold uppercase tracking-widest">
                    Programme order subject to change
                </p>
            </div>
        </div>
    );
};

export default ProgramList;

import React, { useState, useCallback } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { VIDEOS, VideoEntry } from './mediaData';

const VideoGallery: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const activeVideo = VIDEOS[activeIndex];

    const handleSelect = useCallback((index: number) => {
        if (index === activeIndex) return;
        setActiveIndex(index);
        setIsLoaded(false);
    }, [activeIndex]);

    const handlePrev = () => handleSelect((activeIndex - 1 + VIDEOS.length) % VIDEOS.length);
    const handleNext = () => handleSelect((activeIndex + 1) % VIDEOS.length);

    const thumbnailUrl = (v: VideoEntry) =>
        `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`;

    return (
        <div className="flex flex-col gap-4">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        🎬 精彩视频回顾
                    </h2>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">
                        Event Video Highlights
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrev}
                        aria-label="Previous video"
                        className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleNext}
                        aria-label="Next video"
                        className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Player — Facade Pattern */}
            <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
                style={{ paddingBottom: '56.25%' /* 16:9 */ }}>

                {/* Show Static Thumbnail Until User Clicks Play */}
                {!isLoaded ? (
                    <div className="absolute inset-0 group cursor-pointer" onClick={() => setIsLoaded(true)}>
                        <img
                            src={thumbnailUrl(activeVideo)}
                            alt={activeVideo.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        {/* Play Button */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-cny-red/90 hover:bg-cny-red flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform border-4 border-white/30">
                                <Play className="w-9 h-9 text-white fill-white ml-1" />
                            </div>
                            <span className="text-white font-bold text-sm px-4 py-2 bg-black/50 rounded-full backdrop-blur-sm border border-white/10">
                                {activeVideo.title}
                            </span>
                        </div>
                        {/* Video counter badge */}
                        <div className="absolute top-4 right-4 bg-black/60 text-white/80 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                            {activeIndex + 1} / {VIDEOS.length}
                        </div>
                    </div>
                ) : (
                    <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0&vq=hd1080`}
                        title={activeVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                )}
            </div>

            {/* Thumbnail Strip — Horizontally Scrollable */}
            <div className="overflow-x-auto pb-2 -mx-1">
                <div className="flex gap-3 px-1" style={{ minWidth: 'max-content' }}>
                    {VIDEOS.map((v, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelect(i)}
                            title={v.title}
                            className={`
                                relative flex-shrink-0 w-28 rounded-xl overflow-hidden border-2 transition-all
                                ${i === activeIndex
                                    ? 'border-cny-gold shadow-lg shadow-cny-gold/20 scale-105'
                                    : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'
                                }
                            `}
                        >
                            <img
                                src={thumbnailUrl(v)}
                                alt={v.title}
                                className="w-full aspect-video object-cover"
                                loading="lazy"
                            />
                            {/* Title overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-1.5">
                                <span className="text-white text-[9px] font-bold leading-tight line-clamp-2">
                                    {v.title}
                                </span>
                            </div>
                            {/* Active play indicator */}
                            {i === activeIndex && (
                                <div className="absolute top-1 right-1 w-4 h-4 bg-cny-gold rounded-full flex items-center justify-center">
                                    <Play className="w-2 h-2 text-cny-dark fill-cny-dark ml-px" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VideoGallery;

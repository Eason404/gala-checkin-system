import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Images, ExternalLink } from 'lucide-react';
import { DRIVE_IMAGE_IDS, GALLERY_HREF } from './mediaData';

// Google Drive preview URL — renders inside an iframe (CORS permitted by Drive)
const drivePreviewUrl = (fileId: string): string =>
  `https://drive.google.com/file/d/${fileId}/preview`;

const INTERVAL_MS = 4000;

const ImageCarousel: React.FC = () => {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [loaded, setLoaded] = useState<Set<number>>(new Set([0]));
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const total = DRIVE_IMAGE_IDS.length;

    const goTo = useCallback((index: number) => {
        const next = (index + total) % total;
        setCurrent(next);
        // Preload neighbour slides
        setLoaded(prev => {
            const s = new Set(prev);
            s.add(next);
            s.add((next + 1) % total);
            s.add((next - 1 + total) % total);
            return s;
        });
    }, [total]);

    const next = useCallback(() => goTo(current + 1), [current, goTo]);
    const prev = useCallback(() => goTo(current - 1), [current, goTo]);

    // Auto-advance
    useEffect(() => {
        if (total <= 1) return;
        if (isPaused) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }
        intervalRef.current = setInterval(next, INTERVAL_MS);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isPaused, next, total]);

    if (total === 0) return null;

    return (
        <div className="flex flex-col gap-4">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        📸 活动现场照片
                    </h2>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">
                        Event Photo Gallery
                    </p>
                </div>
                {/* View full album — link href is hidden, not shown as text */}
                <a
                    href={GALLERY_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-cny-gold/20 hover:bg-cny-gold/30 text-cny-gold rounded-xl border border-cny-gold/30 text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.03]"
                >
                    <Images className="w-3.5 h-3.5" />
                    <span>查看全部</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
            </div>

            {/* Carousel Frame */}
            <div
                className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/30"
                style={{ paddingBottom: '62%' }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Slides — only render loaded ones, use Drive iframe preview */}
                {DRIVE_IMAGE_IDS.map((id, i) => (
                    loaded.has(i) ? (
                        <div
                            key={id}
                            className={`
                                absolute inset-0 w-full h-full
                                transition-opacity duration-700
                                ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                            `}
                        >
                            <iframe
                                src={drivePreviewUrl(id)}
                                title={`Gala photo ${i + 1}`}
                                className="w-full h-full border-0"
                                allow="autoplay"
                                loading="lazy"
                                style={{ pointerEvents: i === current ? 'none' : 'none' }}
                            />
                        </div>
                    ) : null
                ))}

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

                {/* Pause indicator */}
                {isPaused && (
                    <div className="absolute top-3 left-3 bg-black/50 text-white/70 text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                        ⏸ Paused
                    </div>
                )}

                {/* Counter badge */}
                <div className="absolute top-3 right-3 bg-black/50 text-white/80 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                    {current + 1} / {total}
                </div>

                {/* Nav Arrows */}
                {total > 1 && (
                    <>
                        <button
                            onClick={prev}
                            aria-label="Previous photo"
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white border border-white/10 transition-all hover:scale-110 backdrop-blur-sm"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={next}
                            aria-label="Next photo"
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white border border-white/10 transition-all hover:scale-110 backdrop-blur-sm"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}

                {/* Dot Indicators */}
                {total > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {DRIVE_IMAGE_IDS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                aria-label={`Go to photo ${i + 1}`}
                                className={`
                                    rounded-full transition-all
                                    ${i === current
                                        ? 'w-5 h-2 bg-cny-gold'
                                        : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                                    }
                                `}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Progress bar */}
            {!isPaused && total > 1 && (
                <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                        key={current}
                        className="h-full bg-cny-gold rounded-full"
                        style={{
                            animation: `progress ${INTERVAL_MS}ms linear forwards`
                        }}
                    />
                </div>
            )}

            <style>{`
                @keyframes progress {
                    from { width: 0%; }
                    to   { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default ImageCarousel;

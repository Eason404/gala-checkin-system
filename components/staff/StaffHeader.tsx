
import React from 'react';
import { Sparkles, BarChart3, MapPin } from 'lucide-react';

interface StaffHeaderProps {
  setMode: (mode: any) => void;
  triggerHaptic: (pattern: number) => void;
  onShowWalkInQr?: () => void;
  currentLane?: string;
  setCurrentLane?: (lane: string) => void;
}

const LANES = ['Lane 1', 'Lane 2', 'Lane 3', 'Lane 4', 'VIP/Cast'];

export const StaffHeader: React.FC<StaffHeaderProps> = ({ setMode, triggerHaptic, onShowWalkInQr, currentLane, setCurrentLane }) => {
  const [showLaneDropdown, setShowLaneDropdown] = React.useState(false);

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-cny-gold/20 to-orange-500/20 p-2.5 rounded-2xl border border-cny-gold/30 shadow-inner">
          <Sparkles className="text-cny-gold w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">签到台</h2>
            {currentLane && setCurrentLane && (
              <div className="relative">
                <button
                  onClick={() => setShowLaneDropdown(!showLaneDropdown)}
                  className="flex items-center gap-1 bg-white/10 hover:bg-white/20 transition-colors px-2 py-1 rounded-lg text-xs font-bold text-white border border-white/10"
                >
                  <MapPin className="w-3 h-3 text-cny-gold" />
                  {currentLane}
                </button>
                {showLaneDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 w-32 z-50">
                    <div className="px-3 pb-2 mb-2 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Lane</div>
                    {LANES.map(lane => (
                      <button
                        key={lane}
                        onClick={() => {
                          setCurrentLane(lane);
                          setShowLaneDropdown(false);
                          triggerHaptic(10);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm font-bold transition-colors ${currentLane === lane ? 'bg-cny-red/10 text-cny-red' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                      >
                        {lane}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-cny-gold/80 font-bold uppercase tracking-[0.2em] text-[10px] mt-0.5">Staff Check-in</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => { setMode('dashboard'); triggerHaptic(10); }}
          className="bg-white/10 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg tracking-wider hover:bg-white/20 transition-colors flex items-center gap-1"
        >
          <BarChart3 className="w-4 h-4 mr-1" /> 工作台 <span className="text-sm ml-1">Stats</span>
        </button>
        {onShowWalkInQr && (
          <button
            onClick={onShowWalkInQr}
            className="bg-white/10 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg tracking-wider hover:bg-white/20 transition-colors flex items-center gap-1"
            title="Show Walk-In QR Code"
          >
            现场码 <span className="text-sm ml-1">QR</span>
          </button>
        )}
        <button
          onClick={() => { setMode('walkin'); triggerHaptic(20); }}
          className="bg-cny-gold text-cny-dark px-4 py-2 rounded-xl font-bold text-xs uppercase shadow-lg tracking-wider hover:bg-white transition-colors"
        >
          现场购票 <span className="text-sm ml-1">Walk-In</span>
        </button>
      </div>
    </div>
  );
};

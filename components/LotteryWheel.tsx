import React, { useState, useEffect, useRef } from 'react';
import { getReservations, getTicketConfig, updateLotteryState, subscribeToLotteryState } from '../services/dataService';
import { getCurrentUserRole } from '../services/authService';
import { Reservation, CheckInStatus } from '../types';
import { Gift, Trophy, RefreshCw, Phone, Eye, EyeOff, Crown, Radio } from 'lucide-react';

interface Winner {
  number: string;
  firstName: string;
  phone: string;
}

const PRIZE_TIERS = [
  { id: 'grand', name: '特等奖', label: 'Grand Prize', color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' },
  { id: 'first', name: '一等奖', label: '1st Prize', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  { id: 'second', name: '二等奖', label: '2nd Prize', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  { id: 'third', name: '三等奖', label: '3rd Prize', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
];

const LotteryWheel: React.FC = () => {
  const [candidates, setCandidates] = useState<Winner[]>([]);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState<string>('000');
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(PRIZE_TIERS[3]); // Default to 3rd prize
  const [isAdmin, setIsAdmin] = useState(false);
  
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const role = getCurrentUserRole();
    setIsAdmin(role === 'admin');

    const init = async () => {
      const config = await getTicketConfig();
      setEnabled(!!config.lotteryEnabled);
      
      if (config.lotteryEnabled) {
        const res = await getReservations();
        const validCandidates: Winner[] = [];
        res.forEach(r => {
          if (r.checkInStatus === CheckInStatus.Arrived && r.lotteryNumbers) {
            const firstName = r.contactName.split(' ')[0] || r.contactName;
            r.lotteryNumbers.forEach(num => {
              validCandidates.push({
                number: num,
                firstName: firstName,
                phone: r.phoneNumber
              });
            });
          }
        });
        setCandidates(validCandidates);
      }
      setLoading(false);
    };
    init();

    // Subscribe to live lottery state
    const unsubscribe = subscribeToLotteryState((state) => {
      if (!state) return;
      
      // Update selected prize if changed by admin
      if (state.selectedPrize) {
        const prize = PRIZE_TIERS.find(p => p.id === state.selectedPrize.id);
        if (prize) setSelectedPrize(prize);
      }

      if (state.isSpinning) {
        setIsSpinning(true);
        setWinner(null);
        // Start local animation for everyone
        if (!spinIntervalRef.current) {
          spinIntervalRef.current = setInterval(() => {
            setCurrentDisplay(Math.floor(100 + Math.random() * 899).toString());
          }, 100);
        }
      } else {
        // Stop spinning and show winner
        setIsSpinning(false);
        if (spinIntervalRef.current) {
          clearInterval(spinIntervalRef.current);
          spinIntervalRef.current = null;
        }
        if (state.winner) {
          setWinner(state.winner);
          setCurrentDisplay(state.winner.number);
        }
      }
    });

    return () => {
      unsubscribe();
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    };
  }, []);

  const startSpin = async () => {
    if (candidates.length === 0 || !isAdmin) return;
    
    // Broadcast spinning state
    await updateLotteryState({
      isSpinning: true,
      winner: null,
      selectedPrize,
      timestamp: Date.now()
    });
    
    // Admin handles the actual logic
    setTimeout(async () => {
      const finalWinner = candidates[Math.floor(Math.random() * candidates.length)];
      
      // Broadcast winner
      await updateLotteryState({
        isSpinning: false,
        winner: finalWinner,
        selectedPrize,
        timestamp: Date.now()
      });
    }, 3000); // 3 seconds of spinning
  };

  const handlePrizeChange = async (prize: typeof PRIZE_TIERS[0]) => {
    if (!isAdmin || isSpinning) return;
    setSelectedPrize(prize);
    await updateLotteryState({
      isSpinning: false,
      winner: null,
      selectedPrize: prize,
      timestamp: Date.now()
    });
  };

  const maskPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 4) {
      return `***-***-${digits.slice(-4)}`;
    }
    return '****';
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-cny-red" />
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-6">
          <Gift className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">抽奖功能未开启</h2>
        <p className="text-gray-500 mt-2">请在后台设置中开启此功能</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-center">
      <div className="mb-8 relative">
        {!isAdmin && (
          <div className="absolute top-0 right-0 flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold text-xs animate-pulse">
            <Radio className="w-3 h-3" /> LIVE
          </div>
        )}
        <h1 className="text-5xl md:text-7xl font-black text-cny-red tracking-tighter mb-4 flex items-center justify-center gap-4">
          <Trophy className="w-12 h-12 md:w-16 md:h-16 text-cny-gold" />
          幸运大抽奖
        </h1>
        <p className="text-gray-500 font-bold tracking-[0.2em] uppercase">Lucky Draw</p>
      </div>

      {/* Prize Tier Selector */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {PRIZE_TIERS.map((prize) => (
          <button
            key={prize.id}
            onClick={() => handlePrizeChange(prize)}
            disabled={isSpinning || !isAdmin}
            className={`px-6 py-3 rounded-2xl font-bold text-sm md:text-base border-2 transition-all ${
              selectedPrize.id === prize.id 
                ? `${prize.bg} ${prize.border} ${prize.color} scale-105 shadow-md` 
                : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
            } ${!isAdmin && selectedPrize.id !== prize.id ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-2">
              {prize.id === 'grand' && <Crown className="w-4 h-4" />}
              {prize.name}
            </div>
          </button>
        ))}
      </div>

      <div className={`bg-white p-12 rounded-[3rem] shadow-2xl border-4 ${selectedPrize.border} relative overflow-hidden mb-12 transition-colors duration-500`}>
        <div className={`absolute top-0 left-0 w-full h-2 ${selectedPrize.bg} opacity-50`}></div>
        
        <div className="text-[8rem] md:text-[12rem] font-black text-gray-900 leading-none tracking-tighter tabular-nums mb-8 font-mono">
          {currentDisplay}
        </div>

        {winner && !isSpinning && (
          <div className="animate-in zoom-in slide-in-from-bottom-8 duration-500">
            <div className={`inline-block px-4 py-1 rounded-full ${selectedPrize.bg} ${selectedPrize.color} font-black text-sm tracking-widest uppercase mb-4`}>
              {selectedPrize.name} {selectedPrize.label}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              恭喜 <span className={selectedPrize.color}>{winner.firstName}</span>! 🎉
            </h2>
            <div className="inline-flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-full border border-gray-200">
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="text-xl font-mono font-bold text-gray-600 tracking-wider">
                {isAdmin && showPhone ? winner.phone : maskPhone(winner.phone)}
              </span>
              {isAdmin && (
                <button 
                  onClick={() => setShowPhone(!showPhone)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title={showPhone ? "隐藏号码" : "显示完整号码"}
                >
                  {showPhone ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {isAdmin ? (
        <button 
          onClick={startSpin}
          disabled={isSpinning || candidates.length === 0}
          className={`px-16 py-6 rounded-full text-2xl font-black tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:transform-none disabled:opacity-50 text-white ${
            selectedPrize.id === 'grand' ? 'bg-yellow-500 hover:bg-yellow-600' :
            selectedPrize.id === 'first' ? 'bg-red-500 hover:bg-red-600' :
            selectedPrize.id === 'second' ? 'bg-orange-500 hover:bg-orange-600' :
            'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isSpinning ? '抽奖中...' : `抽取 ${selectedPrize.name}`}
        </button>
      ) : (
        <div className="text-gray-400 font-bold flex items-center justify-center gap-2">
          {isSpinning ? (
            <><RefreshCw className="w-5 h-5 animate-spin" /> 正在抽奖中...</>
          ) : (
            <>等待主持人开始抽奖...</>
          )}
        </div>
      )}

      <p className="mt-8 text-gray-400 font-bold">
        当前奖池人数: {candidates.length}
      </p>
    </div>
  );
};

export default LotteryWheel;

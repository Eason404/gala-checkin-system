import React, { useState, useEffect, useRef } from 'react';
import { getLotteryCandidates, getTicketConfig, updateLotteryState, subscribeToLotteryState } from '../services/dataService';
import { getCurrentUserRole } from '../services/authService';
import { Reservation, CheckInStatus } from '../types';
import { Gift, Trophy, RefreshCw, Crown, Radio } from 'lucide-react';

import { Winner } from '../types';
import { SilkScrollDraw } from './raffle/SilkScrollDraw';

const DEFAULT_PRIZE = { id: 'default', name: '幸运大抽奖', label: 'Lucky Raffle', color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' };

const RaffleWheel: React.FC = () => {
  const [candidates, setCandidates] = useState<Winner[]>([]);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [pastWinners, setPastWinners] = useState<Winner[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState<string>('000');
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canControl, setCanControl] = useState(false); // admin or host
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Derived available candidates pool that excludes already drawn winners
  const availableCandidates = candidates.filter(c =>
    !pastWinners.some(pw => pw.number === c.number)
  );

  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const role = getCurrentUserRole();
    const adminFlag = role === 'admin';
    const controlFlag = role === 'admin' || role === 'host';
    setIsAdmin(adminFlag);
    setCanControl(controlFlag);

    const init = async () => {
      const config = await getTicketConfig();
      setEnabled(!!config.lotteryEnabled);

      if (config.lotteryEnabled && controlFlag) {
        const res = await getLotteryCandidates();
        const validCandidates: Winner[] = [];
        res.forEach(r => {
          if (r.lotteryNumbers) {
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

      if (state.pastWinners) {
        setPastWinners(state.pastWinners);
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
    if (availableCandidates.length === 0 || !canControl) return;

    try {
      // Broadcast spinning state
      await updateLotteryState({
        isSpinning: true,
        winner: null,
        timestamp: Date.now()
      });

      // Admin handles the actual logic
      setTimeout(async () => {
        try {
          const finalWinner = availableCandidates[Math.floor(Math.random() * availableCandidates.length)];
          const updatedPastWinners = [...pastWinners, finalWinner];

          // Broadcast winner
          await updateLotteryState({
            isSpinning: false,
            winner: finalWinner,
            pastWinners: updatedPastWinners,
            timestamp: Date.now()
          });
        } catch (error) {
          console.error("Error during spin resolution:", error);
          await updateLotteryState({ isSpinning: false });
        }
      }, 3000); // 3 seconds of spinning
    } catch (error) {
      console.error("Failed to start spin", error);
      await updateLotteryState({ isSpinning: false });
    }
  };

  const clearWinners = async () => {
    if (!isAdmin) return; // Only admin can clear winners
    await updateLotteryState({
      isSpinning: false,
      winner: null,
      pastWinners: [],
      timestamp: Date.now()
    });
    setShowClearConfirm(false);
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
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="mb-8 p-4 bg-cny-gold/20 rounded-2xl border border-cny-gold max-w-2xl mx-auto">
          <p className="font-bold text-cny-gold text-lg">
            抽奖环节将在演出期间进行 (Raffle game will be live during performance time)
          </p>
          <p className="text-white/60 text-sm mt-1">请耐心等待主持人宣布 (Please wait for the host to announce)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-2 md:py-4 px-2 md:px-4 text-center">
      <div className="mb-4 relative">
        {!canControl && (
          <div className="absolute top-0 right-0 flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold text-xs animate-pulse">
            <Radio className="w-3 h-3" /> 直播 LIVE
          </div>
        )}
      </div>

      {/* Main Animated Draw Component */}
      <SilkScrollDraw
        isSpinning={isSpinning}
        winner={winner}
        currentDisplay={currentDisplay}
        canControl={canControl}
        canRevealPhone={isAdmin}
      />

      {/* Controls: Admin & Host */}
      {canControl ? (
        <div className="flex flex-col items-center gap-4 mt-12 w-full max-w-sm mx-auto">
          <button
            onClick={startSpin}
            disabled={isSpinning || availableCandidates.length === 0}
            className={`w-full py-6 rounded-full text-2xl font-black tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:transform-none disabled:opacity-50 text-white bg-red-600 hover:bg-red-700`}
          >
            {isSpinning ? '抽奖中...' : `开始抽奖 (Start Draw)`}
          </button>

          <div className="flex gap-4 w-full justify-between items-center px-2 mt-1">
            {isSpinning && (
              <button
                onClick={async () => await updateLotteryState({ isSpinning: false })}
                className="text-gray-500 text-sm hover:text-red-500 underline"
              >
                强制停止 (Force Stop)
              </button>
            )}

            {/* Clear winners: admin only */}
            {isAdmin && pastWinners.length > 0 && !isSpinning && !showClearConfirm && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-gray-500 text-sm hover:text-red-500 underline ml-auto"
              >
                清空全部中奖记录 (Clear Winners)
              </button>
            )}
          </div>

          {/* Inline confirmation panel — admin only */}
          {isAdmin && showClearConfirm && (
            <div className="w-full mt-3 p-4 bg-red-950/60 border border-red-700 rounded-2xl text-center">
              <p className="text-red-200 text-sm font-bold mb-1">⚠️ 确认清空所有中奖记录？</p>
              <p className="text-red-300/70 text-xs mb-4">所有人将重新获得中奖资格，此操作不可撤销。</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-5 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20"
                >
                  取消
                </button>
                <button
                  onClick={clearWinners}
                  className="px-5 py-2 rounded-full bg-red-600 text-white text-sm font-bold hover:bg-red-500"
                >
                  确认清空
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-400 font-bold mt-12 flex items-center justify-center gap-2">
          {isSpinning ? (
            <><RefreshCw className="w-5 h-5 animate-spin" /> 正在抽奖中... (Spinning...)</>
          ) : (
            <>等待主持人开始抽奖... (Waiting for host...)</>
          )}
        </div>
      )}

      <p className="mt-8 text-gray-400 font-bold mb-12 flex flex-col items-center gap-1">
        <span>当前剩余奖池人数 (Entries Left): {availableCandidates.length}</span>
        <span className="text-xs font-normal opacity-70">总参与人数 (Total): {candidates.length}</span>
      </p>

      {/* Past Winners Display Area */}
      {pastWinners.length > 0 && (
        <div className="mt-12 bg-white/5 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/10 max-w-3xl mx-auto shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-cny-gold font-bold text-xl md:text-2xl mb-6 tracking-widest flex items-center justify-center gap-2">
            <Gift className="w-6 h-6" /> 已中奖名单 (Past Winners)
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {pastWinners.map((w, idx) => (
              <div key={`${w.number}-${idx}`} className="px-4 py-2 bg-gradient-to-br from-red-900 to-red-800 rounded-lg text-yellow-100 font-bold text-sm md:text-base border border-red-500/30 flex items-center gap-2 shadow-md">
                <Crown className="w-3 h-3 text-yellow-500" />
                <span>{w.firstName}</span>
                {canControl && (
                  <span className="text-yellow-200/50 text-xs font-mono ml-1">
                    {isAdmin ? w.phone : maskPhone(w.phone)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RaffleWheel;

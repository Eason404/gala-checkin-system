
import React, { useState, useEffect, useRef } from 'react';
import { getReservations, updateReservation, createReservation, generateLotteryNumber } from '../services/dataService';
import { Reservation, TicketType, PaymentStatus, CheckInStatus, PaymentMethod } from '../types';
// Fixed: Added missing 'Sparkles' icon to the lucide-react import list
import { Search, UserPlus, DollarSign, Check, ChevronLeft, User, Users, Ticket, Info, CheckCircle, Loader2, Calculator, Banknote, X, AlertCircle, ScanLine, QrCode, Camera, ArrowRight, RefreshCw, Sparkles, AlertTriangle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

const ConfettiBurst = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-20px',
            backgroundColor: ['#10B981', '#34D399', '#FCE7BB', '#FFD700'][Math.floor(Math.random() * 4)],
            animation: `confetti-fall ${0.8 + Math.random() * 1.5}s linear forwards`,
            animationDelay: `${Math.random() * 0.3}s`,
            width: `${8 + Math.random() * 8}px`,
            height: `${8 + Math.random() * 8}px`,
          }}
        />
      ))}
    </div>
  );
};

const StaffPortal: React.FC = () => {
  // Mode: 'search' | 'result' | 'walkin' | 'scanner' | 'success' | 'already_checked_in'
  const [mode, setMode] = useState<'search' | 'result' | 'walkin' | 'scanner' | 'success' | 'already_checked_in'>('search');
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchName, setSearchName] = useState('');
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Payment Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [cashTendered, setCashTendered] = useState('');

  // Walk-in form
  const [walkInForm, setWalkInForm] = useState({ name: '', phone: '', adults: 1, children: 0 });
  const [walkInError, setWalkInError] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const cashInputRef = useRef<HTMLInputElement>(null);

  const triggerHaptic = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  };

  const refreshData = async () => {
    setLoading(true);
    const data = await getReservations();
    setReservations(data);
    setLoading(false);
  };

  useEffect(() => { refreshData(); }, []);

  useEffect(() => {
    if (mode === 'search' && searchInputRef.current) searchInputRef.current.focus();
  }, [mode]);

  useEffect(() => {
    if (showPayModal && cashInputRef.current) cashInputRef.current.focus();
  }, [showPayModal]);

  // Scanner Logic
  useEffect(() => {
    if (showScanner) {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: 250 },
        (text) => {
          triggerHaptic([50, 30, 50]);
          stopScanner();
          executeSearch(text);
        },
        () => {}
      ).catch(() => setShowScanner(false));
      return () => { stopScanner(); };
    }
  }, [showScanner]);

  const stopScanner = async () => {
    if (html5QrCodeRef.current?.isScanning) {
      await html5QrCodeRef.current.stop();
    }
    setShowScanner(false);
  };

  const executeSearch = async (termOverride?: string) => {
    setErrorMsg('');
    const term = (termOverride || searchPhone).trim();
    if (term.length < 4 && !searchName) return setErrorMsg('信息太短');

    setLoading(true);
    const data = await getReservations();
    const isId = term.toUpperCase().startsWith('CNY26-');
    const found = data.find(r => 
      (isId ? r.id === term.toUpperCase() : r.phoneNumber.includes(term)) ||
      (searchName && r.contactName.toLowerCase().includes(searchName.toLowerCase()))
    );
    setLoading(false);

    if (found) {
      if (found.checkInStatus === CheckInStatus.Cancelled) {
        setErrorMsg('此票已取消 (Cancelled)');
        triggerHaptic([50, 100, 50]);
        return;
      }

      // 核心修改：检查是否已签到
      if (found.checkInStatus === CheckInStatus.Arrived) {
        setSelectedRes(found);
        setMode('already_checked_in');
        triggerHaptic([30, 50, 30, 50, 30]); // 警示震动
        setSearchPhone('');
        setSearchName('');
        return;
      }

      setSelectedRes(found);
      setMode('result');
      setSearchPhone('');
      setSearchName('');
    } else {
      setErrorMsg('未找到有效记录');
      triggerHaptic([50, 100]);
    }
  };

  const handleFamilyCheckIn = async () => {
    if (!selectedRes) return;
    setLoading(true);
    const count = selectedRes.totalPeople;
    const currentLottery = selectedRes.lotteryNumbers || [];
    const newLottery = [...currentLottery];
    while (newLottery.length < count) newLottery.push(generateLotteryNumber());

    const updates: Partial<Reservation> = {
      checkInStatus: CheckInStatus.Arrived,
      paymentStatus: PaymentStatus.Paid,
      paymentMethod: PaymentMethod.Cash,
      paidAmount: selectedRes.totalAmount,
      lotteryNumbers: newLottery
    };

    try {
      await updateReservation(selectedRes.id, updates, selectedRes.firebaseDocId);
      triggerHaptic([100, 50, 100]);
      setSelectedRes({ ...selectedRes, ...updates });
      setMode('success'); // 进入成功总结页面
      setShowPayModal(false);
    } catch (e) {
      setErrorMsg('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const resetToNext = () => {
    setSelectedRes(null);
    setSearchPhone('');
    setSearchName('');
    setMode('search');
    // 如果需要连续扫码，可以直接打开扫码器
    setShowScanner(true);
  };

  const totalDue = selectedRes?.totalAmount || 0;
  const changeDue = Number(cashTendered) - totalDue;

  return (
    <div className="max-w-xl mx-auto pb-24 px-4">
      {/* 顶部状态栏 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Sparkles className="text-cny-gold w-5 h-5" /> 签到台 Staff
        </h2>
        <button onClick={() => { setMode('walkin'); triggerHaptic(20); }} className="bg-cny-gold text-cny-dark px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg">
          现场购票 Walk-In
        </button>
      </div>

      {/* 搜索模式 */}
      {mode === 'search' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border-t-8 border-cny-red">
            <div className="relative mb-4">
              <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input 
                ref={searchInputRef}
                placeholder="手机号或ID (Phone or ID)" 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl font-black text-lg outline-none border-2 border-transparent focus:border-cny-red transition-all"
                value={searchPhone}
                onChange={e => setSearchPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && executeSearch()}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowScanner(true)} className="flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase transition active:scale-95">
                <Camera className="w-4 h-4" /> 扫码扫描
              </button>
              <button onClick={() => executeSearch()} className="flex items-center justify-center gap-2 py-4 bg-cny-red text-white rounded-2xl font-black text-xs uppercase transition active:scale-95">
                <Search className="w-4 h-4" /> 搜索记录
              </button>
            </div>
            {errorMsg && <p className="text-center text-red-500 text-[10px] font-black mt-4 uppercase animate-shake">{errorMsg}</p>}
          </div>
        </div>
      )}

      {/* 扫码弹出层 */}
      {showScanner && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-black uppercase tracking-widest">扫描中...</h3>
            <button onClick={stopScanner} className="text-white/40"><X className="w-8 h-8" /></button>
          </div>
          <div id="qr-reader" className="w-full aspect-square rounded-3xl overflow-hidden bg-white/5 border-4 border-white/10" />
          <p className="mt-8 text-white/40 text-center text-xs font-bold">请对准纸质或电子二维码</p>
        </div>
      )}

      {/* 警示：已签到模式 */}
      {mode === 'already_checked_in' && selectedRes && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-t-8 border-orange-500">
            <div className="p-8 text-center">
               <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10 text-orange-500" />
               </div>
               <h3 className="text-2xl font-black text-gray-900 mb-2">已签到! (Checked In)</h3>
               <p className="text-sm font-bold text-gray-400">请勿重复放行 / Duplicate Scan</p>
               
               <div className="my-8 bg-gray-50 rounded-2xl p-6 text-left border border-gray-100">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Guest</span>
                     <span className="font-black text-gray-900">{selectedRes.contactName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Size</span>
                     <span className="font-black text-gray-900">{selectedRes.totalPeople} 人 (People)</span>
                  </div>
               </div>

               <button 
                onClick={resetToNext}
                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
              >
                <span>好的, 下一位 OK, Next</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 结果展示模式 */}
      {mode === 'result' && selectedRes && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-t-8 border-cny-red">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{selectedRes.contactName}</h3>
                  <p className="text-sm font-bold text-gray-400 font-mono tracking-tighter mt-1">{selectedRes.phoneNumber} · {selectedRes.id}</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-gray-300 uppercase mb-1">应收 (Total)</div>
                  <div className="text-3xl font-black text-cny-red">${selectedRes.totalAmount}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">成人 Adults</span>
                  <span className="text-xl font-black">{selectedRes.adultsCount}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">儿童 Kids</span>
                  <span className="text-xl font-black">{selectedRes.childrenCount}</span>
                </div>
              </div>

              <button 
                onClick={() => setShowPayModal(true)} 
                className="w-full py-5 bg-cny-red text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all"
              >
                <Banknote className="w-6 h-6" /> 收款并签到
              </button>
              
              <button onClick={() => setMode('search')} className="w-full py-3 text-gray-400 font-black text-[10px] uppercase tracking-widest">
                返回重试 Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 支付计算器弹出层 */}
      {showPayModal && selectedRes && (
        <div className="fixed inset-0 bg-cny-dark/90 backdrop-blur-xl z-[110] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-cny-red p-6 text-white text-center">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">应收金额 Total Due</span>
              <div className="text-5xl font-black mt-2">${selectedRes.totalAmount}</div>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">实收现金 Cash Received</label>
                <input 
                  ref={cashInputRef}
                  type="number" 
                  className="w-full p-4 bg-gray-50 rounded-2xl font-black text-2xl border-2 border-transparent focus:border-cny-red outline-none"
                  value={cashTendered}
                  onChange={e => setCashTendered(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className={`p-6 rounded-2xl text-center border-2 transition-all ${Number(cashTendered) >= selectedRes.totalAmount ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">找零 Change</span>
                <div className={`text-4xl font-black mt-1 ${Number(cashTendered) >= selectedRes.totalAmount ? 'text-green-600' : 'text-gray-300'}`}>
                  ${Math.max(0, changeDue)}
                </div>
              </div>
              <button 
                disabled={Number(cashTendered) < selectedRes.totalAmount}
                onClick={handleFamilyCheckIn}
                className="w-full py-5 bg-cny-red text-white rounded-2xl font-black text-lg shadow-xl disabled:opacity-30 disabled:grayscale transition-all"
              >
                确认收款并完成签到
              </button>
              <button onClick={() => setShowPayModal(false)} className="w-full text-[10px] font-black text-gray-300 uppercase tracking-widest">取消 Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 签到成功总结 - 提高连续操作的关键 */}
      {mode === 'success' && selectedRes && (
        <div className="animate-in fade-in zoom-in duration-500">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 text-center border-t-8 border-green-500 relative overflow-hidden">
            <ConfettiBurst />
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 animate-bounce">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 relative z-10">签到成功!</h3>
            <p className="text-xs font-bold text-gray-400 uppercase mb-8 relative z-10">Confirmed for {selectedRes.contactName}</p>
            
            <div className="space-y-3 mb-10 relative z-10">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">分配抽奖号 (Raffle Tickets)</span>
              <div className="flex flex-wrap justify-center gap-2">
                {selectedRes.lotteryNumbers?.map(n => (
                  <span key={n} className="bg-cny-gold text-cny-red px-4 py-2 rounded-xl font-black text-xl border border-cny-red/20 shadow-sm">{n}</span>
                ))}
              </div>
            </div>

            <button 
              onClick={resetToNext}
              className="w-full py-6 bg-gray-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all relative z-10"
            >
              <span>扫描下一位 Next Guest</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPortal;

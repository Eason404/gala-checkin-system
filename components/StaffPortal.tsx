
import React, { useState, useEffect, useRef } from 'react';
import { getReservations, updateReservation, createReservation, generateLotteryNumber } from '../services/dataService';
import { Reservation, TicketType, PaymentStatus, CheckInStatus, PaymentMethod } from '../types';
import { Search, UserPlus, DollarSign, Check, ChevronLeft, User, Users, Ticket, Info, CheckCircle, Loader2, Calculator, Banknote, X, AlertCircle, ScanLine, QrCode, Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

const StaffPortal: React.FC = () => {
  // Mode: 'search' (default) | 'result' | 'walkin' | 'scanner'
  const [mode, setMode] = useState<'search' | 'result' | 'walkin' | 'scanner'>('search');
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchName, setSearchName] = useState('');
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Payment Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [cashTendered, setCashTendered] = useState('');

  // Walk-in form state
  const [walkInForm, setWalkInForm] = useState({ name: '', phone: '', adults: 1, children: 0 });
  const [walkInError, setWalkInError] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const cashInputRef = useRef<HTMLInputElement>(null);

  // Load Data
  const refreshData = async () => {
    setLoading(true);
    const data = await getReservations();
    setReservations(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Auto-focus search input when switching to search mode
  useEffect(() => {
    if (mode === 'search' && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [mode]);

  // Auto-focus cash input when modal opens
  useEffect(() => {
    if (showPayModal && cashInputRef.current) {
      cashInputRef.current.focus();
    }
  }, [showPayModal]);

  // Scanner Lifecycle
  useEffect(() => {
    if (showScanner) {
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // Success
          stopScanner();
          executeSearch(decodedText);
        },
        (errorMessage) => {
          // Failure to find a QR code in this frame - silent
        }
      ).catch(err => {
        console.error("Scanner start error:", err);
        setScannerError("无法访问摄像头 (Could not access camera)");
      });

      return () => {
        stopScanner();
      };
    }
  }, [showScanner]);

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.error("Scanner stop error:", e);
      }
    }
    setShowScanner(false);
  };

  // Phone Formatter
  const formatPhoneDisplay = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return val;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchPhone(val);
    
    // Auto-detect public ID (CNY26-XXXX) which often comes from QR scanners
    if (val.toUpperCase().startsWith('CNY26-') && val.length >= 10) {
        executeSearch(val);
    }
  };

  // Search Logic
  const executeSearch = async (overridePhone?: string, overrideName?: string) => {
    setErrorMsg('');
    let term = (overridePhone || searchPhone).trim();
    const isPublicId = term.toUpperCase().startsWith('CNY26-');
    
    // Clean digits ONLY if it's NOT a public ID
    const searchVal = isPublicId ? term.toUpperCase() : term.replace(/\D/g, '');
    const nameTerm = overrideName || searchName;
    
    if (searchVal.length < 4 && !nameTerm) {
        setErrorMsg('请输入至少4位数字或完整ID');
        return;
    }

    setLoading(true);
    const latestData = await getReservations();
    setReservations(latestData);
    setLoading(false);

    let found: Reservation | undefined;

    if (searchVal) {
        if (isPublicId) {
            found = latestData.find(r => r.id === searchVal && r.checkInStatus !== CheckInStatus.Cancelled);
        } else {
            found = latestData.find(r => r.phoneNumber.includes(searchVal) && r.checkInStatus !== CheckInStatus.Cancelled);
        }
    }

    if (!found && nameTerm) {
        found = latestData.find(r => r.contactName.toLowerCase().includes(nameTerm.toLowerCase()) && r.checkInStatus !== CheckInStatus.Cancelled);
    }

    if (found) {
        setSelectedRes(found);
        setMode('result');
        setSearchPhone('');
        setSearchName('');
        setWalkInError('');
    } else {
        setErrorMsg('未找到记录 (No reservation found).');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        executeSearch();
    }
  };

  const initiateCheckIn = () => {
    if (!selectedRes) return;
    
    // If unpaid, show calculator modal first
    if (selectedRes.paymentStatus === PaymentStatus.Unpaid && selectedRes.totalAmount > 0) {
        setCashTendered('');
        setShowPayModal(true);
    } else {
        // If already paid or free, proceed directly
        handleFamilyCheckIn();
    }
  };

  // Check-in Logic (Family)
  const handleFamilyCheckIn = async () => {
    if (!selectedRes) return;
    setShowPayModal(false); // Close modal if open
    
    setLoading(true);
    const count = selectedRes.totalPeople;
    // Generate lottery numbers if they don't exist
    const currentLottery = selectedRes.lotteryNumbers || [];
    const newLottery = [...currentLottery];
    while (newLottery.length < count) {
        newLottery.push(generateLotteryNumber());
    }

    const updates: Partial<Reservation> = {
        checkInStatus: CheckInStatus.Arrived,
        paymentStatus: PaymentStatus.Paid,
        paymentMethod: PaymentMethod.Cash, // Default to cash for speed
        paidAmount: selectedRes.totalAmount,
        lotteryNumbers: newLottery
    };

    // Use firebaseDocId for optimization if available
    await updateReservation(selectedRes.id, updates, selectedRes.firebaseDocId);
    
    // Update local state immediately for UI feedback
    setSelectedRes({ ...selectedRes, ...updates });
    await refreshData();
    setLoading(false);
  };

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalkInError('');
    const price = 20; // Updated to $20 for Walk-ins
    const total = Number(walkInForm.adults) * price;
    const count = Number(walkInForm.adults) + Number(walkInForm.children);

    // Auto-generate lottery numbers for walk-ins
    const lotteryNums = [];
    for(let i=0; i<count; i++) lotteryNums.push(generateLotteryNumber());

    setLoading(true);
    try {
        const newRes = await createReservation({
            ticketType: TicketType.WalkIn,
            contactName: walkInForm.name || 'Walk-In Guest',
            phoneNumber: walkInForm.phone,
            adultsCount: Number(walkInForm.adults),
            childrenCount: Number(walkInForm.children),
            paidAmount: total,
            paymentStatus: PaymentStatus.Paid,
            paymentMethod: PaymentMethod.Cash,
            checkInStatus: CheckInStatus.Arrived,
            lotteryNumbers: lotteryNums
        });

        setWalkInForm({ name: '', phone: '', adults: 1, children: 0 });
        setSelectedRes(newRes);
        setMode('result');
        await refreshData();
    } catch (err: any) {
        if (err.message === 'DUPLICATE_PHONE') {
            setWalkInError("该号码已有预约 (This phone already has a reservation).");
        } else {
            setWalkInError("提交失败 (Submission failed).");
        }
    } finally {
        setLoading(false);
    }
  };

  // Calculator Logic
  const totalDue = selectedRes ? selectedRes.totalAmount : 0;
  const tendered = Number(cashTendered);
  const changeDue = tendered - totalDue;
  const isPaymentSufficient = tendered >= totalDue;

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-cny-red" /> 工作人员入口 Staff Portal
        </h2>
        
        {/* Quick Action Bar */}
        {mode === 'search' && (
            <div className="flex gap-2">
                 <button onClick={() => setMode('walkin')} className="bg-cny-gold text-cny-red px-4 py-2 rounded-lg font-bold shadow hover:bg-yellow-400 flex items-center gap-1 transition-all">
                    <UserPlus className="w-4 h-4" /> 现场购票 Walk-In
                 </button>
                 <button onClick={() => setShowScanner(true)} className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-gray-700 flex items-center gap-2 transition-all">
                    <Camera className="w-4 h-4" /> 扫码 Scan
                 </button>
            </div>
        )}
      </div>

      {loading && (
          <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-cny-red" />
          </div>
      )}

      {/* --- QR SCANNER MODAL --- */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden relative">
            <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 text-gray-800">
                    <QrCode className="w-5 h-5 text-cny-red" /> 扫描门票二维码
                </h3>
                <button onClick={() => stopScanner()} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                </button>
            </div>
            
            <div className="p-4">
                <div id="qr-reader" className="overflow-hidden rounded-xl bg-black aspect-square"></div>
                {scannerError && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> {scannerError}
                    </div>
                )}
                <div className="mt-4 text-center text-xs text-gray-400 font-medium">
                    请将二维码置于框内进行扫描
                    <br/>(Please align the QR code within the frame)
                </div>
            </div>
            
            <button 
                onClick={() => stopScanner()}
                className="w-full py-4 bg-gray-50 text-gray-600 font-bold border-t hover:bg-gray-100 transition"
            >
                取消 Cancel
            </button>
          </div>
        </div>
      )}

      {/* --- SEARCH MODE --- */}
      {mode === 'search' && (
        <div className="bg-white p-8 rounded-xl shadow-lg border-t-8 border-cny-dark">
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-700">快速签到 Quick Check-In</h3>
                <p className="text-gray-400 text-sm">输入手机号、ID 或点击扫码按钮</p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cny-red transition-colors">
                        <ScanLine className="w-5 h-5" />
                    </div>
                    <input 
                        ref={searchInputRef}
                        type="text" 
                        className="w-full pl-12 pr-4 py-4 text-xl border-2 border-gray-200 rounded-xl focus:border-cny-red focus:ring-2 focus:ring-red-100 outline-none transition font-mono bg-white text-gray-900"
                        placeholder="手机号 或 预约 ID"
                        value={searchPhone}
                        onChange={handlePhoneChange}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button 
                            onClick={() => setShowScanner(true)}
                            className="p-2 text-cny-red hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="Open Camera Scanner"
                        >
                            <Camera className="w-5 h-5" />
                        </button>
                        <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-200 rounded-md">Enter</kbd>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 py-2">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">OR SEARCH BY NAME</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-cny-red outline-none bg-white text-gray-900"
                            placeholder="姓名 Name"
                            value={searchName}
                            onChange={e => setSearchName(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <button 
                        onClick={() => executeSearch()}
                        className="bg-cny-red text-white px-8 rounded-lg font-bold hover:bg-red-700 transition shadow-md active:scale-95"
                    >
                        搜索 Search
                    </button>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm text-center font-bold animate-shake border border-red-100">
                        <div className="flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {errorMsg}
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* --- RESULT MODE (Check-In Card) --- */}
      {mode === 'result' && selectedRes && (
        <div className="max-w-xl mx-auto animate-fade-in-up">
            <button onClick={() => { setMode('search'); setSelectedRes(null); }} className="mb-4 text-gray-500 hover:text-gray-800 flex items-center gap-1 font-bold transition group">
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 返回搜索 Back
            </button>

            <div className={`bg-white rounded-xl shadow-2xl overflow-hidden border-t-8 ${selectedRes.checkInStatus === CheckInStatus.Arrived ? 'border-green-500' : 'border-cny-red'}`}>
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{selectedRes.contactName}</h1>
                        <p className="text-gray-600 font-mono text-lg font-bold">{formatPhoneDisplay(selectedRes.phoneNumber)}</p>
                        <div className="flex items-center gap-2 mt-2">
                             <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedRes.ticketType === TicketType.EarlyBird ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                                {selectedRes.ticketType}
                             </span>
                             {selectedRes.checkInStatus === CheckInStatus.Cancelled && (
                                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold uppercase">CANCELLED</span>
                             )}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400 uppercase font-bold tracking-tighter">Total Due</div>
                        <div className={`text-3xl font-bold ${selectedRes.paymentStatus === PaymentStatus.Paid ? 'text-green-600' : 'text-cny-red'}`}>
                            ${selectedRes.totalAmount}
                        </div>
                        {selectedRes.paymentStatus === PaymentStatus.Paid && (
                             <div className="text-xs text-green-600 font-bold flex items-center justify-end gap-1">
                                <Check className="w-3 h-3" /> PAID
                             </div>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Status Alert */}
                    {selectedRes.checkInStatus === CheckInStatus.Arrived && (
                         <div className="bg-green-100 text-green-800 p-4 rounded-lg flex items-center gap-3 animate-pulse-once border border-green-200">
                             <CheckCircle className="w-6 h-6" />
                             <div>
                                 <p className="font-bold">已签到 Checked In</p>
                                 <p className="text-xs">Enjoy the event!</p>
                             </div>
                         </div>
                    )}
                    
                    {selectedRes.checkInStatus === CheckInStatus.Cancelled && (
                         <div className="bg-gray-200 text-gray-500 p-4 rounded-lg flex items-center gap-3">
                             <Info className="w-6 h-6" />
                             <div>
                                 <p className="font-bold">Reservation Cancelled</p>
                                 <p className="text-xs">Cannot check in.</p>
                             </div>
                         </div>
                    )}

                    {/* Family Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg flex flex-col items-center justify-center border border-blue-100 shadow-sm">
                             <span className="text-blue-400 mb-1"><Users className="w-6 h-6" /></span>
                             <span className="text-2xl font-bold text-gray-900">{selectedRes.totalPeople}</span>
                             <span className="text-xs text-gray-500 uppercase font-bold">Total People</span>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg flex flex-col items-center justify-center border border-yellow-100 shadow-sm">
                             <span className="text-yellow-500 mb-1"><Ticket className="w-6 h-6" /></span>
                             <span className="text-2xl font-bold text-gray-900">{selectedRes.lotteryNumbers?.length || 0}</span>
                             <span className="text-xs text-gray-500 uppercase font-bold">Raffle Tickets</span>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="text-sm space-y-2 text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex justify-between font-bold text-gray-800">
                            <span>Adults ({selectedRes.adultsCount})</span>
                            <span>${selectedRes.adultsCount * selectedRes.pricePerPerson}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-800">
                            <span>Children ({selectedRes.childrenCount})</span>
                            <span className="text-green-600 uppercase">FREE</span>
                        </div>
                    </div>

                    {/* Raffle Numbers */}
                    {selectedRes.checkInStatus === CheckInStatus.Arrived && selectedRes.lotteryNumbers && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                                <QrCode className="w-3 h-3" /> Assigned Raffle Numbers
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {selectedRes.lotteryNumbers.map(num => (
                                    <span key={num} className="bg-cny-gold text-cny-red font-mono font-bold px-3 py-1 rounded shadow-sm border border-cny-red/20 text-lg">
                                        {num}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                {selectedRes.checkInStatus === CheckInStatus.NotArrived && (
                    <div className="p-6 bg-gray-50 border-t border-gray-100">
                        <button 
                            onClick={initiateCheckIn}
                            disabled={loading}
                            className={`w-full text-xl font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-3 active:scale-[0.98] ${
                                selectedRes.paymentStatus === PaymentStatus.Unpaid 
                                    ? 'bg-cny-gold hover:bg-yellow-500 text-cny-red' 
                                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                            }`}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (
                                selectedRes.paymentStatus === PaymentStatus.Unpaid 
                                    ? <><Banknote className="w-8 h-8" /> Pay & Check In</>
                                    : <><Check className="w-8 h-8" /> Confirm Check In</>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* --- PAYMENT CALCULATOR MODAL --- */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-scale-in">
                <div className="bg-cny-red p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Calculator className="w-5 h-5" /> 收款计算器 Payment
                    </h3>
                    <button onClick={() => setShowPayModal(false)} className="hover:bg-red-800 p-1 rounded transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Total Due (应收)</p>
                        <p className="text-4xl font-bold text-cny-red mt-1">${totalDue}</p>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-xl border-2 border-transparent focus-within:border-gray-400 transition">
                        <label className="block text-xs font-bold text-gray-500 mb-1">CASH RECEIVED (实收)</label>
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-6 h-6 text-gray-400" />
                            <input 
                                ref={cashInputRef}
                                type="number" 
                                className="w-full bg-transparent text-3xl font-bold text-gray-900 outline-none placeholder-gray-300"
                                placeholder="0"
                                value={cashTendered}
                                onChange={e => setCashTendered(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border-2 text-center transition-colors ${isPaymentSufficient ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-100'}`}>
                        <p className={`text-sm font-bold uppercase ${isPaymentSufficient ? 'text-green-700' : 'text-red-500'}`}>
                            {isPaymentSufficient ? 'Change Due (找零)' : 'Insufficient Amount'}
                        </p>
                        <p className={`text-3xl font-bold mt-1 ${isPaymentSufficient ? 'text-green-600' : 'text-red-500'}`}>
                            ${isPaymentSufficient ? changeDue : '0'}
                        </p>
                    </div>
                    
                    <button 
                        onClick={handleFamilyCheckIn}
                        disabled={!isPaymentSufficient}
                        className={`w-full py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition active:scale-95 ${
                            isPaymentSufficient 
                             ? 'bg-cny-gold text-cny-red hover:bg-yellow-400 shadow-lg' 
                             : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <CheckCircle className="w-5 h-5" />
                        Confirm Paid & Check In
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- WALK IN MODE --- */}
      {mode === 'walkin' && (
        <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-xl border-t-8 border-cny-gold animate-fade-in-up">
            <button onClick={() => setMode('search')} className="mb-4 text-gray-500 flex items-center gap-1 text-sm font-bold transition hover:text-gray-800">
                <ChevronLeft className="w-4 h-4" /> Cancel
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <UserPlus className="text-cny-gold" /> 现场购票 Walk-In
            </h3>
            <form onSubmit={handleWalkInSubmit} className="space-y-4">
                 <div>
                    <label className="block font-bold text-gray-700 mb-1">Name (Optional)</label>
                    <input type="text" className="w-full p-3 border rounded-lg bg-white text-gray-900 font-semibold focus:ring-2 focus:ring-cny-gold outline-none" 
                        value={walkInForm.name} onChange={e => setWalkInForm({...walkInForm, name: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block font-bold text-gray-700 mb-1">Phone <span className="text-red-500 font-bold">*</span></label>
                    <input type="tel" required className="w-full p-3 border rounded-lg bg-white text-gray-900 font-semibold focus:ring-2 focus:ring-cny-gold outline-none" 
                        value={walkInForm.phone} onChange={e => setWalkInForm({...walkInForm, phone: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block font-bold text-gray-700 mb-1">Adults ($20)</label>
                        <input type="number" min="1" required className="w-full p-3 border rounded-lg bg-white text-gray-900 font-bold text-lg focus:ring-2 focus:ring-cny-gold outline-none" 
                            value={walkInForm.adults} onChange={e => setWalkInForm({...walkInForm, adults: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="block font-bold text-gray-700 mb-1">Kids (Free)</label>
                        <input type="number" min="0" required className="w-full p-3 border rounded-lg bg-white text-gray-900 font-bold text-lg focus:ring-2 focus:ring-cny-gold outline-none" 
                            value={walkInForm.children} onChange={e => setWalkInForm({...walkInForm, children: Number(e.target.value)})}
                        />
                    </div>
                 </div>
                 
                 <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center border border-gray-200 shadow-inner">
                    <span className="font-bold text-gray-600">Total Due (Cash):</span>
                    <span className="text-3xl font-bold text-cny-red">${walkInForm.adults * 20}</span>
                 </div>

                 {walkInError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg animate-shake">
                        <div className="flex items-center gap-2 font-bold mb-3">
                            <AlertCircle className="w-5 h-5" /> {walkInError}
                        </div>
                        {walkInError.includes("reservation") && (
                            <button
                                type="button"
                                onClick={() => executeSearch(walkInForm.phone)}
                                className="w-full bg-white border border-red-200 py-2 rounded-md font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition"
                            >
                                <Search className="w-4 h-4" /> 查找现有记录 Find existing
                            </button>
                        )}
                    </div>
                 )}

                 <button type="submit" disabled={loading} className="w-full bg-cny-gold hover:bg-yellow-500 text-cny-red font-bold py-4 rounded-lg shadow-lg text-lg flex items-center justify-center transition-all active:scale-95">
                    {loading ? <Loader2 className="animate-spin" /> : "Confirm & Check In"}
                 </button>
            </form>
        </div>
      )}
    </div>
  );
};

export default StaffPortal;

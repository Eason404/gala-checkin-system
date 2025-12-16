import React, { useState, useEffect, useRef } from 'react';
import { getReservations, updateReservation, createReservation, generateLotteryNumber } from '../services/dataService';
import { Reservation, TicketType, PaymentStatus, CheckInStatus, PaymentMethod } from '../types';
import { Search, UserPlus, DollarSign, Check, ChevronLeft, QrCode, User, Users, CreditCard, Ticket, Info, CheckCircle } from 'lucide-react';

const StaffPortal: React.FC = () => {
  // Mode: 'search' (default) | 'result' | 'walkin' | 'scanner'
  const [mode, setMode] = useState<'search' | 'result' | 'walkin' | 'scanner'>('search');
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchName, setSearchName] = useState('');
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Walk-in form state
  const [walkInForm, setWalkInForm] = useState({ name: '', phone: '', adults: 1, children: 0 });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load Data
  const refreshData = () => {
    setReservations(getReservations());
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
    // Allow typing, but we search on cleaned version
    setSearchPhone(val);
  };

  // Search Logic
  const executeSearch = (overridePhone?: string) => {
    setErrorMsg('');
    const term = (overridePhone || searchPhone).replace(/\D/g, ''); // Clean non-digits
    
    if (term.length < 4 && !searchName) {
        setErrorMsg('请输入至少4位数字 (Enter at least 4 digits)');
        return;
    }

    let found: Reservation | undefined;

    // 1. Try exact phone match (last 10 digits)
    if (term) {
        found = reservations.find(r => r.phoneNumber.includes(term));
    }

    // 2. Try Name if no phone match
    if (!found && searchName) {
        found = reservations.find(r => r.contactName.toLowerCase().includes(searchName.toLowerCase()));
    }

    if (found) {
        setSelectedRes(found);
        setMode('result');
        setSearchPhone('');
        setSearchName('');
    } else {
        setErrorMsg('未找到记录 (No reservation found).');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        executeSearch();
    }
  };

  // Check-in Logic (Family)
  const handleFamilyCheckIn = () => {
    if (!selectedRes) return;
    
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

    updateReservation(selectedRes.id, updates);
    
    // Update local state immediately for UI feedback
    setSelectedRes({ ...selectedRes, ...updates });
    refreshData();
  };

  // Simulated QR Scan
  const handleSimulateScan = () => {
    // Pick a random reservation to simulate a scan
    if (reservations.length > 0) {
        const randomRes = reservations[0]; // Just pick the first one for demo
        setSelectedRes(randomRes);
        setMode('result');
    } else {
        setErrorMsg('无数据可模拟 (No data to simulate)');
        setMode('search');
    }
  };

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = 20; // Updated to $20 for Walk-ins
    // Price logic: Children Free
    const total = Number(walkInForm.adults) * price;
    const count = Number(walkInForm.adults) + Number(walkInForm.children);

    // Auto-generate lottery numbers for walk-ins
    const lotteryNums = [];
    for(let i=0; i<count; i++) lotteryNums.push(generateLotteryNumber());

    const newRes = createReservation({
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

    // Reset and show result
    setWalkInForm({ name: '', phone: '', adults: 1, children: 0 });
    setSelectedRes(newRes);
    setMode('result');
    refreshData();
  };

  // Demo Helpers
  const demoNumbers = ['5085550101', '6175550202', '5085550404'];

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-cny-red" /> 工作人员入口 Staff Portal
        </h2>
        
        {/* Quick Action Bar */}
        {mode === 'search' && (
            <div className="flex gap-2">
                 <button onClick={() => setMode('walkin')} className="bg-cny-gold text-cny-red px-4 py-2 rounded-lg font-bold shadow hover:bg-yellow-400 flex items-center gap-1">
                    <UserPlus className="w-4 h-4" /> 现场购票 Walk-In
                 </button>
                 <button onClick={() => setMode('scanner')} className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-gray-700 flex items-center gap-1">
                    <QrCode className="w-4 h-4" /> 扫码 Scan
                 </button>
            </div>
        )}
      </div>

      {/* --- SEARCH MODE --- */}
      {mode === 'search' && (
        <div className="bg-white p-8 rounded-xl shadow-lg border-t-8 border-cny-dark">
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-700">快速签到 Quick Check-In</h3>
                <p className="text-gray-400 text-sm">输入手机号或扫描二维码</p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        ref={searchInputRef}
                        type="tel" 
                        className="w-full pl-12 pr-4 py-4 text-xl border-2 border-gray-200 rounded-xl focus:border-cny-red focus:ring-2 focus:ring-red-100 outline-none transition font-mono"
                        placeholder="手机号码 Phone Number"
                        value={searchPhone}
                        onChange={handlePhoneChange}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-cny-red outline-none"
                        placeholder="姓名 Name (Optional)"
                        value={searchName}
                        onChange={e => setSearchName(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button 
                        onClick={() => executeSearch()}
                        className="bg-cny-red text-white px-8 rounded-lg font-bold hover:bg-red-700 transition"
                    >
                        搜索
                    </button>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-bold animate-pulse">
                        {errorMsg}
                    </div>
                )}
            </div>

            {/* DEMO CHEAT SHEET */}
            <div className="mt-12 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-widest text-center mb-3">Demo Cheat Sheet</p>
                <div className="flex flex-wrap justify-center gap-2">
                    {demoNumbers.map(num => (
                        <button 
                            key={num}
                            onClick={() => {
                                setSearchPhone(num);
                                executeSearch(num); // Auto search
                            }}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full border border-gray-200 transition"
                        >
                            {num}
                        </button>
                    ))}
                    <button onClick={() => {
                        setSearchName('Jianguo');
                        // No auto execute for name, let user see it
                    }} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full border border-gray-200 transition">
                        Name: Jianguo
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- RESULT MODE (Check-In Card) --- */}
      {mode === 'result' && selectedRes && (
        <div className="max-w-xl mx-auto">
            <button onClick={() => { setMode('search'); setSelectedRes(null); }} className="mb-4 text-gray-500 hover:text-gray-800 flex items-center gap-1 font-bold">
                <ChevronLeft className="w-5 h-5" /> 返回搜索 Back
            </button>

            <div className={`bg-white rounded-xl shadow-2xl overflow-hidden border-t-8 ${selectedRes.checkInStatus === CheckInStatus.Arrived ? 'border-green-500' : 'border-cny-red'}`}>
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{selectedRes.contactName}</h1>
                        <p className="text-gray-500 font-mono text-lg">{formatPhoneDisplay(selectedRes.phoneNumber)}</p>
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
                        <div className="text-sm text-gray-400">Total Due</div>
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
                         <div className="bg-green-100 text-green-800 p-4 rounded-lg flex items-center gap-3 animate-pulse-once">
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
                        <div className="bg-blue-50 p-4 rounded-lg flex flex-col items-center justify-center border border-blue-100">
                             <span className="text-blue-400 mb-1"><Users className="w-6 h-6" /></span>
                             <span className="text-2xl font-bold text-gray-800">{selectedRes.totalPeople}</span>
                             <span className="text-xs text-gray-500 uppercase font-bold">Total People</span>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg flex flex-col items-center justify-center border border-yellow-100">
                             <span className="text-yellow-500 mb-1"><Ticket className="w-6 h-6" /></span>
                             <span className="text-2xl font-bold text-gray-800">{selectedRes.lotteryNumbers?.length || 0}</span>
                             <span className="text-xs text-gray-500 uppercase font-bold">Raffle Tickets</span>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="text-sm space-y-2 text-gray-600 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between">
                            <span>Adults ({selectedRes.adultsCount})</span>
                            <span>${selectedRes.adultsCount * selectedRes.pricePerPerson}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Children ({selectedRes.childrenCount})</span>
                            <span className="text-green-600">FREE</span>
                        </div>
                    </div>

                    {/* Raffle Numbers */}
                    {selectedRes.checkInStatus === CheckInStatus.Arrived && selectedRes.lotteryNumbers && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Assigned Raffle Numbers</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedRes.lotteryNumbers.map(num => (
                                    <span key={num} className="bg-cny-gold text-cny-red font-mono font-bold px-3 py-1 rounded shadow-sm">
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
                            onClick={handleFamilyCheckIn}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xl font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-3"
                        >
                            <Check className="w-8 h-8" />
                            确认签到 Check In
                        </button>
                        {selectedRes.paymentStatus === PaymentStatus.Unpaid && (
                            <p className="text-center text-xs text-red-500 mt-2 font-bold">
                                Please collect ${selectedRes.totalAmount} cash first!
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
      )}

      {/* --- WALK IN MODE --- */}
      {mode === 'walkin' && (
        <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-xl border-t-8 border-cny-gold">
            <button onClick={() => setMode('search')} className="mb-4 text-gray-500 flex items-center gap-1 text-sm font-bold">
                <ChevronLeft className="w-4 h-4" /> Cancel
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <UserPlus className="text-cny-gold" /> 现场购票 Walk-In
            </h3>
            <form onSubmit={handleWalkInSubmit} className="space-y-4">
                 <div>
                    <label className="block font-bold text-gray-700 mb-1">Name (Optional)</label>
                    <input type="text" className="w-full p-3 border rounded-lg bg-gray-50" 
                        value={walkInForm.name} onChange={e => setWalkInForm({...walkInForm, name: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block font-bold text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                    <input type="tel" required className="w-full p-3 border rounded-lg bg-gray-50" 
                        value={walkInForm.phone} onChange={e => setWalkInForm({...walkInForm, phone: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block font-bold text-gray-700 mb-1">Adults ($20)</label>
                        <input type="number" min="1" required className="w-full p-3 border rounded-lg font-bold text-lg" 
                            value={walkInForm.adults} onChange={e => setWalkInForm({...walkInForm, adults: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="block font-bold text-gray-700 mb-1">Kids (Free)</label>
                        <input type="number" min="0" required className="w-full p-3 border rounded-lg font-bold text-lg" 
                            value={walkInForm.children} onChange={e => setWalkInForm({...walkInForm, children: Number(e.target.value)})}
                        />
                    </div>
                 </div>
                 
                 <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                    <span className="font-bold text-gray-600">Total Due (Cash):</span>
                    <span className="text-3xl font-bold text-cny-red">${walkInForm.adults * 20}</span>
                 </div>

                 <button type="submit" className="w-full bg-cny-gold hover:bg-yellow-500 text-cny-red font-bold py-4 rounded-lg shadow-lg text-lg">
                    Confirm & Check In
                 </button>
            </form>
        </div>
      )}

      {/* --- SCANNER MODE (Mock) --- */}
      {mode === 'scanner' && (
          <div className="max-w-md mx-auto bg-black rounded-xl overflow-hidden shadow-2xl relative aspect-[3/4] flex flex-col items-center justify-center text-white">
              <button onClick={() => setMode('search')} className="absolute top-4 left-4 z-20 bg-black/50 p-2 rounded-full">
                  <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1516192518150-0d8fee5425e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center"></div>
              
              <div className="w-64 h-64 border-4 border-cny-gold/50 rounded-2xl relative z-10 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <div className="w-full h-0.5 bg-red-500 absolute top-1/2 animate-scan"></div>
                  <p className="text-sm font-bold opacity-80">Scanning...</p>
              </div>

              <div className="absolute bottom-10 z-20">
                  <button onClick={handleSimulateScan} className="bg-white text-black px-6 py-3 rounded-full font-bold shadow-xl active:scale-95 transition">
                      Simulate Scan Result
                  </button>
              </div>
          </div>
      )}

    </div>
  );
};

export default StaffPortal;
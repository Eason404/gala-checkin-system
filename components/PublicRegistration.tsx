
import React, { useState, useEffect, useMemo } from 'react';
import { createReservation, getReservations } from '../services/dataService';
import { TicketType, PaymentStatus, CheckInStatus, Reservation } from '../types';
import { validatePhone, validateEmail } from '../utils/validation';
import { CheckCircle, AlertCircle, Phone, Ticket, Wand2, Loader2, Mail, Plus, Minus, ArrowRight, QrCode, Utensils, Sparkles, X, Gift, Flame, Clock, Zap, Lock } from 'lucide-react';
import QRCode from 'qrcode';

const ConfettiBurst = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: ['#D72638', '#FCE7BB', '#FFD700', '#ffffff'][Math.floor(Math.random() * 4)],
            animation: `confetti-fall ${1 + Math.random() * 2}s linear forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
            width: `${5 + Math.random() * 10}px`,
            height: `${5 + Math.random() * 10}px`,
          }}
        />
      ))}
    </div>
  );
};

const PublicRegistration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'manage'>('register');
  
  // Registration Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    adults: 1,
    children: 0,
    ticketType: TicketType.EarlyBird,
  });
  const [agreedToWaiver, setAgreedToWaiver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [reservationId, setReservationId] = useState('');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false); 

  // Manage/Cancel State
  const [managePhone, setManagePhone] = useState('');
  const [manageName, setManageName] = useState(''); 
  const [myRes, setMyRes] = useState<Reservation | null>(null);
  const [lookupError, setLookupError] = useState('');

  const currentPrice = formData.ticketType === TicketType.EarlyBird ? 15 : 20;

  useEffect(() => {
    if (submitted && reservationId) {
      QRCode.toDataURL(reservationId, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      })
      .then(url => setQrCodeData(url))
      .catch(err => console.error(err));
    }
  }, [submitted, reservationId]);
  
  const triggerHaptic = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const handleMagicFill = () => {
    triggerHaptic(50);
    setFormData({
      firstName: 'James',
      lastName: 'Smith',
      phone: `508-555-${Math.floor(1000 + Math.random() * 9000)}`,
      email: `natick.${Date.now().toString().slice(-4)}@example.com`,
      adults: 2,
      children: 1,
      ticketType: TicketType.EarlyBird,
    });
    setAgreedToWaiver(true);
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setSubmitError('请填写姓名 (Name required)');
      return;
    }
    if (!validateEmail(formData.email)) {
      setSubmitError('邮箱格式错误 (Invalid email)');
      return;
    }
    if (!validatePhone(formData.phone)) {
      setSubmitError('手机号格式错误 (Invalid phone)');
      return;
    }
    if (!agreedToWaiver) {
      setSubmitError("请阅读并同意协议 (Please agree to the waiver)");
      return;
    }

    setLoading(true);
    try {
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        const newRes = await createReservation({
          contactName: fullName,
          phoneNumber: formData.phone,
          email: formData.email,
          adultsCount: Number(formData.adults),
          childrenCount: Number(formData.children),
          ticketType: formData.ticketType,
        });

        triggerHaptic([100, 50, 100]);
        setReservationId(newRes.id);
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
        if (err.message === 'DUPLICATE_PHONE') setSubmitError("该号码已存在预约 (Duplicate reservation)");
        else setSubmitError("提交失败，请检查网络 (Submission failed)");
        triggerHaptic([50, 100, 50]);
    } finally {
        setLoading(false);
    }
  };

  const openEnvelope = () => {
    setEnvelopeOpened(true);
    triggerHaptic([30, 20, 100]);
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setMyRes(null);

    if (!manageName.trim() || !managePhone.trim()) {
      setLookupError('请完整填写信息');
      return;
    }

    setLoading(true);
    try {
        const allReservations = await getReservations();
        const cleanPhone = managePhone.replace(/\D/g, '');
        const found = allReservations.find(r => 
          r.phoneNumber.replace(/\D/g, '').includes(cleanPhone) && 
          r.contactName.toLowerCase().includes(manageName.trim().toLowerCase()) &&
          r.checkInStatus !== CheckInStatus.Cancelled
        );
        if (found) {
          setMyRes(found);
          triggerHaptic(50);
        }
        else setLookupError('未找到匹配记录 (No record found)');
    } catch (err) {
        setLookupError('查询失败');
    } finally {
        setLoading(false);
    }
  };

  const adjustCount = (field: 'adults' | 'children', delta: number) => {
    setFormData(prev => ({ ...prev, [field]: Math.max(0, Math.min(20, (prev[field] as number || 0) + delta)) }));
    triggerHaptic(5);
  };

  if (submitted && !envelopeOpened) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-cny-dark/95 backdrop-blur-xl">
          <div 
            onClick={openEnvelope}
            className="relative w-full max-w-sm aspect-[3/4] cursor-pointer group animate-burst"
          >
              {/* Back of Envelope */}
              <div className="absolute inset-0 bg-cny-red rounded-3xl shadow-2xl border-4 border-cny-gold/20 overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/silk.png')]"></div>
              </div>
              
              {/* Flap */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-cny-red rounded-t-3xl border-b-4 border-cny-gold/40 origin-top z-20 group-hover:bg-red-700 transition-colors" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}></div>
              
              {/* Seal */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                  <div className="w-24 h-24 bg-cny-gold text-cny-red rounded-full shadow-2xl flex items-center justify-center text-4xl font-serif font-black border-4 border-white/20 festive-float">
                      福
                  </div>
              </div>

              <div className="absolute bottom-12 left-0 right-0 text-center z-10">
                  <p className="text-cny-gold font-black text-sm uppercase tracking-[0.3em] mb-2">预约成功</p>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">点击开启好运 | Tap to Open</p>
              </div>
          </div>
      </div>
    );
  }

  if (submitted && envelopeOpened) {
    return (
      <div className="max-w-xl mx-auto relative mt-4">
        <ConfettiBurst />
        <div className="glass-card rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-700 border border-cny-gold/40 relative z-10">
          <div className="h-2 bg-cny-gold w-full"></div>
          <div className="p-10 text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-green-50 p-6 shadow-inner">
                  <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-1">新年大吉!</h2>
            <p className="text-gray-400 font-bold mb-8 uppercase tracking-widest text-[10px]">Your Lucky Ticket is Ready</p>
            
            <div className="bg-white/50 backdrop-blur-md rounded-[2rem] p-8 mb-8 border border-white/20 shadow-xl relative group">
              {qrCodeData ? (
                <div className="space-y-6">
                    <div className="relative inline-block">
                      <img src={qrCodeData} alt="Check-in QR" className="w-48 h-48 mx-auto border-8 border-white shadow-2xl rounded-2xl" />
                      <div className="absolute -top-4 -right-4 bg-cny-red text-white p-2 rounded-full shadow-lg festive-float">
                          <Sparkles className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Confirmation ID</span>
                      <span className="text-xl font-mono font-black text-cny-red tracking-wider">{reservationId}</span>
                    </div>
                </div>
              ) : <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
            </div>

            <div className="bg-cny-red text-white p-8 rounded-[2rem] shadow-2xl mb-8 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Ticket className="w-40 h-40" /></div>
              <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Guest</span>
                      <span className="font-black text-lg">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Group</span>
                      <span className="font-black">{formData.adults} Adults, {formData.children} Children</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                      <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Due at Door</span>
                      <span className="text-3xl font-black text-cny-gold">${formData.adults * currentPrice}</span>
                  </div>
              </div>
            </div>

            <button 
              onClick={() => { setSubmitted(false); setEnvelopeOpened(false); setReservationId(''); }}
              className="w-full py-5 bg-white border border-gray-100 text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition shadow-sm active:scale-95"
            >
              再帮朋友预约 Another Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-12 pb-12">
      {/* Dynamic Header Section */}
      <div className="text-center relative py-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none select-none">
           <div className="text-[180px] font-serif text-cny-gold leading-none">马</div>
        </div>
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-cny-gold text-cny-dark rounded-3xl shadow-2xl flex items-center justify-center text-4xl font-serif font-black mb-8 rotate-3 festive-float border-2 border-white/20">福</div>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-xl">2026 Natick 春晚</h1>
            <div className="flex items-center gap-4 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                <span className="text-cny-gold font-black text-[10px] uppercase tracking-[0.3em]">Year of the Horse Gala</span>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-dark rounded-full p-2 flex border border-white/10 shadow-2xl">
        <button onClick={() => { setActiveTab('register'); triggerHaptic(10); }} className={`flex-1 py-4 rounded-full font-black text-xs tracking-widest uppercase transition-all duration-500 ${activeTab === 'register' ? 'bg-cny-gold text-cny-dark shadow-xl' : 'text-white/40 hover:text-white'}`}>
          登记预约 Register
        </button>
        <button onClick={() => { setActiveTab('manage'); triggerHaptic(10); }} className={`flex-1 py-4 rounded-full font-black text-xs tracking-widest uppercase transition-all duration-500 ${activeTab === 'manage' ? 'bg-cny-gold text-cny-dark shadow-xl' : 'text-white/40 hover:text-white'}`}>
          管理预约 Manage
        </button>
      </div>

      {activeTab === 'register' ? (
        <div className="glass-card rounded-[3rem] shadow-2xl p-8 sm:p-12 border border-white/30 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">立即登记</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Join the celebration</p>
            </div>
            <button type="button" onClick={handleMagicFill} className="group flex items-center gap-2 text-cny-red bg-red-50 px-4 py-2 rounded-2xl border border-red-100 hover:bg-cny-red hover:text-white transition-all active:scale-95 shadow-sm">
              <Wand2 className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">测试填写</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Ticket Type Selector - Enhanced for Scarcity/Value */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Select Ticket</span>
                 <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 animate-pulse">
                    <Flame className="w-3 h-3 fill-red-500" />
                    SELLING FAST
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* EARLY BIRD CARD (Featured) - Span 3 */}
                  <button 
                    type="button" 
                    onClick={() => { setFormData({...formData, ticketType: TicketType.EarlyBird}); triggerHaptic(20); }}
                    className={`md:col-span-3 relative p-6 rounded-[2rem] border-2 transition-all group overflow-hidden text-left shadow-lg
                      ${formData.ticketType === TicketType.EarlyBird 
                        ? 'border-cny-gold bg-gradient-to-br from-red-50 to-white ring-4 ring-cny-gold/20 scale-[1.02]' 
                        : 'border-gray-100 bg-white hover:border-cny-red/30'}`}
                  >
                    {/* Badge */}
                    <div className="absolute top-0 right-0 bg-cny-red text-cny-gold px-4 py-1.5 rounded-bl-2xl font-black text-[10px] uppercase tracking-wider shadow-md">
                      Save 25%
                    </div>

                    <div className="flex items-start justify-between mb-4">
                       <div>
                          <div className={`text-xs font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-2 ${formData.ticketType === TicketType.EarlyBird ? 'text-cny-red' : 'text-gray-400'}`}>
                             <Sparkles className="w-3 h-3" /> 早鸟票 Early Bird
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold max-w-[140px] leading-tight">Includes Lunch & Gala Entrance</p>
                       </div>
                    </div>

                    <div className="flex items-end gap-3 mb-6">
                       <div className="text-4xl font-black text-gray-900 tracking-tight">$15</div>
                       <div className="text-lg font-bold text-gray-300 line-through decoration-2 mb-1">$20</div>
                    </div>

                    {/* Scarcity Progress Bar */}
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-cny-red">87% Claimed</span>
                          <span className="text-gray-300">Only 40 left</span>
                       </div>
                       <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cny-red to-orange-500 w-[87%] rounded-full shadow-[0_0_10px_rgba(215,38,56,0.5)]"></div>
                       </div>
                    </div>
                  </button>

                  {/* REGULAR CARD (De-emphasized) - Span 2 */}
                  <button 
                    type="button" 
                    onClick={() => { setFormData({...formData, ticketType: TicketType.Regular}); triggerHaptic(20); }}
                    className={`md:col-span-2 relative p-6 rounded-[2rem] border-2 transition-all group overflow-hidden text-left
                      ${formData.ticketType === TicketType.Regular 
                        ? 'border-gray-900 bg-gray-50' 
                        : 'border-gray-50 bg-gray-50/50 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:border-gray-200'}`}
                  >
                    <div className="flex flex-col h-full justify-between">
                       <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-gray-400 flex items-center gap-2">
                             {formData.ticketType === TicketType.Regular ? <CheckCircle className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                             常规票 Regular
                          </div>
                          <div className="text-3xl font-black text-gray-900 mt-2">$20</div>
                       </div>
                       
                       <div className="mt-4 pt-4 border-t border-gray-200/50">
                          <p className="text-[10px] text-gray-400 font-bold leading-tight">
                             Standard price applies after Early Bird sells out.
                          </p>
                       </div>
                    </div>
                  </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">姓 Last Name</label>
                <input required className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-cny-red/5 focus:bg-white transition-all font-bold" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="例: Zhang" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">名 First Name</label>
                <input required className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-cny-red/5 focus:bg-white transition-all font-bold" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="例: San" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">手机号 Phone</label>
                  <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input type="tel" required className="w-full pl-12 pr-5 py-5 bg-gray-50 border border-gray-100 rounded-3xl font-bold focus:ring-4 focus:ring-cny-red/5 focus:bg-white transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="508-xxx-xxxx" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">电子邮箱 Email</label>
                  <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input type="email" required className="w-full pl-12 pr-5 py-5 bg-gray-50 border border-gray-100 rounded-3xl font-bold focus:ring-4 focus:ring-cny-red/5 focus:bg-white transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="you@example.com" />
                  </div>
                </div>
            </div>

            <div className="p-2 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                <div className="grid grid-cols-2 gap-2">
                   <div className="bg-white p-6 rounded-[2rem] text-center shadow-sm">
                      <span className="text-[10px] font-black text-gray-400 block mb-4 uppercase tracking-[0.2em]">成人 Adults</span>
                      <div className="flex items-center justify-between px-2">
                        <button type="button" onClick={() => adjustCount('adults', -1)} className="p-3 hover:bg-cny-red hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"><Minus className="w-4 h-4" /></button>
                        <span className="font-black text-4xl text-gray-900">{formData.adults}</span>
                        <button type="button" onClick={() => adjustCount('adults', 1)} className="p-3 hover:bg-cny-red hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"><Plus className="w-4 h-4" /></button>
                      </div>
                   </div>
                   <div className="bg-white p-6 rounded-[2rem] text-center shadow-sm">
                      <span className="text-[10px] font-black text-gray-400 block mb-4 uppercase tracking-[0.2em]">儿童 Kids</span>
                      <div className="flex items-center justify-between px-2">
                        <button type="button" onClick={() => adjustCount('children', -1)} className="p-3 hover:bg-cny-red hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"><Minus className="w-4 h-4" /></button>
                        <span className="font-black text-4xl text-gray-900">{formData.children}</span>
                        <button type="button" onClick={() => adjustCount('children', 1)} className="p-3 hover:bg-cny-red hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"><Plus className="w-4 h-4" /></button>
                      </div>
                   </div>
                </div>
                <div className="p-5 flex items-center gap-3 text-[10px] font-black text-gray-400 justify-center text-center leading-tight">
                   <Utensils className="w-4 h-4 text-cny-gold flex-shrink-0" />
                   注: 成人含春节盒饭一份，儿童免费提供主食。
                </div>
            </div>

            <div className="bg-cny-red rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000"><Sparkles className="w-40 h-40" /></div>
               <div className="flex justify-between items-end relative z-10">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 block mb-2">Estimated Total</span>
                    <div className="text-6xl font-black text-cny-gold flex items-baseline gap-2">
                        <span className="text-2xl font-normal">$</span>{formData.adults * currentPrice}
                    </div>
                  </div>
                  <div className="text-right">
                    {/* Dynamic Savings Badge */}
                    {formData.ticketType === TicketType.EarlyBird && formData.adults > 0 && (
                      <div className="bg-white text-cny-red px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 mb-4 inline-flex items-center gap-1 shadow-lg animate-bounce">
                        <Zap className="w-3 h-3 fill-cny-red" />
                        Save ${formData.adults * 5}!
                      </div>
                    )}
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Pay at Entry · Cash Only</p>
                  </div>
               </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
               <input type="checkbox" id="waiver" checked={agreedToWaiver} onChange={e => { setAgreedToWaiver(e.target.checked); triggerHaptic(10); }} className="w-6 h-6 rounded-lg text-cny-red cursor-pointer mt-1" />
               <label htmlFor="waiver" className="text-xs text-gray-500 leading-relaxed font-medium">
                  我已确认阅读并同意 <span className="text-cny-red font-black">*</span> <button type="button" className="text-cny-red font-black hover:underline decoration-2">免责声明与媒体授权协议</button>
               </label>
            </div>

            {submitError && (
              <div className="p-5 bg-red-50 text-red-600 rounded-[2rem] flex items-center gap-4 border border-red-100 animate-shake shadow-sm">
                <AlertCircle className="w-6 h-6" />
                <span className="text-sm font-black">{submitError}</span>
              </div>
            )}

            <button disabled={loading} className="w-full py-6 bg-cny-red hover:bg-cny-dark text-white rounded-[2.5rem] font-black text-xl shadow-2xl hover:shadow-cny-red/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 group">
               {loading ? <Loader2 className="animate-spin" /> : <><span>立即提交预约 Submit</span><ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" /></>}
            </button>
          </form>
        </div>
      ) : (
        <div className="glass-card rounded-[3rem] shadow-2xl p-8 sm:p-12 border border-white/30 animate-in fade-in slide-in-from-bottom-6">
          <h3 className="text-2xl font-black text-gray-900 mb-10 tracking-tight">查询我的预约</h3>
          <form onSubmit={handleLookup} className="space-y-6">
             <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">预约姓名</label>
                 <input required className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none font-bold" placeholder="例如: Zhang San" value={manageName} onChange={e => setManageName(e.target.value)} />
             </div>
             <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">手机号码</label>
                 <input type="tel" required className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl font-bold" placeholder="508-xxx-xxxx" value={managePhone} onChange={e => setManagePhone(e.target.value)} />
             </div>
             <button disabled={loading} className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-black transition shadow-xl active:scale-95">
               {loading ? <Loader2 className="animate-spin" /> : "搜索记录 Search"}
             </button>
          </form>

          {myRes && (
            <div className="mt-10 p-8 bg-white/50 rounded-[2.5rem] border-2 border-cny-gold/20 shadow-xl space-y-6 animate-in zoom-in duration-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-gray-900 text-2xl">{myRes.contactName}</h4>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">ID: {myRes.id}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${myRes.checkInStatus === CheckInStatus.Arrived ? 'bg-green-100 text-green-700' : 'bg-cny-gold/20 text-cny-red shadow-inner'}`}>
                      {myRes.checkInStatus === CheckInStatus.Arrived ? '已签到' : '待参加'}
                  </div>
                </div>
            </div>
          )}
          {lookupError && <p className="mt-6 text-center text-red-500 font-black text-sm">{lookupError}</p>}
        </div>
      )}
    </div>
  );
};

export default PublicRegistration;

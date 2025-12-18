
import React, { useState, useEffect } from 'react';
import { createReservation, getReservations, updateReservation } from '../services/dataService';
import { TicketType, PaymentStatus, CheckInStatus, Reservation } from '../types';
import { validatePhone, validateEmail } from '../utils/validation';
import { CheckCircle, AlertCircle, Phone, Ticket, Search, XCircle, AlertTriangle, CalendarDays, ScrollText, Wand2, TrendingUp, Loader2, Mail, Plus, Minus, ArrowRight, MapPin, QrCode, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';

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
    subscribe: false,
  });
  const [agreedToWaiver, setAgreedToWaiver] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reservationId, setReservationId] = useState('');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false); 

  // Manage/Cancel State
  const [managePhone, setManagePhone] = useState('');
  const [manageName, setManageName] = useState(''); 
  const [myRes, setMyRes] = useState<Reservation | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

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
  
  const handleMagicFill = () => {
    const firstNames = ['San', 'Ming', 'Wei', 'Jun', 'James', 'Emily', 'Sarah', 'Kevin', 'David', 'Qiang'];
    const lastNames = ['Zhang', 'Li', 'Wang', 'Liu', 'Chen', 'Yang', 'Zhao', 'Huang', 'Smith', 'Johnson'];
    const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];
    
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const tsSuffix = Date.now().toString().slice(-4);
    
    setFormData({
      firstName: fName,
      lastName: lName,
      phone: `${Math.floor(500 + Math.random() * 400)}-555-${tsSuffix}`,
      email: `${fName.toLowerCase()}.${tsSuffix}@${domains[Math.floor(Math.random() * domains.length)]}`,
      adults: Math.floor(Math.random() * 3) + 1,
      children: Math.floor(Math.random() * 3),
      subscribe: true,
    });
    setAgreedToWaiver(true);
    setPhoneError('');
    setEmailError('');
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    setEmailError('');
    setSubmitError('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setSubmitError('请填写姓名');
      return;
    }
    if (!validateEmail(formData.email)) {
      setEmailError('邮箱格式错误');
      return;
    }
    if (!validatePhone(formData.phone)) {
      setPhoneError('手机号格式错误');
      return;
    }
    if (!agreedToWaiver) {
      setSubmitError("请阅读并同意协议");
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
          ticketType: TicketType.EarlyBird,
        });

        setReservationId(newRes.id);
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
        if (err.message === 'DUPLICATE_PHONE') setSubmitError("该号码已存在预约");
        else setSubmitError("预约提交失败，请重试");
    } finally {
        setLoading(false);
    }
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
        if (found) setMyRes(found);
        else setLookupError('未找到匹配记录');
    } catch (err) {
        setLookupError('查询失败');
    } finally {
        setLoading(false);
    }
  };

  const adjustCount = (field: 'adults' | 'children', delta: number) => {
    setFormData(prev => ({ ...prev, [field]: Math.max(0, Math.min(20, (prev[field] || 0) + delta)) }));
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden mt-4 animate-in fade-in zoom-in duration-500 border-2 border-cny-gold/30">
        <div className="h-2 bg-gradient-to-r from-cny-red via-cny-gold to-cny-red w-full"></div>
        <div className="p-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-50 p-6">
                <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-1">预约成功!</h2>
          <p className="text-gray-400 font-medium mb-8">恭贺新禧，期待您的光临</p>
          
          <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-dashed border-gray-200">
             {qrCodeData ? (
               <div className="space-y-4">
                  <img src={qrCodeData} alt="Check-in QR" className="w-48 h-48 mx-auto border-8 border-white shadow-xl rounded-2xl" />
                  <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                    <QrCode className="w-4 h-4 text-cny-red" />
                    <span className="text-xs font-bold text-gray-600 tracking-wider">ID: {reservationId}</span>
                  </div>
               </div>
             ) : <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
          </div>

          <div className="bg-cny-red text-white p-6 rounded-2xl shadow-xl mb-8 text-left space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Ticket className="w-20 h-20" /></div>
             <div className="flex justify-between items-center border-b border-white/20 pb-2">
                <span className="text-white/60 text-xs font-bold">联络人</span>
                <span className="font-bold">{formData.firstName} {formData.lastName}</span>
             </div>
             <div className="flex justify-between items-center border-b border-white/20 pb-2">
                <span className="text-white/60 text-xs font-bold">随行人数</span>
                <span className="font-bold">{formData.adults} 成人 / {formData.children} 儿童</span>
             </div>
             <div className="flex justify-between items-center pt-2">
                <span className="text-white/60 text-xs font-bold uppercase tracking-widest">预估费用</span>
                <span className="text-2xl font-bold text-cny-gold">${formData.adults * 15}</span>
             </div>
          </div>

          <button 
            onClick={() => { setSubmitted(false); setReservationId(''); }}
            className="w-full py-4 bg-gray-100 text-gray-800 rounded-2xl font-bold hover:bg-gray-200 transition"
          >
            返回首页 Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-12">
      <div className="text-center py-4 relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
           <div className="text-[120px] font-serif select-none text-cny-gold">福</div>
        </div>
        <div className="relative z-10 space-y-4">
            <div className="inline-block relative">
                <div className="bg-cny-red text-cny-gold rounded-2xl shadow-xl w-16 h-16 flex items-center justify-center text-3xl font-serif mx-auto border-2 border-cny-gold/40 rotate-3 festive-float">马</div>
                <div className="absolute -right-2 -bottom-1 text-2xl">🏮</div>
            </div>
            <div className="bg-white/40 backdrop-blur-sm p-8 rounded-3xl border-2 border-cny-gold/20 shadow-lg relative overflow-hidden">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">2026 Natick 春晚</h1>
                <p className="text-cny-red/70 font-bold tracking-widest uppercase text-xs">Natick Chinese New Year Gala</p>
                <div className="h-px bg-gradient-to-r from-transparent via-cny-gold/50 to-transparent my-4"></div>
                <p className="text-gray-500 text-sm font-medium">万马奔腾 · 龙马精神 · 欢度佳节</p>
            </div>
        </div>
      </div>

      <div className="bg-cny-cloud/50 backdrop-blur-md rounded-full p-1.5 flex shadow-inner border border-cny-gold/10">
        <button onClick={() => setActiveTab('register')} className={`flex-1 py-3 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'register' ? 'bg-cny-red text-white shadow-lg' : 'text-gray-500 hover:text-cny-red'}`}>
          活动预约 Register
        </button>
        <button onClick={() => setActiveTab('manage')} className={`flex-1 py-3 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'manage' ? 'bg-cny-red text-white shadow-lg' : 'text-gray-500 hover:text-cny-red'}`}>
          管理预约 Manage
        </button>
      </div>

      {activeTab === 'register' ? (
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-10 border border-cny-gold/5 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <div className="w-2 h-6 bg-cny-red rounded-full"></div>登记预约
            </h3>
            <button type="button" onClick={handleMagicFill} className="group flex items-center gap-2 text-purple-600 bg-purple-50 px-3 py-2 rounded-xl border border-purple-100 hover:bg-purple-100 transition shadow-sm active:scale-95">
              <Wand2 className="w-4 h-4" /> <span className="text-xs font-bold">自动填写</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase px-1">姓 (Last Name) <span className="text-cny-red">*</span></label>
                <input required className="w-full p-4 bg-gray-50/50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-cny-red/5 focus:bg-white" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase px-1">名 (First Name) <span className="text-cny-red">*</span></label>
                <input required className="w-full p-4 bg-gray-50/50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-cny-red/5 focus:bg-white" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase px-1">手机号码 (Phone) <span className="text-cny-red">*</span></label>
              <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="tel" required className="w-full pl-11 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="508-xxx-xxxx" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase px-1">电子邮箱 (Email) <span className="text-cny-red">*</span></label>
              <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="email" required className="w-full pl-11 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="you@example.com" />
              </div>
            </div>

            <div className="p-1 bg-cny-cloud/30 rounded-3xl border border-cny-gold/10">
                <div className="grid grid-cols-2 gap-1">
                   <div className="bg-white/60 p-4 rounded-2xl text-center shadow-sm">
                      <span className="text-[10px] font-black text-gray-400 block mb-2 uppercase tracking-widest">成人 ($15)</span>
                      <div className="flex items-center justify-between px-2">
                        <button type="button" onClick={() => adjustCount('adults', -1)} className="p-2 hover:bg-cny-red/5 rounded-full transition"><Minus className="w-4 h-4 text-gray-400" /></button>
                        <span className="font-black text-2xl text-gray-900">{formData.adults}</span>
                        <button type="button" onClick={() => adjustCount('adults', 1)} className="p-2 hover:bg-cny-red/5 rounded-full transition"><Plus className="w-4 h-4 text-cny-red" /></button>
                      </div>
                   </div>
                   <div className="bg-white/60 p-4 rounded-2xl text-center shadow-sm">
                      <span className="text-[10px] font-black text-gray-400 block mb-2 uppercase tracking-widest">儿童 (免费)</span>
                      <div className="flex items-center justify-between px-2">
                        <button type="button" onClick={() => adjustCount('children', -1)} className="p-2 hover:bg-cny-red/5 rounded-full transition"><Minus className="w-4 h-4 text-gray-400" /></button>
                        <span className="font-black text-2xl text-gray-900">{formData.children}</span>
                        <button type="button" onClick={() => adjustCount('children', 1)} className="p-2 hover:bg-cny-red/5 rounded-full transition"><Plus className="w-4 h-4 text-cny-red" /></button>
                      </div>
                   </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-cny-red to-cny-dark p-6 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="flex justify-between items-end relative z-10">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">预计总额 Total</span>
                    <div className="text-4xl font-black text-cny-gold flex items-baseline gap-1">
                        <span className="text-xl">$</span>{formData.adults * 15}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-block bg-white/10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight mb-2">现场支付 Pay at Door</div>
                    <div className="text-[10px] text-white/40 italic">2026年3月8日 · Natick High</div>
                  </div>
               </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
               <input type="checkbox" id="waiver" checked={agreedToWaiver} onChange={e => setAgreedToWaiver(e.target.checked)} className="w-5 h-5 rounded-md text-cny-red cursor-pointer mt-0.5" />
               <label htmlFor="waiver" className="text-xs text-gray-500 leading-relaxed select-none">
                  我已确认阅读并同意 <span className="text-cny-red font-black">*</span> <button type="button" onClick={() => setShowWaiverModal(true)} className="text-cny-red font-bold hover:underline">免责声明与媒体授权协议</button>
               </label>
            </div>

            {submitError && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-bold">{submitError}</span>
              </div>
            )}

            <button disabled={loading} className="w-full py-5 bg-cny-red hover:bg-cny-dark text-white rounded-3xl font-black text-lg shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3">
               {loading ? <Loader2 className="animate-spin" /> : <><span>立即预约 Reserve Now</span><ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 sm:p-10 border border-cny-gold/5 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
            <div className="w-2 h-6 bg-cny-red rounded-full"></div>查询预约
          </h3>
          <form onSubmit={handleLookup} className="space-y-4">
             <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase px-1">预约姓名</label>
                 <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none" placeholder="例如: 张三" value={manageName} onChange={e => setManageName(e.target.value)} />
             </div>
             <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase px-1">手机号码</label>
                 <input type="tel" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none" placeholder="508-xxx-xxxx" value={managePhone} onChange={e => setManagePhone(e.target.value)} />
             </div>
             <button disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition shadow-lg active:scale-95">
               {loading ? <Loader2 className="animate-spin" /> : "搜索记录 Search"}
             </button>
          </form>

          {myRes && (
            <div className="mt-8 p-6 bg-cny-cloud/20 rounded-3xl border-2 border-cny-gold/10 space-y-4 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-gray-900 text-xl">{myRes.contactName}</h4>
                    <p className="text-xs text-gray-400 font-mono">{myRes.id}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${myRes.checkInStatus === CheckInStatus.Arrived ? 'bg-green-100 text-green-700' : 'bg-cny-gold/20 text-cny-red'}`}>
                      {myRes.checkInStatus === CheckInStatus.Arrived ? '已签到' : '待参加'}
                  </div>
                </div>
            </div>
          )}
          {lookupError && <p className="mt-4 text-center text-red-500 font-bold">{lookupError}</p>}
        </div>
      )}
    </div>
  );
};

export default PublicRegistration;

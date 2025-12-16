import React, { useState, useEffect } from 'react';
import { createReservation, getReservations, updateReservation } from '../services/dataService';
import { TicketType, PaymentStatus, CheckInStatus, Reservation } from '../types';
import { CheckCircle, AlertCircle, Phone, User, Ticket, Search, XCircle, AlertTriangle, CalendarDays, Info, FileText, ScrollText, Wand2, Timer, TrendingUp } from 'lucide-react';
import EventSchedule from './EventSchedule';

const PublicRegistration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'manage'>('register');
  
  // Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    adults: 1,
    children: 0,
    subscribe: false,
  });
  const [agreedToWaiver, setAgreedToWaiver] = useState(false); // New state for waiver
  const [showWaiverModal, setShowWaiverModal] = useState(false); // New state for modal
  const [submitted, setSubmitted] = useState(false);
  const [reservationId, setReservationId] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [submitError, setSubmitError] = useState(''); // New state for form submission errors

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Manage/Cancel State
  const [managePhone, setManagePhone] = useState('');
  const [manageName, setManageName] = useState(''); 
  const [myRes, setMyRes] = useState<Reservation | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  // Countdown Logic (Mock Target: Feb 15, 2026 for Early Bird End)
  useEffect(() => {
    const targetDate = new Date('2026-02-15T23:59:59').getTime();
    
    // For demo purposes, if target is passed, set a fake future date relative to now
    // In real app, this would be fixed. Here we ensure the visual always shows something cool.
    const demoTarget = new Date().getTime() + (5 * 24 * 60 * 60 * 1000) + (14 * 60 * 60 * 1000); // 5 days, 14 hours from now

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = demoTarget - now;

      if (distance < 0) {
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  
  // Strict Phone Validation
  const validatePhone = (phone: string) => {
    const phoneRegex = /^(\+?1)?[ -. ]?\(?([0-9]{3})\)?[ -. ]?([0-9]{3})[ -. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
  };

  // --- MAGIC FILL (TEST DEMO) ---
  const handleMagicFill = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller'];
    const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    
    setFormData({
      name: randomName,
      phone: `508-555-${randomNum}`,
      email: `test.${randomNum}@example.com`,
      adults: Math.floor(1 + Math.random() * 3), // 1-3 adults
      children: Math.floor(Math.random() * 3), // 0-2 children
      subscribe: true,
    });
    setAgreedToWaiver(true); // Auto check waiver for speed
    setPhoneError('');
    setSubmitError(''); // Clear errors
  };

  // --- REGISTRATION LOGIC ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    setSubmitError(''); // Clear previous errors

    if (!validatePhone(formData.phone)) {
      setPhoneError('请输入有效的美国手机号码 (Please enter a valid US phone number)');
      return;
    }

    if (formData.adults + formData.children === 0) {
      setSubmitError("总人数必须大于0 (Total attendees must be greater than 0)");
      return;
    }

    if (!agreedToWaiver) {
      setSubmitError("请勾选同意免责声明 (Please check the Waiver box to continue)");
      return;
    }

    const newRes = createReservation({
      contactName: formData.name,
      phoneNumber: formData.phone,
      email: formData.email,
      adultsCount: Number(formData.adults),
      childrenCount: Number(formData.children),
      ticketType: TicketType.EarlyBird,
      checkInStatus: CheckInStatus.NotArrived,
      paymentStatus: PaymentStatus.Unpaid,
      notes: formData.subscribe ? 'Subscribed' : '',
    });

    setReservationId(newRes.id);
    setSubmitted(true);
  };

  // --- MANAGE / CANCEL LOGIC ---
  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setCancelSuccess(false);
    setMyRes(null);

    const cleanPhone = managePhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setLookupError('请输入完整的10位电话号码');
      return;
    }

    if (!manageName.trim()) {
      setLookupError('请输入预约姓名以验证身份 (Please enter the contact name for verification)');
      return;
    }

    const allReservations = getReservations();
    // Find the most recent active reservation for this phone AND name check
    const found = allReservations.find(r => {
      const phoneMatch = r.phoneNumber.replace(/\D/g, '').includes(cleanPhone);
      // Case-insensitive partial match for name to be user-friendly but secure enough
      const nameMatch = r.contactName.toLowerCase().includes(manageName.trim().toLowerCase());
      const isActive = r.checkInStatus !== CheckInStatus.Cancelled;
      return phoneMatch && nameMatch && isActive;
    });

    if (found) {
      setMyRes(found);
    } else {
      setLookupError('未找到匹配的预约记录，请检查手机号或姓名 (No matching reservation found, please check phone and name)');
    }
  };

  // Helper variables for button state
  const getCancelEligibility = () => {
      if (!myRes) return { canCancel: false, reason: '' };

      // 1. Check Checked In Status
      if (myRes.checkInStatus === CheckInStatus.Arrived) {
          return { canCancel: false, reason: 'arrived' };
      }

      // 2. Check 72 Hour Rule
      const eventDate = new Date('2026-03-08T10:00:00').getTime();
      const now = Date.now();
      const hoursLeft = (eventDate - now) / (1000 * 60 * 60);

      if (hoursLeft < 72) {
          return { canCancel: false, reason: 'too_late' };
      }

      return { canCancel: true, reason: '' };
  };

  const { canCancel, reason } = getCancelEligibility();

  const handleCancelRequest = () => {
    if (!myRes || !canCancel) return;
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    if (!myRes) return;

    updateReservation(myRes.id, { checkInStatus: CheckInStatus.Cancelled });
    setShowCancelModal(false);
    setCancelSuccess(true);
    setMyRes(null);
  };

  // --- RENDER SUCCESS VIEW (Registration) ---
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 mt-8 relative">
        <div className="h-4 bg-cny-red w-full"></div>
        <div className="p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-4 animate-bounce-subtle">
                <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">预约成功!</h2>
          <p className="text-gray-500 uppercase tracking-wide mb-8 font-medium">Reservation Confirmed</p>
          
          <div className="bg-gradient-to-br from-cny-red to-cny-dark p-6 rounded-xl text-white shadow-lg mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            <div className="relative z-10">
                <p className="text-cny-gold text-sm font-bold uppercase tracking-widest mb-2">Access Code</p>
                <p className="text-5xl font-mono font-bold tracking-wider drop-shadow-md">{reservationId}</p>
                <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs opacity-90">
                    <span>Natick CNY 2026</span>
                    <span>{new Date().toLocaleDateString()}</span>
                </div>
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg text-left text-sm space-y-3 mb-8 border border-gray-200">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-600">联系人 (Contact):</span>
              <span className="font-bold text-lg">{formData.name}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-600">人数 (People):</span>
              <span className="font-bold text-lg">
                {Number(formData.adults)} Adult, {Number(formData.children)} Child
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2 bg-yellow-50 -mx-5 px-5 pt-2">
              <span className="text-gray-600 font-bold">预计费用 (Est. Cost):</span>
              <span className="font-bold text-2xl text-cny-red">${Number(formData.adults) * 15}</span>
            </div>
            <div className="text-xs text-gray-500 mt-2 italic text-center">
               * Children are free. Adults $15/each (Early Bird).
            </div>
          </div>

          <button 
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', phone: '', email: '', adults: 1, children: 0, subscribe: false });
              setAgreedToWaiver(false);
            }}
            className="w-full py-3 text-cny-red hover:text-white hover:bg-cny-red border border-cny-red rounded-lg transition font-bold"
          >
            为其他家庭预约 Make another reservation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-12">
      {/* Header Visual */}
      <div className="text-center mb-8 pt-6 relative">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-cny-red text-cny-gold w-20 h-20 rounded-full flex items-center justify-center text-4xl font-serif border-4 border-white shadow-lg z-10">
          马
        </div>
        <div className="mt-10">
          <h2 className="text-3xl font-bold text-cny-red">Natick 2026 马年春晚</h2>
          <p className="text-xl text-gray-700 font-medium mt-1">社区活动预约</p>
        </div>
      </div>

      <EventSchedule />

      {/* Tabs */}
      <div className="flex rounded-lg bg-gray-200 p-1 mb-6">
        <button 
          onClick={() => setActiveTab('register')}
          className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'register' ? 'bg-white text-cny-red shadow' : 'text-gray-500 hover:text-gray-700'}`}
        >
          预约活动 Register
        </button>
        <button 
          onClick={() => setActiveTab('manage')}
          className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'manage' ? 'bg-white text-cny-red shadow' : 'text-gray-500 hover:text-gray-700'}`}
        >
          管理/取消 Manage
        </button>
      </div>

      {activeTab === 'register' ? (
        /* REGISTRATION FORM */
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl border-t-8 border-cny-gold relative">
          
          {/* MAGIC FILL BUTTON (UPDATED - VISIBLE & LABELED) */}
          <div className="flex justify-end mb-4">
              <button 
                type="button"
                onClick={handleMagicFill}
                className="bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 px-3 py-1.5 rounded-lg shadow-sm transition-all text-xs font-bold flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                测试专用：一键填充 (Magic Fill)
              </button>
          </div>

          {/* COUNTDOWN TICKER */}
          <div className="mb-6 rounded-lg overflow-hidden border border-orange-200 shadow-sm">
             <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-3 flex items-center justify-between text-amber-900">
                <div className="flex items-center gap-2">
                   <div className="bg-white p-1.5 rounded-full shadow-sm animate-pulse">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                   </div>
                   <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-orange-800">Price Jump Alert</p>
                      <p className="text-xs font-medium leading-tight">Price increases to <span className="font-bold line-through text-orange-400">$20</span> soon!</p>
                   </div>
                </div>
                <div className="text-right">
                   <div className="font-mono font-bold text-lg leading-none tracking-tight">
                     {String(timeLeft.days).padStart(2, '0')}:{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}
                   </div>
                   <p className="text-[10px] uppercase font-bold text-orange-600">Time Left</p>
                </div>
             </div>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 pb-2 border-b border-gray-100">
            <Ticket className="text-cny-red w-5 h-5" /> 填写预约信息
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-bold text-gray-800 mb-1 flex items-center gap-1">
                <User className="w-4 h-4 text-gray-500" />
                联系人姓名 <span className="font-normal text-gray-500 text-sm">(Contact Name)</span> 
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cny-red focus:border-cny-red outline-none transition bg-gray-50"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="请输入姓名 e.g., San Zhang"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1 flex items-center gap-1">
                <Phone className="w-4 h-4 text-gray-500" />
                手机号码 <span className="font-normal text-gray-500 text-sm">(Phone Number)</span> 
                <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                className={`w-full p-3 border rounded-lg focus:ring-2 outline-none transition bg-gray-50 ${phoneError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-cny-red focus:border-cny-red'}`}
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="e.g., 508-555-0123"
              />
              {phoneError && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{phoneError}</p>}
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">电子邮箱 <span className="font-normal text-gray-500 text-sm">(Email)</span></label>
              <input
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cny-red focus:border-cny-red outline-none transition bg-gray-50"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="选填 Optional"
              />
            </div>

            <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <label className="block font-bold text-gray-800 mb-1">成人 <span className="font-normal text-gray-500 text-sm">(Adults)</span></label>
                <div className="relative">
                  <input
                      type="number"
                      min="0"
                      max="20"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cny-red focus:border-cny-red outline-none transition text-center text-lg font-semibold"
                      value={formData.adults}
                      onChange={e => setFormData({...formData, adults: Number(e.target.value)})}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">$15</span>
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-800 mb-1">儿童 <span className="font-normal text-gray-500 text-sm">(Kids)</span></label>
                <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cny-red focus:border-cny-red outline-none transition text-center text-lg font-semibold"
                      value={formData.children}
                      onChange={e => setFormData({...formData, children: Number(e.target.value)})}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-green-500">FREE</span>
                </div>
              </div>
            </div>

            <div className="bg-cny-red/5 p-4 rounded-lg border border-cny-red/10 mt-4">
              <div className="flex justify-between items-center text-xl">
                <span className="font-bold text-gray-700">总金额 <span className="text-sm font-normal">(Total)</span>:</span>
                <span className="text-2xl font-bold text-cny-red">${Number(formData.adults) * 15}</span>
              </div>
              <p className="text-xs text-gray-500 text-right mt-1">现场支付 (Pay on-site)</p>
            </div>

            <div className="flex flex-col gap-3 mb-2 pt-2">
              <div className="flex items-start gap-3">
                 <input 
                   type="checkbox" 
                   id="waiver"
                   checked={agreedToWaiver}
                   onChange={e => setAgreedToWaiver(e.target.checked)}
                   className="w-5 h-5 mt-0.5 rounded text-cny-red focus:ring-cny-red border-gray-300"
                 />
                 <label htmlFor="waiver" className="text-sm text-gray-600 leading-tight">
                    我已阅读并同意 <button type="button" onClick={() => setShowWaiverModal(true)} className="text-blue-600 underline font-bold hover:text-blue-800">免责声明与肖像权授权 (Waiver & Media Consent)</button>
                    <span className="text-red-500 ml-1">*</span>
                 </label>
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="subscribe"
                  checked={formData.subscribe}
                  onChange={e => setFormData({...formData, subscribe: e.target.checked})}
                  className="w-5 h-5 rounded text-cny-red focus:ring-cny-red border-gray-300"
                />
                <label htmlFor="subscribe" className="text-sm text-gray-600">接收活动通知 <span className="text-xs">(Notifications)</span></label>
              </div>
            </div>

            {/* ERROR MESSAGE DISPLAY */}
            {submitError && (
               <div className="mb-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg flex items-start gap-2 text-sm font-bold animate-pulse">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>{submitError}</div>
               </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cny-red to-cny-dark hover:from-red-700 hover:to-red-900 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-lg flex items-center justify-center gap-2"
            >
              立即预约 Reserve Now
            </button>
          </form>
        </div>
      ) : (
        /* MANAGE RESERVATION TAB */
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl border-t-8 border-gray-600">
           <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 pb-2 border-b border-gray-100">
            <Search className="text-gray-600 w-5 h-5" /> 查询预约 (Lookup)
          </h3>

          {/* Test Data Helper */}
          {!myRes && !cancelSuccess && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-sm text-blue-800">
              <div className="flex items-center gap-2 font-bold mb-2">
                <Info className="w-4 h-4" />
                <span>测试账号 (Test Data)</span>
              </div>
              <ul className="space-y-1 text-xs list-disc pl-4 opacity-80">
                <li><span className="font-bold">Qiang Wang / 5085550101</span> - 未签到 (Unpaid)</li>
                <li><span className="font-bold">Emily Chen / 6175550202</span> - 未签到 (Unpaid)</li>
                <li><span className="font-bold">Jianguo Liu / 7815550303</span> - 已签到 (Arrived)</li>
              </ul>
            </div>
          )}

          {!myRes && !cancelSuccess && (
            <form onSubmit={handleLookup} className="space-y-6">
               <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">
                       预约人姓名 <span className="text-red-500">*</span>
                       <br/>
                       <span className="font-normal text-gray-500 text-sm">Contact Name</span>
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-lg bg-gray-50"
                      value={manageName}
                      onChange={e => setManageName(e.target.value)}
                      placeholder="e.g. Qiang Wang"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">
                       手机号码 <span className="text-red-500">*</span>
                       <br/>
                       <span className="font-normal text-gray-500 text-sm">Phone Number</span>
                    </label>
                    <input
                      type="tel"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-lg bg-gray-50"
                      value={managePhone}
                      onChange={e => setManagePhone(e.target.value)}
                      placeholder="e.g. 5085550101"
                    />
                  </div>
                  
                  <button type="submit" className="w-full bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-700 flex items-center justify-center gap-2">
                    <Search className="w-4 h-4" /> 查询 Find Reservation
                  </button>
                </div>
                {lookupError && <p className="text-red-500 mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> {lookupError}</p>}
            </form>
          )}

          {cancelSuccess && (
             <div className="text-center py-8">
                <div className="inline-flex bg-gray-100 p-4 rounded-full mb-4">
                  <XCircle className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">已取消 Cancelled</h3>
                <p className="text-gray-500 mt-2">您的预约已取消。期待下次见到您！<br/>Your reservation has been cancelled.</p>
                <button 
                  onClick={() => { setCancelSuccess(false); setManagePhone(''); setManageName(''); }}
                  className="mt-6 text-blue-600 font-bold hover:underline"
                >
                  返回 Back
                </button>
             </div>
          )}

          {myRes && (
            <div className="mt-4 animate-fade-in">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">{myRes.contactName}</h4>
                    <p className="text-gray-500 text-sm">{myRes.phoneNumber}</p>
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {myRes.ticketType}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white p-3 rounded border border-gray-100">
                    <span className="block text-gray-500 text-xs">Access Code</span>
                    <span className="block font-mono font-bold text-lg text-gray-800">{myRes.id}</span>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-100">
                    <span className="block text-gray-500 text-xs">Total People</span>
                    <span className="block font-bold text-lg text-gray-800">{myRes.totalPeople}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3 mb-6">
                 <CalendarDays className="w-5 h-5 text-yellow-600 mt-0.5" />
                 <div>
                   <h5 className="font-bold text-yellow-800 text-sm">Cancellation Policy</h5>
                   <p className="text-xs text-yellow-700 mt-1">
                     Please cancel at least 72 hours before the event (Before March 5, 2026) to release your spot for others.
                   </p>
                 </div>
              </div>

              <button 
                onClick={handleCancelRequest}
                disabled={!canCancel}
                className={`w-full py-4 border-2 font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                    canCancel 
                      ? 'border-red-500 text-red-600 hover:bg-red-50' 
                      : 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                  }`}
              >
                {reason === 'arrived' ? (
                   <><CheckCircle className="w-5 h-5" /> 已签到 Cannot Cancel (Checked In)</>
                ) : reason === 'too_late' ? (
                   <><AlertTriangle className="w-5 h-5" /> 超过期限 Cannot Cancel (Too Late)</>
                ) : (
                   <><XCircle className="w-5 h-5" /> 取消预约 Cancel Reservation</>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl transform transition-all scale-100">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">确定要取消吗?</h3>
              <p className="text-center text-gray-500 text-sm mb-6">
                 Are you sure you want to cancel?
              </p>
              
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                 <p className="text-red-800 font-bold text-sm text-center">
                   ⚠️ 注意 Warning
                 </p>
                 <p className="text-red-600 text-xs text-center mt-1">
                   取消预约将释放您的午餐名额。<br/>
                   This will remove the lunch box quota.
                 </p>
              </div>

              <div className="flex gap-3">
                 <button 
                   onClick={() => setShowCancelModal(false)}
                   className="flex-1 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300"
                 >
                   保留 Keep
                 </button>
                 <button 
                   onClick={confirmCancel}
                   className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
                 >
                   确认取消 Confirm
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* WAIVER MODAL (New) */}
      {showWaiverModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl max-w-2xl w-full flex flex-col shadow-2xl max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                 <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                   <ScrollText className="w-5 h-5 text-cny-red" />
                   免责声明与媒体授权
                 </h3>
                 <button 
                   onClick={() => setShowWaiverModal(false)}
                   className="text-gray-400 hover:text-gray-600"
                 >
                   <XCircle className="w-6 h-6" />
                 </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="p-6 overflow-y-auto text-sm text-gray-600 leading-relaxed space-y-4">
                 <div className="border border-gray-100 p-4 rounded bg-gray-50/50">
                    <h4 className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-wider">Waiver and Release of Liability</h4>
                    <p>
                      I hereby assume all of the risks of participating in the 2026 Natick Chinese New Year Gala. 
                      I certify that I am physically fit, have sufficiently prepared or trained for participation in this activity, 
                      and have not been advised to not participate by a qualified medical professional.
                    </p>
                    <p className="mt-2">
                      I acknowledge that this Accident Waiver and Release of Liability Form will be used by the event holders, 
                      sponsors, and organizers of the activity in which I may participate, and that it will govern my actions and responsibilities at said activity.
                    </p>
                    <p className="mt-2">
                      In consideration of my application and permitting me to participate in this activity, I hereby take action for myself, 
                      my executors, administrators, heirs, next of kin, successors, and assigns as follows:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>(A) I WAIVE, RELEASE, AND DISCHARGE from any and all liability, including but not limited to, liability arising from the negligence or fault of the entities or persons released, for my death, disability, personal injury, property damage, property theft, or actions of any kind which may hereafter occur to me including my traveling to and from this activity.</li>
                      <li>(B) I INDEMNIFY, HOLD HARMLESS, AND PROMISE NOT TO SUE the entities or persons mentioned in this paragraph from any and all liabilities or claims made as a result of participation in this activity, whether caused by the negligence of release or otherwise.</li>
                    </ul>
                 </div>

                 <div className="border border-gray-100 p-4 rounded bg-gray-50/50">
                    <h4 className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-wider">Media Consent / Photo Release</h4>
                    <p>
                      I understand that at this event or related activities, I may be photographed. I agree to allow my photo, video, or film likeness to be used for any legitimate purpose by the event holders, producers, sponsors, organizers, and assigns, including but not limited to usage on the Natick CNY website, social media channels, and promotional materials.
                    </p>
                 </div>

                 <div className="border border-gray-100 p-4 rounded bg-gray-50/50">
                    <h4 className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-wider">Medical Consent</h4>
                    <p>
                       I hereby consent to receive medical treatment which may be deemed advisable in the event of injury, accident, and/or illness during this activity.
                    </p>
                 </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                 <button 
                   onClick={() => setShowWaiverModal(false)}
                   className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg"
                 >
                   关闭 Close
                 </button>
                 <button 
                   onClick={() => {
                     setAgreedToWaiver(true);
                     setShowWaiverModal(false);
                   }}
                   className="px-6 py-2 bg-cny-red text-white font-bold rounded-lg hover:bg-red-700 shadow-md flex items-center gap-2"
                 >
                   <CheckCircle className="w-4 h-4" /> 我同意 I Agree
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default PublicRegistration;

import React, { useState, useEffect } from 'react';
import { TicketType } from '../../types';
import { AlertCircle, ChevronLeft, Gift, Info, Loader2, Mail, Minus, Phone, Plus, ShieldCheck, Sparkles, Star, Zap, Ticket } from 'lucide-react';

interface StepTwoProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  submitError: string;
  agreedToWaiver: boolean;
  setAgreedToWaiver: (val: boolean) => void;
  setShowWaiverModal: (val: boolean) => void;
  handlePrevStep: () => void;
  triggerHaptic: (pattern?: number | number[]) => void;
  currentPrice: number;
}

export const StepTwoForm: React.FC<StepTwoProps> = ({
  formData, setFormData, handleSubmit, loading, submitError,
  agreedToWaiver, setAgreedToWaiver, setShowWaiverModal, handlePrevStep, triggerHaptic, currentPrice
}) => {

  const adjustCount = (field: 'adults' | 'children', delta: number) => {
    setFormData(prev => {
      const currentVal = prev[field] as number || 0;
      // Enforce minimum 1 for adults, 0 for children
      const minLimit = field === 'adults' ? 1 : 0;
      const newVal = Math.max(minLimit, Math.min(20, currentVal + delta));
      return { ...prev, [field]: newVal };
    });
    triggerHaptic(5);
  };

  const isEarlyBird = formData.ticketType === TicketType.EarlyBird;
  const savings = isEarlyBird ? formData.adults * 5 : 0;
  const regularTotal = formData.adults * 20;

  const [waiverError, setWaiverError] = useState(false);

  useEffect(() => {
    if (submitError && submitError.includes('Agreement')) {
      setWaiverError(true);
      const timer = setTimeout(() => setWaiverError(false), 800);
      return () => clearTimeout(timer);
    }
  }, [submitError]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Visual Reminder Header */}
      <div className="relative p-6 rounded-[2rem] bg-gradient-to-br from-cny-gold/20 to-transparent border border-cny-gold/40 shadow-inner overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck className="w-24 h-24 text-cny-red" /></div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="bg-cny-gold p-3 rounded-2xl shadow-sm shrink-0">
            <Info className="w-5 h-5 text-cny-red" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">请填写真实姓名和联系方式</h4>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              为了保障您的抽奖权益及快速现场核销，请确保提供您的<span className="text-cny-red font-black">真实姓名</span>。我们承诺您的个人资料仅用于本次活动预约。
            </p>
            <div className="flex gap-4 pt-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-cny-red uppercase tracking-tighter">
                <Gift className="w-3.5 h-3.5" /> 抽奖唯一凭证
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-cny-red uppercase tracking-tighter">
                <Zap className="w-3.5 h-3.5" /> 快速签到通道
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">姓 Last Name <span className="text-cny-red">*</span></label>
          <input required className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-cny-red/5 focus:bg-white transition-all font-bold" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} placeholder="例: Zhang" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">名 First Name <span className="text-cny-red">*</span></label>
          <input required className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-cny-red/5 focus:bg-white transition-all font-bold" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} placeholder="例: San" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">手机号 Phone <span className="text-cny-red">*</span></label>
          <div className="relative">
            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input type="tel" required className="w-full pl-12 pr-5 py-5 bg-gray-50 border border-gray-100 rounded-3xl font-bold focus:ring-4 focus:ring-cny-red/5 focus:bg-white transition-all" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="508-xxx-xxxx" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">电子邮箱 Email <span className="text-cny-red">*</span></label>
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input type="email" required className="w-full pl-12 pr-5 py-5 bg-gray-50 border border-gray-100 rounded-3xl font-bold focus:ring-4 focus:ring-cny-red/5 focus:bg-white transition-all" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="用于接收确认邮件" />
          </div>
        </div>
      </div>

      <div className="p-6 bg-cny-gold/10 rounded-[2.5rem] border-2 border-cny-gold/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-cny-gold p-2 rounded-xl"><Star className="w-4 h-4 text-cny-red fill-cny-red" /></div>
            <p className="text-sm font-black text-gray-900 uppercase tracking-tighter">表演人员身份确认 <span className="text-cny-red">*</span></p>
          </div>
          <div className="flex items-center gap-1 bg-white/50 p-1 rounded-2xl border border-cny-gold/10">
            <button type="button" onClick={() => { setFormData({ ...formData, isPerformer: false, performanceUnit: '' }); triggerHaptic(10); }} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${!formData.isPerformer ? 'bg-gray-200 text-gray-700' : 'text-gray-400'}`}>否 NO</button>
            <button type="button" onClick={() => { setFormData({ ...formData, isPerformer: true }); triggerHaptic(10); }} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.isPerformer ? 'bg-cny-red text-white' : 'text-gray-400'}`}>是 YES</button>
          </div>
        </div>
        {formData.isPerformer && (
          <div className="animate-in slide-in-from-top-2 duration-300 space-y-2">
            <label className="text-[10px] font-black text-cny-red uppercase tracking-[0.2em] px-1">表演单位 / 节目名称 <span className="text-cny-red">*</span></label>
            <input required className="w-full p-4 bg-white border border-cny-gold/30 rounded-2xl font-bold text-sm" value={formData.performanceUnit} onChange={e => setFormData({ ...formData, performanceUnit: e.target.value })} placeholder="如：中文学校舞蹈组" />
          </div>
        )}
      </div>

      <div className="p-2 bg-gray-50 rounded-[2.5rem] border border-gray-100 grid grid-cols-2 gap-2">
        <div className="bg-white p-6 rounded-[2rem] text-center shadow-sm">
          <span className="text-[10px] font-black text-gray-400 block mb-4 uppercase tracking-[0.2em]">成人 Adults</span>
          <div className="flex items-center justify-between px-2">
            <button
              type="button"
              onClick={() => adjustCount('adults', -1)}
              disabled={formData.adults <= 1}
              className="p-3 hover:bg-cny-red hover:text-white rounded-2xl transition-all active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-black text-4xl text-gray-900">{formData.adults}</span>
            <button type="button" onClick={() => adjustCount('adults', 1)} className="p-3 hover:bg-cny-red hover:text-white rounded-2xl transition-all active:scale-90"><Plus className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] text-center shadow-sm">
          <span className="text-[10px] font-black text-gray-400 block mb-4 uppercase tracking-[0.2em]">儿童 Kids</span>
          <div className="flex items-center justify-between px-2">
            <button type="button" onClick={() => adjustCount('children', -1)} className="p-3 hover:bg-cny-red hover:text-white rounded-2xl transition-all active:scale-90"><Minus className="w-4 h-4" /></button>
            <span className="font-black text-4xl text-gray-900">{formData.children}</span>
            <button type="button" onClick={() => adjustCount('children', 1)} className="p-3 hover:bg-cny-red hover:text-white rounded-2xl transition-all active:scale-90"><Plus className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Premium Ticket Stub Design */}
      <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl isolate">
        {/* Main Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D72638] to-[#991b1b]"></div>

        {/* Texture Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

        <div className="relative flex flex-col sm:flex-row items-stretch min-h-[140px]">

          {/* Left Side: The Bill */}
          <div className="flex-1 p-8 sm:p-10 text-white flex flex-col justify-center relative">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">预计总费用 Estimated Total</span>
            <div className="text-5xl sm:text-6xl font-black flex items-baseline gap-2 tracking-tighter">
              <span className="text-2xl font-medium opacity-80">$</span>
              {formData.adults * currentPrice}
            </div>
            <div className="mt-3 flex items-center gap-2 opacity-60">
              <Ticket className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">现场支付 · 仅限现金</span>
            </div>
          </div>

          {/* Perforation Line (CSS Dashed Border) */}
          <div className="hidden sm:block absolute top-0 bottom-0 left-[60%] w-[1px] border-l-2 border-dashed border-white/20 z-10"></div>
          <div className="hidden sm:block absolute top-[-10px] left-[60%] w-5 h-5 bg-white rounded-full -translate-x-1/2 z-20"></div>
          <div className="hidden sm:block absolute bottom-[-10px] left-[60%] w-5 h-5 bg-white rounded-full -translate-x-1/2 z-20"></div>

          {/* Right Side: The Savings (Golden Ticket Stub) */}
          {isEarlyBird && formData.adults > 0 ? (
            <div className="sm:w-[40%] bg-gradient-to-br from-[#FCE7BB] via-[#F8C471] to-[#D4AC0D] relative overflow-hidden flex flex-col justify-center p-8 text-[#8a1c26] group">
              {/* Sheen Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 translate-x-[-200%] animate-[shimmer_3s_infinite]"></div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#8a1c26]/10 border border-[#8a1c26]/10 mb-2">
                  <Zap className="w-3 h-3 fill-[#8a1c26]" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Early Bird</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold line-through opacity-50 decoration-2">Regular ${regularTotal}</span>
                  <span className="text-2xl font-black tracking-tight leading-none">节省 Save ${savings}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Standard Ticket Right Side */
            <div className="sm:w-[40%] bg-black/20 p-8 flex flex-col justify-center items-start text-white/40">
              <div className="w-12 h-1 bg-white/10 rounded-full mb-2"></div>
              <div className="text-[10px] font-bold uppercase tracking-widest">常规票价 Standard</div>
            </div>
          )}
        </div>
      </div>

      <div className={`flex items-start gap-4 p-6 rounded-3xl border transition-all duration-300 ${waiverError ? 'bg-red-50 border-red-300 animate-shake shadow-lg shadow-red-500/10' : 'bg-gray-50/50 border-gray-100'}`}>
        <input type="checkbox" id="waiver" checked={agreedToWaiver} onChange={e => { setAgreedToWaiver(e.target.checked); triggerHaptic(10); }} className="w-6 h-6 rounded-lg text-cny-red cursor-pointer mt-1 shrink-0" />
        <label htmlFor="waiver" className={`text-sm leading-relaxed font-medium transition-colors ${waiverError ? 'text-red-700' : 'text-gray-500'}`}>
          <div className="mb-1">
            我确认已满 18 周岁，已阅读并同意 <button type="button" onClick={() => setShowWaiverModal(true)} className={`${waiverError ? 'text-red-800' : 'text-cny-red'} font-bold hover:underline decoration-2`}>上述所有条款（包含责任豁免、食品安全及肖像授权）</button>。我代表本人及本次报名中的所有未成年家属签署本协议。
          </div>
          <div className={`text-xs ${waiverError ? 'text-red-600/80' : 'text-gray-400'} font-normal`}>
            I certify that I am at least 18 years old and have read and agree to <button type="button" onClick={() => setShowWaiverModal(true)} className="hover:underline font-medium">all terms above, including the Liability Waiver, Food Safety Warning, and Media Release</button>. I sign this agreement on behalf of myself and all minors included in this registration.
          </div>
        </label>
      </div>

      {submitError && (
        <div className="p-5 bg-red-50 text-red-600 rounded-[2rem] flex items-center gap-4 border border-red-100 animate-shake">
          <AlertCircle className="w-6 h-6" />
          <span className="text-sm font-bold">{submitError}</span>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={handlePrevStep}
          disabled={loading}
          className="p-6 bg-gray-100 text-gray-400 rounded-[2rem] font-bold hover:bg-gray-200 transition-all active:scale-95 flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button disabled={loading} className="flex-1 py-6 bg-cny-red hover:bg-cny-dark text-white rounded-[2rem] font-black text-xl shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center">
          {loading ? <Loader2 className="animate-spin" /> : "立即提交预约 Submit"}
        </button>
      </div>
    </form>
  );
};

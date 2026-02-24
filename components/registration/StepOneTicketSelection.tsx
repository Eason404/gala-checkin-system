
import React from 'react';
import { TicketType } from '../../types';
import { ArrowRight, Flame, Gift, ShoppingBag, Sparkles, Ticket, Users, Utensils, Zap } from 'lucide-react';

interface StepOneProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  triggerHaptic: (pattern?: number | number[]) => void;
  handleNextStep: () => void;
  progressBarRef: React.RefObject<HTMLDivElement | null>;
  earlyBirdProgress: number;
}

export const StepOneTicketSelection: React.FC<StepOneProps> = ({ 
  formData, setFormData, triggerHaptic, handleNextStep, progressBarRef, earlyBirdProgress 
}) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center">
        <h3 className="text-4xl font-black text-gray-900 tracking-tight">新年献礼 · 选择票种</h3>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-3">BEST VALUE FOR YOUR CHINESE NEW YEAR CELEBRATION</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Early Bird - Re-engineered for maximum appeal */}
        <button 
          type="button" 
          onClick={() => { setFormData({...formData, ticketType: TicketType.EarlyBird}); triggerHaptic(20); }}
          className={`relative p-8 rounded-[3rem] border-2 transition-all group overflow-hidden text-left shadow-2xl
            ${formData.ticketType === TicketType.EarlyBird 
              ? 'border-cny-gold bg-gradient-to-br from-red-50 to-white ring-8 ring-cny-gold/10 scale-[1.03]' 
              : 'border-gray-50 bg-white hover:border-cny-red/20 hover:scale-[1.01]'}`}
        >
          {/* Badge */}
          <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-cny-red text-white px-8 py-3 rounded-bl-[2rem] font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 animate-pulse">
            <Flame className="w-4 h-4 fill-white" /> 限量 25% OFF · 最值推荐
          </div>
          
          <div className="flex items-start gap-6 mb-8 mt-4">
              <div className={`p-5 rounded-[1.5rem] transition-all duration-500 shadow-lg ${formData.ticketType === TicketType.EarlyBird ? 'bg-cny-red text-white rotate-6' : 'bg-gray-100 text-gray-400'}`}>
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <div className={`text-base font-black uppercase tracking-[0.2em] mb-1 ${formData.ticketType === TicketType.EarlyBird ? 'text-cny-red' : 'text-gray-400'}`}>
                    早鸟特别票 EARLY BIRD
                </div>
                <div className="flex items-end gap-3">
                    <div className="text-6xl font-black text-gray-900 tracking-tighter">$15</div>
                    <div className="text-2xl font-bold text-gray-300 line-through decoration-4 mb-2">$20</div>
                </div>
              </div>
          </div>

          {/* Value Points - High Value Renaming */}
          <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/80 p-3.5 rounded-2xl border border-gray-100 shadow-sm group-hover:bg-cny-red group-hover:text-white transition-colors">
                  <Utensils className={`w-4 h-4 transition-colors ${formData.ticketType === TicketType.EarlyBird ? 'text-cny-red group-hover:text-white' : 'text-gray-400 group-hover:text-white'}`} />
                  <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter group-hover:text-white transition-colors">“贺岁锦绣”开运午餐</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 p-3.5 rounded-2xl border border-gray-100 shadow-sm group-hover:bg-cny-red group-hover:text-white transition-colors">
                  <Users className={`w-4 h-4 transition-colors ${formData.ticketType === TicketType.EarlyBird ? 'text-cny-red group-hover:text-white' : 'text-gray-400 group-hover:text-white'}`} />
                  <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter group-hover:text-white transition-colors">春晚尊享坐席 Seats</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 p-3.5 rounded-2xl border border-gray-100 shadow-sm group-hover:bg-cny-red group-hover:text-white transition-colors">
                  <Gift className={`w-4 h-4 transition-colors ${formData.ticketType === TicketType.EarlyBird ? 'text-cny-red group-hover:text-white' : 'text-gray-400 group-hover:text-white'}`} />
                  <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter group-hover:text-white transition-colors">马年锦鲤抽奖 Raffle</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 p-3.5 rounded-2xl border border-gray-100 shadow-sm group-hover:bg-cny-red group-hover:text-white transition-colors">
                  <ShoppingBag className={`w-4 h-4 transition-colors ${formData.ticketType === TicketType.EarlyBird ? 'text-cny-red group-hover:text-white' : 'text-gray-400 group-hover:text-white'}`} />
                  <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter group-hover:text-white transition-colors">新春庙会通行 Fair</span>
              </div>
          </div>

          <div className="space-y-4" ref={progressBarRef}>
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-cny-red uppercase tracking-widest flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-cny-red" /> 火热销售中 SELLING FAST
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">抢购倒计时 · VALUE PACK</span>
                </div>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50">
                <div 
                  className="h-full bg-gradient-to-r from-cny-red via-orange-500 to-yellow-400 rounded-full shadow-[0_0_15px_rgba(215,38,56,0.4)] transition-all duration-[2500ms] cubic-bezier(0.65, 0, 0.35, 1)"
                  style={{ width: `${earlyBirdProgress}%` }}
                ></div>
              </div>
          </div>
        </button>

        {/* Regular - Simplified but elegant */}
        <button 
          type="button" 
          onClick={() => { setFormData({...formData, ticketType: TicketType.Regular}); triggerHaptic(20); }}
          className={`relative p-8 rounded-[3rem] border-2 transition-all group overflow-hidden text-left
            ${formData.ticketType === TicketType.Regular 
              ? 'border-gray-900 bg-gray-50 ring-8 ring-gray-900/5 scale-[1.01]' 
              : 'border-gray-50 bg-gray-50/50 opacity-40 grayscale hover:grayscale-0 transition-all'}`}
        >
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`p-5 rounded-[1.5rem] transition-colors ${formData.ticketType === TicketType.Regular ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    <Ticket className="w-8 h-8" />
                </div>
                <div>
                    <div className={`text-sm font-black uppercase tracking-[0.2em] mb-1 ${formData.ticketType === TicketType.Regular ? 'text-gray-900' : 'text-gray-400'}`}>
                      常规票 REGULAR
                    </div>
                    <div className="text-4xl font-black text-gray-900 tracking-tighter">$20</div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">库存充足</p>
                <p className="text-[9px] text-gray-300 font-medium">Available</p>
              </div>
          </div>
        </button>
      </div>

      <div className="pt-4">
        <button 
          onClick={handleNextStep}
          className="w-full py-7 bg-gradient-to-br from-cny-red to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-[2.5rem] font-black text-2xl shadow-[0_20px_40px_rgba(215,38,56,0.3)] transition-all active:scale-95 flex items-center justify-center gap-4 group relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-glass-shine -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
            <span className="relative z-10">确认票种并继续 Continue</span>
            <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform relative z-10" />
        </button>
        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-6">
          现场签到时支付 · 仅限现金或支票
        </p>
      </div>
    </div>
  );
};

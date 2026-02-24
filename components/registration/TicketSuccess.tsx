
import React from 'react';
import { CheckCircle, Loader2, Sparkles, Ticket } from 'lucide-react';
import { ConfettiBurst } from './ConfettiBurst';

interface TicketSuccessProps {
  reservationId: string;
  qrCodeData: string;
  formData: any;
  currentPrice: number;
  onReset: () => void;
}

export const TicketSuccess: React.FC<TicketSuccessProps> = ({ reservationId, qrCodeData, formData, currentPrice, onReset }) => {
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
            <h2 className="text-3xl font-bold text-gray-900 mb-1">新年大吉!</h2>
            <p className="text-gray-400 font-semibold mb-8 uppercase tracking-widest text-xs">Your Lucky Ticket is Ready</p>
            
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
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-1">Confirmation ID</span>
                      <span className="text-2xl font-mono font-bold text-cny-red tracking-wider">{reservationId}</span>
                    </div>
                </div>
              ) : <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
            </div>

            <div className="bg-cny-red text-white p-8 rounded-[2rem] shadow-2xl mb-8 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Ticket className="w-40 h-40" /></div>
              <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Guest</span>
                      <span className="font-bold text-lg">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Group</span>
                      <span className="font-bold">{formData.adults} Adults, {formData.children} Children</span>
                  </div>
                  {formData.isPerformer && (
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Performance</span>
                        <span className="font-bold text-cny-gold">{formData.performanceUnit}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                      <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Due at Door</span>
                      <span className="text-3xl font-bold text-cny-gold">${formData.adults * currentPrice}</span>
                  </div>
              </div>
            </div>

            <button 
              onClick={onReset}
              className="w-full py-5 bg-white border border-gray-100 text-gray-900 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-gray-50 transition shadow-sm active:scale-95"
            >
              再帮朋友预约 Another Registration
            </button>
          </div>
        </div>
      </div>
  );
};

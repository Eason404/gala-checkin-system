

import React from 'react';
import { Settings, X } from 'lucide-react';
import { TicketConfig } from '../../../types';

interface ConfigModalProps {
   showConfigModal: boolean;
   setShowConfigModal: (val: boolean) => void;
   editConfig: TicketConfig;
   setEditConfig: (val: TicketConfig) => void;
   handleSaveConfig: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
   showConfigModal, setShowConfigModal, editConfig, setEditConfig, handleSaveConfig
}) => {
   if (!showConfigModal) return null;

   return (
      <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
         <div className="bg-white max-w-sm w-full max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 relative">
            <div className="bg-gray-900 p-6 flex justify-between items-center text-white sticky top-0 z-10">
               <h3 className="font-bold text-lg flex items-center gap-2"><Settings className="w-5 h-5 text-cny-gold" /> 库存规划</h3>
               <button onClick={() => setShowConfigModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6">
               <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">总票数限制 (Total Tickets Cap)</label>
                  <input type="number" className="w-full p-4 bg-gray-50 rounded-xl font-bold text-3xl border border-gray-100 text-center" value={editConfig.totalCapacity} onChange={e => setEditConfig({ ...editConfig, totalCapacity: Number(e.target.value) })} />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">总人数限制 (Total Headcount Cap)</label>
                  <input type="number" className="w-full p-4 bg-gray-50 rounded-xl font-bold text-3xl border border-gray-100 text-center" value={editConfig.totalHeadcountCap} onChange={e => setEditConfig({ ...editConfig, totalHeadcountCap: Number(e.target.value) })} />
               </div>
               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">开启抽奖功能 (Enable Raffle Game)</label>
                  <input type="checkbox" className="w-6 h-6 rounded text-cny-red focus:ring-cny-red" checked={editConfig.lotteryEnabled || false} onChange={e => setEditConfig({ ...editConfig, lotteryEnabled: e.target.checked })} />
               </div>
               <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                  <label className="text-xs font-bold text-red-500 uppercase tracking-widest">关闭常规报名 (Close Regular Reg)</label>
                  <input type="checkbox" className="w-6 h-6 rounded text-red-600 focus:ring-red-600" checked={editConfig.regularRegistrationClosed || false} onChange={e => setEditConfig({ ...editConfig, regularRegistrationClosed: e.target.checked })} />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">🍱 总饭卡数量 (Total Meal Cards)</label>
                  <input type="number" className="w-full p-4 bg-orange-50 rounded-xl font-bold text-3xl border border-orange-200 text-center" value={editConfig.totalMealCards || 380} onChange={e => setEditConfig({ ...editConfig, totalMealCards: Number(e.target.value) })} />
                  <p className="text-[10px] text-gray-400 text-center">用于计算可售walk-in盒饭数量</p>
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">工作人员饭卡数 (Cards/Staff)</label>
                  <input type="number" className="w-full p-4 bg-purple-50 rounded-xl font-bold text-3xl border border-purple-200 text-center" value={editConfig.mealCardsPerStaff || 1} onChange={e => setEditConfig({ ...editConfig, mealCardsPerStaff: Number(e.target.value) })} />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">固定追踪的员工代码 (Tracked Codes)</label>
                  <input
                     type="text"
                     placeholder="A9X2M1, S1R5T9 (comma separated)"
                     className="w-full p-4 bg-gray-50 rounded-xl font-bold text-lg border border-gray-200 text-center"
                     value={editConfig.trackedStaffCodes?.join(', ') || ''}
                     onChange={e => {
                        const codes = e.target.value.split(',').map(c => c.trim()).filter(c => c !== '');
                        setEditConfig({ ...editConfig, trackedStaffCodes: codes });
                     }}
                  />
                  <p className="text-[10px] text-gray-400 text-center">强制在控制台显示这些员工 (Comma separated codes)</p>
               </div>

               <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <label className="text-xs font-bold text-blue-500 uppercase tracking-widest">开启现场注册 (Public Walk-In)</label>
                  <input type="checkbox" className="w-6 h-6 rounded text-blue-600 focus:ring-blue-600" checked={editConfig.publicWalkInEnabled || false} onChange={e => setEditConfig({ ...editConfig, publicWalkInEnabled: e.target.checked })} />
               </div>
               <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <label className="text-xs font-bold text-yellow-500 uppercase tracking-widest">仅限无饭票(No Food Only)</label>
                  <input type="checkbox" className="w-6 h-6 rounded text-yellow-600 focus:ring-yellow-600" checked={editConfig.walkInNoFoodOnly || false} onChange={e => setEditConfig({ ...editConfig, walkInNoFoodOnly: e.target.checked })} />
               </div>

               <button onClick={handleSaveConfig} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm uppercase tracking-[0.2em] shadow-xl">保存设置 Save Config</button>
            </div>
         </div>
      </div>
   );
};

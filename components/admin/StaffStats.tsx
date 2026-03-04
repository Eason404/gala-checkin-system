import React, { useMemo } from 'react';
import { Reservation, CheckInStatus, PaymentMethod } from '../../types';
import { Users } from 'lucide-react';

interface StaffStatsProps {
    reservations: Reservation[];
    staffMap: Record<string, string>;
}

export const StaffStats: React.FC<StaffStatsProps> = ({ reservations, staffMap }) => {
    const stats = useMemo(() => {
        const staffData: Record<string, { checkIns: number; cash: number }> = {};

        // Initialize with known staff members
        Object.entries(staffMap).forEach(([code, name]) => {
            staffData[code] = { checkIns: 0, cash: 0 };
        });

        reservations.forEach(r => {
            if (r.checkInStatus === CheckInStatus.Arrived && r.lastModifiedBy) {
                if (!staffData[r.lastModifiedBy]) {
                    staffData[r.lastModifiedBy] = { checkIns: 0, cash: 0 };
                }
                staffData[r.lastModifiedBy].checkIns += r.totalPeople;

                if (r.paymentMethod === PaymentMethod.Cash) {
                    staffData[r.lastModifiedBy].cash += (r.paidAmount || 0);
                }
            }
        });

        // Convert to array and filter out those with 0 activity if they aren't in staffMap
        return Object.entries(staffData).map(([code, data]) => ({
            code,
            name: staffMap[code] || code,
            ...data
        })).filter(s => s.code !== 'PUBLIC' && (s.checkIns > 0 || staffMap[s.code]))
            .sort((a, b) => b.checkIns - a.checkIns); // Sort by most check-ins
    }, [reservations, staffMap]);

    if (stats.length === 0) return null;

    return (
        <div className="animate-fade-in mb-8">
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 drop-shadow-md">
                <Users className="text-cny-gold w-6 h-6" /> 操作员统计 Staff Statistics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(staff => (
                    <div key={staff.code} className="glass-dark p-6 rounded-[2rem] border border-white/10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-colors">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cny-gold/5 to-orange-500/5 rounded-bl-[4rem] -z-10 group-hover:scale-110 transition-transform" />

                        <div className="mb-4">
                            <h4 className="text-white font-bold text-lg truncate" title={staff.name}>{staff.name}</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">已签到</p>
                                <p className="text-xl font-black text-white">{staff.checkIns}</p>
                            </div>
                            <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20">
                                <p className="text-green-400 text-[10px] font-bold uppercase tracking-wider mb-1">收现金</p>
                                <p className="text-xl font-black text-cny-gold">${staff.cash}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

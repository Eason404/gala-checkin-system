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

        return Object.entries(staffData).map(([code, data]) => ({
            code,
            name: staffMap[code] || code,
            ...data
        })).filter(s => s.code !== 'PUBLIC' && (s.checkIns > 0 || staffMap[s.code]))
            .sort((a, b) => b.checkIns - a.checkIns);
    }, [reservations, staffMap]);

    if (stats.length === 0) return null;

    return (
        <div>
            <h3 className="text-sm font-black text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users className="text-cny-gold w-4 h-4" /> Staff
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {stats.map(staff => (
                    <div key={staff.code} className="glass-dark p-4 rounded-2xl border border-white/10 shadow-lg">
                        <h4 className="text-white font-bold text-sm truncate mb-3" title={staff.name}>{staff.name}</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-blue-500/10 rounded-lg p-2 border border-blue-500/20">
                                <p className="text-blue-400 text-[9px] font-bold uppercase mb-0.5">Check-ins</p>
                                <p className="text-lg font-black text-white">{staff.checkIns}</p>
                            </div>
                            <div className="bg-green-500/10 rounded-lg p-2 border border-green-500/20">
                                <p className="text-green-400 text-[9px] font-bold uppercase mb-0.5">Cash</p>
                                <p className="text-lg font-black text-cny-gold">${staff.cash}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

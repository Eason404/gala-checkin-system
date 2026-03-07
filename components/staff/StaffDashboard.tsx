import React, { useMemo } from 'react';
import { Reservation, CheckInStatus, PaymentMethod } from '../../types';
import { getCurrentUserCode } from '../../services/authService';
import { Users, DollarSign, Clock, CheckCircle2 } from 'lucide-react';

interface StaffDashboardProps {
    reservations: Reservation[];
    onClose: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ reservations, onClose }) => {
    const currentUserCode = getCurrentUserCode();

    const stats = useMemo(() => {
        const myCheckIns = reservations.filter(
            r => r.lastModifiedBy === currentUserCode && r.checkInStatus === CheckInStatus.Arrived
        );

        let totalPeopleCheckedIn = 0;
        let totalCashCollected = 0;

        myCheckIns.forEach(r => {
            totalPeopleCheckedIn += r.totalPeople;
            // Depending on workflow, you might only consider cash payments
            if (r.paymentMethod === PaymentMethod.Cash) {
                totalCashCollected += (r.paidAmount || 0);
            }
        });

        // Sort by most recently updated/created for the recent list
        const recentCheckIns = [...myCheckIns].sort((a, b) => b.createdTime - a.createdTime).slice(0, 50);

        return { totalPeopleCheckedIn, totalCashCollected, myCheckIns, recentCheckIns };
    }, [reservations, currentUserCode]);

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="text-cny-gold w-5 h-5" /> My Stats
                </h2>
                <button
                    onClick={onClose}
                    className="text-white/40 hover:text-white transition-colors"
                >
                    Back
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="glass-dark p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Checked In</p>
                    <p className="text-3xl font-black text-white">{stats.totalPeopleCheckedIn}</p>
                    <p className="text-[10px] text-white/40 mt-1">People Checked-in</p>
                </div>

                <div className="glass-dark p-6 rounded-3xl border border-cny-gold/20 shadow-xl flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-cny-gold/20 text-cny-gold flex items-center justify-center mb-4">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Cash Collected</p>
                    <p className="text-3xl font-black text-cny-gold">${stats.totalCashCollected}</p>
                    <p className="text-[10px] text-white/40 mt-1">Cash Collected</p>
                </div>
            </div>

            <h3 className="text-white/80 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                <Clock className="w-4 h-4" />
                Recent Check-ins
            </h3>

            <div className="space-y-3">
                {stats.recentCheckIns.length === 0 ? (
                    <div className="glass-dark p-8 rounded-3xl text-center border border-white/5">
                        <p className="text-white/40 text-sm">No Records</p>
                        <p className="text-white/20 text-xs mt-1">No check-ins yet</p>
                    </div>
                ) : (
                    stats.recentCheckIns.map(res => (
                        <div key={res.id} className="glass-dark p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                            <div>
                                <p className="text-white font-bold">{res.contactName}</p>
                                <p className="text-white/40 text-[10px] font-mono mt-0.5">{res.id}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-cny-gold font-bold text-sm bg-cny-gold/10 px-2 py-1 rounded-lg">
                                    {res.totalPeople} People
                                </span>
                                {res.paymentMethod === PaymentMethod.Cash && res.paidAmount > 0 ? (
                                    <span className="text-green-400 font-bold text-sm bg-green-500/10 px-2 py-1 rounded-lg">
                                        +${res.paidAmount}
                                    </span>
                                ) : (
                                    <span className="text-white/20 text-xs">Pre-paid</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

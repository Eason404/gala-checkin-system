import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, Users, BarChart } from 'lucide-react';
import { getCurrentUserRole } from '../services/authService';

export const AdminSwitcher: React.FC = () => {
    const role = getCurrentUserRole();
    const location = useLocation();
    const navigate = useNavigate();

    // Only show switcher if user is an admin
    if (role !== 'admin') return null;

    const isStaff = location.pathname.includes('/staff');
    const isAdmin = location.pathname.includes('/admin');

    return (
        <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="glass-dark p-1.5 rounded-2xl inline-flex items-center gap-1 shadow-2xl border border-white/10 backdrop-blur-2xl">
                <div className="px-3 flex items-center gap-1.5 border-r border-white/10 shrink-0">
                    <Shield className="w-4 h-4 text-cny-gold" />
                    <span className="text-[10px] uppercase tracking-widest font-black text-white/50">Admin</span>
                </div>

                <button
                    onClick={() => navigate('/staff')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${isStaff
                            ? 'bg-cny-gold text-cny-dark shadow-lg shadow-cny-gold/20'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    签到台 Check-in
                </button>

                <button
                    onClick={() => navigate('/admin')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${isAdmin
                            ? 'bg-cny-gold text-cny-dark shadow-lg shadow-cny-gold/20'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <BarChart className="w-4 h-4" />
                    数据中心 Dashboard
                </button>
            </div>
        </div>
    );
};

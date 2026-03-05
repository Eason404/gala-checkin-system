import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, Users, BarChart, ClipboardList } from 'lucide-react';
import { getCurrentUserRole } from '../services/authService';

const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin',
    staff: 'Staff',
    observer: 'Observer',
};

export const AdminSwitcher: React.FC = () => {
    const role = getCurrentUserRole();
    const location = useLocation();
    const navigate = useNavigate();

    if (!role) return null;

    const isStaff = location.pathname.includes('/staff');
    const isAdminDashboard = location.pathname === '/admin' || location.pathname === '/admin/';
    const isAdminList = location.pathname.includes('/admin/list');

    const canCheckIn = role === 'staff' || role === 'admin';
    const canViewDashboard = true; // all authenticated roles
    const canViewList = role === 'observer' || role === 'admin';

    const btnClass = (active: boolean) =>
        `flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${active
            ? 'bg-cny-gold text-cny-dark shadow-lg shadow-cny-gold/20'
            : 'text-white/60 hover:text-white hover:bg-white/5'
        }`;

    return (
        <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="glass-dark p-1.5 rounded-2xl inline-flex items-center gap-1 shadow-2xl border border-white/10 backdrop-blur-2xl">
                <div className="px-3 flex items-center gap-1.5 border-r border-white/10 shrink-0">
                    <Shield className="w-3.5 h-3.5 text-cny-gold" />
                    <span className="text-[10px] uppercase tracking-widest font-black text-white/50">
                        {ROLE_LABELS[role] || role}
                    </span>
                </div>

                {canCheckIn && (
                    <button onClick={() => navigate('/staff')} className={btnClass(isStaff)}>
                        <Users className="w-4 h-4" />
                        Check-in
                    </button>
                )}

                {canViewDashboard && (
                    <button onClick={() => navigate('/admin')} className={btnClass(isAdminDashboard)}>
                        <BarChart className="w-4 h-4" />
                        Dashboard
                    </button>
                )}

                {canViewList && (
                    <button onClick={() => navigate('/admin/list')} className={btnClass(isAdminList)}>
                        <ClipboardList className="w-4 h-4" />
                        List
                    </button>
                )}
            </div>
        </div>
    );
};

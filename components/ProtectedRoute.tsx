
import React, { useState, useEffect } from 'react';
import { getCurrentUserRole, getCurrentUserCode, ENABLE_AUTH } from '../services/authService';
import Login from './Login';
import { Loader2, Lock, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff' | 'observer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  if (!ENABLE_AUTH) {
    return <>{children}</>;
  }

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'admin' | 'staff' | 'observer' | null>(null);
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    // With code access, check is synchronous from sessionStorage
    const r = getCurrentUserRole();
    const c = getCurrentUserCode();
    setRole(r);
    setCode(c);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cny-red" />
      </div>
    );
  }

  // Case 1: Not Authenticated (No valid code in session)
  if (!role || code === 'PUBLIC') {
    return <Login />;
  }

  // Case 2: Insufficient privileges
  const hasAccess = () => {
    if (!requiredRole) return true;
    if (role === 'admin') return true;
    if (requiredRole === 'staff' && role === 'staff') return true;
    if (requiredRole === 'observer' && (role === 'staff' || role === 'observer')) return true;
    return false;
  };

  if (!hasAccess()) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-orange-50 p-6 rounded-[2.5rem] mb-6 shadow-inner">
          <ShieldAlert className="w-12 h-12 text-orange-500" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">权限不足</h2>
        <p className="text-gray-400 mt-4 max-w-xs font-bold uppercase text-[10px] tracking-widest leading-relaxed">
          Access Code <span className="text-orange-500">{code}</span> has STAFF privileges.<br />
          This section requires ADMIN level access.
        </p>
        <button
          onClick={() => window.history.back()}
          className="mt-10 py-4 px-8 bg-gray-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          返回 Back
        </button>
      </div>
    );
  }

  // Case 3: Authorized
  return <>{children}</>;
};

export default ProtectedRoute;

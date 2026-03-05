
import React, { useState, useEffect } from 'react';
import { verifyStoredSession, getCurrentUserCode, ENABLE_AUTH, UserRole } from '../services/authService';
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
  const [role, setRole] = useState<UserRole>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      // Re-verify against Firestore to prevent sessionStorage tampering
      const result = await verifyStoredSession();
      if (cancelled) return;
      setRole(result.role);
      setVerified(result.valid);
      setLoading(false);
    };
    verify();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cny-red" />
      </div>
    );
  }

  // Case 1: Not Authenticated (No valid code in session)
  if (!role || !verified) {
    return <Login />;
  }

  // Case 2: Insufficient privileges
  const hasAccess = () => {
    if (!requiredRole) return true;
    if (role === 'admin') return true;

    // Strict role check
    if (requiredRole === 'staff') return role === 'staff';
    if (requiredRole === 'observer') return role === 'observer';

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
          Your account does not have sufficient privileges.<br />
          This section requires a higher access level.
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


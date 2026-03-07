
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { verifyStoredSession, getCurrentUserCode, ENABLE_AUTH, UserRole } from '../services/authService';
import Login from './Login';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'gm' | 'staff' | 'observer' | 'host';
}

/** Get the default landing page for a given role */
export const getRoleLandingPage = (role: UserRole): string => {
  switch (role) {
    case 'admin': return '/staff';
    case 'gm': return '/staff';
    case 'staff': return '/staff';
    case 'observer': return '/admin';
    case 'host': return '/raffle';
    default: return '/';
  }
};

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

  // Case 2: Insufficient privileges — auto-redirect to role-appropriate page
  const hasAccess = () => {
    if (!requiredRole) return true;
    if (role === 'admin' || role === 'gm') return true;

    // Staff can access observer-level pages (e.g. analytics dashboard)
    if (requiredRole === 'observer') return role === 'observer' || role === 'staff';
    if (requiredRole === 'staff') return role === 'staff';

    return false;
  };

  if (!hasAccess()) {
    return <Navigate to={getRoleLandingPage(role)} replace />;
  }

  // Case 3: Authorized
  return <>{children}</>;
};

export default ProtectedRoute;


import React, { useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getUserRole, ENABLE_AUTH } from '../services/authService';
import Login from './Login';
import { Loader2, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff'; // If undefined, just requires login
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  // FEATURE FLAG: If auth is disabled, bypass all checks and render content immediately.
  if (!ENABLE_AUTH) {
    return <>{children}</>;
  }

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'staff' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch role
        const r = await getUserRole(currentUser.email);
        setRole(r);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cny-red" />
      </div>
    );
  }

  // Case 1: Not Logged In
  if (!user) {
    return <Login />;
  }

  // Case 2: Logged In, but No Role assigned (Access Denied)
  if (!role) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-gray-200 p-4 rounded-full mb-4">
          <Lock className="w-8 h-8 text-gray-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Your account ({user.email}) is not authorized. Please ask an administrator to add you to the <b>roles</b> list.
        </p>
        <button onClick={() => auth.signOut()} className="mt-6 text-cny-red font-bold underline">
          Sign Out
        </button>
      </div>
    );
  }

  // Case 3: Logged In, Role assigned, but insufficient privileges (e.g. Staff trying to access Admin)
  if (requiredRole === 'admin' && role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-orange-100 p-4 rounded-full mb-4">
          <Lock className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Admin Access Only</h2>
        <p className="text-gray-500 mt-2">
          Your account ({user.email}) has <b>Staff</b> privileges, but this page requires <b>Admin</b> access.
        </p>
      </div>
    );
  }

  // Case 4: Authorized
  return <>{children}</>;
};

export default ProtectedRoute;
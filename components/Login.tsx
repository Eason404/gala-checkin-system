import React, { useState } from 'react';
import { loginWithGoogle } from '../services/authService';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      // Navigation is handled by the parent ProtectedRoute or AuthState listener
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full border-t-8 border-cny-red text-center">
        <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-cny-red" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Staff Access</h2>
        <p className="text-gray-500 mb-8 text-sm">
          Please verify your identity to access the staff or admin portal.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-lg shadow-sm transition flex items-center justify-center gap-3"
        >
          {loading ? (
            <Loader2 className="animate-spin w-5 h-5 text-gray-400" />
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </>
          )}
        </button>
      </div>
      <p className="mt-8 text-xs text-gray-400 text-center max-w-xs">
        Only authorized emails listed in the system will be granted access.
      </p>
    </div>
  );
};

export default Login;
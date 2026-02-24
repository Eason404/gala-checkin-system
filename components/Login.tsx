
import React, { useState, useRef, useEffect } from 'react';
import { loginWithCode } from '../services/authService';
import { Loader2, AlertCircle, KeyRound, Settings, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorType, setErrorType] = useState<'NONE' | 'INVALID' | 'DB_EMPTY' | 'ERROR'>('NONE');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return; // Enforce minimum 6 characters
    
    setLoading(true);
    setErrorType('NONE');

    try {
        const result = await loginWithCode(code);
        if (result.success) {
            window.location.reload();
        } else {
            if (result.error === 'NOT_FOUND') {
                setErrorType('INVALID');
            } else if (result.error === 'PERMISSION_DENIED') {
                setErrorType('DB_EMPTY');
            } else {
                setErrorType('ERROR');
            }
            setLoading(false);
            if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
        }
    } catch (err) {
        setErrorType('ERROR');
        setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="glass-card p-10 rounded-[3rem] shadow-2xl max-w-sm w-full border-t-8 border-cny-red text-center relative overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-red-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
          <KeyRound className="w-10 h-10 text-cny-red" />
        </div>
        
        <h2 className="text-3xl font-black text-gray-900 mb-2">内部通道</h2>
        <p className="text-gray-400 mb-10 text-xs font-bold uppercase tracking-widest">STAFF ACCESS ONLY</p>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? "text" : "password"}
                placeholder="输入安全口令 (至少6位)"
                className={`w-full p-6 bg-gray-50 border-2 rounded-[2rem] text-center font-black text-xl tracking-widest outline-none transition-all
                  ${errorType !== 'NONE' ? 'border-red-200 text-red-600' : 'border-gray-100 focus:border-cny-red'}`}
                value={code}
                onChange={e => setCode(e.target.value.trim())} 
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-2"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {errorType === 'INVALID' && (
              <p className="text-red-500 font-bold text-xs flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" /> 口令错误或未授权
              </p>
            )}

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full bg-gray-900 text-white font-black py-6 rounded-[2rem] shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30"
            >
              {loading ? <Loader2 className="animate-spin" /> : "安全登录 LOGIN"}
            </button>
        </form>

        {/* 数据库配置急救引导 (仅在出错时显示) */}
        {(errorType === 'DB_EMPTY') && (
          <div className="mt-10 p-6 bg-orange-50 rounded-3xl border border-orange-100 text-left animate-in slide-in-from-top-4">
            <div className="flex items-center gap-2 text-orange-600 font-black text-[10px] uppercase tracking-widest mb-3">
              <Settings className="w-3 h-3" /> 数据库配置指南
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                <p className="text-[11px] text-gray-600 leading-tight">点击 Firebase 的 <b>+ Start collection</b>，填写 ID: <code className="bg-white px-1 text-cny-red">access_keys</code></p>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                <p className="text-[11px] text-gray-600 leading-tight">新增文档，ID 建议填写复杂短语 (如 <code className="bg-white px-1 text-cny-red">Natick2026Admin</code>)</p>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                <p className="text-[11px] text-gray-600 leading-tight">添加字段 <code className="bg-white px-1 text-cny-red">role</code>，值填 <code className="bg-white px-1 text-cny-red">admin</code></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

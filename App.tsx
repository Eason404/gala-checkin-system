import React, { useEffect, useState, memo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import PublicRegistration from './pages/PublicRegistration';
import ManageReservation from './pages/ManageReservation';
import StaffPortal from './pages/StaffPortal';
import AdminDashboard from './pages/AdminDashboard';
import RaffleWheel from './components/RaffleWheel';
import ProtectedRoute from './components/ProtectedRoute';
import ProgramList from './pages/ProgramList';
import FoodMenu from './pages/FoodMenu';
import LandingPage from './pages/LandingPage';
import { Ticket, Users, BarChart3, LogOut, CalendarDays, Home, Mail, Sparkles, Music2, Utensils } from 'lucide-react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './components/Login';
import { logout, ENABLE_AUTH } from './services/authService';

export const ENABLE_REGISTRATION = false;

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const Navigation = memo(() => {
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!ENABLE_AUTH) return;
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const navClass = (path: string) =>
    `flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-500 font-bold ${location.pathname === path
      ? 'bg-cny-gold text-cny-dark shadow-lg shadow-cny-gold/20 scale-105'
      : 'text-white/60 hover:text-white hover:bg-white/5'
    }`;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 hidden sm:block w-full max-w-6xl px-4 pointer-events-none">
        <div className="flex items-center justify-between">
          <Link to="/" className="glass-dark pl-2 pr-4 py-2 rounded-2xl flex items-center gap-3 shadow-2xl border border-white/10 backdrop-blur-2xl pointer-events-auto hover:bg-white/5 transition-colors group">
            <div className="w-8 h-8 bg-gradient-to-br from-cny-gold to-orange-400 text-cny-dark flex items-center justify-center font-serif font-black rounded-xl shadow-lg rotate-3 group-hover:rotate-0 transition-transform text-sm">福</div>
            <div className="flex flex-col">
              <span className="text-white font-black tracking-tight text-sm leading-none">Natick 2026 春晚</span>
              <span className="text-cny-gold/80 font-bold uppercase tracking-[0.2em] text-[10px] mt-0.5">Lunar New Year Gala</span>
            </div>
          </Link>

          <div className="pointer-events-auto flex items-center gap-2">
            {ENABLE_AUTH && user && (
              <button
                onClick={logout}
                className="glass-dark flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-colors border border-white/10 shadow-xl backdrop-blur-2xl"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">退出登录</span>
              </button>
            )}
          </div>
        </div>
      </nav>
      {/* Mobile Top Header (Shows on smaller screens) */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-40 p-2 pointer-events-none">
        <div className="glass-dark rounded-xl p-3 flex items-center justify-between shadow-xl pointer-events-auto border border-white/5 backdrop-blur-3xl">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-gradient-to-br from-cny-gold to-orange-400 text-cny-dark font-serif font-black rounded-lg w-7 h-7 flex items-center justify-center text-sm shadow-md">福</div>
            <div className="flex flex-col">
              <span className="text-white font-black tracking-tight text-[13px] leading-none">Natick 2026 春晚</span>
              <span className="text-cny-gold/80 font-bold uppercase tracking-[0.2em] text-[8px] mt-0.5">Lunar New Year Gala</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {ENABLE_AUTH && user && (
              <button
                onClick={logout}
                className="text-white/40 hover:text-white p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-6 left-6 right-6 glass-dark rounded-[2.5rem] z-50 py-3 px-6 flex justify-around shadow-2xl border border-white/5">
        {/* Simplified Mobile Nav - Only User Tabs */}
        <Link to="/" className="flex flex-col items-center transition-transform active:scale-90">
          <div className={`p-2 rounded-2xl transition-all ${location.pathname === '/' ? 'bg-cny-gold text-cny-dark shadow-lg' : 'text-white/40'}`}>
            <Home className="w-5 h-5" />
          </div>
        </Link>
        <Link to="/program" className="flex flex-col items-center transition-transform active:scale-90">
          <div className={`p-2 rounded-2xl transition-all ${location.pathname === '/program' ? 'bg-cny-gold text-cny-dark shadow-lg' : 'text-white/40'}`}>
            <Music2 className="w-5 h-5" />
          </div>
        </Link>
        <Link to="/food" className="flex flex-col items-center transition-transform active:scale-90">
          <div className={`p-2 rounded-2xl transition-all ${location.pathname === '/food' ? 'bg-cny-gold text-cny-dark shadow-lg' : 'text-white/40'}`}>
            <Utensils className="w-5 h-5" />
          </div>
        </Link>
        <Link to="/raffle" className="flex flex-col items-center transition-transform active:scale-90">
          <div className={`p-2 rounded-2xl transition-all ${location.pathname === '/raffle' ? 'bg-cny-gold text-cny-dark shadow-lg' : 'text-white/40'}`}>
            <Sparkles className="w-5 h-5" />
          </div>
        </Link>
      </nav>
    </>
  );
});

const Footer = memo(() => (
  <footer className="pt-20 pb-40 sm:pb-20 relative overflow-hidden">
    <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
      <div className="flex justify-center items-center gap-4 mb-8 opacity-20">
        <div className="h-px bg-white flex-1"></div>
        <p className="text-sm font-serif text-white">🐎 2026 🐎</p>
        <div className="h-px bg-white flex-1"></div>
      </div>

      <p className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-3 sm:mb-4">Hosted By / 指导单位</p>
      <p className="font-bold text-white/80 text-xs sm:text-sm mb-6 sm:mb-8">Natick High School Chinese Club / Natick高中中文俱乐部</p>

      <div className="pt-6 border-t border-white/5 space-y-4">
        <a href="mailto:natickchineseassociation@gmail.com" className="inline-flex items-center gap-2 text-white/30 hover:text-cny-gold transition-colors text-[10px] font-black uppercase tracking-widest">
          <Mail className="w-3 h-3" />
          Email Us / 联系我们
        </a>
        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="text-[8px] font-black text-white/10 uppercase tracking-[0.4em]">
            © 2026 NATICK CHINESE COMMUNITY
          </div>
        </div>
      </div>
    </div>
  </footer>
));

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col text-gray-800">
        <Navigation />
        <main className="flex-grow px-4 pt-24 sm:pt-32 pb-12 max-w-6xl mx-auto w-full relative z-10">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/registration" element={ENABLE_REGISTRATION ? <PublicRegistration /> : <Navigate to="/" replace />} />
            <Route path="/registration-temp" element={<PublicRegistration />} />
            <Route path="/walkin" element={<PublicRegistration forceWalkIn={true} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/manage" element={<ManageReservation />} />
            <Route path="/program" element={<ProgramList />} />
            <Route path="/food" element={<FoodMenu />} />
            <Route
              path="/staff"
              element={
                <ProtectedRoute requiredRole="staff">
                  <StaffPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="observer">
                  <AdminDashboard view="dashboard" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/list"
              element={
                <ProtectedRoute requiredRole="observer">
                  <AdminDashboard view="list" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/raffle"
              element={<RaffleWheel />}
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
import React, { useEffect, useState, memo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import PublicRegistration from './pages/PublicRegistration';
import ManageReservation from './pages/ManageReservation';
import StaffPortal from './pages/StaffPortal';
import AdminDashboard from './pages/AdminDashboard';
import RaffleWheel from './components/RaffleWheel';
import ProtectedRoute from './components/ProtectedRoute';
import EventSchedule from './pages/EventSchedule';
import ProgramList from './pages/ProgramList';
import { Ticket, Users, BarChart3, LogOut, CalendarDays, Home, Mail, Sparkles, Music2 } from 'lucide-react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { logout, ENABLE_AUTH } from './services/authService';

export const ENABLE_REGISTRATION = false;

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
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 hidden sm:block max-w-[95vw]">
        <div className="glass-dark px-2 py-2 rounded-[2rem] flex items-center gap-2 shadow-2xl border border-white/10 backdrop-blur-2xl overflow-x-auto no-scrollbar">
          <Link to="/" className="flex items-center gap-3 px-4 mr-4 group flex-shrink-0 whitespace-nowrap">
            <div className="w-8 h-8 bg-cny-gold text-cny-dark flex items-center justify-center font-serif font-black rounded-xl shadow-lg rotate-3 group-hover:rotate-0 transition-transform">福</div>
            <span className="text-white font-black tracking-tight text-sm">Natick 2026</span>
          </Link>

          <div className="flex items-center gap-1 text-xs flex-shrink-0 whitespace-nowrap pr-2">
            {ENABLE_REGISTRATION && (
              <Link to="/" className={navClass('/')}>
                <Ticket className="w-4 h-4" />
                <span>活动预约 (Registration)</span>
              </Link>
            )}
            <Link to="/schedule" className={navClass('/schedule')}>
              <CalendarDays className="w-4 h-4" />
              <span>流程安排 (Schedule)</span>
            </Link>
            <Link to="/program" className={navClass('/program')}>
              <Music2 className="w-4 h-4" />
              <span>节目单 (Program)</span>
            </Link>
            <Link to="/raffle" className={navClass('/raffle')}>
              <Sparkles className="w-4 h-4" />
              <span>抽奖 (Raffle)</span>
            </Link>

            <>
              <div className="w-px h-6 bg-white/10 mx-1 flex-shrink-0"></div>
              <Link to="/staff" className={navClass('/staff')}>
                <Users className="w-4 h-4" />
                <span className="hidden md:inline">工作人员 (Staff)</span>
              </Link>
              <Link to="/admin" className={navClass('/admin')}>
                <BarChart3 className="w-4 h-4" />
                <span className="hidden md:inline">后台 (Admin)</span>
              </Link>
            </>

            {ENABLE_AUTH && user && (
              <button onClick={logout} className="ml-2 text-white/40 hover:text-white p-2 rounded-xl transition-colors flex-shrink-0">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </nav>
      {/* Mobile Top Header (Shows on smaller screens) */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-40 p-4 pointer-events-none">
        <div className="glass-dark rounded-2xl p-4 flex items-center justify-between shadow-xl pointer-events-auto">
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="bg-cny-gold text-cny-dark font-serif font-black rounded-lg w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-base sm:text-lg shadow-md">福</div>
            <span className="text-white font-black tracking-tight text-base sm:text-lg">Natick 春晚</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <>
              <Link to="/staff" className="text-[10px] font-black uppercase tracking-tighter text-white/40 border border-white/10 px-2 py-1 rounded-lg">
                Staff
              </Link>
              <Link to="/admin" className="text-[10px] font-black uppercase tracking-tighter text-white/40 border border-white/10 px-2 py-1 rounded-lg">
                Admin
              </Link>
            </>
            {ENABLE_AUTH && user && (
              <button onClick={logout} className="text-white/40 p-2">
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-6 left-6 right-6 glass-dark rounded-[2.5rem] z-50 py-3 px-6 flex justify-around shadow-2xl border border-white/5">
        {/* Simplified Mobile Nav - Only User Tabs */}
        {ENABLE_REGISTRATION && (
          <Link to="/" className="flex flex-col items-center transition-transform active:scale-90">
            <div className={`p-2 rounded-2xl transition-all ${location.pathname === '/' ? 'bg-cny-gold text-cny-dark shadow-lg' : 'text-white/40'}`}>
              <Home className="w-5 h-5" />
            </div>
          </Link>
        )}
        <Link to="/schedule" className="flex flex-col items-center transition-transform active:scale-90">
          <div className={`p-2 rounded-2xl transition-all ${location.pathname === '/schedule' ? 'bg-cny-gold text-cny-dark shadow-lg' : 'text-white/40'}`}>
            <CalendarDays className="w-5 h-5" />
          </div>
        </Link>
        <Link to="/program" className="flex flex-col items-center transition-transform active:scale-90">
          <div className={`p-2 rounded-2xl transition-all ${location.pathname === '/program' ? 'bg-cny-gold text-cny-dark shadow-lg' : 'text-white/40'}`}>
            <Music2 className="w-5 h-5" />
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
      <div className="min-h-screen flex flex-col text-gray-800">
        <Navigation />
        <main className="flex-grow px-4 pt-24 sm:pt-32 pb-12 max-w-6xl mx-auto w-full relative z-10">
          <Routes>
            <Route path="/" element={ENABLE_REGISTRATION ? <PublicRegistration /> : <Navigate to="/schedule" replace />} />
            <Route path="/registration-temp" element={<PublicRegistration />} />
            <Route path="/walkin" element={<PublicRegistration forceWalkIn={true} />} />
            <Route path="/manage" element={<ManageReservation />} />
            <Route path="/schedule" element={<EventSchedule />} />
            <Route path="/program" element={<ProgramList />} />
            <Route
              path="/staff"
              element={
                <ProtectedRoute>
                  <StaffPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
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
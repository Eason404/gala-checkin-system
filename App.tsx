
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import PublicRegistration from './components/PublicRegistration';
import StaffPortal from './components/StaffPortal';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import EventSchedule from './components/EventSchedule';
import { Ticket, Users, BarChart3, LogOut, CalendarDays, Home, Mail } from 'lucide-react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { logout, ENABLE_AUTH } from './services/authService';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!ENABLE_AUTH) return;
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);
  
  const navClass = (path: string) => 
    `flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 py-2 rounded-xl transition-all duration-300 font-bold ${
      location.pathname === path 
        ? 'bg-cny-gold/20 text-cny-gold sm:bg-cny-dark sm:shadow-lg sm:scale-105' 
        : 'text-white/70 hover:text-white hover:bg-white/10'
    }`;

  return (
    <>
      {/* Desktop Header */}
      <nav className="bg-cny-red shadow-xl sticky top-0 z-50 border-b-4 border-cny-gold hidden sm:block">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-18 py-4">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="bg-cny-gold text-cny-red font-serif font-bold rounded-2xl w-10 h-10 flex items-center justify-center text-2xl shadow-lg border-2 border-cny-red/20 group-hover:rotate-12 transition-transform duration-300">福</div>
              <div className="leading-tight">
                 <span className="text-white font-black text-xl block tracking-tight">Natick 春晚 2026</span>
                 <span className="text-cny-gold/80 text-[10px] block font-black tracking-[0.3em] uppercase">YEAR OF THE HORSE</span>
              </div>
            </Link>
            
            <div className="flex items-center gap-3 text-sm">
              <Link to="/" className={navClass('/')}>
                <Ticket className="w-4 h-4" />
                <span>活动预约</span>
              </Link>
              <Link to="/schedule" className={navClass('/schedule')}>
                <CalendarDays className="w-4 h-4" />
                <span>活动安排</span>
              </Link>
              <div className="h-8 w-px bg-white/20 mx-2"></div>
              <Link to="/staff" className={navClass('/staff')}>
                <Users className="w-4 h-4" />
                <span>工作人员</span>
              </Link>
              <Link to="/admin" className={navClass('/admin')}>
                <BarChart3 className="w-4 h-4" />
                <span>后台统计</span>
              </Link>
              
              {ENABLE_AUTH && user && (
                 <button onClick={logout} className="ml-2 text-white/70 hover:text-white p-2 bg-white/10 rounded-xl transition-colors">
                    <LogOut className="w-4 h-4" />
                 </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <div className="sm:hidden bg-cny-red p-4 sticky top-0 z-50 flex items-center justify-between border-b-2 border-cny-gold/30 shadow-xl backdrop-blur-md bg-opacity-95">
          <div className="flex items-center gap-3">
              <div className="bg-cny-gold text-cny-red font-serif font-bold rounded-lg w-8 h-8 flex items-center justify-center text-lg shadow-md">福</div>
              <span className="text-white font-black tracking-tight text-lg">Natick 春晚 2026</span>
          </div>
          {ENABLE_AUTH && user && (
               <button onClick={logout} className="text-white/70 p-2 bg-white/10 rounded-lg">
                  <LogOut className="w-5 h-5" />
               </button>
          )}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-6 left-6 right-6 bg-cny-red/90 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem] z-50 py-2.5 px-6 flex items-center justify-between">
          <Link to="/" className="flex flex-col items-center transition-transform active:scale-90">
            <div className={`p-2 rounded-2xl transition-all ${location.pathname === '/' ? 'bg-cny-gold text-cny-red shadow-lg' : 'text-white/60'}`}>
                <Home className="w-5 h-5" />
            </div>
            <span className={`text-[9px] mt-1 font-black uppercase tracking-tighter ${location.pathname === '/' ? 'text-cny-gold' : 'text-white/40'}`}>首页</span>
          </Link>
          <Link to="/schedule" className="flex flex-col items-center transition-transform active:scale-90">
            <div className={`p-2 rounded-2xl transition-all ${location.pathname === '/schedule' ? 'bg-cny-gold text-cny-red shadow-lg' : 'text-white/60'}`}>
                <CalendarDays className="w-5 h-5" />
            </div>
            <span className={`text-[9px] mt-1 font-black uppercase tracking-tighter ${location.pathname === '/schedule' ? 'text-cny-gold' : 'text-white/40'}`}>安排</span>
          </Link>
          <Link to="/staff" className="flex flex-col items-center transition-transform active:scale-90">
            <div className={`p-2 rounded-2xl transition-all ${location.pathname === '/staff' ? 'bg-cny-gold text-cny-red shadow-lg' : 'text-white/60'}`}>
                <Users className="w-5 h-5" />
            </div>
            <span className={`text-[9px] mt-1 font-black uppercase tracking-tighter ${location.pathname === '/staff' ? 'text-cny-gold' : 'text-white/40'}`}>签到</span>
          </Link>
          <Link to="/admin" className="flex flex-col items-center transition-transform active:scale-90">
            <div className={`p-2 rounded-2xl transition-all ${location.pathname === '/admin' ? 'bg-cny-gold text-cny-red shadow-lg' : 'text-white/60'}`}>
                <BarChart3 className="w-5 h-5" />
            </div>
            <span className={`text-[9px] mt-1 font-black uppercase tracking-tighter ${location.pathname === '/admin' ? 'text-cny-gold' : 'text-white/40'}`}>统计</span>
          </Link>
      </nav>
    </>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-cny-dark text-white pt-12 pb-32 sm:pb-12 mt-16 border-t-4 border-cny-gold relative overflow-hidden">
    <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
      {/* Small festive divider */}
      <div className="flex justify-center items-center gap-4 mb-8 opacity-40">
          <div className="h-px bg-cny-gold flex-1"></div>
          <p className="text-sm font-serif text-cny-gold">🐎 2026 🐎</p>
          <div className="h-px bg-cny-gold flex-1"></div>
      </div>
      
      {/* Organizations - Compact single column layout */}
      <div className="space-y-4 mb-8">
        <div>
          <h4 className="text-cny-gold font-black uppercase tracking-[0.2em] text-[8px] mb-1 opacity-50">Organizer / 主办单位</h4>
          <p className="font-bold text-white text-base">Natick High School Chinese Club</p>
        </div>
        <div>
          <h4 className="text-cny-gold font-black uppercase tracking-[0.2em] text-[8px] mb-1 opacity-50">Co-organizer / 协办组织</h4>
          <p className="font-bold text-white text-base">Natick Chinese Association (NCA)</p>
        </div>
      </div>

      {/* Simplified contact & copyright */}
      <div className="pt-6 border-t border-white/5 space-y-4">
        <a href="mailto:natickchineseassociation@gmail.com" className="inline-flex items-center gap-2 text-white/50 hover:text-cny-gold transition-colors text-xs font-bold">
          <Mail className="w-3.5 h-3.5" />
          natickchineseassociation@gmail.com
        </a>
        <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
          © 2026 NATICK CHINESE COMMUNITY
        </div>
      </div>
    </div>
  </footer>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-cny-bg font-sans selection:bg-cny-red selection:text-white">
        <Navigation />
        <main className="flex-grow px-4 py-6 sm:py-12 max-w-6xl mx-auto w-full">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Routes>
              <Route path="/" element={<PublicRegistration />} />
              <Route path="/schedule" element={<EventSchedule />} />
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
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import PublicRegistration from './components/PublicRegistration';
import StaffPortal from './components/StaffPortal';
import AdminDashboard from './components/AdminDashboard';
import { Ticket, Users, BarChart3 } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const navClass = (path: string) => 
    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors font-medium ${
      location.pathname === path 
        ? 'bg-cny-dark text-cny-gold shadow-sm' 
        : 'text-white/90 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <nav className="bg-cny-red shadow-lg sticky top-0 z-50 border-b-4 border-cny-gold">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-cny-gold text-cny-red font-serif font-bold rounded-full w-9 h-9 flex items-center justify-center text-xl shadow-sm border-2 border-cny-red">福</div>
            <div className="leading-tight">
               <span className="text-white font-bold text-lg block">Natick 春晚</span>
               <span className="text-cny-gold text-xs block font-medium tracking-wider">CNY GALA 2026</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 text-sm">
            <Link to="/" className={navClass('/')}>
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">预约 (Register)</span>
            </Link>
            <div className="h-6 w-px bg-white/20 mx-1"></div>
            <Link to="/staff" className={navClass('/staff')}>
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">工作人员 (Staff)</span>
            </Link>
            <Link to="/admin" className={navClass('/admin')}>
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">后台 (Admin)</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-cny-dark text-white py-8 mt-12 border-t-4 border-cny-gold">
    <div className="max-w-6xl mx-auto px-4 text-center text-sm text-white/60">
      <p className="text-lg font-serif text-cny-gold mb-2">Happy Chinese New Year of the Horse 🐎</p>
      <p>Natick 华人春晚 2026</p>
      <p className="mt-1">Sunday, March 8, 2026 • Natick High School</p>
      <p className="mt-4 text-xs opacity-50">Designed for Community Demo</p>
    </div>
  </footer>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-cny-bg font-sans">
        <Navigation />
        <main className="flex-grow px-4 py-8">
          <Routes>
            <Route path="/" element={<PublicRegistration />} />
            <Route path="/staff" element={<StaffPortal />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
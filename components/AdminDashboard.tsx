import React, { useEffect, useState } from 'react';
import { calculateStats, getReservations } from '../services/dataService';
import { Stats, Reservation } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Users, DollarSign, UserCheck, TrendingUp, Loader2, Cloud, RefreshCw, Wifi } from 'lucide-react';

const COLORS = ['#D72638', '#FFD700', '#0088FE', '#00C49F'];

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
        const [fetchedStats, fetchedReservations] = await Promise.all([
            calculateStats(),
            getReservations()
        ]);
        setStats(fetchedStats);
        setReservations(fetchedReservations);
    } catch (e) {
        console.error("Failed to load dashboard data", e);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-12 text-center flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-cny-red" /></div>;
  if (!stats) return <div className="p-8 text-center text-red-500 font-bold">Error loading data. Please check your Firebase configuration.</div>;

  const pieData = [
    { name: '早鸟票 Early Bird', value: stats.earlyBirdCount },
    { name: '现场票 Walk-In', value: stats.walkInCount },
  ];

  const revenueData = [
    { name: 'Revenue', expected: stats.totalRevenueExpected, collected: stats.totalRevenueCollected }
  ];

  const downloadCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Type', 'TotalPeople', 'TotalAmount', 'PaidAmount', 'Status', 'CheckIn', 'Notes', 'LotteryNumbers'];
    const rows = reservations.map(r => [
      r.id,
      `"${r.contactName}"`,
      r.phoneNumber,
      r.ticketType,
      r.totalPeople,
      r.totalAmount,
      r.paidAmount,
      r.paymentStatus,
      r.checkInStatus,
      `"${r.notes || ''}"`,
      `"${(r.lotteryNumbers || []).join(' ')}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cny_2026_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* System Status Bar */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className="bg-green-100 text-green-700 p-2 rounded-full">
              <Cloud className="w-5 h-5" />
           </div>
           <div>
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                 Database Connected
                 <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                 </span>
              </h3>
              <p className="text-xs text-gray-500">Google Firestore (Cloud)</p>
           </div>
        </div>
        
        <button 
           onClick={fetchData}
           disabled={refreshing}
           className="flex items-center gap-2 text-sm text-cny-red hover:bg-red-50 px-3 py-2 rounded transition font-medium"
        >
           <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
           {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
             <TrendingUp className="text-cny-red" /> 数据统计 Dashboard
        </h2>
        <button onClick={downloadCSV} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition text-sm">
          <Download className="w-4 h-4" /> 导出 Excel (Export CSV)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow border-t-4 border-blue-500">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">总人数 (Total People)</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalPeople}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border-t-4 border-green-500">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <UserCheck className="w-4 h-4" />
            <span className="text-sm">已签到 (Checked In)</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.checkedInCount}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border-t-4 border-cny-gold">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
             <DollarSign className="w-4 h-4" />
             <span className="text-sm">实收金额 (Collected)</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">${stats.totalRevenueCollected}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border-t-4 border-gray-300">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
             <TrendingUp className="w-4 h-4" />
             <span className="text-sm">预计总额 (Expected)</span>
          </div>
          <p className="text-3xl font-bold text-gray-400">${stats.totalRevenueExpected}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4 text-gray-700">票务类型分布 (Ticket Types)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4 text-gray-700">收入状况 (Revenue)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="expected" fill="#e5e7eb" name="预计 Expected" />
                <Bar dataKey="collected" fill="#10b981" name="实收 Collected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
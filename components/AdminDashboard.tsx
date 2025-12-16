import React, { useEffect, useState } from 'react';
import { calculateStats, getReservations } from '../services/dataService';
import { Stats, Reservation, CheckInStatus, PaymentStatus } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Users, DollarSign, UserCheck, TrendingUp, Loader2, Cloud, RefreshCw, Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const COLORS = ['#D72638', '#FFD700', '#0088FE', '#00C49F'];

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setRefreshing(true);
    try {
        const [fetchedStats, fetchedReservations] = await Promise.all([
            calculateStats(),
            getReservations()
        ]);
        setStats(fetchedStats);
        setReservations(fetchedReservations);
        setFilteredReservations(fetchedReservations);
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

  // Filter logic
  useEffect(() => {
    if (!reservations) return;
    const lowerTerm = searchTerm.toLowerCase();
    const results = reservations.filter(r => 
        r.contactName.toLowerCase().includes(lowerTerm) ||
        r.phoneNumber.includes(lowerTerm) ||
        r.id.toLowerCase().includes(lowerTerm)
    );
    setFilteredReservations(results);
  }, [searchTerm, reservations]);

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
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* System Status Bar */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex justify-between items-center sticky top-20 z-10">
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

      {/* DATA TABLE SECTION */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-700">预约列表 Reservation Management</h3>
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                   type="text" 
                   placeholder="Search name, phone, or ID..."
                   className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cny-red focus:border-cny-red outline-none text-sm"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
         </div>
         
         <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 shadow-sm z-10">
                    <tr>
                        <th className="px-6 py-3">ID / Time</th>
                        <th className="px-6 py-3">Contact</th>
                        <th className="px-6 py-3">People</th>
                        <th className="px-6 py-3">Payment</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredReservations.length > 0 ? (
                        filteredReservations.map((res) => (
                            <tr key={res.id} className="bg-white border-b hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-mono">
                                    <div className="font-bold text-gray-900">{res.id}</div>
                                    <div className="text-xs text-gray-400">{new Date(res.createdTime).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-800">{res.contactName}</div>
                                    <div className="text-xs">{res.phoneNumber}</div>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${res.ticketType === 'EarlyBird' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                        {res.ticketType}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-800 text-lg">{res.totalPeople}</div>
                                    <div className="text-xs">{res.adultsCount}A / {res.childrenCount}C</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className={`font-bold ${res.paymentStatus === PaymentStatus.Paid ? 'text-green-600' : 'text-red-500'}`}>
                                        ${res.totalAmount}
                                    </div>
                                    <div className="text-xs">{res.paymentStatus}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {res.checkInStatus === CheckInStatus.Arrived ? (
                                        <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full w-fit">
                                            <CheckCircle className="w-3 h-3" /> Arrived
                                        </span>
                                    ) : res.checkInStatus === CheckInStatus.Cancelled ? (
                                        <span className="flex items-center gap-1 text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded-full w-fit">
                                            <XCircle className="w-3 h-3" /> Cancelled
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded-full w-fit">
                                            <AlertCircle className="w-3 h-3" /> Pending
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                   {/* Placeholder for future edit actions */}
                                   <span className="text-xs text-gray-400">--</span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                No matching records found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
         </div>
         <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 text-right">
            Showing {filteredReservations.length} of {reservations.length} records
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
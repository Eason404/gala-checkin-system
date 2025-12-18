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

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-cny-red" /></div>;
  if (!stats) return <div className="p-8 text-center text-red-500 font-bold">Error loading data.</div>;

  const pieData = [
    { name: '早鸟票 Early Bird', value: stats.earlyBirdCount },
    { name: '现场票 Walk-In', value: stats.walkInCount },
  ];

  const downloadCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Type', 'People', 'Amount', 'Status', 'CheckIn'];
    const rows = reservations.map(r => [r.id, r.contactName, r.phoneNumber, r.ticketType, r.totalPeople, r.totalAmount, r.paymentStatus, r.checkInStatus]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "cny2026_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
             <TrendingUp className="text-cny-red w-8 h-8" /> 数据中心 <span className="text-sm font-bold text-gray-400 uppercase tracking-widest hidden sm:inline">Admin</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">Real-time event tracking and statistics.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={fetchData} disabled={refreshing} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-2xl text-sm font-bold hover:bg-gray-50 transition">
             <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 刷新
          </button>
          <button onClick={downloadCSV} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-2xl text-sm font-bold hover:bg-gray-800 transition shadow-lg">
             <Download className="w-4 h-4" /> 导出
          </button>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '总人数', sub: 'Total People', value: stats.totalPeople, color: 'border-blue-500', icon: <Users className="w-4 h-4" /> },
          { label: '已签到', sub: 'Arrived', value: stats.checkedInCount, color: 'border-green-500', icon: <UserCheck className="w-4 h-4" /> },
          { label: '实收', sub: 'Revenue', value: `$${stats.totalRevenueCollected}`, color: 'border-cny-gold', icon: <DollarSign className="w-4 h-4" /> },
          { label: '预计', sub: 'Expected', value: `$${stats.totalRevenueExpected}`, color: 'border-gray-300', icon: <TrendingUp className="w-4 h-4" /> }
        ].map((kpi, idx) => (
          <div key={idx} className={`bg-white p-5 rounded-3xl shadow-sm border-b-4 ${kpi.color} group hover:scale-[1.02] transition-transform cursor-default`}>
             <div className="flex items-center gap-2 text-gray-400 mb-2 font-black uppercase text-[10px] tracking-widest">
                {kpi.icon} {kpi.label}
             </div>
             <div className="text-2xl sm:text-3xl font-black text-gray-900 leading-none">{kpi.value}</div>
             <div className="text-[10px] text-gray-300 font-bold mt-2">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-gray-100">
           <h3 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-tight">票务分布 Tickets</h3>
           <div className="h-64 sm:h-72">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                   {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                 </Pie>
                 <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                 <Legend verticalAlign="bottom" height={36}/>
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">搜索列表 Reservations</h3>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                 <input className="pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-xs border border-gray-100 outline-none w-40 sm:w-56 focus:bg-white transition-all" placeholder="ID / Name / Phone" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
           </div>
           <div className="overflow-x-auto flex-grow max-h-[350px]">
              <table className="w-full text-sm text-left">
                 <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    <tr>
                       <th className="p-4">Contact</th>
                       <th className="p-4">Status</th>
                       <th className="p-4 text-right">Paid</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {filteredReservations.slice(0, 50).map(res => (
                       <tr key={res.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="p-4">
                             <div className="font-bold text-gray-900 text-sm">{res.contactName}</div>
                             <div className="text-[10px] text-gray-400 font-mono">{res.id}</div>
                          </td>
                          <td className="p-4">
                             <div className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg w-fit ${res.checkInStatus === CheckInStatus.Arrived ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                {res.checkInStatus}
                             </div>
                          </td>
                          <td className="p-4 text-right font-black text-gray-900">${res.paidAmount}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
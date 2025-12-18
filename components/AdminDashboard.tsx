
import React, { useEffect, useState, useMemo } from 'react';
import { calculateStats, getReservations } from '../services/dataService';
import { Stats, Reservation, CheckInStatus, PaymentStatus, TicketType } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Download, Users, DollarSign, UserCheck, TrendingUp, Loader2, RefreshCw, Search, Filter, ArrowUpDown, ChevronRight, Activity, PieChart as PieIcon, CreditCard, Utensils, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';

const COLORS = ['#D72638', '#FFD700', '#3B82F6', '#10B981', '#F59E0B'];
const PAGE_SIZE = 15;

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Advanced Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortKey, setSortKey] = useState<'contactName' | 'totalAmount' | 'createdTime'>('createdTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterPayment, filterType]);

  const filteredData = useMemo(() => {
    return reservations.filter(r => {
      const matchSearch = r.contactName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.phoneNumber.includes(searchTerm);
      const matchStatus = filterStatus === 'all' || r.checkInStatus === filterStatus;
      const matchPayment = filterPayment === 'all' || r.paymentStatus === filterPayment;
      const matchType = filterType === 'all' || r.ticketType === filterType;
      
      return matchSearch && matchStatus && matchPayment && matchType;
    }).sort((a, b) => {
      const factor = sortOrder === 'asc' ? 1 : -1;
      if (sortKey === 'contactName') return a.contactName.localeCompare(b.contactName) * factor;
      if (sortKey === 'totalAmount') return (a.totalAmount - b.totalAmount) * factor;
      return (a.createdTime - b.createdTime) * factor;
    });
  }, [reservations, searchTerm, filterStatus, filterPayment, filterType, sortKey, sortOrder]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const toggleSort = (key: 'contactName' | 'totalAmount' | 'createdTime') => {
    if (sortKey === key) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortOrder('desc'); }
  };

  const revenueByTicket = useMemo(() => [
    { name: '早鸟票', amount: reservations.filter(r => r.ticketType === TicketType.EarlyBird).reduce((acc, curr) => acc + curr.totalAmount, 0) },
    { name: '常规票', amount: reservations.filter(r => r.ticketType === TicketType.Regular).reduce((acc, curr) => acc + curr.totalAmount, 0) },
    { name: '现场票', amount: reservations.filter(r => r.ticketType === TicketType.WalkIn).reduce((acc, curr) => acc + curr.totalAmount, 0) },
  ], [reservations]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-cny-red" /></div>;
  if (!stats) return <div className="p-8 text-center text-red-500 font-bold">Error loading data.</div>;

  const downloadCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Type', 'Adults', 'Children', 'Amount', 'Paid', 'Status', 'CheckIn'];
    const rows = filteredData.map(r => [r.id, r.contactName, r.phoneNumber, r.ticketType, r.adultsCount, r.childrenCount, r.totalAmount, r.paidAmount, r.paymentStatus, r.checkInStatus]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `cny_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingAmount = stats.totalRevenueExpected - stats.totalRevenueCollected;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
        <div className="flex items-center gap-5">
          <div className="bg-cny-red p-4 rounded-3xl shadow-lg">
             <Activity className="text-white w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">数据洞察 Dashboard</h2>
            <p className="text-gray-400 text-sm font-bold mt-1 uppercase tracking-widest">Real-time Advanced Analytics</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={fetchData} disabled={refreshing} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-50 border border-gray-100 px-6 py-3.5 rounded-2xl text-sm font-black hover:bg-gray-100 transition active:scale-95">
             <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 刷新
          </button>
          <button onClick={downloadCSV} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-cny-dark text-white px-6 py-3.5 rounded-2xl text-sm font-black hover:shadow-lg transition active:scale-95">
             <Download className="w-4 h-4" /> 导出报表
          </button>
        </div>
      </div>

      {/* KPI Tiles - Enhanced */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: '预计到场人数', val: stats.totalPeople, sub: 'Total Headcount', color: 'border-blue-500', icon: <Users className="text-blue-500" /> },
          { label: '预计盒饭总数', val: stats.lunchBoxCount, sub: 'Based on Adults Count', color: 'border-orange-500', icon: <Utensils className="text-orange-500" /> },
          { label: '已确认收入', val: `$${stats.totalRevenueCollected}`, sub: 'Net Cash Collected', color: 'border-cny-gold', icon: <DollarSign className="text-cny-gold" /> },
          { label: '待收余款', val: `$${pendingAmount}`, sub: 'Unpaid Balance', color: 'border-red-500', icon: <CreditCard className="text-red-500" /> }
        ].map((kpi, idx) => (
          <div key={idx} className={`bg-white p-7 rounded-[2rem] shadow-sm border-l-8 ${kpi.color} hover:shadow-md transition-shadow`}>
             <div className="flex items-center gap-3 text-gray-400 mb-3 font-black uppercase text-[10px] tracking-widest">
                {kpi.icon} {kpi.label}
             </div>
             <div className="text-3xl font-black text-gray-900">{kpi.val}</div>
             <div className="text-[10px] text-gray-400 font-bold mt-2 italic">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Advanced Filters Bento */}
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-lg border border-gray-100 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative flex-grow w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl text-sm border border-gray-100 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-cny-red/5" placeholder="搜索 ID、姓名或电话..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select className="bg-transparent text-xs font-bold outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="all">所有状态 (Status)</option>
                        <option value={CheckInStatus.NotArrived}>未签到</option>
                        <option value={CheckInStatus.Arrived}>已签到</option>
                        <option value={CheckInStatus.Cancelled}>已取消</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <select className="bg-transparent text-xs font-bold outline-none" value={filterPayment} onChange={e => setFilterPayment(e.target.value)}>
                        <option value="all">支付情况 (Payment)</option>
                        <option value={PaymentStatus.Paid}>已支付</option>
                        <option value={PaymentStatus.Unpaid}>待支付</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden rounded-3xl border border-gray-50">
            <div className="overflow-x-auto optimized-list">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                        <tr>
                            <th className="p-5 cursor-pointer hover:text-cny-red" onClick={() => toggleSort('contactName')}>
                                <div className="flex items-center gap-1">预约人 <ArrowUpDown className="w-3 h-3"/></div>
                            </th>
                            <th className="p-5">门票 & 人数</th>
                            <th className="p-5 cursor-pointer hover:text-cny-red text-right" onClick={() => toggleSort('totalAmount')}>
                                <div className="flex items-center justify-end gap-1">预估金额 <ArrowUpDown className="w-3 h-3"/></div>
                            </th>
                            <th className="p-5 text-center">状态</th>
                            <th className="p-5"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {paginatedData.length === 0 ? (
                            <tr><td colSpan={5} className="p-20 text-center text-gray-300 font-bold uppercase tracking-widest italic">No matching records found.</td></tr>
                        ) : paginatedData.map(res => (
                            <tr key={res.id} className="hover:bg-cny-cloud/10 transition-colors group">
                                <td className="p-5">
                                    <div className="font-black text-gray-900 text-base">{res.contactName}</div>
                                    <div className="text-[10px] text-gray-400 font-bold tracking-tight">{res.phoneNumber} · {res.id}</div>
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${res.ticketType === TicketType.EarlyBird ? 'bg-indigo-50 text-indigo-500' : 'bg-orange-50 text-orange-500'}`}>{res.ticketType}</span>
                                        <span className="text-gray-900 font-bold text-xs">{res.adultsCount}A / {res.childrenCount}C</span>
                                    </div>
                                </td>
                                <td className="p-5 text-right font-black text-gray-900 text-base">${res.totalAmount}</td>
                                <td className="p-5">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${res.paymentStatus === PaymentStatus.Paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                            {res.paymentStatus === PaymentStatus.Paid ? '已付' : '未付'}
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${res.checkInStatus === CheckInStatus.Arrived ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                            {res.checkInStatus === CheckInStatus.Arrived ? '到场' : '待到场'}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5 text-right">
                                    <button className="p-2 text-gray-300 hover:text-cny-red transition-colors"><ChevronRight className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Showing {Math.min(filteredData.length, (currentPage - 1) * PAGE_SIZE + 1)}-{Math.min(filteredData.length, currentPage * PAGE_SIZE)} of {filteredData.length}
                    </div>
                    <div className="flex gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center px-4 text-xs font-black text-gray-700">
                            Page {currentPage} / {totalPages}
                        </div>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition"
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Visual Analytics - Bento Bottom */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-gray-100 lg:col-span-1">
           <h3 className="text-lg font-black text-gray-800 mb-8 uppercase tracking-tight flex items-center gap-2"><PieIcon className="w-5 h-5 text-cny-red" /> 票务分布</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={[
                    { name: '早鸟', value: reservations.filter(r => r.ticketType === TicketType.EarlyBird).length },
                    { name: '常规', value: reservations.filter(r => r.ticketType === TicketType.Regular).length },
                    { name: '现场', value: reservations.filter(r => r.ticketType === TicketType.WalkIn).length }
                 ]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                   {COLORS.map((color, index) => <Cell key={index} fill={color} />)}
                 </Pie>
                 <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cny-red"></div> 早鸟票</span>
                  <span className="text-gray-400">{Math.round(reservations.filter(r => r.ticketType === TicketType.EarlyBird).length / (reservations.length || 1) * 100)}%</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cny-gold"></div> 常规票</span>
                  <span className="text-gray-400">{Math.round(reservations.filter(r => r.ticketType === TicketType.Regular).length / (reservations.length || 1) * 100)}%</span>
              </div>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-gray-100 lg:col-span-2">
           <h3 className="text-lg font-black text-gray-800 mb-8 uppercase tracking-tight flex items-center gap-2"><TrendingUp className="w-5 h-5 text-cny-red" /> 收入明细 ($)</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={revenueByTicket}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                 <Tooltip cursor={{ fill: '#f8f8f8' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                 <Bar dataKey="amount" fill="#D72638" radius={[8, 8, 0, 0]} barSize={60} />
               </BarChart>
             </ResponsiveContainer>
           </div>
           <div className="mt-6 p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">总计预计收入</span>
              <span className="text-2xl font-black text-gray-900">${stats.totalRevenueExpected}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

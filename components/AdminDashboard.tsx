
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { calculateStats, getReservations, updateReservation, deleteReservation } from '../services/dataService';
import { Stats, Reservation, CheckInStatus, PaymentStatus, TicketType } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Download, Users, DollarSign, TrendingUp, Loader2, RefreshCw, Search, Filter, ArrowUpDown, ChevronRight, Activity, PieChart as PieIcon, CreditCard, Utensils, MoreVertical, X, Trash2, Ban, AlertTriangle, CheckCircle, Mail } from 'lucide-react';

const COLORS = ['#D72638', '#FFD700', '#3B82F6', '#10B981', '#F59E0B'];
const ROW_HEIGHT = 84; 
const VISIBLE_ROWS = 10; 
const BUFFER_ROWS = 5; 

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Advanced Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [sortKey, setSortKey] = useState<'contactName' | 'totalAmount' | 'createdTime'>('createdTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Virtualization State
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Management Modal State
  const [selectedForAction, setSelectedForAction] = useState<Reservation | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const filteredData = useMemo(() => {
    return reservations.filter(r => {
      const matchSearch = r.contactName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.phoneNumber.includes(searchTerm);
      const matchStatus = filterStatus === 'all' || r.checkInStatus === filterStatus;
      const matchPayment = filterPayment === 'all' || r.paymentStatus === filterPayment;
      
      return matchSearch && matchStatus && matchPayment;
    }).sort((a, b) => {
      const factor = sortOrder === 'asc' ? 1 : -1;
      if (sortKey === 'contactName') return a.contactName.localeCompare(b.contactName) * factor;
      if (sortKey === 'totalAmount') return (a.totalAmount - b.totalAmount) * factor;
      return (a.createdTime - b.createdTime) * factor;
    });
  }, [reservations, searchTerm, filterStatus, filterPayment, sortKey, sortOrder]);

  const totalHeight = filteredData.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS);
  const endIndex = Math.min(filteredData.length, Math.ceil((scrollTop + (VISIBLE_ROWS * ROW_HEIGHT)) / ROW_HEIGHT) + BUFFER_ROWS);
  const visibleData = filteredData.slice(startIndex, endIndex);
  const offsetY = startIndex * ROW_HEIGHT;

  const toggleSort = (key: 'contactName' | 'totalAmount' | 'createdTime') => {
    if (sortKey === key) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortOrder('desc'); }
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
  };

  // Actions
  const handleCancelReservation = async () => {
    if (!selectedForAction || !selectedForAction.firebaseDocId) return;
    setActionLoading(true);
    try {
      await updateReservation(selectedForAction.id, { checkInStatus: CheckInStatus.Cancelled }, selectedForAction.firebaseDocId);
      await fetchData();
      setSelectedForAction(null);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReservation = async () => {
    if (!selectedForAction || !selectedForAction.firebaseDocId) return;
    setActionLoading(true);
    try {
      await deleteReservation(selectedForAction.firebaseDocId);
      await fetchData();
      setShowConfirmDelete(false);
      setSelectedForAction(null);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const revenueByTicket = useMemo(() => [
    { name: '早鸟票', amount: reservations.filter(r => r.ticketType === TicketType.EarlyBird && r.checkInStatus !== CheckInStatus.Cancelled).reduce((acc, curr) => acc + curr.totalAmount, 0) },
    { name: '常规票', amount: reservations.filter(r => r.ticketType === TicketType.Regular && r.checkInStatus !== CheckInStatus.Cancelled).reduce((acc, curr) => acc + curr.totalAmount, 0) },
    { name: '现场票', amount: reservations.filter(r => r.ticketType === TicketType.WalkIn && r.checkInStatus !== CheckInStatus.Cancelled).reduce((acc, curr) => acc + curr.totalAmount, 0) },
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
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 animate-in fade-in duration-700">
      
      {/* Management Modal (Glassmorphism) */}
      {selectedForAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
           <div className="glass-card max-w-md w-full rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/40">
              <div className="p-8">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">管理预约</h3>
                    <button onClick={() => setSelectedForAction(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                 </div>
                 
                 <div className="bg-gray-50 p-6 rounded-3xl mb-8 space-y-2 border border-gray-100">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">预约详情</div>
                    <div className="text-lg font-black text-gray-900">{selectedForAction.contactName}</div>
                    <div className="text-xs text-gray-400 font-bold">{selectedForAction.phoneNumber} · {selectedForAction.id}</div>
                    <div className="pt-2 flex gap-2">
                       <span className="bg-white px-3 py-1 rounded-lg text-[10px] font-black border border-gray-100 uppercase tracking-tighter">${selectedForAction.totalAmount} Due</span>
                       <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-tighter ${selectedForAction.checkInStatus === CheckInStatus.Cancelled ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{selectedForAction.checkInStatus}</span>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <button 
                      onClick={handleCancelReservation}
                      disabled={actionLoading || selectedForAction.checkInStatus === CheckInStatus.Cancelled}
                      className="w-full py-4 flex items-center justify-center gap-2 bg-orange-50 text-orange-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-100 transition disabled:opacity-50"
                    >
                       <Ban className="w-4 h-4" /> 取消预约 (Soft Delete)
                    </button>
                    <button 
                      onClick={() => setShowConfirmDelete(true)}
                      disabled={actionLoading}
                      className="w-full py-4 flex items-center justify-center gap-2 bg-red-50 text-red-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-100 transition"
                    >
                       <Trash2 className="w-4 h-4" /> 永久删除 (Hard Delete)
                    </button>
                 </div>
                 
                 <p className="mt-6 text-[10px] text-gray-400 text-center font-bold italic">
                   注意：硬删除将不可恢复，软删除保留记录但排除在统计外。
                 </p>
              </div>
           </div>

           {/* Nested Delete Confirmation */}
           {showConfirmDelete && (
             <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="bg-white max-w-xs w-full rounded-[2rem] p-8 text-center shadow-2xl border border-red-100 animate-in zoom-in duration-300">
                   <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                   </div>
                   <h4 className="text-lg font-black text-gray-900 mb-2 uppercase">永久删除？</h4>
                   <p className="text-xs text-gray-400 font-bold mb-8 leading-relaxed">此操作无法撤销。确认彻底移除该记录吗？</p>
                   <div className="flex flex-col gap-2">
                      <button onClick={handleDeleteReservation} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 transition">确认删除</button>
                      <button onClick={() => setShowConfirmDelete(false)} className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition">取消</button>
                   </div>
                </div>
             </div>
           )}
        </div>
      )}

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

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: '预计到场人数', val: stats.totalPeople, sub: 'Active Headcount', color: 'border-blue-500', icon: <Users className="text-blue-500" /> },
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

      {/* Advanced Filters & Virtualized Table */}
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-lg border border-gray-100 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative flex-grow w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl text-sm border border-gray-100 focus:bg-white transition-all outline-none focus:ring-4 focus:ring-cny-red/5" placeholder="搜索 ID、姓名或电话..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); if(scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;}} />
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select className="bg-transparent text-xs font-bold outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="all">所有状态 (All Status)</option>
                        <option value={CheckInStatus.NotArrived}>未签到</option>
                        <option value={CheckInStatus.Arrived}>已签到</option>
                        <option value={CheckInStatus.Cancelled}>已取消</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <select className="bg-transparent text-xs font-bold outline-none" value={filterPayment} onChange={e => setFilterPayment(e.target.value)}>
                        <option value="all">支付情况 (All Payment)</option>
                        <option value={PaymentStatus.Paid}>已支付</option>
                        <option value={PaymentStatus.Unpaid}>待支付</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Virtualized Table Container */}
        <div className="overflow-hidden rounded-3xl border border-gray-50">
            <div className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] flex items-center px-5 py-4">
                <div className="w-[30%] cursor-pointer hover:text-cny-red flex items-center gap-1" onClick={() => toggleSort('contactName')}>预约人 <ArrowUpDown className="w-3 h-3"/></div>
                <div className="w-[25%] px-5">门票 & 人数</div>
                <div className="w-[15%] px-5 text-right cursor-pointer hover:text-cny-red" onClick={() => toggleSort('totalAmount')}>预估金额 <ArrowUpDown className="w-3 h-3"/></div>
                <div className="w-[20%] text-center">状态</div>
                <div className="w-[10%]"></div>
            </div>

            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="overflow-y-auto scrollbar-hide bg-white relative"
              style={{ height: `${Math.min(filteredData.length * ROW_HEIGHT, VISIBLE_ROWS * ROW_HEIGHT)}px` }}
            >
                {filteredData.length === 0 ? (
                    <div className="flex items-center justify-center p-20 text-gray-300 font-bold uppercase tracking-widest italic">No matching records found.</div>
                ) : (
                    <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
                        <div style={{ transform: `translateY(${offsetY}px)`, willChange: 'transform' }}>
                            {visibleData.map(res => (
                                <div 
                                    key={res.id} 
                                    className={`flex items-center px-5 border-b border-gray-50 transition-colors ${res.checkInStatus === CheckInStatus.Cancelled ? 'bg-red-50/30' : 'hover:bg-cny-cloud/10'}`}
                                    style={{ height: `${ROW_HEIGHT}px` }}
                                >
                                    <div className="w-[30%]">
                                        <div className={`font-black text-sm truncate ${res.checkInStatus === CheckInStatus.Cancelled ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{res.contactName}</div>
                                        <div className="text-[10px] text-gray-400 font-bold tracking-tight truncate flex items-center gap-2">
                                           <span>{res.phoneNumber} · {res.id}</span>
                                           {res.email && <Mail className="w-3 h-3 opacity-30" />}
                                        </div>
                                    </div>
                                    <div className="w-[25%] px-5">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${res.ticketType === TicketType.EarlyBird ? 'bg-indigo-50 text-indigo-500' : 'bg-orange-50 text-orange-500'}`}>{res.ticketType}</span>
                                            <span className="text-gray-900 font-bold text-xs">{res.adultsCount}A / {res.childrenCount}C</span>
                                        </div>
                                    </div>
                                    <div className="w-[15%] px-5 text-right font-black text-gray-900 text-sm">${res.totalAmount}</div>
                                    <div className="w-[20%]">
                                        <div className="flex items-center justify-center gap-2">
                                            {res.checkInStatus === CheckInStatus.Cancelled ? (
                                                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1"><Ban className="w-3 h-3" /> 已取消</span>
                                            ) : (
                                                <>
                                                    <div className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${res.paymentStatus === PaymentStatus.Paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                        {res.paymentStatus === PaymentStatus.Paid ? '已付' : '未付'}
                                                    </div>
                                                    <div className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${res.checkInStatus === CheckInStatus.Arrived ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                                        {res.checkInStatus === CheckInStatus.Arrived ? '到场' : '待到场'}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-[10%] text-right">
                                        <button 
                                          onClick={() => setSelectedForAction(res)}
                                          className="p-3 text-gray-300 hover:text-cny-red hover:bg-gray-50 rounded-2xl transition-all active:scale-90"
                                        >
                                          <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Showing {filteredData.length} records in Real-time Virtual View
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Email Service: Active
                </div>
            </div>
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
                    { name: '早鸟', value: reservations.filter(r => r.ticketType === TicketType.EarlyBird && r.checkInStatus !== CheckInStatus.Cancelled).length },
                    { name: '常规', value: reservations.filter(r => r.ticketType === TicketType.Regular && r.checkInStatus !== CheckInStatus.Cancelled).length },
                    { name: '现场', value: reservations.filter(r => r.ticketType === TicketType.WalkIn && r.checkInStatus !== CheckInStatus.Cancelled).length }
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
                  <span className="text-gray-400">{Math.round(reservations.filter(r => r.ticketType === TicketType.EarlyBird && r.checkInStatus !== CheckInStatus.Cancelled).length / (reservations.filter(r => r.checkInStatus !== CheckInStatus.Cancelled).length || 1) * 100)}%</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cny-gold"></div> 常规票</span>
                  <span className="text-gray-400">{Math.round(reservations.filter(r => r.ticketType === TicketType.Regular && r.checkInStatus !== CheckInStatus.Cancelled).length / (reservations.filter(r => r.checkInStatus !== CheckInStatus.Cancelled).length || 1) * 100)}%</span>
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

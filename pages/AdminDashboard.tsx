
import { Download, Loader2, RefreshCw, Activity, Settings } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { calculateStats, getReservations, updateReservation, deleteReservation, getTicketConfig, updateTicketConfig, sendCancellationEmail } from '../services/dataService';
import { Stats, Reservation, CheckInStatus, TicketConfig } from '../types';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getCurrentUserRole } from '../services/authService';

// Sub-components
import { StatsGrid } from '../components/admin/StatsGrid';
import { DailyStatsChart } from '../components/admin/DailyStatsChart';
import { CouponStats } from '../components/admin/CouponStats';
import { ReservationList } from '../components/admin/ReservationList';
import { ConfigModal } from '../components/admin/modals/ConfigModal';
import { DeleteModal } from '../components/admin/modals/DeleteModal';
import { DetailModal } from '../components/admin/modals/DetailModal';

const ITEMS_PER_PAGE = 10;

const AdminDashboard: React.FC = () => {
  const role = getCurrentUserRole();
  const isAdmin = role === 'admin';

  const [stats, setStats] = useState<Stats | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [config, setConfig] = useState<TicketConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterPerformer, setFilterPerformer] = useState<string>('all');
  const [filterCoupon, setFilterCoupon] = useState<string>('all');
  const [sortKey, setSortKey] = useState<'contactName' | 'totalAmount' | 'createdTime'>('createdTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedForAction, setSelectedForAction] = useState<Reservation | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editConfig, setEditConfig] = useState<TicketConfig>({
    totalCapacity: 400,
    totalHeadcountCap: 450,
    earlyBirdCap: 300,
    regularCap: 50,
    walkInCap: 50
  });

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const fetchedReservations = await getReservations();

      const [fetchedStats, fetchedConfig] = await Promise.all([
        calculateStats(fetchedReservations),
        getTicketConfig()
      ]);

      setStats(fetchedStats);
      setReservations(fetchedReservations);
      setConfig(fetchedConfig);
      setEditConfig(fetchedConfig);
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
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterPayment, filterPerformer, filterCoupon, sortKey, sortOrder]);

  const filteredData = useMemo(() => {
    return reservations.filter(r => {
      const matchSearch = (r.contactName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.phoneNumber || '').includes(searchTerm) ||
        (r.performanceUnit || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'all' || r.checkInStatus === filterStatus;
      const matchPayment = filterPayment === 'all' || r.paymentStatus === filterPayment;
      const isSponsor = (typeof r.couponCode === 'string' && r.couponCode.includes('SPONSOR')) || (r.coupons && r.coupons.some(c => c.code === 'SPONSOR'));
      const isPerformerParent = (typeof r.couponCode === 'string' && r.couponCode.includes('PERFORMER_PARENTS')) || (r.coupons && r.coupons.some(c => c.code === 'PERFORMER_PARENTS'));
      const matchPerformer = filterPerformer === 'all' ||
        (filterPerformer === 'yes' ? r.isPerformer :
          filterPerformer === 'no' ? !r.isPerformer :
            filterPerformer === 'sponsor' ? isSponsor :
              filterPerformer === 'performer_parents' ? isPerformerParent : true);

      const hasAnyCoupon = (r.coupons && r.coupons.length > 0) || (typeof r.couponCode === 'string' && r.couponCode.trim() !== '');
      const matchCoupon = filterCoupon === 'all' ||
        (filterCoupon === 'any' ? hasAnyCoupon :
          filterCoupon === 'none' ? !hasAnyCoupon :
            ((r.coupons && r.coupons.some(c => c.code === filterCoupon)) || (typeof r.couponCode === 'string' && r.couponCode.includes(filterCoupon))));

      return matchSearch && matchStatus && matchPayment && matchPerformer && matchCoupon;
    }).sort((a, b) => {
      const factor = sortOrder === 'asc' ? 1 : -1;
      if (sortKey === 'contactName') return (a.contactName || '').localeCompare(b.contactName || '') * factor;
      if (sortKey === 'totalAmount') return (a.totalAmount - b.totalAmount) * factor;
      return (a.createdTime - b.createdTime) * factor;
    });
  }, [reservations, searchTerm, filterStatus, filterPayment, filterPerformer, filterCoupon, sortKey, sortOrder]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const toggleSort = (key: 'contactName' | 'totalAmount' | 'createdTime') => {
    if (sortKey === key) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortOrder('desc'); }
  };

  const handleCancelReservation = async () => {
    if (!selectedForAction) return;
    if (!window.confirm(`确定要取消 ${selectedForAction.contactName} 的预约吗？\nAre you sure you want to cancel this reservation?`)) return;
    setActionLoading(true);
    try {
      // 1. Update Status in DB
      await updateReservation(selectedForAction.id, { checkInStatus: CheckInStatus.Cancelled }, selectedForAction.firebaseDocId);

      // 2. Send Email Notification
      await sendCancellationEmail(selectedForAction);

      await fetchData();
      setSelectedForAction(null);
    } catch (e) {
      console.error(e);
      alert("取消失败 / Cancel failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReservation = async () => {
    if (!selectedForAction) return;
    setActionLoading(true);
    try {
      let docId = selectedForAction.firebaseDocId;
      if (!docId) {
        const q = query(collection(db, 'reservations'), where('id', '==', selectedForAction.id));
        const snapshot = await getDocs(q);
        docId = snapshot.docs[0]?.id;
      }
      if (docId) {
        await deleteReservation(docId);
      }
      await fetchData();
      setShowConfirmDelete(false);
      setSelectedForAction(null);
    } catch (e) { console.error(e); } finally { setActionLoading(false); }
  };

  const handleSaveConfig = async () => {
    setActionLoading(true);
    try {
      await updateTicketConfig(editConfig);
      setConfig(editConfig);
      setShowConfigModal(false);
    } catch (e) { console.error(e); } finally { setActionLoading(false); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-cny-red" /></div>;
  if (!stats) return <div className="p-8 text-center text-red-500 font-bold">Error loading data.</div>;

  const downloadCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Type', 'Adults', 'Children', 'Performer', 'Unit', 'Operator', 'LastModifiedBy', 'Amount', 'Status'];
    const rows = filteredData.map(r => [
      r.id,
      r.contactName,
      r.phoneNumber,
      r.ticketType,
      r.adultsCount,
      r.childrenCount,
      r.isPerformer ? 'YES' : 'NO',
      r.performanceUnit || '',
      r.operatorId || 'N/A',
      r.lastModifiedBy || 'N/A',
      r.totalAmount,
      r.checkInStatus
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `cny_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 antialiased animate-in fade-in duration-700">

      <ConfigModal
        showConfigModal={showConfigModal}
        setShowConfigModal={setShowConfigModal}
        editConfig={editConfig}
        setEditConfig={setEditConfig}
        handleSaveConfig={handleSaveConfig}
      />

      <DeleteModal
        showConfirmDelete={showConfirmDelete}
        setShowConfirmDelete={setShowConfirmDelete}
        selectedForAction={selectedForAction}
        handleDeleteReservation={handleDeleteReservation}
        actionLoading={actionLoading}
      />

      <DetailModal
        selectedForAction={selectedForAction}
        setSelectedForAction={setSelectedForAction}
        showConfirmDelete={showConfirmDelete}
        setShowConfirmDelete={setShowConfirmDelete}
        handleCancelReservation={handleCancelReservation}
        actionLoading={actionLoading}
        fetchData={fetchData}
      />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
        <div className="flex items-center gap-6">
          <div className="bg-cny-red p-5 rounded-3xl shadow-lg">
            <Activity className="text-white w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">数据中心 Dashboard</h2>
            <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-[0.2em]">Real-time Event Analytics</p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          {isAdmin && (
            <button onClick={() => setShowConfigModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-50 border border-gray-100 px-8 py-4 rounded-2xl text-sm font-bold hover:bg-gray-100 transition">
              <Settings className="w-4 h-4" /> 库存设置
            </button>
          )}
          <button onClick={fetchData} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-50 border border-gray-100 px-8 py-4 rounded-2xl text-sm font-bold hover:bg-gray-100 transition">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 刷新
          </button>
          {isAdmin && (
            <button onClick={downloadCSV} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-cny-dark text-white px-8 py-4 rounded-2xl text-sm font-bold hover:shadow-lg transition">
              <Download className="w-4 h-4" /> 导出报表
            </button>
          )}
        </div>
      </div>

      <StatsGrid stats={stats} config={config} />

      <CouponStats stats={stats} />

      <DailyStatsChart reservations={reservations} />

      {isAdmin && (
        <ReservationList
          reservations={reservations}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterPerformer={filterPerformer}
          setFilterPerformer={setFilterPerformer}
          filterCoupon={filterCoupon}
          setFilterCoupon={setFilterCoupon}
          paginatedData={paginatedData}
          toggleSort={toggleSort}
          setSelectedForAction={setSelectedForAction}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      )}

    </div>
  );
};

export default AdminDashboard;

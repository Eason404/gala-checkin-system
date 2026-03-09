
import { Download, Loader2, RefreshCw, Activity, Settings, Mail, Users } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { calculateStats, getReservations, updateReservation, deleteReservation, getTicketConfig, updateTicketConfig, sendCancellationEmail, getStaffAccounts } from '../services/dataService';
import { Stats, Reservation, CheckInStatus, TicketConfig } from '../types';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getCurrentUserRole, getCurrentUserDisplayName } from '../services/authService';

// Sub-components
import { StatsGrid } from '../components/admin/StatsGrid';
import { DailyStatsChart } from '../components/admin/DailyStatsChart';
import { CouponStats } from '../components/admin/CouponStats';
import { StaffStats } from '../components/admin/StaffStats';
import { ReservationList } from '../components/admin/ReservationList';
import { ConfigModal } from '../components/admin/modals/ConfigModal';
import { DeleteModal } from '../components/admin/modals/DeleteModal';
import { DetailModal } from '../components/admin/modals/DetailModal';
import { EmailReminderModal } from '../components/admin/modals/EmailReminderModal';
import { AdminSwitcher } from '../components/AdminSwitcher';

const ITEMS_PER_PAGE = 10;

const AdminDashboard: React.FC<{ view?: 'dashboard' | 'list' }> = ({ view = 'dashboard' }) => {
  const role = getCurrentUserRole();
  const isAdmin = role === 'admin';

  // Staff cannot access the registration list — redirect to check-in
  if (view === 'list' && role === 'staff') {
    return <Navigate to="/staff" replace />;
  }


  const [stats, setStats] = useState<Stats | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [config, setConfig] = useState<TicketConfig | null>(null);
  const [staffMap, setStaffMap] = useState<Record<string, string>>({});
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
  const [showEmailModal, setShowEmailModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);

    try {
      const allRes = await getReservations();

      const fetchedConfig = await getTicketConfig();
      const [fetchedStats, fetchedStaffMap] = await Promise.all([
        calculateStats(allRes),
        getStaffAccounts(allRes, fetchedConfig)
      ]);

      setStats(fetchedStats);
      setReservations(allRes);
      setConfig(fetchedConfig);
      setStaffMap(fetchedStaffMap);
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

      <AdminSwitcher />

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

      <EmailReminderModal
        showModal={showEmailModal}
        setShowModal={setShowEmailModal}
        reservations={reservations}
      />

      {/* GM Welcome Banner */}
      {role === 'gm' && (
        <div className="glass-dark px-5 py-4 rounded-2xl shadow-lg border border-cny-gold/20 flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cny-gold to-orange-400 text-cny-dark font-serif font-black rounded-xl flex items-center justify-center text-lg shadow-md">福</div>
            <div>
              <h3 className="text-white font-bold text-lg">欢迎, {getCurrentUserDisplayName()} <span className="text-white/50 text-sm font-normal">(GM)</span></h3>
              <p className="text-cny-gold/80 font-bold uppercase tracking-wider text-xs">马年快乐！Happy Year of the Horse!</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="glass-dark flex flex-wrap items-center justify-between gap-3 px-5 py-4 rounded-2xl shadow-lg border border-white/10 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          {view === 'dashboard' ? <Activity className="text-cny-gold w-5 h-5" /> : <Users className="text-cny-gold w-5 h-5" />}
          <h2 className="text-lg font-black text-white tracking-tight">
            {view === 'dashboard' ? 'Dashboard' : 'Registration List'}
          </h2>
          <button onClick={() => fetchData()} className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex gap-2">
          {isAdmin && view === 'dashboard' && (
            <button onClick={() => setShowConfigModal(true)} className="flex items-center gap-1.5 bg-white/10 border border-white/5 px-4 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-white/20 transition">
              <Settings className="w-3.5 h-3.5" /> Config
            </button>
          )}
          {isAdmin && view === 'list' && (
            <button onClick={() => setShowEmailModal(true)} className="flex items-center gap-1.5 bg-[#D72638] border border-red-500/50 px-4 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-red-700 transition">
              <Mail className="w-3.5 h-3.5" /> Email
            </button>
          )}
          {isAdmin && view === 'list' && (
            <button onClick={downloadCSV} className="flex items-center gap-1.5 bg-cny-gold text-cny-dark px-4 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          )}
        </div>
      </div>

      {view === 'dashboard' && (
        <>
          <StatsGrid stats={stats} config={config} />
          <StaffStats reservations={reservations} staffMap={staffMap} config={config} />
          <CouponStats stats={stats} />
          <DailyStatsChart reservations={reservations} />
        </>
      )}

      {view === 'list' && (
        <>
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
          <div className="mt-8 flex justify-center pb-8 text-center flex-col gap-2">
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">
              共 {reservations.length} 条记录 / TOTAL {reservations.length} RECORDS
            </p>
            {filteredData.length !== reservations.length && (
              <p className="text-white/20 text-[10px] tracking-widest font-bold">
                (显示 {filteredData.length} 条过滤结果)
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

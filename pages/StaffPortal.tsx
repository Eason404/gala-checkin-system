
import React, { useState, useEffect, useRef } from 'react';
import { getReservations, updateReservation, processFamilyCheckInTransaction } from '../services/dataService';
import PublicRegistration from './PublicRegistration';
import { Reservation, CheckInStatus, PaymentStatus, PaymentMethod } from '../types';
import { StaffHeader } from '../components/staff/StaffHeader';
import { SearchSection } from '../components/staff/SearchSection';
import { ScannerOverlay } from '../components/staff/ScannerOverlay';
import { CheckInAlert } from '../components/staff/CheckInAlert';
import { ReservationDetail } from '../components/staff/ReservationDetail';
import { PaymentModal } from '../components/staff/PaymentModal';
import { SuccessView } from '../components/staff/SuccessView';
import { StaffDashboard } from '../components/staff/StaffDashboard';
import { AdminSwitcher } from '../components/AdminSwitcher';
import QRCode from 'qrcode';

const StaffPortal: React.FC = () => {
  const [mode, setMode] = useState<'search' | 'result' | 'walkin' | 'scanner' | 'success' | 'already_checked_in' | 'dashboard'>('search');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [cashTendered, setCashTendered] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>('');

  // Persisted Lane State
  const [currentLane, setCurrentLane] = useState<string>(() => {
    return localStorage.getItem('staffLane') || 'Select Lane';
  });

  // Effect to save lane
  useEffect(() => {
    if (currentLane !== 'Select Lane') {
      localStorage.setItem('staffLane', currentLane);
    }
  }, [currentLane]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const cashInputRef = useRef<HTMLInputElement>(null);

  const triggerHaptic = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  };

  const handleSetMode = (newMode: typeof mode) => {
    if (newMode === 'walkin' || newMode === 'dashboard' || newMode === 'search') {
      setSelectedRes(null);
      setShowPayModal(false);
      setSearchPhone('');
    }
    setMode(newMode);
  };

  const refreshData = async () => {
    setLoading(true);
    const data = await getReservations();
    setReservations(data);
    setLoading(false);
  };

  useEffect(() => { refreshData(); }, []);

  useEffect(() => {
    if (mode === 'search' && searchInputRef.current) searchInputRef.current.focus();
  }, [mode]);

  useEffect(() => {
    if (showPayModal && cashInputRef.current) cashInputRef.current.focus();
  }, [showPayModal]);

  const generateWalkInQr = async () => {
    try {
      const walkInUrl = `${window.location.origin}${window.location.pathname}#/public-walkin`;
      const url = await QRCode.toDataURL(walkInUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
      setQrCodeData(url);
      setShowQrModal(true);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to generate QR Code');
    }
  };

  const executeSearch = async (termOverride?: string) => {
    setErrorMsg('');
    const term = (termOverride || searchPhone).trim();
    if (term.length < 4) return setErrorMsg('信息太短');

    setLoading(true);
    const data = await getReservations();
    const isId = term.toUpperCase().startsWith('CNY26-');
    const matchedRecords = data.filter(r =>
      (isId ? r.id === term.toUpperCase() : r.phoneNumber.includes(term))
    );
    setLoading(false);

    // Prioritize active records (NotArrived or Arrived) over Cancelled records
    let found = matchedRecords.find(r => r.checkInStatus !== CheckInStatus.Cancelled);
    if (!found && matchedRecords.length > 0) {
      // Fallback to cancelled if only cancelled exist
      found = matchedRecords[0];
    }

    if (found) {
      if (found.checkInStatus === CheckInStatus.Cancelled) {
        setErrorMsg('此票已取消 (Cancelled)');
        triggerHaptic([50, 100, 50]);
        return;
      }
      if (found.checkInStatus === CheckInStatus.Arrived) {
        setSelectedRes(found);
        setMode('already_checked_in');
        triggerHaptic([30, 50, 30, 50, 30]);
        setSearchPhone('');
        return;
      }
      setSelectedRes(found);
      setMode('result');
      setSearchPhone('');
    } else {
      setErrorMsg('未找到有效记录');
      triggerHaptic([50, 100]);
    }
  };

  const handleScanSuccess = (text: string) => {
    triggerHaptic([50, 30, 50]);
    setShowScanner(false);
    executeSearch(text);
  };

  const handleFamilyCheckIn = async () => {
    if (!selectedRes) return;
    setLoading(true);
    const count = selectedRes.totalPeople;

    try {
      const updates: Partial<Reservation> = {
        checkInStatus: CheckInStatus.Arrived,
        paymentStatus: PaymentStatus.Paid,
        paymentMethod: PaymentMethod.Cash,
        paidAmount: selectedRes.totalAmount,
        lastModifiedBy: currentLane !== 'Select Lane' ? currentLane : undefined
      };

      const newLottery = await processFamilyCheckInTransaction(
        selectedRes.id,
        selectedRes.firebaseDocId,
        count,
        updates
      );

      triggerHaptic([100, 50, 100]);
      setSelectedRes({ ...selectedRes, ...updates, lotteryNumbers: newLottery });
      setMode('success');
      setShowPayModal(false);
    } catch (e: any) {
      console.error(e);
      if (e.message === 'RESERVATION_CANCELLED') {
        setErrorMsg('此票已取消 (Cancelled)');
      } else {
        setErrorMsg('更新失败 (Update failed)');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetToNext = () => {
    handleSetMode('search');
  };

  return (
    <div className="max-w-xl mx-auto pb-24 px-4 antialiased">
      <AdminSwitcher />
      <StaffHeader
        setMode={handleSetMode}
        triggerHaptic={triggerHaptic}
        onShowWalkInQr={generateWalkInQr}
        currentLane={currentLane}
        setCurrentLane={setCurrentLane}
      />

      {mode === 'search' && (
        <SearchSection
          searchInputRef={searchInputRef}
          searchPhone={searchPhone}
          setSearchPhone={setSearchPhone}
          executeSearch={executeSearch}
          setShowScanner={setShowScanner}
          errorMsg={errorMsg}
        />
      )}

      {mode === 'dashboard' && (
        <StaffDashboard reservations={reservations} onClose={() => handleSetMode('search')} />
      )}

      {mode === 'walkin' && (
        <PublicRegistration
          forceWalkIn={true}
          onClose={(newRes) => {
            if (newRes) {
              setSelectedRes(newRes);
              setMode('result');
              setShowPayModal(true);
            } else {
              handleSetMode('search');
            }
          }}
        />
      )}

      {showScanner && (
        <ScannerOverlay onScanSuccess={handleScanSuccess} onClose={() => setShowScanner(false)} />
      )}

      {mode === 'already_checked_in' && selectedRes && (
        <CheckInAlert selectedRes={selectedRes} resetToNext={resetToNext} />
      )}

      {mode === 'result' && selectedRes && (
        <ReservationDetail selectedRes={selectedRes} setShowPayModal={setShowPayModal} setMode={handleSetMode} setSelectedRes={setSelectedRes} />
      )}

      {showPayModal && selectedRes && (
        <PaymentModal
          selectedRes={selectedRes}
          cashInputRef={cashInputRef}
          cashTendered={cashTendered}
          setCashTendered={setCashTendered}
          handleFamilyCheckIn={handleFamilyCheckIn}
          setShowPayModal={setShowPayModal}
        />
      )}

      {mode === 'success' && selectedRes && (
        <SuccessView selectedRes={selectedRes} resetToNext={resetToNext} />
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowQrModal(false)}>
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-gray-900 mb-2">现场购票扫码区</h2>
            <p className="text-gray-500 text-sm mb-6">Scan to register for Walk-in tickets</p>
            {qrCodeData && (
              <img src={qrCodeData} alt="Walk-in QR Code" className="w-full h-auto rounded-xl mx-auto shadow-sm" />
            )}
            <button
              onClick={() => setShowQrModal(false)}
              className="mt-8 w-full py-4 bg-gray-100 text-gray-900 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors"
            >
              关闭 (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPortal;

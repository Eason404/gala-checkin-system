
import React, { useState, useEffect, useRef } from 'react';
import { getReservations, updateReservation, generateLotteryNumber } from '../services/dataService';
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

  const searchInputRef = useRef<HTMLInputElement>(null);
  const cashInputRef = useRef<HTMLInputElement>(null);

  const triggerHaptic = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
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

  const executeSearch = async (termOverride?: string) => {
    setErrorMsg('');
    const term = (termOverride || searchPhone).trim();
    if (term.length < 4) return setErrorMsg('信息太短');

    setLoading(true);
    const data = await getReservations();
    const isId = term.toUpperCase().startsWith('CNY26-');
    const found = data.find(r =>
      (isId ? r.id === term.toUpperCase() : r.phoneNumber.includes(term))
    );
    setLoading(false);

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
    const currentLottery = selectedRes.lotteryNumbers || [];
    const newLottery = [...currentLottery];

    try {
      const reservations = await getReservations();
      const existingNumbers = new Set<string>();
      reservations.forEach(r => {
        if (r.lotteryNumbers) {
          r.lotteryNumbers.forEach(n => existingNumbers.add(n));
        }
      });

      while (newLottery.length < count) {
        newLottery.push(await generateLotteryNumber(existingNumbers));
      }

      const updates: Partial<Reservation> = {
        checkInStatus: CheckInStatus.Arrived,
        paymentStatus: PaymentStatus.Paid,
        paymentMethod: PaymentMethod.Cash,
        paidAmount: selectedRes.totalAmount,
        lotteryNumbers: newLottery
      };

      await updateReservation(selectedRes.id, updates, selectedRes.firebaseDocId);
      triggerHaptic([100, 50, 100]);
      setSelectedRes({ ...selectedRes, ...updates });
      setMode('success');
      setShowPayModal(false);
    } catch (e) {
      setErrorMsg('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const resetToNext = () => {
    setSelectedRes(null);
    setSearchPhone('');
    setMode('search');
    // Optional: auto-open scanner for efficiency
    // setShowScanner(true);
  };

  return (
    <div className="max-w-xl mx-auto pb-24 px-4 antialiased">
      <StaffHeader setMode={setMode} triggerHaptic={triggerHaptic} />

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
        <StaffDashboard reservations={reservations} onClose={() => setMode('search')} />
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
              setMode('search');
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
        <ReservationDetail selectedRes={selectedRes} setShowPayModal={setShowPayModal} setMode={setMode} setSelectedRes={setSelectedRes} />
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
    </div>
  );
};

export default StaffPortal;

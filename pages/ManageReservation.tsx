import React, { useState } from 'react';
import { getReservations, updateReservation, sendCancellationEmail } from '../services/dataService';
import { CheckInStatus, Reservation } from '../types';
import { ManagementTab } from '../components/registration/ManagementTab';
import { Link } from 'react-router-dom';

const ManageReservation: React.FC = () => {
    const [managePhone, setManagePhone] = useState('');
    const [manageName, setManageName] = useState('');
    const [myRes, setMyRes] = useState<Reservation | null>(null);
    const [lookupError, setLookupError] = useState('');
    const [loading, setLoading] = useState(false);

    const triggerHaptic = (pattern: number | number[] = 10) => {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    };

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLookupError('');
        setMyRes(null);

        if (!manageName.trim() || !managePhone.trim()) {
            setLookupError('请完整填写姓名和电话');
            return;
        }

        const normalizeName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, ' ');

        setLoading(true);
        try {
            const allReservations = await getReservations();
            const cleanPhone = managePhone.replace(/\D/g, '');
            const normalizedSearchName = normalizeName(manageName);

            const found = allReservations.find(r => {
                // Strip non-digits from stored phone
                const storedCleanPhone = r.phoneNumber.replace(/\D/g, '');
                const phoneMatch = storedCleanPhone === cleanPhone;

                const storedNormalizedName = normalizeName(r.contactName);
                const storedFirstName = storedNormalizedName.split(' ')[0];

                // Exact match on normalized full name or first name
                const nameMatch = storedNormalizedName === normalizedSearchName || storedFirstName === normalizedSearchName;

                return phoneMatch && nameMatch && r.checkInStatus !== CheckInStatus.Cancelled;
            });

            if (found) {
                setMyRes(found);
                triggerHaptic(50);
            } else {
                setLookupError('未找到相关预约信息或匹配不正确 (No record found or incorrect info)');
            }
        } catch (err) {
            setLookupError('查询失败，请检查网络连接');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!myRes) return;
        if (window.confirm('确定要取消预约吗？此操作无法撤销。\\nAre you sure you want to cancel?')) {
            setLoading(true);
            try {
                await updateReservation(myRes.id, { checkInStatus: CheckInStatus.Cancelled }, myRes.firebaseDocId);
                await sendCancellationEmail(myRes);
                triggerHaptic([50, 50]);

                setMyRes({
                    ...myRes,
                    checkInStatus: CheckInStatus.Cancelled
                });
                setLookupError('预约已成功取消 (Reservation Cancelled)');
            } catch (e) {
                setLookupError('取消失败，请重试');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-12 pb-32">
            {/* Header Section */}
            <div className="text-center relative py-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none select-none">
                    <div className="text-[180px] font-serif text-cny-gold leading-none">马</div>
                </div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-cny-gold text-cny-dark rounded-3xl shadow-2xl flex items-center justify-center text-4xl font-serif font-black mb-8 rotate-3 festive-float border-2 border-white/20">福</div>
                    <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tighter mb-4 drop-shadow-xl">2026 Natick 春晚</h1>
                    <div className="flex items-center gap-4 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                        <span className="text-cny-gold font-bold text-xs uppercase tracking-[0.3em]">Year of the Horse Gala</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mb-8">
                <Link to="/" className="px-6 py-3 bg-white/10 text-white rounded-full font-bold text-sm tracking-widest uppercase hover:bg-white/20 transition-colors border border-white/10 shadow-xl backdrop-blur-sm">
                    ← 返回主页 Return Home
                </Link>
            </div>

            <ManagementTab
                manageName={manageName}
                setManageName={setManageName}
                managePhone={managePhone}
                setManagePhone={setManagePhone}
                loading={loading}
                handleLookup={handleLookup}
                myRes={myRes}
                lookupError={lookupError}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default ManageReservation;

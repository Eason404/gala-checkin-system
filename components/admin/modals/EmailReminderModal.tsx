import React, { useState } from 'react';
import { Mail, Loader2, X, Send, Users, Eye, AlertTriangle } from 'lucide-react';
import { Reservation, TicketType, PaymentStatus, CheckInStatus } from '../../../types';
import { sendEventReminderEmail, generateEventReminderEmailHtml } from '../../../services/dataService';

interface EmailReminderModalProps {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    reservations: Reservation[];
}

export const EmailReminderModal: React.FC<EmailReminderModalProps> = ({
    showModal,
    setShowModal,
    reservations
}) => {
    const [testEmailStr, setTestEmailStr] = useState('');
    const [sendingTest, setSendingTest] = useState(false);
    const [sendingMass, setSendingMass] = useState(false);
    const [progress, setProgress] = useState({ sent: 0, total: 0 });
    const [showPreview, setShowPreview] = useState(false);
    const [showMassConfirm, setShowMassConfirm] = useState(false);
    const [testReservationId, setTestReservationId] = useState<string>('dummy');
    const [showTestConfirm, setShowTestConfirm] = useState(false);

    if (!showModal) return null;

    const activeReservations = reservations.filter(r => r.checkInStatus !== 'cancelled');

    // Generic dummy reservation for preview and testing
    const samplePreviewReservation: Reservation = {
        id: 'CNY26-TEST',
        firebaseDocId: 'test',
        createdTime: Date.now(),
        contactName: 'Test Attendee (测试)',
        phoneNumber: '508-555-0123',
        email: 'test@example.com',
        ticketType: TicketType.Regular,
        adultsCount: 2,
        childrenCount: 0,
        totalPeople: 2,
        pricePerPerson: 20,
        totalAmount: 40,
        paidAmount: 0,
        paymentStatus: PaymentStatus.Unpaid,
        paymentMethod: 'None' as any,
        checkInStatus: CheckInStatus.NotArrived,
        isPerformer: false,
    };

    const selectedReservation = testReservationId === 'dummy' ? samplePreviewReservation : (activeReservations.find(r => r.id === testReservationId) || samplePreviewReservation);

    const previewHtml = generateEventReminderEmailHtml(selectedReservation);

    const handleSendTestClick = () => {
        if (!testEmailStr) return alert("Please enter at least one test email address.");
        setShowTestConfirm(true);
    };

    const handleSendTest = async () => {
        setSendingTest(true);
        try {
            const emails = testEmailStr.split(',').map(e => e.trim()).filter(e => e.includes('@'));
            if (emails.length === 0) {
                alert("Invalid email format");
                return;
            }

            // Define the sample based on the test email target and selected template
            const sample: Reservation = {
                ...selectedReservation,
                email: emails[0]
            };

            await sendEventReminderEmail(emails, sample);
            // No custom alert dialog on success, a subtle state update is preferred but simple alert is fine
            alert(`Test email successfully sent to: ${emails.join(', ')}\n\n(Note: This test email used profile: ${selectedReservation.contactName})`);
            setShowTestConfirm(false); // Close the preview confirmation after sending
        } catch (e) {
            console.error(e);
            alert("Failed to send test email");
        } finally {
            setSendingTest(false);
        }
    };

    const validReservations = activeReservations.filter(r => r.email && r.email.includes('@'));
    const sentCount = validReservations.filter(r => r.isReminderEmailSent).length;
    const pendingReservations = validReservations.filter(r => !r.isReminderEmailSent);

    const handleSendBatch = async () => {
        if (!showMassConfirm) {
            setShowMassConfirm(true);
            return;
        }

        setSendingMass(true);
        const batchSize = 20;
        const toSend = pendingReservations.slice(0, batchSize);
        setProgress({ sent: 0, total: toSend.length });

        let currentSent = 0;
        try {
            for (const res of toSend) {
                if (res.email) {
                    await sendEventReminderEmail([res.email], res);
                    currentSent++;
                    setProgress({ sent: currentSent, total: toSend.length });
                    // Sequential delay of 800ms avoids concurrent Firebase Extension limits & Gmail spam blocking
                    await new Promise(r => setTimeout(r, 800));
                }
            }

            alert(`Successfully sent ${currentSent} reminder emails in this batch.`);
            setShowMassConfirm(false); // Reset confirmation
        } catch (e) {
            console.error(e);
            alert(`An error occurred. Proceeded partially (${currentSent} sent in this batch). Please wait a moment and try again.`);
            setShowMassConfirm(false);
        } finally {
            setSendingMass(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1a1c23] rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-gradient-to-r from-cny-dark to-[#2a1f24] p-6 border-b border-white/5 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Mail className="w-6 h-6 text-cny-gold" /> Event Reminders
                        </h2>
                        <p className="text-white/60 text-sm mt-1">Send email reminders to attendees.</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition p-2 hover:bg-white/10 rounded-full" disabled={sendingMass}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">

                    {/* Action 1: Test Email */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">1. Test Mode (Recommended)</h3>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-3">
                            <p className="text-sm text-blue-200">
                                Send a test email to verify formatting before mass broadcasting. It will use the selected reservation profile for the template data.
                            </p>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-blue-300 font-semibold uppercase tracking-wider">Template Data Source</label>
                                <select
                                    value={testReservationId}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setTestReservationId(val);
                                        setShowTestConfirm(false); // Reset confirmation when changing template
                                        if (val !== 'dummy') {
                                            const res = activeReservations.find(r => r.id === val);
                                            if (res && res.email) {
                                                setTestEmailStr(res.email); // Auto-populate email from reservation
                                            }
                                        } else {
                                            setTestEmailStr('');
                                        }
                                    }}
                                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-cny-gold/50 transition text-sm appearance-none cursor-pointer hover:bg-black/60"
                                >
                                    <option value="dummy" className="text-black bg-white">Generic "Test Attendee" Profile (Safe Dummy Data)</option>
                                    {activeReservations
                                        .slice()
                                        .sort((a, b) => a.createdTime - b.createdTime)
                                        .slice(0, 30)
                                        .map(r => (
                                            <option key={r.id} value={r.id} className="text-black bg-white">{r.id} - {r.contactName} ({r.totalPeople} tickets)</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>

                        {!showTestConfirm ? (
                            <div className="flex gap-3">
                                <input
                                    type="email"
                                    value={testEmailStr}
                                    onChange={(e) => setTestEmailStr(e.target.value)}
                                    placeholder="Enter test email address(es), separated by comma"
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cny-gold/50 focus:outline-none transition"
                                />
                                <button
                                    onClick={handleSendTestClick}
                                    disabled={sendingTest || sendingMass || !testEmailStr}
                                    className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-white/5 shadow-lg"
                                >
                                    {sendingTest ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
                                    Preview & Send Test
                                </button>
                            </div>
                        ) : (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-4 animate-in fade-in duration-300">
                                <div className="flex justify-between items-center border-b border-blue-500/20 pb-2">
                                    <h4 className="font-bold text-blue-300 flex items-center gap-2">
                                        <Eye className="w-5 h-5" /> Preview & Confirm
                                    </h4>
                                    <button onClick={() => setShowTestConfirm(false)} className="text-blue-300 hover:text-white transition">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="border border-white/10 rounded-xl overflow-hidden bg-white shadow-inner">
                                    <div className="bg-gray-200 text-gray-800 text-xs px-3 py-1 font-mono border-b border-gray-300 flex justify-between">
                                        <span className="truncate max-w-[50%]">To: {testEmailStr}</span>
                                        <span className="truncate max-w-[50%]">Subject: 【提醒/Reminder】 Natick 2026 春晚即将来临...</span>
                                    </div>
                                    <iframe
                                        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                                        srcDoc={previewHtml}
                                        className="w-full h-80 bg-white"
                                        title="Email Preview"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowTestConfirm(false)}
                                        disabled={sendingTest}
                                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendTest}
                                        disabled={sendingTest}
                                        className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2 shadow-lg shadow-blue-900/50 disabled:opacity-50"
                                    >
                                        {sendingTest ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                        {sendingTest ? "Sending Test..." : "Confirm & Send Test Email"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action 2: Mass Broadcast */}
                    <div className="space-y-4 pt-4">
                        <div className="flex justify-between items-end border-b border-red-500/20 pb-2">
                            <h3 className="text-lg font-semibold text-cny-red flex items-center gap-2">
                                <Users className="w-5 h-5" /> 2. Batch Broadcast
                            </h3>
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="text-sm text-cny-gold flex items-center gap-1 hover:underline pb-1 transition-all"
                            >
                                <Eye className="w-4 h-4" /> {showPreview ? "Hide Preview" : "Preview Email"}
                            </button>
                        </div>

                        {showPreview && (
                            <div className="mb-4 border border-white/10 rounded-xl overflow-hidden bg-white shadow-inner">
                                <div className="bg-gray-200 text-gray-800 text-xs px-3 py-1 font-mono border-b border-gray-300 flex justify-between">
                                    <span>Subject: 【Reminder】 Natick 2026 春晚即将来临...</span>
                                </div>
                                <iframe
                                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                                    srcDoc={previewHtml}
                                    className="w-full h-80 bg-white"
                                    title="Email Preview"
                                />
                            </div>
                        )}

                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-white/60">Total Valid Profiles: <strong className="text-white">{validReservations.length}</strong></span>
                            <span className="text-blue-400">Sent: <strong>{sentCount}</strong> / {validReservations.length}</span>
                        </div>

                        <p className="text-sm text-white/60">Send reminders in controlled batches of up to <strong className="text-white">20 attendees</strong> to respect email server rate limits. You can safely resume where you left off if an error occurs.</p>

                        {!showMassConfirm ? (
                            <button
                                onClick={handleSendBatch}
                                disabled={sendingMass || sendingTest || pendingReservations.length === 0}
                                className="w-full bg-gradient-to-r from-cny-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/50"
                            >
                                <Mail className="w-6 h-6" />
                                {pendingReservations.length > 0 ? `Send to Next Batch (Up to 20)` : `All Confirmed Emails Sent!`}
                            </button>
                        ) : (
                            <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 space-y-3 animate-in fade-in duration-300">
                                <p className="text-red-400 font-bold flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    Send to Next Batch?
                                </p>
                                <p className="text-white/80 text-sm">
                                    You are about to securely broadcast emails to the next <strong>{Math.min(20, pendingReservations.length)} pending addresses</strong>.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowMassConfirm(false)}
                                        disabled={sendingMass}
                                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendBatch}
                                        disabled={sendingMass}
                                        className="flex-[2] bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2 shadow-lg shadow-red-900/50 disabled:opacity-50"
                                    >
                                        {sendingMass ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                        {sendingMass ? `Sending... (${progress.sent} / ${progress.total})` : "Yes, Send Next Batch"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {sendingMass && (
                            <div className="w-full bg-black/50 rounded-full h-2 mt-4 overflow-hidden">
                                <div
                                    className="bg-cny-gold h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(progress.sent / Math.max(progress.total, 1)) * 100}%` }}
                                />
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};


import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { createReservation, getReservations, updateReservation, sendCancellationEmail, getTicketConfig } from '../services/dataService';
import { TicketType, CheckInStatus, Reservation, TicketConfig } from '../types';
import { validatePhone, validateEmail } from '../utils/validation';
import { CheckCircle, AlertCircle, ArrowRight, Ticket } from 'lucide-react';
import QRCode from 'qrcode';

// Sub-components
import { WaiverModal } from '../components/registration/WaiverModal';
import { RedEnvelope } from '../components/registration/RedEnvelope';
import { TicketSuccess } from '../components/registration/TicketSuccess';
import { StepOneTicketSelection } from '../components/registration/StepOneTicketSelection';
import { StepTwoForm } from '../components/registration/StepTwoForm';
import { LiveTicker } from '../components/registration/LiveTicker';

interface PublicRegistrationProps {
  forceWalkIn?: boolean;
  onClose?: (newReservation?: Reservation) => void;
}

const PublicRegistration: React.FC<PublicRegistrationProps> = ({ forceWalkIn = false, onClose }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isWalkIn = forceWalkIn || searchParams.get('type') === 'walkin';

  const [currentStep, setCurrentStep] = useState<1 | 2>(isWalkIn ? 2 : 1);
  const [config, setConfig] = useState<TicketConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Registration Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    adults: 1,
    children: 0,
    ticketType: isWalkIn ? TicketType.WalkIn : TicketType.EarlyBird,
    isPerformer: false,
    performanceUnit: ''
  });
  const [agreedToWaiver, setAgreedToWaiver] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [reservationId, setReservationId] = useState('');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [earlyBirdProgress, setEarlyBirdProgress] = useState(0);

  // Intersection Observer ref
  const progressBarRef = useRef<HTMLDivElement>(null);

  const currentPrice = formData.ticketType === TicketType.EarlyBird ? 15 : 20;

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const conf = await getTicketConfig();
        setConfig(conf);
      } catch (err) {
        console.error("Failed to fetch config", err);
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (submitted && reservationId) {
      QRCode.toDataURL(reservationId, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      })
        .then(url => setQrCodeData(url))
        .catch(err => console.error(err));
    }
  }, [submitted, reservationId]);

  useEffect(() => {
    if (currentStep === 1 && progressBarRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setTimeout(() => {
              setEarlyBirdProgress(95);
            }, 400);
            observer.disconnect();
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(progressBarRef.current);
      return () => observer.disconnect();
    }
  }, [currentStep]);

  const triggerHaptic = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const handleNextStep = () => {
    triggerHaptic(20);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    triggerHaptic(10);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (formData.adults < 1) {
      setSubmitError('必须至少有一名成人陪同 (At least 1 adult required)');
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setSubmitError('请填写真实姓名 (Full name required)');
      return;
    }
    if (!validateEmail(formData.email)) {
      setSubmitError('邮箱格式不正确 (Invalid email)');
      return;
    }
    if (!validatePhone(formData.phone)) {
      setSubmitError('电话格式不正确 (Invalid phone)');
      return;
    }
    if (!agreedToWaiver) {
      setSubmitError("您必须阅读并同意协议才能报名 (Agreement required)");
      return;
    }
    if (formData.isPerformer && !formData.performanceUnit.trim()) {
      setSubmitError("表演人员请务必填写单位名称 (Performance unit required)");
      return;
    }

    setLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const newRes = await createReservation({
        contactName: fullName,
        phoneNumber: formData.phone,
        email: formData.email,
        adultsCount: Number(formData.adults),
        childrenCount: Number(formData.children),
        ticketType: formData.ticketType,
        isPerformer: formData.isPerformer,
        performanceUnit: formData.performanceUnit
      });

      triggerHaptic([100, 50, 100]);

      // If we are in Staff Walk-in mode, bypass the Red Envelope and pass data back immediately
      if (forceWalkIn && onClose) {
        onClose(newRes);
        return;
      }

      setReservationId(newRes.id);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      if (err.message === 'DUPLICATE_PHONE') setSubmitError("该号码已报名。请切换到【管理预约】查询或取消。 (Phone used. Check 'Manage' tab)");
      else setSubmitError("系统繁忙，请稍后再试 (Submission failed)");
      triggerHaptic([50, 100, 50]);
    } finally {
      setLoading(false);
    }
  };

  const openEnvelope = () => {
    setEnvelopeOpened(true);
    triggerHaptic([30, 20, 100]);
  };

  const resetForm = () => {
    setSubmitted(false);
    setEnvelopeOpened(false);
    setReservationId('');
    setCurrentStep(1);
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      adults: 1,
      children: 0,
      ticketType: isWalkIn ? TicketType.WalkIn : TicketType.EarlyBird,
      isPerformer: false,
      performanceUnit: ''
    });
    setAgreedToWaiver(false);
  };

  if (submitted && !envelopeOpened) {
    return <RedEnvelope onOpen={openEnvelope} />;
  }

  if (submitted && envelopeOpened) {
    return (
      <TicketSuccess
        reservationId={reservationId}
        qrCodeData={qrCodeData}
        formData={formData}
        currentPrice={currentPrice}
        onReset={onClose || resetForm}
      />
    );
  }

  if (forceWalkIn) {
    return (
      <div className="animate-in fade-in duration-500 relative">
        <WaiverModal
          isOpen={showWaiverModal}
          onClose={() => setShowWaiverModal(false)}
          onConfirm={() => { setAgreedToWaiver(true); triggerHaptic(20); }}
        />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Ticket className="text-cny-gold w-5 h-5" /> 现场购票录入 (Staff Walk-in Registration)
          </h2>
          {onClose && (
            <button onClick={() => onClose()} className="px-4 py-2 bg-white/10 text-white/60 rounded-xl text-xs font-bold hover:bg-white/20 transition-all z-10 relative">
              取消返回 Close
            </button>
          )}
        </div>
        <div className="glass-card rounded-[3rem] shadow-2xl p-8 sm:p-12 border border-white/30 animate-in fade-in slide-in-from-bottom-6 duration-700 overflow-hidden relative z-0">
          <StepTwoForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            loading={loading}
            submitError={submitError}
            agreedToWaiver={agreedToWaiver}
            setAgreedToWaiver={setAgreedToWaiver}
            setShowWaiverModal={setShowWaiverModal}
            handlePrevStep={onClose ? () => onClose() : handlePrevStep}
            triggerHaptic={triggerHaptic}
            currentPrice={currentPrice}
          />
        </div>
      </div>
    );
  }

  // Walk-In check - must be enabled in config
  if (isWalkIn && config && !config.publicWalkInEnabled) {
    return (
      <div className="max-w-xl mx-auto space-y-12 pb-32 pt-20 text-center animate-in fade-in duration-500">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white">现场注册目前已关闭</h2>
        <p className="text-white/60">Walk-in registration is currently disabled by the organizer.</p>
        <Link to="/" className="inline-block mt-8 px-8 py-4 bg-white/10 text-white rounded-[2rem] font-bold hover:bg-white/20 transition-colors">
          返回主页 Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-12 pb-32">
      <LiveTicker />

      <WaiverModal
        isOpen={showWaiverModal}
        onClose={() => setShowWaiverModal(false)}
        onConfirm={() => { setAgreedToWaiver(true); triggerHaptic(20); }}
      />

      {/* Header Section */}
      <div className="text-center relative py-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none select-none">
          <div className="text-[180px] font-serif text-cny-gold leading-none">马</div>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-cny-gold text-cny-dark rounded-3xl shadow-2xl flex items-center justify-center text-4xl font-serif font-black mb-8 rotate-3 festive-float border-2 border-white/20">福</div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tighter mb-4 drop-shadow-xl">2026 Natick 春晚</h1>
          <div className="flex items-center gap-4 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
            <span className="text-cny-gold font-bold text-xs uppercase tracking-[0.3em] font-serif">2026 Natick Chinese New Year Gala</span>
          </div>
        </div>
      </div>

      {/* Link to Manage Portal replacing the tabs */}
      <div className="flex justify-center mt-2 mb-8">
        <Link to="/manage" className="text-sm font-bold text-white/60 hover:text-white underline underline-offset-4 decoration-white/30 transition-all flex items-center gap-2">
          查询或取消已有的预约 (Manage your reservation) <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${currentStep === 1 ? 'bg-cny-gold border-cny-gold text-cny-dark scale-110 shadow-lg' : 'bg-green-500 border-green-500 text-white'}`}>
              {currentStep > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${currentStep === 1 ? 'text-white' : 'text-white/40'}`}>选票 Pick Ticket</span>
          </div>
          <div className="w-8 h-px bg-white/10"></div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${currentStep === 2 ? 'bg-cny-gold border-cny-gold text-cny-dark scale-110 shadow-lg' : 'border-white/20 text-white/20'}`}>
              2
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${currentStep === 2 ? 'text-white' : 'text-white/20'}`}>资料 Your Info</span>
          </div>
        </div>

        <div className="glass-card rounded-[3rem] shadow-2xl p-8 sm:p-12 border border-white/30 animate-in fade-in slide-in-from-bottom-6 duration-700 overflow-hidden">
          {currentStep === 1 ? (
            <StepOneTicketSelection
              formData={formData}
              setFormData={setFormData}
              triggerHaptic={triggerHaptic}
              handleNextStep={handleNextStep}
              progressBarRef={progressBarRef}
              earlyBirdProgress={earlyBirdProgress}
              isWalkIn={isWalkIn}
              isNoFoodOnly={config?.walkInNoFoodOnly}
            />
          ) : (
            <StepTwoForm
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              loading={loading}
              submitError={submitError}
              agreedToWaiver={agreedToWaiver}
              setAgreedToWaiver={setAgreedToWaiver}
              setShowWaiverModal={setShowWaiverModal}
              handlePrevStep={handlePrevStep}
              triggerHaptic={triggerHaptic}
              currentPrice={currentPrice}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicRegistration;

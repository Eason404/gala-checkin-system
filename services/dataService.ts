
import { Reservation, TicketType, PaymentStatus, CheckInStatus, PaymentMethod, Stats, TicketConfig, Coupon } from '../types';
import { db, analytics } from '../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, Timestamp, setDoc, getDoc, limit } from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';
import { getCurrentUserCode } from './authService';

const COLLECTION_NAME = 'reservations';
const MAIL_COLLECTION = 'mail';
const SYSTEM_COLLECTION = 'system';
const CONFIG_DOC_ID = 'ticketConfig';
const OFFICIAL_EMAIL = 'natickchineseassociation@gmail.com';

const generateId = (): string => {
  return 'CNY26-' + Math.floor(1000 + Math.random() * 9000).toString();
};

export const generateLotteryNumber = (): string => {
  return Math.floor(100 + Math.random() * 899).toString(); 
};

const mapDocToReservation = (docSnap: any): Reservation => {
  const data = docSnap.data();
  
  // Backward compatibility: If no 'coupons' array but has 'couponCode', create array
  let coupons: Coupon[] = data.coupons || [];
  if (coupons.length === 0 && data.couponCode) {
    coupons.push({
        code: data.couponCode,
        amount: data.discountAmount || 0
    });
  }

  return {
    ...data,
    id: data.id || docSnap.id,
    firebaseDocId: docSnap.id,
    createdTime: data.createdTime instanceof Timestamp ? data.createdTime.toMillis() : data.createdTime,
    discountAmount: data.discountAmount || 0,
    couponCode: data.couponCode || '',
    coupons: coupons,
  } as Reservation;
};

const sendConfirmationEmail = async (reservation: any) => {
  if (!reservation.email || !reservation.email.includes('@')) return;

  try {
    const totalDue = reservation.totalAmount; 
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${reservation.id}`;
    
    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #f0f0f0;">
        <!-- Header -->
        <div style="background-color: #D72638; padding: 40px 20px; text-align: center;">
          <h1 style="color: #FCE7BB; margin: 0; font-size: 28px; letter-spacing: 2px; font-weight: bold;">Natick 2026 春晚</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; opacity: 0.9; font-weight: bold;">Reservation Confirmed • 预约成功</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          
          <!-- Alert Box -->
          <div style="border: 2px solid #D72638; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 35px; background-color: #FFF5F5;">
            <p style="margin: 0 0 5px 0; color: #D72638; font-size: 18px; font-weight: bold;">
              ⚠️ 重要提醒：请携带现金
            </p>
            <p style="margin: 0 0 15px 0; color: #D72638; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
              IMPORTANT: PLEASE BRING CASH
            </p>
            <p style="margin: 0; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
              请在入场签到台现场支付现金购买门票<br>
              Please pay cash at the check-in desk upon arrival.
            </p>
          </div>

          <!-- Greeting -->
          <p style="color: #333333; font-size: 16px; margin-bottom: 20px;">
            您好 / Dear <strong>${reservation.contactName}</strong>,
          </p>
          
          <p style="color: #555555; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
            感谢您预约 Natick 2026 马年春晚！您的位置已保留。<br>
            Thank you for registering for the Natick 2026 CNY Gala! Your spot is reserved.
          </p>

          <!-- Event Info & Calendar (NEW) -->
          <div style="background-color: #F8F9FA; padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #eee;">
             <table width="100%" cellpadding="0" cellspacing="0" style="border: none; margin-bottom: 15px;">
               <tr>
                 <td width="30" valign="top" style="padding-right: 10px; font-size: 18px;">📅</td>
                 <td>
                   <p style="margin: 0; font-weight: bold; color: #333; font-size: 14px;">Sunday, March 8, 2026</p>
                   <p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">10:00 AM - 2:30 PM</p>
                 </td>
               </tr>
               <tr><td height="15"></td></tr>
               <tr>
                 <td width="30" valign="top" style="padding-right: 10px; font-size: 18px;">📍</td>
                 <td>
                   <p style="margin: 0; font-weight: bold; color: #333; font-size: 14px;">Natick High School</p>
                   <p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">15 West St, Natick, MA 01760</p>
                 </td>
               </tr>
             </table>
             
             <div style="text-align: center; margin-top: 20px;">
                <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Natick+2026+CNY+Gala&dates=20260308T140000Z/20260308T183000Z&details=Ticket+Confirmation+ID:+${reservation.id}%0A%0APlease+bring+cash+for+check-in.+Present+this+email+at+the+reception.&location=Natick+High+School,+15+West+St,+Natick,+MA+01760" 
                   target="_blank" 
                   style="display: inline-block; background-color: #333; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-size: 13px; font-weight: bold;">
                   🗓️ Add to Calendar / 加入日历
                </a>
             </div>
          </div>

          <!-- ID Box -->
          <div style="background-color: #F9F1E7; padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 30px;">
             <p style="margin: 0 0 10px 0; color: #8a1c26; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
               入场券确认码 / Confirmation ID
             </p>
             <div style="color: #D72638; font-size: 32px; font-weight: 900; letter-spacing: 2px; font-family: monospace;">
               ${reservation.id}
             </div>
          </div>
          
          <!-- Ticket Details -->
           <div style="margin-bottom: 30px; border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 20px 0;">
             <table width="100%" cellpadding="0" cellspacing="0" style="border: none;">
               <tr>
                 <td style="padding-bottom: 8px; color: #888; font-size: 12px; text-transform: uppercase;">票种 Ticket Type</td>
                 <td style="padding-bottom: 8px; text-align: right; color: #333; font-weight: bold;">${reservation.ticketType}</td>
               </tr>
               <tr>
                 <td style="padding-bottom: 8px; color: #888; font-size: 12px; text-transform: uppercase;">人数 Party Size</td>
                 <td style="padding-bottom: 8px; text-align: right; color: #333; font-weight: bold;">${reservation.totalPeople} (Adults: ${reservation.adultsCount}, Kids: ${reservation.childrenCount})</td>
               </tr>
               <tr>
                 <td style="color: #888; font-size: 12px; text-transform: uppercase; vertical-align: bottom;">应付金额 Total Due</td>
                 <td style="text-align: right; color: #D72638; font-weight: bold; font-size: 24px;">$${totalDue}</td>
               </tr>
             </table>
           </div>

          <!-- QR Code -->
          <div style="text-align: center; margin-bottom: 10px;">
             <img src="${qrUrl}" width="180" height="180" style="border: 8px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 12px;" />
             <p style="margin-top: 15px; color: #999; font-size: 12px;">请出示此二维码以便快速签到<br>Scan this QR code at reception for fast check-in</p>
          </div>

        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          <p style="margin: 0;">Hosted by <strong>Natick High School Chinese Club</strong></p>
        </div>
      </div>
    `;

    await addDoc(collection(db, MAIL_COLLECTION), {
      to: [reservation.email],
      from: OFFICIAL_EMAIL,
      message: {
        subject: `【重要/Important】 Natick 2026 春晚预约确认 - 请携带现金 / Bring Cash for Entry`,
        html: emailHtml
      }
    });
  } catch (e) {
    console.error("Email error", e);
  }
};

export const sendCancellationEmail = async (reservation: Reservation) => {
  if (!reservation.email || !reservation.email.includes('@')) return;

  try {
    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #f0f0f0;">
        <div style="background-color: #888888; padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: bold;">Reservation Cancelled</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">预约已取消</p>
        </div>

        <div style="padding: 40px 30px;">
          <p style="color: #333333; font-size: 16px; margin-bottom: 20px;">
            您好 / Dear <strong>${reservation.contactName}</strong>,
          </p>
          
          <p style="color: #555555; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
            您的 Natick 2026 春晚预约（ID: <strong>${reservation.id}</strong>）已成功取消。<br>
            Your reservation for the Natick 2026 CNY Gala has been successfully cancelled.
          </p>

          <div style="background-color: #FFF5F5; padding: 20px; border-radius: 12px; border: 1px solid #FED7D7; margin-bottom: 30px;">
            <p style="margin: 0; color: #C53030; font-size: 13px;">
              如果您改变主意，欢迎随时重新预约。<br>
              If you change your mind, feel free to register again at any time.
            </p>
          </div>
          
          <div style="text-align: center;">
            <a href="https://natick-cny.web.app/" style="display: inline-block; background-color: #333; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-size: 13px; font-weight: bold;">
               重新预约 Register Again
            </a>
          </div>

        </div>
      </div>
    `;

    await addDoc(collection(db, MAIL_COLLECTION), {
      to: [reservation.email],
      from: OFFICIAL_EMAIL,
      message: {
        subject: `【取消通知/Cancelled】Natick 2026 春晚预约已取消`,
        html: emailHtml
      }
    });
  } catch (e) {
    console.error("Email error", e);
  }
};

export const sendDiscountEmail = async (reservation: Reservation) => {
  if (!reservation.email || !reservation.email.includes('@')) return;

  try {
    const totalDue = reservation.totalAmount;
    
    // Build coupons list string
    const couponsList = reservation.coupons 
        ? reservation.coupons.map(c => `${c.code.replace(/_/g, ' ')} (-$${c.amount})`).join('<br/>') 
        : (reservation.couponCode || 'Discount');

    // Email Template for Discount
    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #f0f0f0;">
        <!-- Header -->
        <div style="background-color: #2E8B57; padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: bold;">优惠已应用 Discount Applied</h1>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          
          <p style="color: #333333; font-size: 16px; margin-bottom: 20px;">
            您好 / Dear <strong>${reservation.contactName}</strong>,
          </p>
          
          <p style="color: #555555; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
            您的 Natick 2026 春晚预约已更新。我们为您应用了以下优惠。<br>
            Your reservation has been updated. The following discounts have been applied.
          </p>

          <!-- Ticket Details -->
           <div style="margin-bottom: 30px; background-color: #F8F9FA; border-radius: 12px; padding: 25px; border: 1px solid #eee;">
             <table width="100%" cellpadding="0" cellspacing="0" style="border: none;">
               <tr>
                 <td style="padding-bottom: 15px; color: #888; font-size: 12px; text-transform: uppercase;">ID</td>
                 <td style="padding-bottom: 15px; text-align: right; color: #333; font-weight: bold; font-family: monospace;">${reservation.id}</td>
               </tr>
               <tr>
                 <td valign="top" style="padding-bottom: 15px; color: #888; font-size: 12px; text-transform: uppercase;">优惠详情 Coupons</td>
                 <td style="padding-bottom: 15px; text-align: right; color: #2E8B57; font-weight: bold; font-size: 12px;">${couponsList}</td>
               </tr>
               <tr>
                 <td style="padding-bottom: 15px; color: #888; font-size: 12px; text-transform: uppercase;">总减免 Total Saved</td>
                 <td style="padding-bottom: 15px; text-align: right; color: #2E8B57; font-weight: bold;">-$${reservation.discountAmount}</td>
               </tr>
               <tr>
                 <td style="border-top: 1px solid #e0e0e0; padding-top: 15px; color: #333; font-size: 14px; font-weight: bold; text-transform: uppercase; vertical-align: bottom;">最新应付金额 New Total</td>
                 <td style="border-top: 1px solid #e0e0e0; padding-top: 15px; text-align: right; color: #D72638; font-weight: bold; font-size: 28px;">$${totalDue}</td>
               </tr>
             </table>
           </div>
           
           <p style="color: #999; font-size: 12px; line-height: 1.6; text-align: center;">
             请在入场时出示您的二维码并支付最新的金额。<br>
             Please present your QR code and pay this updated amount at check-in.
           </p>

        </div>
      </div>
    `;

    await addDoc(collection(db, MAIL_COLLECTION), {
      to: [reservation.email],
      from: OFFICIAL_EMAIL,
      message: {
        subject: `【更新/Update】Natick 2026 春晚 - 优惠已应用 / Discount Applied`,
        html: emailHtml
      }
    });
  } catch (e) {
    console.error("Email error", e);
  }
};

export const getReservations = async (): Promise<Reservation[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdTime', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapDocToReservation);
  } catch (error) {
    console.error("Error fetching", error);
    return [];
  }
};

export const getRecentReservations = async (limitCount: number = 10): Promise<Reservation[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdTime', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapDocToReservation);
  } catch (error) {
    // Fail silently for ticker
    return [];
  }
};

export const createReservation = async (data: Partial<Reservation>): Promise<Reservation> => {
  if (!data.contactName) throw new Error('MISSING_NAME');
  const cleanPhone = (data.phoneNumber || '').replace(/\D/g, '');

  // *** DUPLICATE CHECK ***
  // Prevent creating a new reservation if the phone number already exists 
  // and hasn't been cancelled.
  const duplicateQuery = query(collection(db, COLLECTION_NAME), where('phoneNumber', '==', cleanPhone));
  const duplicateSnapshot = await getDocs(duplicateQuery);
  const hasActive = duplicateSnapshot.docs.some(d => d.data().checkInStatus !== CheckInStatus.Cancelled);
  
  if (hasActive) {
      throw new Error('DUPLICATE_PHONE');
  }
  
  const currentOperator = getCurrentUserCode();

  let price = data.ticketType === TicketType.EarlyBird ? 15 : 20;
  const adults = data.adultsCount || 0;
  const children = data.childrenCount || 0;

  const newReservationData = {
    id: generateId(), 
    createdTime: Timestamp.now(), 
    ticketType: data.ticketType || TicketType.EarlyBird,
    contactName: data.contactName.trim(),
    phoneNumber: cleanPhone,
    email: data.email,
    adultsCount: adults,
    childrenCount: children,
    totalPeople: adults + children,
    pricePerPerson: price,
    totalAmount: adults * price,
    paidAmount: data.paidAmount || 0,
    discountAmount: 0,
    couponCode: '',
    coupons: [],
    paymentStatus: data.paymentStatus || PaymentStatus.Unpaid,
    paymentMethod: data.paymentMethod || PaymentMethod.None,
    checkInStatus: data.checkInStatus || CheckInStatus.NotArrived,
    notes: data.notes || '',
    isPerformer: !!data.isPerformer,
    performanceUnit: data.performanceUnit || '',
    operatorId: currentOperator // Track who created this
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), newReservationData);
  const result = { ...newReservationData, firebaseDocId: docRef.id, createdTime: Date.now() } as unknown as Reservation;
  sendConfirmationEmail(result).catch(console.error);
  return result;
};

export const updateReservation = async (publicId: string, updates: Partial<Reservation>, firebaseDocId?: string): Promise<void> => {
  const currentOperator = getCurrentUserCode();
  const docRef = firebaseDocId 
    ? doc(db, COLLECTION_NAME, firebaseDocId)
    : (await getDocs(query(collection(db, COLLECTION_NAME), where('id', '==', publicId)))).docs[0]?.ref;
  
  if (docRef) {
    await updateDoc(docRef, { 
      ...updates, 
      lastModifiedBy: currentOperator // Track who updated this
    });
  }
};

export const deleteReservation = async (firebaseDocId: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION_NAME, firebaseDocId));
};

export const calculateStats = async (): Promise<Stats> => {
  const reservations = await getReservations();
  const stats: Stats = {
    totalReservations: 0, totalPeople: 0, earlyBirdCount: 0, regularCount: 0, 
    walkInCount: 0, lunchBoxCount: 0, totalRevenueExpected: 0, 
    totalRevenueCollected: 0, checkedInCount: 0, cancelledCount: 0, totalPerformersCount: 0
  };
  reservations.forEach(r => {
    if (r.checkInStatus === CheckInStatus.Cancelled) { stats.cancelledCount++; return; }
    stats.totalReservations++;
    stats.totalPeople += r.totalPeople;
    
    // --- LUNCH LOGIC UPDATED ---
    // Start with all adults needing lunch
    let lunchesForReservation = r.adultsCount;
    
    // Check multiple coupons
    if (r.coupons && r.coupons.length > 0) {
        r.coupons.forEach(c => {
            if (c.code === 'VOLUNTEER_NO_LUNCH') {
                lunchesForReservation--;
            }
        });
    } 
    // Legacy check
    else if (r.couponCode === 'VOLUNTEER_NO_LUNCH') {
        // If legacy "NO_LUNCH" entire order was considered no lunch? 
        // Or assume 1 coupon = 1 person. Let's assume 1 person.
        lunchesForReservation--;
    }

    stats.lunchBoxCount += Math.max(0, lunchesForReservation);
    // ---------------------------

    stats.totalRevenueExpected += r.totalAmount;
    stats.totalRevenueCollected += r.paidAmount;
    if (r.isPerformer) stats.totalPerformersCount += r.totalPeople;
    if (r.ticketType === TicketType.EarlyBird) stats.earlyBirdCount += r.adultsCount;
    if (r.ticketType === TicketType.Regular) stats.regularCount += r.adultsCount;
    if (r.checkInStatus === CheckInStatus.Arrived) stats.checkedInCount += r.totalPeople;
  });
  return stats;
};

const DEFAULT_CONFIG: TicketConfig = { 
  totalCapacity: 400, 
  totalHeadcountCap: 450, 
  earlyBirdCap: 300, 
  regularCap: 50, 
  walkInCap: 50 
};

export const getTicketConfig = async (): Promise<TicketConfig> => {
  const docRef = doc(db, SYSTEM_COLLECTION, CONFIG_DOC_ID);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    // Merge with defaults to ensure all fields exist (e.g. if adding new config fields later)
    return { ...DEFAULT_CONFIG, ...snap.data() } as TicketConfig;
  }
  return DEFAULT_CONFIG;
};

export const updateTicketConfig = async (config: TicketConfig): Promise<void> => {
  await setDoc(doc(db, SYSTEM_COLLECTION, CONFIG_DOC_ID), config, { merge: true });
};

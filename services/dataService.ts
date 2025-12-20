
import { Reservation, TicketType, PaymentStatus, CheckInStatus, PaymentMethod, Stats } from '../types';
import { db, analytics } from '../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';

const COLLECTION_NAME = 'reservations';
const MAIL_COLLECTION = 'mail';
const OFFICIAL_EMAIL = 'natickchineseassociation@gmail.com';

const generateId = (): string => {
  return 'CNY26-' + Math.floor(1000 + Math.random() * 9000).toString();
};

export const generateLotteryNumber = (): string => {
  return Math.floor(100 + Math.random() * 899).toString(); 
};

const mapDocToReservation = (docSnap: any): Reservation => {
  const data = docSnap.data();
  return {
    ...data,
    id: data.id || docSnap.id,
    firebaseDocId: docSnap.id,
    createdTime: data.createdTime instanceof Timestamp ? data.createdTime.toMillis() : data.createdTime,
  } as Reservation;
};

const sendConfirmationEmail = async (reservation: any) => {
  if (!reservation.email || !reservation.email.includes('@')) {
    console.warn("Invalid email for reservation:", reservation.id);
    return;
  }

  try {
    const totalDue = reservation.adultsCount * reservation.pricePerPerson;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${reservation.id}`;
    
    // Calendar URL Generation (Google Calendar)
    const eventTitle = encodeURIComponent("Natick 2026 马年春晚 Gala");
    const eventDetails = encodeURIComponent(`预约确认码 / Confirmation ID: ${reservation.id}\n应付金额 / Total Due: $${totalDue}\n请携带现金现场支付 / Please bring cash for on-site payment.`);
    const eventLocation = encodeURIComponent("Natick High School, 15 West St, Natick, MA 01760");
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&location=${eventLocation}&dates=20260308T150000Z/20260308T193000Z`;

    const emailHtml = `
      <div style="font-family: 'PingFang SC', 'Microsoft YaHei', Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        <div style="background-color: #D72638; padding: 50px 20px; text-align: center; background-image: linear-gradient(135deg, #8a1c26 0%, #D72638 100%);">
          <h1 style="color: #FCE7BB; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: 4px;">Natick 2026 春晚</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 4px;">Reservation Confirmed • 预约成功</p>
        </div>
        
        <div style="padding: 40px 35px; background-color: #ffffff;">
          <!-- 醒目的现金提醒 (Bilingual Cash Reminder) -->
          <div style="background-color: #FFF5F5; border: 3px solid #D72638; border-radius: 16px; padding: 25px; margin-bottom: 35px; text-align: center;">
            <p style="margin: 0; color: #D72638; font-size: 24px; font-weight: 900; line-height: 1.4;">⚠️ 重要提醒：请携带现金</p>
            <p style="margin: 5px 0 0; color: #D72638; font-size: 18px; font-weight: 700;">IMPORTANT: PLEASE BRING CASH</p>
            <p style="margin: 15px 0 0; color: #8a1c26; font-size: 15px; font-weight: bold;">
              请在入场签到台现场支付现金购买门票<br/>
              Please pay cash at the check-in desk upon arrival.
            </p>
          </div>

          <p style="font-size: 16px; line-height: 1.6;">您好 / Dear <strong>${reservation.contactName}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.6; color: #666;">
            感谢您预约 Natick 2026 马年春晚！以下是您的预约凭证：<br/>
            Thank you for registering for the Natick 2026 CNY Gala! Here is your confirmation:
          </p>
          
          <div style="background-color: #F9F1E7; border-radius: 20px; padding: 35px; margin: 30px 0; text-align: center; border: 1px solid #FCE7BB; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
            <p style="margin: 0 0 10px; color: #8a1c26; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">入场券确认码 / Confirmation ID</p>
            <p style="margin: 0 0 25px; font-size: 32px; font-weight: 900; color: #D72638; font-family: 'Courier New', monospace; letter-spacing: 2px;">${reservation.id}</p>
            <div style="display: inline-block; padding: 20px; background: #fff; border-radius: 16px; box-shadow: 0 8px 20px rgba(0,0,0,0.08);">
               <img src="${qrUrl}" alt="Check-in QR Code" width="180" height="180" style="display: block;" />
            </div>
            <p style="margin: 25px 0 0; font-size: 13px; color: #999; font-weight: bold;">签到时请出示此二维码<br/>Please show this QR code at check-in</p>
          </div>

          <div style="margin-bottom: 35px;">
            <h3 style="font-size: 18px; font-weight: 900; border-left: 4px solid #D72638; padding-left: 12px; margin-bottom: 20px;">活动信息 / Event Info</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; color: #999; font-size: 14px; border-bottom: 1px solid #f0f0f0;">活动日期 / Date</td>
                <td style="padding: 12px 0; text-align: right; font-weight: bold; border-bottom: 1px solid #f0f0f0;">2026年3月8日 (周日) / March 8 (Sun)</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #999; font-size: 14px; border-bottom: 1px solid #f0f0f0;">活动时间 / Time</td>
                <td style="padding: 12px 0; text-align: right; font-weight: bold; border-bottom: 1px solid #f0f0f0;">10:00 AM - 2:30 PM</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #999; font-size: 14px; border-bottom: 1px solid #f0f0f0;">活动地点 / Location</td>
                <td style="padding: 12px 0; text-align: right; font-weight: bold; border-bottom: 1px solid #f0f0f0;">Natick High School</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #999; font-size: 14px; border-bottom: 1px solid #f0f0f0;">预约人数 / Guests</td>
                <td style="padding: 12px 0; text-align: right; font-weight: bold; border-bottom: 1px solid #f0f0f0;">${reservation.adultsCount} 成人 (Adults), ${reservation.childrenCount} 儿童 (Kids)</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #999; font-size: 14px;">现场支付 / Total Due (Cash)</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 900; color: #D72638; font-size: 24px;">$${totalDue}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <a href="${calendarUrl}" target="_blank" style="display: inline-block; background-color: #333; color: #fff; padding: 18px 36px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">📅 加入日历提醒 / Add to Calendar</a>
          </div>
        </div>

        <div style="background-color: #fcfcfc; padding: 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0; font-size: 11px; color: #999; line-height: 1.8;">
            Natick Chinese Association (NCA)<br/>
            Natick High School Chinese Club<br/>
            <span style="text-transform: uppercase; letter-spacing: 2px; color: #ccc; margin-top: 10px; display: block;">© 2026 NATICK CHINESE COMMUNITY</span>
          </p>
        </div>
      </div>
    `;

    // 写入 mail 集合，触发 Firebase Extension
    await addDoc(collection(db, MAIL_COLLECTION), {
      to: [reservation.email],
      from: OFFICIAL_EMAIL,
      replyTo: OFFICIAL_EMAIL,
      message: {
        subject: `【重要/Important】Natick 2026 春晚预约确认 - 请携带现金 / Bring Cash for Entry`,
        html: emailHtml,
        text: `您的预约已确认。确认码: ${reservation.id}。应收现金: $${totalDue}。请在 3月8日 10am-2:30pm 前往 Natick High School 参加活动，并准备好现金支付。/ Your reservation is confirmed ID: ${reservation.id}. Total due in CASH: $${totalDue}. See you March 8th at Natick High School.`
      }
    });
    
    console.log(`Email task queued for ${reservation.email}`);
  } catch (e) {
    console.error("Error triggering email:", e);
  }
};

export const getReservations = async (): Promise<Reservation[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdTime', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapDocToReservation);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return [];
  }
};

export const createReservation = async (data: Partial<Reservation>): Promise<Reservation> => {
  if (!data.contactName || data.contactName.trim().length < 2) {
    throw new Error('MISSING_NAME');
  }
  if (!data.phoneNumber || data.phoneNumber.replace(/\D/g, '').length < 10) {
    throw new Error('INVALID_PHONE');
  }
  if (!data.email || !data.email.includes('@')) {
    throw new Error('INVALID_EMAIL');
  }

  const cleanPhone = data.phoneNumber.replace(/\D/g, '');
  
  const phoneQuery = query(
    collection(db, COLLECTION_NAME), 
    where('phoneNumber', '==', cleanPhone)
  );
  
  const snapshot = await getDocs(phoneQuery);
  const hasActive = snapshot.docs.some(docSnap => {
    const resData = docSnap.data();
    return resData.checkInStatus !== CheckInStatus.Cancelled;
  });

  if (hasActive) {
    throw new Error('DUPLICATE_PHONE');
  }

  // PRICING LOGIC
  let price = 15;
  if (data.ticketType === TicketType.Regular) price = 20;
  if (data.ticketType === TicketType.WalkIn) price = 20;

  const adults = data.adultsCount || 0;
  const children = data.childrenCount || 0;
  const totalPeople = adults + children;
  const totalAmount = adults * price;

  const newReservationData = {
    id: generateId(), 
    createdTime: Timestamp.now(), 
    ticketType: data.ticketType || TicketType.EarlyBird,
    contactName: data.contactName.trim(),
    phoneNumber: cleanPhone,
    email: data.email,
    adultsCount: adults,
    childrenCount: children,
    totalPeople: totalPeople,
    pricePerPerson: price,
    totalAmount: totalAmount,
    paidAmount: data.paidAmount || 0,
    paymentStatus: data.paymentStatus || PaymentStatus.Unpaid,
    paymentMethod: data.paymentMethod || PaymentMethod.None,
    checkInStatus: data.checkInStatus || CheckInStatus.NotArrived,
    notes: data.notes || '',
    lotteryNumbers: data.lotteryNumbers || [],
    emailStatus: 'queued'
  };

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newReservationData);
    
    const resultReservation = {
        ...newReservationData,
        firebaseDocId: docRef.id,
        createdTime: Date.now() 
    } as unknown as Reservation;

    logEvent(analytics, 'sign_up', {
      method: 'web_form',
      ticket_type: newReservationData.ticketType,
      total_people: totalPeople,
      value: totalAmount,
      currency: 'USD'
    });

    sendConfirmationEmail(resultReservation).catch(err => console.error("Async email error:", err));

    return resultReservation;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export const updateReservation = async (publicId: string, updates: Partial<Reservation>, firebaseDocId?: string): Promise<void> => {
  try {
    let docRef;

    if (firebaseDocId) {
       docRef = doc(db, COLLECTION_NAME, firebaseDocId);
    } else {
       const q = query(collection(db, COLLECTION_NAME), where('id', '==', publicId));
       const snapshot = await getDocs(q);
       if (snapshot.empty) {
         console.warn(`Reservation ${publicId} not found`);
         return;
       }
       docRef = snapshot.docs[0].ref;
    }

    await updateDoc(docRef, updates);

    if (updates.checkInStatus === CheckInStatus.Arrived) {
        logEvent(analytics, 'check_in', { id: publicId });
    }

    if (updates.paymentStatus === PaymentStatus.Paid && updates.paidAmount && updates.paidAmount > 0) {
        logEvent(analytics, 'purchase', {
            transaction_id: publicId,
            value: updates.paidAmount,
            currency: 'USD'
        });
    }
  } catch (e) {
    console.error("Error updating document: ", e);
  }
};

export const deleteReservation = async (firebaseDocId: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, firebaseDocId);
    await deleteDoc(docRef);
    logEvent(analytics, 'reservation_deleted', { doc_id: firebaseDocId });
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw e;
  }
};

export const calculateStats = async (): Promise<Stats> => {
  const reservations = await getReservations();
  const stats: Stats = {
    totalReservations: 0,
    totalPeople: 0,
    earlyBirdCount: 0,
    regularCount: 0,
    walkInCount: 0,
    lunchBoxCount: 0,
    totalRevenueExpected: 0,
    totalRevenueCollected: 0,
    checkedInCount: 0,
    cancelledCount: 0
  };

  reservations.forEach(r => {
    if (r.checkInStatus === CheckInStatus.Cancelled) {
      stats.cancelledCount++;
      return; 
    }
    stats.totalReservations++;
    stats.totalPeople += r.totalPeople;
    stats.lunchBoxCount += r.adultsCount;
    stats.totalRevenueExpected += r.totalAmount;
    stats.totalRevenueCollected += r.paidAmount;

    if (r.ticketType === TicketType.EarlyBird) stats.earlyBirdCount++;
    if (r.ticketType === TicketType.Regular) stats.regularCount++;
    if (r.ticketType === TicketType.WalkIn) stats.walkInCount++;
    
    if (r.checkInStatus === CheckInStatus.Arrived) stats.checkedInCount += r.totalPeople;
  });

  return stats;
};

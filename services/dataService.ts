import { Reservation, TicketType, PaymentStatus, CheckInStatus, PaymentMethod, Stats } from '../types';
import { db, analytics } from '../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';

const COLLECTION_NAME = 'reservations';
const MAIL_COLLECTION = 'mail';

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
  if (!reservation.email || !reservation.email.includes('@')) return;

  try {
    const totalDue = reservation.adultsCount * reservation.pricePerPerson;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${reservation.id}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #D72638; padding: 20px; text-align: center;">
          <h1 style="color: #FFD700; margin: 0; font-size: 24px;">Natick 2026 CNY Gala</h1>
          <p style="color: white; margin: 5px 0 0;">Reservation Confirmed</p>
        </div>
        <div style="padding: 20px;">
          <p>Hi <strong>${reservation.contactName}</strong>,</p>
          <p>Thank you for registering for the Natick Chinese New Year Gala! We look forward to celebrating the Year of the Horse with you.</p>
          <div style="background-color: #f9f9f9; border-left: 4px solid #D72638; padding: 15px; margin: 20px 0; text-align: center;">
            <p style="margin: 5px 0;"><strong>Confirmation ID:</strong> ${reservation.id}</p>
            <div style="margin: 15px 0;">
               <img src="${qrUrl}" alt="Check-in QR Code" width="150" height="150" style="border: 10px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
            </div>
          </div>
          <p>Total Due: $${totalDue}</p>
        </div>
      </div>
    `;

    await addDoc(collection(db, MAIL_COLLECTION), {
      to: [reservation.email],
      message: {
        subject: `Confirmation: Natick CNY 2026 Gala (${reservation.id})`,
        html: emailHtml,
        text: `Reservation Confirmed. ID: ${reservation.id}. Total Due: $${totalDue}.`
      }
    });
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
  // Validation checks for required fields
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

  const price = data.ticketType === TicketType.WalkIn ? 20 : 15;
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
    lotteryNumbers: data.lotteryNumbers || []
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

    await sendConfirmationEmail(resultReservation);

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

export const calculateStats = async (): Promise<Stats> => {
  const reservations = await getReservations();
  const stats: Stats = {
    totalReservations: 0,
    totalPeople: 0,
    earlyBirdCount: 0,
    walkInCount: 0,
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
    stats.totalRevenueExpected += r.totalAmount;
    stats.totalRevenueCollected += r.paidAmount;
    if (r.ticketType === TicketType.EarlyBird) stats.earlyBirdCount++;
    if (r.ticketType === TicketType.WalkIn) stats.walkInCount++;
    if (r.checkInStatus === CheckInStatus.Arrived) stats.checkedInCount += r.totalPeople;
  });

  return stats;
};
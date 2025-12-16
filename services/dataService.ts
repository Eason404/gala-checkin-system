import { Reservation, TicketType, PaymentStatus, CheckInStatus, PaymentMethod, Stats } from '../types';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';

const COLLECTION_NAME = 'reservations';

// Helper to generate ID (visual only, Firestore has its own IDs)
const generateId = (): string => {
  return 'CNY26-' + Math.floor(1000 + Math.random() * 9000).toString();
};

export const generateLotteryNumber = (): string => {
  return Math.floor(100 + Math.random() * 899).toString(); 
};

// --- DATA MAPPING HELPER ---
// Firestore stores dates as Timestamps, we need numbers for the App
const mapDocToReservation = (docSnap: any): Reservation => {
  const data = docSnap.data();
  return {
    ...data,
    id: data.id || docSnap.id, // Prefer internal ID if stored, else doc ID
    firebaseDocId: docSnap.id, // Store the actual document ID for updates
    createdTime: data.createdTime instanceof Timestamp ? data.createdTime.toMillis() : data.createdTime,
  } as Reservation;
};

// --- CRUD OPERATIONS ---

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
  // Pricing Logic
  const price = data.ticketType === TicketType.WalkIn ? 20 : 15;
  const adults = data.adultsCount || 0;
  const children = data.childrenCount || 0;
  const totalPeople = adults + children;
  const totalAmount = adults * price;

  const newReservationData = {
    id: generateId(), // Visual ID
    createdTime: Timestamp.now(), // Firestore Timestamp
    ticketType: data.ticketType || TicketType.EarlyBird,
    contactName: data.contactName || 'Unknown',
    phoneNumber: data.phoneNumber?.replace(/\D/g, '') || '',
    email: data.email || '',
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
    // Return the object with the generated ID and converted timestamp
    return {
        ...newReservationData,
        firebaseDocId: docRef.id,
        createdTime: Date.now() 
    } as unknown as Reservation; 
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

/**
 * Updates a reservation.
 * Optimized: If the reservation object has a 'firebaseDocId', we use it directly.
 * Fallback: If not, we query by the visual 'id' field (slower, costs more reads).
 */
export const updateReservation = async (publicId: string, updates: Partial<Reservation>, firebaseDocId?: string): Promise<void> => {
  try {
    let docRef;

    if (firebaseDocId) {
       // Direct access (Optimized)
       docRef = doc(db, COLLECTION_NAME, firebaseDocId);
    } else {
       // Query fallback (Legacy/Safety)
       const q = query(collection(db, COLLECTION_NAME), where('id', '==', publicId));
       const snapshot = await getDocs(q);
       if (snapshot.empty) {
         console.warn(`Reservation ${publicId} not found`);
         return;
       }
       docRef = snapshot.docs[0].ref;
    }

    await updateDoc(docRef, updates);
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
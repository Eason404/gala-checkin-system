import { Reservation, TicketType, PaymentStatus, CheckInStatus, PaymentMethod, Stats } from '../types';

const STORAGE_KEY = 'natick_cny_2026_data_v3'; // Incremented to v3 to reset local data for the fix

// Helper to generate ID
const generateId = (): string => {
  return 'CNY26-' + Math.floor(1000 + Math.random() * 9000).toString();
};

// Helper to generate Lottery Number (Mock)
export const generateLotteryNumber = (): string => {
  return Math.floor(100 + Math.random() * 899).toString(); // 100-999
};

const initialData: Reservation[] = [
  // Scenario 1: Standard Family (2 Adults, 2 Kids) - Early Bird, Unpaid
  // Pricing: 2 Adults * $15 = $30. Kids Free.
  {
    id: 'CNY26-1001',
    createdTime: Date.now() - 86400000 * 5, // 5 days ago
    ticketType: TicketType.EarlyBird,
    contactName: '王强 (Qiang Wang)',
    phoneNumber: '5085550101',
    email: 'wang.q@example.com',
    adultsCount: 2,
    childrenCount: 2,
    totalPeople: 4,
    pricePerPerson: 15,
    totalAmount: 30, 
    paidAmount: 0,
    paymentStatus: PaymentStatus.Unpaid,
    paymentMethod: PaymentMethod.None,
    checkInStatus: CheckInStatus.NotArrived,
    lotteryNumbers: []
  },
  // Scenario 2: Couple (2 Adults, 0 Kids) - Unpaid (Fixed: Pay on Arrival)
  // Pricing: 2 Adults * $15 = $30.
  {
    id: 'CNY26-1002',
    createdTime: Date.now() - 86400000 * 3,
    ticketType: TicketType.EarlyBird,
    contactName: 'Emily Chen',
    phoneNumber: '6175550202',
    adultsCount: 2,
    childrenCount: 0,
    totalPeople: 2,
    pricePerPerson: 15,
    totalAmount: 30,
    paidAmount: 0,
    paymentStatus: PaymentStatus.Unpaid, // Changed from Paid to Unpaid
    paymentMethod: PaymentMethod.None,   // Changed from Check to None
    checkInStatus: CheckInStatus.NotArrived,
    lotteryNumbers: []
  },
  // Scenario 3: Large Group/Grandparents (4 Adults, 3 Kids) - Walk In
  // Pricing: 4 Adults * $20 = $80. Kids Free.
  {
    id: 'CNY26-1003',
    createdTime: Date.now() - 3600000,
    ticketType: TicketType.WalkIn,
    contactName: '刘建国 (Jianguo Liu)',
    phoneNumber: '7815550303',
    adultsCount: 4,
    childrenCount: 3,
    totalPeople: 7,
    pricePerPerson: 20,
    totalAmount: 80,
    paidAmount: 80,
    paymentStatus: PaymentStatus.Paid,
    paymentMethod: PaymentMethod.Cash,
    checkInStatus: CheckInStatus.Arrived,
    lotteryNumbers: ['101', '102', '103', '104', '105', '106', '107']
  },
  // Scenario 4: Single Parent (1 Adult, 1 Kid) - Early Bird
  // Pricing: 1 Adult * $15 = $15.
  {
    id: 'CNY26-1004',
    createdTime: Date.now() - 7200000,
    ticketType: TicketType.EarlyBird,
    contactName: 'Sarah Li',
    phoneNumber: '5085550404',
    adultsCount: 1,
    childrenCount: 1,
    totalPeople: 2,
    pricePerPerson: 15,
    totalAmount: 15,
    paidAmount: 0,
    paymentStatus: PaymentStatus.Unpaid,
    paymentMethod: PaymentMethod.None,
    checkInStatus: CheckInStatus.NotArrived,
    lotteryNumbers: []
  }
];

export const getReservations = (): Reservation[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading from local storage", e);
  }
  // Initialize with dummy data if empty for demo purposes
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
};

export const createReservation = (data: Partial<Reservation>): Reservation => {
  const currentData = getReservations();
  
  // Pricing Logic: Children are FREE
  // Update: WalkIn = $20, EarlyBird = $15
  const price = data.ticketType === TicketType.WalkIn ? 20 : 15;
  const adults = data.adultsCount || 0;
  const children = data.childrenCount || 0;
  const totalPeople = adults + children;
  
  // Total Amount is based on Adults only
  const totalAmount = adults * price;

  const newReservation: Reservation = {
    id: generateId(),
    createdTime: Date.now(),
    ticketType: data.ticketType || TicketType.EarlyBird,
    contactName: data.contactName || 'Unknown',
    phoneNumber: data.phoneNumber?.replace(/\D/g, '') || '', // Clean phone on create
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

  const updatedData = [newReservation, ...currentData];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  return newReservation;
};

export const updateReservation = (id: string, updates: Partial<Reservation>): void => {
  const currentData = getReservations();
  const index = currentData.findIndex(r => r.id === id);
  if (index !== -1) {
    currentData[index] = { ...currentData[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
  }
};

export const calculateStats = (): Stats => {
  const reservations = getReservations();
  
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
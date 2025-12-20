
export enum TicketType {
  EarlyBird = 'EarlyBird',
  Regular = 'Regular',
  WalkIn = 'WalkIn',
}

export enum PaymentStatus {
  Unpaid = 'Unpaid',
  Paid = 'Paid',
  PartialPaid = 'PartialPaid',
}

export enum CheckInStatus {
  NotArrived = 'NotArrived',
  Arrived = 'Arrived',
  Cancelled = 'Cancelled', // New status
}

export enum PaymentMethod {
  Cash = 'Cash',
  Check = 'Check',
  Other = 'Other',
  None = 'None',
}

export interface Reservation {
  id: string; // The visual ID (e.g. CNY26-1234)
  firebaseDocId?: string; // The actual Firestore Document ID (for fast updates)
  createdTime: number;
  ticketType: TicketType;
  contactName: string;
  phoneNumber: string;
  email?: string;
  adultsCount: number;
  childrenCount: number;
  totalPeople: number;
  pricePerPerson: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  checkInStatus: CheckInStatus;
  notes?: string;
  // New field for Lottery Numbers (e.g., ["001", "002"])
  lotteryNumbers?: string[]; 
}

export interface TicketConfig {
  totalCapacity: number;
  earlyBirdCap: number;
  regularCap: number;
  walkInCap: number;
}

export interface Stats {
  totalReservations: number;
  totalPeople: number;
  earlyBirdCount: number;
  regularCount: number; // Added
  walkInCount: number;
  lunchBoxCount: number; // New: Based on total adults
  totalRevenueExpected: number;
  totalRevenueCollected: number;
  checkedInCount: number;
  cancelledCount: number; // New stat
}

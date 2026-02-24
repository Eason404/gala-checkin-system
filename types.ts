
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
  Cancelled = 'Cancelled',
}

export enum PaymentMethod {
  Cash = 'Cash',
  Check = 'Check',
  Other = 'Other',
  None = 'None',
}

export interface Coupon {
  code: string;   // 'VOLUNTEER', 'PERFORMER', 'VOLUNTEER_NO_LUNCH'
  amount: number;
}

export interface Reservation {
  id: string;
  firebaseDocId?: string;
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
  discountAmount?: number; // Total discount value
  couponCode?: string;     // Legacy: kept for backward compatibility
  coupons?: Coupon[];      // New: Support multiple coupons
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  checkInStatus: CheckInStatus;
  notes?: string;
  lotteryNumbers?: string[];
  isPerformer: boolean;
  performanceUnit?: string;
  // Audit fields
  operatorId?: string;       // Who created this (e.g., 'PUBLIC', 'S1', 'A1')
  lastModifiedBy?: string;   // Who last updated this (e.g., 'S2', 'A2')
}

export interface TicketConfig {
  totalCapacity: number;     // Ticket Limit (Paying Adults)
  totalHeadcountCap: number; // Headcount Limit (Adults + Children)
  earlyBirdCap: number;
  regularCap: number;
  walkInCap: number;
}

export interface Stats {
  totalReservations: number;
  totalPeople: number;
  earlyBirdCount: number;
  regularCount: number;
  walkInCount: number;
  lunchBoxCount: number;
  totalRevenueExpected: number;
  totalRevenueCollected: number;
  checkedInCount: number;
  cancelledCount: number;
  totalPerformersCount: number;
}

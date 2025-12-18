
# Natick CNY 2026 - AI Development Context

**Project Name:** Natick Chinese New Year 2026 Gala System
**Description:** A client-side Event Registration, Check-in, and Management Single Page Application (SPA).
**Target Event Date:** March 8, 2026.

---

## 1. Tech Stack & Architecture

*   **Framework:** React 19 (Functional Components + Hooks).
*   **Language:** TypeScript (Strict typing preferred).
*   **Styling:** Tailwind CSS (via CDN script config).
*   **Routing:** `react-router-dom` (HashRouter used for compatibility).
*   **Icons:** `lucide-react`.
*   **Charts:** `recharts`.
*   **QR:** `qrcode` (Generation) and `html5-qrcode` (Scanning).
*   **Data Persistence:** Google Firebase Firestore (Real-time NoSQL).

---

## 2. Business Logic & Rules

### A. Pricing Model
*   **Early Bird (TicketType.EarlyBird):** $15.00 per Adult.
*   **Walk-In (TicketType.WalkIn):** $20.00 per Adult.
*   **Children:** Always Free ($0).
*   **Total Cost:** `(Adults * Price) + (Children * 0)`.

### B. Registration (Public)
1.  **Validation:**
    *   **Name:** First and Last name required.
    *   **Email:** Must follow valid email pattern (validated via JS).
    *   **Phone:** Must be a valid US format (10 digits).
    *   **Capacity:** Adults + Children must be > 0.
    *   **Mandatory Waiver:** User *must* check the "Waiver & Media Consent" box.
2.  **QR Code:** Upon success, a unique QR code (based on `id`) is generated for the user to screenshot or receive via email.
3.  **UI Feedback:** Use modern, shaking error alerts and fluid transitions.

### C. Check-In (Staff Portal)
1.  **Search:** Supports Phone lookup, Name search, or **QR ID Scan** (Public ID starts with `CNY26-`).
2.  **QR Scanner:** Staff can use the device camera to scan visitor tickets for instantaneous lookup.
3.  **Process:**
    *   Staff confirms payment (Cash calculator included).
    *   Clicking "Check In" updates status to `Arrived`.
    *   **Lottery Numbers:** Generated *only* upon check-in. One number per person (Adult + Child). Format: 3 digits (100-999).
4.  **Walk-In Mode:** Staff can create a new registration on the spot (defaults to $20 pricing).

### D. Administration
1.  **Stats:** Real-time calculation of total revenue (expected vs. collected), headcounts, and ticket types.
2.  **Export:** CSV download functionality available.

---

## 3. Data Model (TypeScript Interfaces)

The application relies heavily on `types.ts`. Any AI modifying the app must adhere to this structure.

```typescript
export enum TicketType {
  EarlyBird = 'EarlyBird',
  WalkIn = 'WalkIn',
}

export enum CheckInStatus {
  NotArrived = 'NotArrived',
  Arrived = 'Arrived',
  Cancelled = 'Cancelled',
}

export interface Reservation {
  id: string;             // Format: "CNY26-XXXX"
  createdTime: number;    // Timestamp (Firestore)
  ticketType: TicketType;
  contactName: string;
  phoneNumber: string;    // Clean digits
  email?: string;
  adultsCount: number;
  childrenCount: number;
  totalPeople: number;    // adults + children
  pricePerPerson: number; // 15 or 20
  totalAmount: number;    // adults * price
  paidAmount: number;
  paymentStatus: 'Unpaid' | 'Paid';
  paymentMethod: 'Cash' | 'Check' | 'None';
  checkInStatus: CheckInStatus;
  notes?: string;
  lotteryNumbers?: string[]; // Generated on Check-in
}
```

## 4. How to Resume Work

> **Constraint:** Registration requires valid name, email, and phone. Staff Portal uses `html5-qrcode` for scanning. Admin analytics depend on `dataService.ts` stats calculation.

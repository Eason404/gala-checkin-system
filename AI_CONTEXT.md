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
*   **Data Persistence:** `localStorage` (Client-side only, no backend).
*   **Build Environment:** ES Modules via browser native support (no complex bundler config visible in snippets, relies on import maps).

---

## 2. Business Logic & Rules

### A. Pricing Model
*   **Early Bird (TicketType.EarlyBird):** $15.00 per Adult.
*   **Walk-In (TicketType.WalkIn):** $20.00 per Adult.
*   **Children:** Always Free ($0).
*   **Total Cost:** `(Adults * Price) + (Children * 0)`.

### B. Registration (Public)
1.  **Validation:**
    *   Phone: Must be a valid US format (10 digits).
    *   Adults + Children must be > 0.
    *   **Mandatory Waiver:** User *must* check the "Waiver & Media Consent" box.
2.  **Magic Fill:** A developer tool (Wand icon) exists to auto-fill random valid data for testing.
3.  **UI Feedback:** Use inline red error boxes for validation failures. Do not use `alert()`.
4.  **Countdown:** A visual ticker simulates a "Price Jump Alert" (mock logic targeting Feb 15).

### C. Check-In (Staff Portal)
1.  **Search:** Supports partial match by Phone (last 4 digits+) or Name (case-insensitive).
2.  **Process:**
    *   Staff confirms payment (Cash).
    *   Clicking "Check In" updates status to `Arrived`.
    *   **Lottery Numbers:** Generated *only* upon check-in. One number per person (Adult + Child). Format: 3 digits (100-999).
3.  **Walk-In Mode:** Staff can create a new registration on the spot (defaults to $20 pricing).

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
  createdTime: number;    // Timestamp
  ticketType: TicketType;
  contactName: string;
  phoneNumber: string;    // Stored as clean digits usually, displayed formatted
  email?: string;
  adultsCount: number;
  childrenCount: number;
  totalPeople: number;    // adults + children
  pricePerPerson: number; // 15 or 20
  totalAmount: number;    // adults * price
  paidAmount: number;
  paymentStatus: 'Unpaid' | 'Paid' | 'PartialPaid';
  paymentMethod: 'Cash' | 'Check' | 'Other' | 'None';
  checkInStatus: CheckInStatus;
  notes?: string;
  lotteryNumbers?: string[]; // Generated on Check-in
}
```

## 4. Design System (Tailwind)

*   **Primary Colors:**
    *   Red: `cny-red` (#D72638)
    *   Gold: `cny-gold` (#FFD700)
    *   Dark: `cny-dark` (#8a1c26)
    *   Background: `cny-bg` (#FFF8F0)
*   **Font:** San-serif stack favoring Chinese characters ("PingFang SC", "Microsoft YaHei").
*   **Components:**
    *   *Cards:* White background, rounded-xl, shadow-lg, often with top borders.
    *   *Buttons:* Gradient reds for primary actions, distinct hover states.
    *   *Modals:* Fixed positioning, semi-transparent black backdrop.

## 5. File Structure Overview

*   `index.html`: Entry point, Tailwind config, Import maps.
*   `types.ts`: Central type definitions.
*   `services/dataService.ts`: CRUD operations wrapper for `localStorage`. Handles ID generation and stats calculation.
*   `components/PublicRegistration.tsx`: User-facing form, Waiver modal, Success page.
*   `components/StaffPortal.tsx`: Staff dashboard, Search, Check-in logic, QR mock.
*   `components/AdminDashboard.tsx`: Charts and CSV export.
*   `components/EventSchedule.tsx`: Static schedule display component.

## 6. How to Resume Work (Prompt for AI)

If you are a new AI agent taking over this project, use the following instruction:

> "You are working on the Natick CNY 2026 Gala System. It is a React/TypeScript app using Tailwind CSS and localStorage.
>
> **Current State:** The app allows public registration ($15 early bird), staff check-in (generating lottery tickets), and admin reporting.
> **Constraint:** Do not introduce a backend database. Keep all logic in `dataService.ts` using localStorage. Maintain the 'Year of the Horse' red/gold theme.
>
> Refer to the code in `services/dataService.ts` for data integrity rules."

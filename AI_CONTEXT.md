
# Natick CNY 2026 - AI Development Context

**Project Name:** Natick Chinese New Year 2026 Gala System
**Description:** A client-side Event Registration, Check-in, and Management SPA.
**Target Event Date:** March 8, 2026.

---

## 1. 💡 Creative Vision (2026 Upgrade)

To elevate the user experience for the Year of the Horse, the system follows these creative directions:

### A. Neo-Chinese Minimalist (Active)
*   **Aesthetics:** Combining traditional Chinese elements (Ink, Silk, Gold) with modern UI trends (Glassmorphism, High Contrast).
*   **Colors:** Crimson (#D72638), Dark Silk (#8a1c26), Warm Gold (#FCE7BB), and Cloud White (#F9F1E7).
*   **Materials:** Semi-transparent frosted glass containers with sophisticated backdrop blurs.

### B. Emotional Feedback
*   **Rites of Passage:** Registration success should feel like "Opening a Red Envelope."
*   **Micro-interactions:** Smooth transitions using hardware-accelerated transforms.
*   **Haptic Feedback:** Strategic vibration patterns on mobile for button presses and success states.

---

## 2. Tech Stack & Architecture
*   **Framework:** React 19.
*   **Styling:** Tailwind CSS + Glassmorphism.
*   **Data Persistence:** Google Firebase Firestore (Live).
*   **Authentication:** Code-based role access via Firestore.

---

## 3. Pricing & Validation Rules

*   **Early Bird Ticket:** $15 (Limited Quantity / Time).
*   **Regular Ticket:** $20.
*   **Walk-in Ticket:** $20 (Staff mode only).
*   **Children:** Free (Counted for headcount/seats, but $0 cost).
*   **Performers:** Tracked separately, usually $0 or specialized entry.
*   **Validation:**
    *   Phone number must be valid US format.
    *   Email required for confirmation.
    *   Waiver agreement is mandatory.

---

## 4. Data Models

Refer to `DESIGN_FIREBASE_MIGRATION.md` for the complete Firestore Schema and field definitions.

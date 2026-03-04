
# Natick CNY 2026 - Firestore Schema & Security

**Status:** Active / Production
**Backend:** Google Firebase (Firestore)

This document defines the Firestore data structure and security model for the production system.

---

## 1. Architecture Overview

The application uses a serverless architecture relying on Firebase:
*   **Firestore**: Primary database for reservations and system config.
*   **Authentication**: Staff/Admin access control via access codes mapped to roles.
*   **Analytics**: Event tracking (GA4).
*   **Extensions**: "Trigger Email from Firestore" for confirmation and cancellation emails.

---

## 2. Firestore Schema

### Collection: `reservations`

Stores all attendee data.
**Document ID:** The public ticket ID (e.g., `CNY26-1234`). This ensures uniqueness at the database level.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Public ticket ID (e.g., `CNY26-1234`). Same as the Document ID. |
| `createdTime` | Timestamp | Creation date. |
| `contactName` | String | Full name. |
| `phoneNumber` | String | Digits only. |
| `email` | String | Contact email. |
| `ticketType` | String | `EarlyBird` \| `Regular` \| `WalkIn` |
| `adultsCount` | Number | Number of adults. |
| `childrenCount` | Number | Number of children (free). |
| `totalPeople` | Number | `adultsCount` + `childrenCount`. |
| `totalAmount` | Number | Expected revenue. |
| `paidAmount` | Number | Collected revenue. |
| `paymentStatus` | String | `Unpaid` \| `Paid` |
| `checkInStatus` | String | `NotArrived` \| `Arrived` \| `Cancelled` |
| `isPerformer` | Boolean | If the registrant is a performer. |
| `performanceUnit` | String | Name of the performance group. |
| `lotteryNumbers` | Array\<String\> | Assigned at check-in (e.g., `["101", "102"]`). |
| `operatorId` | String | Who created/modified the record (`PUBLIC` or Staff Code). |

### Collection: `system`

Singleton configuration documents.

**Document: `ticketConfig`** — Manages inventory caps.
```json
{
  "totalCapacity": 450,
  "earlyBirdCap": 300,
  "regularCap": 50,
  "walkInCap": 50
}
```

### Collection: `mail` (Trigger Extension)

Used by the Firebase "Trigger Email" extension to send confirmation and cancellation emails.
*   **to**: `[email]`
*   **message**: `{ subject: "...", html: "..." }`

### Collection: `access_keys`

Maps access codes to roles for staff/admin login.
**Document ID:** The 6-character code.

```json
{
  "role": "admin" // or "staff"
}
```

---

## 3. Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isStaff() {
      return request.auth != null; 
    }

    match /reservations/{docId} {
      allow create: if true;
      allow read: if true; 
      allow update, delete: if isStaff();
    }
    
    match /system/{docId} {
      allow read: if true;
      allow write: if isStaff();
    }
    
    match /mail/{mailId} {
      allow create: if true;
    }
    
    match /access_keys/{code} {
      allow read: if true;
      allow write: if false; 
    }
  }
}
```

---

## 4. Key Workflows

1.  **Registration**: Client creates doc in `reservations` → Extension triggers confirmation email via `mail` collection.
2.  **Check-in**: Staff searches by `phoneNumber` → Updates `checkInStatus` to `Arrived` → Generates `lotteryNumbers`.
3.  **Cancellation**: Attendee looks up reservation on `/manage` → Confirms cancel → Status set to `Cancelled` → Cancellation email sent.
4.  **Stats**: Admin Dashboard queries full `reservations` collection (client-side aggregation) to calculate totals.


# Natick CNY 2026 Gala System 🏮🐎

A React-based event management system designed for the **2026 Natick Chinese New Year (Year of the Horse) Gala**. This application handles the entire event lifecycle: public registration, staff check-in, and administrative analytics.

## ✨ Key Features

*   **📝 Public Registration**: Mobile-responsive form with validation, "Magic Fill" for testing, and integrated waiver consent. Supports Early Bird ($15) vs. Walk-in ($20) pricing models.
*   **🔍 Manage Reservation**: Standalone portal for attendees to look up and cancel their reservations securely.
*   **📱 Staff Portal**: Fast check-in via phone lookup or name search. Supports handling payments, issuing lottery numbers, and processing walk-ins on the spot.
*   **📊 Admin Dashboard**: Real-time visualization of revenue, headcount, and ticket types. Includes CSV export functionality.
*   **🎰 Lottery Wheel**: Interactive spinning wheel for prize drawing at the event.
*   **🎨 Thematic Design**: Custom UI using the "Year of the Horse" color palette (Red `#D72638` & Gold `#FFD700`) with glassmorphism and micro-animations.

## 🛠️ Tech Stack

*   **Core**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS + Glassmorphism
*   **Routing**: React Router (HashRouter)
*   **Icons & Charts**: Lucide React, Recharts
*   **Backend**: Google Firebase (Firestore, Auth, Analytics)
*   **Testing**: Jest, React Testing Library

## 📂 Documentation

| Document | Purpose |
| :--- | :--- |
| [AI_CONTEXT.md](./AI_CONTEXT.md) | Creative vision, design system, and pricing rules |
| [DESIGN_FIREBASE_MIGRATION.md](./DESIGN_FIREBASE_MIGRATION.md) | Firestore schema, security rules, and key workflows |
| [DEPLOY.md](./DEPLOY.md) | CI/CD setup guide for Firebase Hosting via GitHub Actions |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run unit tests
npm run test

# Build for production
npm run build
```

## 🧪 Testing

*   **Unit Tests**: Run `npm run test` to execute the full Jest + React Testing Library suite (services, utils, and UI components).
*   **Magic Fill**: Use the wand icon 🪄 on the registration page to auto-fill valid data for manual testing.
*   **Firebase Config**: Ensure `firebaseConfig.ts` is correctly configured with your project credentials.

---
*Designed for the Natick Community • March 8, 2026*

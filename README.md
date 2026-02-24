
# Natick CNY 2026 Gala System 🏮🐎

A React-based event management system designed for the **2026 Natick Chinese New Year (Year of the Horse) Gala**. This application handles the entire event lifecycle: public registration, staff check-in, and administrative analytics.

## ✨ Key Features

*   **📝 Public Registration**: Mobile-responsive form with validation, "Magic Fill" for testing, and integrated waiver consent. Supports Early Bird ($15) vs. Walk-in ($20) pricing models.
*   **📱 Staff Portal**: Fast check-in via phone lookup or name search. Supports handling payments, issuing lottery numbers, and processing walk-ins on the spot.
*   **📊 Admin Dashboard**: Real-time visualization of revenue, headcount, and ticket types. Includes CSV export functionality.
*   **🎨 Thematic Design**: Custom UI using the "Year of the Horse" color palette (Red `#D72638` & Gold `#FFD700`).

## 🛠️ Tech Stack

*   **Core**: React 19, TypeScript
*   **Styling**: Tailwind CSS
*   **Routing**: React Router (HashRouter)
*   **Icons & Charts**: Lucide React, Recharts
*   **Backend & Persistence**: Google Firebase (Firestore, Auth, Analytics)

## 📂 Documentation

For developers and AI agents continuing this work:

1.  **[AI_CONTEXT.md](./AI_CONTEXT.md)**: Detailed breakdown of creative vision and system architecture.
2.  **[DESIGN_FIREBASE_MIGRATION.md](./DESIGN_FIREBASE_MIGRATION.md)**: (Now Active) Reference for Firestore Database Schema and Security Architecture.

## 🚀 Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Run Development Server**:
    ```bash
    npm start
    ```
3.  **Build for Production**:
    ```bash
    npm run build
    ```

## 🧪 Testing

*   **Magic Fill**: Use the wand icon 🪄 on the registration page to auto-fill valid data.
*   **Firebase**: Ensure `src/firebaseConfig.ts` is correctly configured with your project credentials.

---
*Designed for the Natick Community • March 8, 2026*

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
*   **Persistence**: `localStorage` (Serverless/Client-side prototype)

## 📂 Documentation

For developers and AI agents continuing this work:

1.  **[AI_CONTEXT.md](./AI_CONTEXT.md)**: Detailed breakdown of business logic, architecture, and data models. **Read this first.**
2.  **[DESIGN_FIREBASE_MIGRATION.md](./DESIGN_FIREBASE_MIGRATION.md)**: Blueprint for moving from LocalStorage to a Google Firebase backend.

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
*   **Reset Data**: Increment `STORAGE_KEY` in `services/dataService.ts` to clear local storage and reset to seed data.

---
*Designed for the Natick Community • March 8, 2026*

# DarshanEase 📿

DarshanEase is a modern, high-fidelity Temple Darshan & Special Pooja Booking platform designed to provide devotees with a seamless, peaceful spiritual planning experience. Skip the long lines and secure holy sights for your family with ease.
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6b19a518-8343-4a71-8a3b-159cf87379a3" />

---

## ✨ Features

- **Interactive Devasthanam Map & Guide**: Navigate the sacred complexes with an interactive indoor blueprint. It includes step-by-step route walking steps (such as the *Complete Darshan Path* or the *Quick Darshan & Exit*), active point of interest popups, GPS coordinates, and real-time Google Satellite integrations.
- **Divine Devotional Emoji Canvas**: To preserve a clean, fast, and authentic look, all temple pictures are rendered as beautifully stylized interactive devotional emoji configurations inside a warm, glowing sacred geometric background card. No broken links or heavy external images.
- **Sacred Temple Discovery**: Explore divine shrines across India, complete with spiritual profiles, ratings, histories, guidelines, and location details.
- **Flexible Booking System**: Custom slot selections, age/identity details, and support for multiple devotees.
- **Multi-Tiered Passes**: Choose from Free General, Special Entry, or VIP Darshan & Prasadam packages.
- **Instant Digital Ticket**: After booking, secure an elegant digital pass with interactive details and instant QR code verification.
- **My Bookings Dashboard**: Review active and historical bookings, download passes, and manage cancellations/rebooking in one place.
- **Devotional Bento Design**: A beautifully polished, high-contrast visual theme tailored with warm saffron colors and elegant spacing.
- **Notification Center**: Real-time slot confirmations, schedule updates, and Devasthanam advisories.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Interactive Maps**: `@vis.gl/react-google-maps` (Google Maps Platform)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database & Auth**: Firebase (Cloud Firestore & Authentication)
- **Icons**: Lucide React

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory (based on `.env.example`) and supply your Firebase configurations.
   For the live satellite map, specify:
   ```env
   GOOGLE_MAPS_PLATFORM_KEY=your-api-key-here
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

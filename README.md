# 🚗 Smart Park

![Smart Park It Banner](./public/docs/banner.png)

**Smart Park It** is a modern, full-stack parking management and booking solution designed to streamline the urban parking experience. Built with a focus on speed, security, and user-centric design, it provides a seamless platform for both users to find parking and administrators to manage assets.

---

## ✨ Key Features

### 👤 User Features
- **Smart Booking**: Intuitive interface to find and reserve parking spots in seconds.
- **Secure Authentication**: Seamless login and signup powered by Firebase.
- **Digital Tickets**: Instant booking confirmation with QR codes for contactless entry/exit.
- **Booking History**: Keep track of all your past and upcoming reservations in one place.
- **Real-time Notifications**: Instant feedback on booking status and confirmations.

### 🔐 Admin Features
- **Analytics Dashboard**: High-level overview of bookings, users, and revenue with interactive charts.
- **Booking Management**: Full control over all system reservations with filterable views.
- **User Administration**: Manage system users and monitor activity.
- **Responsive Layout**: Fully optimized for desktop and mobile administrative tasks.

---

## 🛠️ Tech Stack

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)
- **Backend/Auth**: [Firebase](https://firebase.google.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **QR Codes**: [React QR Code](https://github.com/rosskhanas/react-qr-code)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sundar12v/easy-park-it.git
   cd easy-park-it
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or if using bun
   bun install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add your Firebase configurations:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```
easy-park-it/
├── src/
│   ├── components/     # Reusable UI & Layout components
│   ├── contexts/       # Auth and Global state contexts
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # External library configurations (Firebase, etc.)
│   ├── pages/          # Application routes (User & Admin)
│   └── App.tsx         # Main application entry and routing
├── public/             # Static assets
├── supabase/           # Database migrations and config
└── tailwind.config.ts  # Theme and styling configuration
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git checkout origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Sundar12v">Sundar12v</a>
</p>

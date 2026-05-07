# 🎓 Student Performance Analyzer & School Management System

A comprehensive, production-ready school management ecosystem built with **React**, **Node.js**, **Express**, and **Cloud Firestore**. 

---

## 🚀 Key Features
- **📊 Interactive Analytics**: Real-time performance tracking with beautiful charts (Recharts).
- **✅ Audited Attendance**: Teacher-led attendance system with duplicate prevention and audit logs.
- **📁 Bulk Onboarding**: CSV upload support for registering hundreds of students instantly.
- **🔐 Secure Profiles**: Role-based access (Admin, Teacher, Student) with self-service profile management.
- **💡 AI Smart Insights**: Automated student performance recommendations.

---

## 🛠️ Security & Private Files
For security reasons, sensitive files are **not included** in this repository. To run this project locally, you must manually create the following:

### 1. Backend Service Account
Place your Firebase Admin SDK key in `backend/serviceAccountKey.json`.
1. Go to Firebase Console → Project Settings → Service Accounts.
2. Click **Generate New Private Key**.
3. Rename the downloaded file to `serviceAccountKey.json` and move it to the `/backend` folder.

### 2. Environment Variables
Create a `.env` file in the `/backend` folder with:
```env
JWT_SECRET=your_secret_key_here
PORT=5000
```

---

## 💻 Installation & Setup

### 📡 Backend
```bash
cd backend
npm install
npm start
```

### 🎨 Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Tech Stack
- **Frontend**: Vite, React 19, Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, Firebase Admin SDK, JWT.
- **Database**: Google Cloud Firestore.
- **Deployment**: Firebase Hosting (Frontend).

---

## 📜 License
This project is for educational and administrative use in school management environments.

# Mobile Platform App

This project is a mobile application built using **React Native** and **Expo**.  
The app is developed as part of the **Platform-Based Development (PBP)** course.

The application includes basic authentication, data management, and several screens implemented using TypeScript.

---

## 🚀 Features

- Login & Authentication (Firebase)
- Add, Edit, and View Data
- Modular screen components
- Local storage for session handling
- Integration with Firebase Firestore / Auth (if used)

---

## 📦 Tech Stack

- **React Native**
- **Expo**
- **TypeScript**
- **Firebase Authentication**
- **Firebase Firestore**
- **Async Storage (custom storage)**

---

## 📁 Project Structure

```
src/
│
├── firebase/
│   ├── config.ts          # Firebase configuration
│   └── firebase.d.ts      # Firebase TypeScript definitions
│
├── screens/
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   ├── AddMahasiswaScreen.tsx
│   ├── EditMahasiswaScreen.tsx
│
└── storage/
    └── authStorage.ts     # Custom auth persistence
```

---

## ▶️ How to Run the App

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npx expo start
   ```

3. Scan the QR code using:
   - Expo Go (Android)
   - iOS Camera / Expo Go (iPhone)

---

## 🔒 Login Details

| Field | Detail |
| :--- | :--- |
| **Username (Email)** | `user@gmail.com` |
| **Password** | `111111` |

## 🔧 Environment Setup

If you use Firebase, the config directly in:

```
src/firebase/config.ts
```

---

Platform-Based Development (PBP) – Mobile App Project

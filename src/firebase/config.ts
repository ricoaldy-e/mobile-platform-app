import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvAfHI0s9fyF6sUz26x55spiTHtEUzkSo",
  authDomain: "tugaspbp-251a1.firebaseapp.com",
  projectId: "tugaspbp-251a1",
  storageBucket: "tugaspbp-251a1.firebasestorage.app",
  messagingSenderId: "1069740633346",
  appId: "1:1069740633346:web:a3401808fc51c41f7fe61b",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
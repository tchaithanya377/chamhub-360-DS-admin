// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC1ekZDZR1-6dh3E_0rShNa279iwe-JVCY",
  authDomain: "csd-nodues.firebaseapp.com",
  projectId: "csd-nodues",
  storageBucket: "csd-nodues.firebasestorage.app",
  messagingSenderId: "787881916826",
  appId: "1:787881916826:web:8a497747a086d010322223",
  measurementId: "G-YKB417NSXQ"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBUYVky7ehZvrK39MUoSVgdHDThuC8wvR8",
  authDomain: "ch360-mca.firebaseapp.com",
  projectId: "ch360-mca",
  storageBucket: "ch360-mca.firebasestorage.app",
  messagingSenderId: "430833021852",
  appId: "1:430833021852:web:dc64dd8ebea0cbe7658e59",
  measurementId: "G-0312RBY65S"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
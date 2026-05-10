import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDAA-h1ilQ-0iXW3EWqg1qRTTRwk_IHQls",
  authDomain: "shekhawatgaurav-eca2b.firebaseapp.com",
  databaseURL: "https://shekhawatgaurav-eca2b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "shekhawatgaurav-eca2b",
  storageBucket: "shekhawatgaurav-eca2b.firebasestorage.app",
  messagingSenderId: "211877606910",
  appId: "1:211877606910:web:97c1163c039b7026283caf"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
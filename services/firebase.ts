import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCvpg8arq-H1cfbC0xjmsAVQDG0WbMRb5M",
  authDomain: "slsu-gu-app.firebaseapp.com",
  databaseURL: "https://slsu-gu-app-default-rtdb.firebaseio.com",
  projectId: "slsu-gu-app",
  storageBucket: "slsu-gu-app.firebasestorage.app",
  messagingSenderId: "1040189581792",
  appId: "1:1040189581792:web:754f2eeae66c7d8abaa385",
  measurementId: "G-FEQMBRZ8M9"
};

let database: any = null;

try {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  database = getDatabase(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export const db = database;
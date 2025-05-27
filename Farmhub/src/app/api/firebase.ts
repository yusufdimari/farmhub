import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAJRsxctkKoV56w3ZmGt3Gk1DnEHemn6xc",
  authDomain: "farm-hub-23a89.firebaseapp.com",
  projectId: "farm-hub-23a89",
  storageBucket: "farm-hub-23a89.firebasestorage.app",
  messagingSenderId: "600212099025",
  appId: "1:600212099025:web:6330de6cfb46239ae59af0"
};

// Initialize Firebase (avoid duplicate initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
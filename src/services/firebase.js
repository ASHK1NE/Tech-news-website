import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// این اطلاعات رو باید از Firebase Console بگیری
const firebaseConfig = {
  apiKey: "AIzaSyDsAq8CahCEztGh9ipnFnlvs5_LBIp72TI",
  authDomain: "tech-news-hub-v1.firebaseapp.com",
  projectId: "tech-news-hub-v1",
  storageBucket: "tech-news-hub-v1.firebasestorage.app",
  messagingSenderId: "954198073430",
  appId: "1:954198073430:web:4e13622b9b64fa7457dbf7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

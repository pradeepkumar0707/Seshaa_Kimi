import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCBpjg8nuRri2z4EwzzYyQptEUDikucNEE",
  authDomain: "keerthana-traders.firebaseapp.com",
  projectId: "keerthana-traders",
  storageBucket: "keerthana-traders.firebasestorage.app",
  messagingSenderId: "44538960020",
  appId: "1:44538960020:web:34c741f0516219c189fc81",
  measurementId: "G-BJ3PQ115X7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export default app;
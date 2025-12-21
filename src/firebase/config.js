import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
 apiKey: "AIzaSyBpXvNm_ZK3-D1BMtHuIxl3A8P8BmX1bbw",
  authDomain: "pradeepcheck-2c7a5.firebaseapp.com",
  projectId: "pradeepcheck-2c7a5",
  storageBucket: "pradeepcheck-2c7a5.firebasestorage.app",
  messagingSenderId: "398673958396",
  appId: "1:398673958396:web:de3ce92ac2de2f236c4e79",
  measurementId: "G-QDLMS98XK2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export default app;
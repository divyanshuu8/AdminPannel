// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCVnOLIaKkdEDPrRAXabzdryQxAa1VDOpg",
  authDomain: "interiorji.firebaseapp.com",
  projectId: "interiorji",
  storageBucket: "interiorji.firebasestorage.app",
  messagingSenderId: "71022848219",
  appId: "1:71022848219:web:84b34b2ae755af995e04fe",
  measurementId: "G-Z7EK5SRWTQ",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };

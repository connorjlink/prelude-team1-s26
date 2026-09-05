// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_eRI59wzRxE5qwYgHIHU5U-MTyD0R6cI",
  authDomain: "prelude-2c284.firebaseapp.com",
  projectId: "prelude-2c284",
  storageBucket: "prelude-2c284.firebasestorage.app",
  messagingSenderId: "915506973683",
  appId: "1:915506973683:web:965361ff3c3cbe30a56086",
  measurementId: "G-L50RXLZ4EZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics only works in browser environments (not during SSR/tests)
let analytics = null;
isAnalyticsSupported().then((supported) => {
  if (supported) {
    try {
      analytics = getAnalytics(app);
    } catch (e) {
      console.warn("Analytics init failed", e);
    }
  }
});

// Firestore - NoSQL database
export const db = getFirestore(app);

// Auth instance - reuse across app instead of calling getAuth(app) everywhere
export const auth = getAuth(app);

export { analytics };
export default app;

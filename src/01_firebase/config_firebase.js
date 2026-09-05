// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_eRI59wzRxE5qwYgHIHU5U-MTyD0R6cI",
  authDomain: "prelude-2c284.firebaseapp.com",
  projectId: "prelude-2c284",
  storageBucket: "prelude-2c284.firebasestorage.app",
  messagingSenderId: "915506973683",
  appId: "1:915506973683:web:965361ff3c3cbe30a56086",
  measurementId: "G-L50RXLZ4EZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default firebase_app

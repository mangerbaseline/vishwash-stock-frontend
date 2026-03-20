import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCTWUegS55mGrRBz1B-F13rfRneLtbFXo4",
  authDomain: "stock-db186.firebaseapp.com",
  projectId: "stock-db186",
  storageBucket: "stock-db186.firebasestorage.app",
  messagingSenderId: "991700236272",
  appId: "1:991700236272:web:ea6d291df6641b8ec44f35",
  measurementId: "G-9D9MFFFWBP"
};

// Initialize Firebase only once
let app;
let analytics;
let auth;

if (typeof window !== 'undefined') {
  // Check if Firebase is already initialized
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    // Initialize analytics only if supported
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  } else {
    app = getApps()[0];
    auth = getAuth(app);
  }
} else {
  // Server-side: minimal initialization
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export { app, auth, analytics };
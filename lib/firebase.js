import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBacZi703A8DN7Rw6huN3nYW8ps5EQmRZs",
  authDomain: "claude-521cb.firebaseapp.com",
  projectId: "claude-521cb",
  storageBucket: "claude-521cb.firebasestorage.app",
  messagingSenderId: "849991706049",
  appId: "1:849991706049:web:e02ff8fe5d567ed6e03b40"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;

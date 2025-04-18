import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBoeKp6hcgp4JExVIYgv3-WC7R2HfS8ZhY",
  authDomain: "authantication-16438.firebaseapp.com",
  projectId: "authantication-16438",
  storageBucket: "authantication-16438.firebasestorage.app",
  messagingSenderId: "51574316575",
  appId: "1:51574316575:web:28d1f0fac21e5e11c93f2a",
  measurementId: "G-K55FPPHB3V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };

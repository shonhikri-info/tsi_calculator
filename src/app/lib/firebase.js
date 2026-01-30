import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAYmL6Fm-8FaCw1LNV4yUDx1tCzPy_tVcM",
  authDomain: "tsi-investment-app-61e75.firebaseapp.com",
  projectId: "tsi-investment-app-61e75",
  storageBucket: "tsi-investment-app-61e75.firebasestorage.app",
  messagingSenderId: "160771557680",
  appId: "1:160771557680:web:b32f413dc0e4ee58e260f5"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };
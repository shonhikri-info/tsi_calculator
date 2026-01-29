import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBIXzBQK5mqiIj7EQe_cQtDPDQoUv2GXGo",
  authDomain: "tsi-investment-app.firebaseapp.com",
  projectId: "tsi-investment-app",
  storageBucket: "tsi-investment-app.firebasestorage.app",
  messagingSenderId: "192371856387",
  appId: "1:192371856387:web:b25109feb8da46322fea36"
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
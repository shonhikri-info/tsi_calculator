import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// רישום משתמש חדש + שליחת אימות אימייל
export const registerUser = async (email, password, userDetails) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // שלח אימות אימייל
    await sendEmailVerification(user, {
      url: window.location.origin, // URL לחזרה אחרי אימות
      handleCodeInApp: false
    });
    
    await setDoc(doc(db, 'users', user.uid), {
      ...userDetails,
      email: user.email,
      emailVerified: false,
      role: 'user',
      status: 'pending',
      createdAt: serverTimestamp()
    });
    
    return { success: true, userId: user.uid };
  } catch (error) {
    let errorMessage = 'שגיאה ברישום';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'האימייל כבר בשימוש';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'הסיסמה חלשה מדי (לפחות 6 תווים)';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'אימייל לא תקין';
    }
    
    return { success: false, error: errorMessage };
  }
};

// התחברות
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await signOut(auth);
      return { success: false, error: 'משתמש לא קיים' };
    }
    
    const userData = userDoc.data();
    
    // עדכן מצב אימות אימייל
    if (user.emailVerified && !userData.emailVerified) {
      await setDoc(doc(db, 'users', user.uid), {
        emailVerified: true
      }, { merge: true });
    }
    
    if (userData.status === 'blocked') {
      await signOut(auth);
      return { success: false, error: 'המשתמש חסום' };
    }
    
    if (userData.status !== 'approved' && userData.role !== 'admin') {
      await signOut(auth);
      return { success: false, error: 'המשתמש טרם אושר על ידי מנהל' };
    }
    
    return { 
      success: true, 
      userData: { ...userData, emailVerified: user.emailVerified },
      userId: user.uid,
      userType: userData.role 
    };
  } catch (error) {
    let errorMessage = 'שגיאה בהתחברות';
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      errorMessage = 'אימייל או סיסמה שגויים';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'יותר מדי ניסיונות. נסה שוב מאוחר יותר';
    }
    
    return { success: false, error: errorMessage };
  }
};

// יציאה
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'שגיאה ביציאה' };
  }
};

// שליחת אימייל לאיפוס סיסמה
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: window.location.origin,
      handleCodeInApp: false
    });
    return { success: true };
  } catch (error) {
    let errorMessage = 'שגיאה בשליחת אימייל';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'אימייל לא קיים במערכת';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'אימייל לא תקין';
    }
    
    return { success: false, error: errorMessage };
  }
};

// שליחה מחדש של אימות אימייל
export const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'אין משתמש מחובר' };
    }
    
    if (user.emailVerified) {
      return { success: false, error: 'האימייל כבר מאומת' };
    }
    
    await sendEmailVerification(user, {
      url: window.location.origin,
      handleCodeInApp: false
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'שגיאה בשליחת אימייל' };
  }
};

// אימות קוד פעולה (לאימות אימייל או איפוס סיסמה)
export const verifyActionCode = async (code) => {
  try {
    await applyActionCode(auth, code);
    
    // רענן את המשתמש הנוכחי
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const user = auth.currentUser;
      
      // עדכן ב-Firestore
      if (user.emailVerified) {
        await setDoc(doc(db, 'users', user.uid), {
          emailVerified: true
        }, { merge: true });
      }
    }
    
    return { success: true };
  } catch (error) {
    let errorMessage = 'קוד לא תקין או פג תוקף';
    
    if (error.code === 'auth/expired-action-code') {
      errorMessage = 'הקוד פג תוקף';
    } else if (error.code === 'auth/invalid-action-code') {
      errorMessage = 'קוד לא תקין';
    }
    
    return { success: false, error: errorMessage };
  }
};

// אימות קוד איפוס סיסמה
export const verifyResetCode = async (code) => {
  try {
    await verifyPasswordResetCode(auth, code);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'קוד לא תקין או פג תוקף' };
  }
};

// אישור סיסמה חדשה
export const confirmNewPassword = async (code, newPassword) => {
  try {
    await confirmPasswordReset(auth, code, newPassword);
    return { success: true };
  } catch (error) {
    let errorMessage = 'שגיאה באיפוס סיסמה';
    
    if (error.code === 'auth/weak-password') {
      errorMessage = 'הסיסמה חלשה מדי';
    } else if (error.code === 'auth/expired-action-code') {
      errorMessage = 'הקוד פג תוקף';
    }
    
    return { success: false, error: errorMessage };
  }
};

// האזנה לשינויים במצב האימות
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// קבלת משתמש נוכחי
export const getCurrentUser = () => {
  return auth.currentUser;
};
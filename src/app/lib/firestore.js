import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  serverTimestamp, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';

// User Management
export const saveUserDetails = async (userId, userDetails) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userDetails,
      role: 'user',
      createdAt: serverTimestamp(),
      status: 'pending'
    }, { merge: true });
    return true;
  } catch (error) {
    return false;
  }
};

export const getUser = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = [];

    usersSnapshot.forEach((d) => {
      const userData = d.data();
      users.push({
        id: d.id,
        ...userData
      });
    });

    return users;
  } catch (error) {
    return [];
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      status,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
    return true;
  } catch (error) {
    return false;
  }
};

// Formula Management
export const saveFormulas = async (formulasData) => {
  try {
    await setDoc(doc(db, 'settings', 'formulas'), {
      formulas: formulasData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const loadFormulas = async () => {
  try {
    const formulasDoc = await getDoc(doc(db, 'settings', 'formulas'));
    return formulasDoc.exists() ? formulasDoc.data().formulas : null;
  } catch (error) {
    return null;
  }
};

// Trading Journal - Subcollection under user
export const saveTrade = async (userId, tradeData) => {
  try {
    const tradesRef = collection(db, 'users', userId, 'trades');
    const docRef = await addDoc(tradesRef, {
      ...tradeData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    return null;
  }
};

export const getUserTrades = async (userId) => {
  try {
    const tradesRef = collection(db, 'users', userId, 'trades');
    const q = query(tradesRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    
    const trades = [];
    snapshot.forEach((d) => {
      const data = d.data();
      trades.push({
        id: d.id,
        ...data,
        date: data.date || (data.createdAt ? data.createdAt.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
      });
    });
    
    return trades;
  } catch (error) {
    return [];
  }
};

export const deleteTrade = async (userId, tradeId) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'trades', tradeId));
    return true;
  } catch (error) {
    return false;
  }
};

// Portfolio - Subcollection under user
export const savePortfolio = async (userId, portfolioData) => {
  try {
    await setDoc(doc(db, 'users', userId, 'portfolio', 'stocks'), {
      stocks: portfolioData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const getUserPortfolio = async (userId) => {
  try {
    const portfolioDoc = await getDoc(doc(db, 'users', userId, 'portfolio', 'stocks'));
    return portfolioDoc.exists() ? portfolioDoc.data().stocks : [];
  } catch (error) {
    return [];
  }
};

// Constants
export const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  BLOCKED: 'blocked'
};

export const TRADE_TYPES = {
  BUY: 'buy',
  SELL: 'sell'
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};
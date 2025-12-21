import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

// PRODUCTS
export const addProduct = async (productData) => {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...productData };
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const getProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    await deleteDoc(doc(db, 'products', id));
    return id;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// FARMERS
export const addFarmer = async (farmerData) => {
  try {
    const docRef = await addDoc(collection(db, 'farmers'), {
      ...farmerData,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...farmerData };
  } catch (error) {
    console.error('Error adding farmer:', error);
    throw error;
  }
};

export const getFarmers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'farmers'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting farmers:', error);
    throw error;
  }
};

export const deleteFarmer = async (id) => {
  try {
    await deleteDoc(doc(db, 'farmers', id));
    return id;
  } catch (error) {
    console.error('Error deleting farmer:', error);
    throw error;
  }
};

// DEALERS
export const addDealer = async (dealerData) => {
  try {
    const docRef = await addDoc(collection(db, 'dealers'), {
      ...dealerData,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...dealerData };
  } catch (error) {
    console.error('Error adding dealer:', error);
    throw error;
  }
};

export const getDealers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'dealers'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting dealers:', error);
    throw error;
  }
};

export const deleteDealer = async (id) => {
  try {
    await deleteDoc(doc(db, 'dealers', id));
    return id;
  } catch (error) {
    console.error('Error deleting dealer:', error);
    throw error;
  }
};
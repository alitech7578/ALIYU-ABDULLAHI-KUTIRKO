import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, deleteDoc, getDoc, onSnapshot, writeBatch, updateDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Connect to the specific database instance registered in the config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

export { collection, doc, setDoc, deleteDoc, getDoc, onSnapshot, writeBatch, updateDoc };

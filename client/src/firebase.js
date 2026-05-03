import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
export let db = null;

try {
  // Only initialize if API key is present to prevent crashes in unconfigured environments
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    console.warn('Firebase config missing. Firestore analytics disabled.');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

/**
 * Log user interactions to Firestore for anonymous usage metrics.
 * @param {string} intent - The feature intent (e.g. 'journey', 'jargon')
 * @param {Object} data - Additional data to log (query, context, lang)
 */
export const logFirestoreInteraction = async (intent, data) => {
  if (!db) return;
  try {
    await addDoc(collection(db, 'interactions'), {
      intent,
      ...data,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging to Firestore:', error);
  }
};

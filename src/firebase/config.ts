'use client';

/**
 * Firebase configuration object.
 * Note: To fix the 'identity-toolkit-api-has-not-been-used' error, you must enable
 * the Identity Toolkit API in the Google Cloud Console for project 616470986160.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyBOWMGBajMUoEObPoFRBj2mIDk3xh3JUO4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "nextn-616470986160.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nextn-616470986160",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "nextn-616470986160.appspot.com",
  messagingSenderId: "616470986160",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:616470986160:web:mockapp",
};

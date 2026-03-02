'use client';

/**
 * Firebase configuration object.
 * Note: To fix the 'requests-to-this-api-identitytoolkit...are-blocked' error:
 * 1. Visit https://console.cloud.google.com/apis/credentials
 * 2. Locate the API key: AIzaSyBOWMGBajMUoEObPoFRBj2mIDk3xh3JUO4
 * 3. Ensure 'API restrictions' allows the 'Identity Toolkit API'.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyBOWMGBajMUoEObPoFRBj2mIDk3xh3JUO4",
  authDomain: "nextn-616470986160.firebaseapp.com",
  projectId: "nextn-616470986160",
  storageBucket: "nextn-616470986160.appspot.com",
  messagingSenderId: "616470986160",
  appId: "1:616470986160:web:96e8e8e8e8e8e8e8e8e8e8", // Mock App ID, update with real value if available
};

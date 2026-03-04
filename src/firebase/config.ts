'use client';

/**
 * Firebase configuration object.
 * 
 * TROUBLESHOOTING ERRORS:
 * 
 * 1. 'auth/configuration-not-found':
 *    Go to https://console.firebase.google.com/project/nextn-616470986160/authentication
 *    Click 'Get Started' and enable the 'Google' sign-in provider.
 * 
 * 2. 'auth/requests-to-this-api...are-blocked':
 *    Go to https://console.cloud.google.com/apis/credentials
 *    Find API key: AIzaSyBOWMGBajMUoEObPoFRBj2mIDk3xh3JUO4
 *    Set 'API restrictions' to 'Don't restrict key' OR add 'Identity Toolkit API'.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyBOWMGBajMUoEObPoFRBj2mIDk3xh3JUO4",
  authDomain: "nextn-616470986160.firebaseapp.com",
  projectId: "nextn-616470986160",
  storageBucket: "nextn-616470986160.appspot.com",
  messagingSenderId: "616470986160",
  appId: "1:616470986160:web:96e8e8e8e8e8e8e8e8e8e8",
};

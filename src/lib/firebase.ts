
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDj-ClN2rGhcrR55WG6nhh17xz9o-UwMbU",
    authDomain: "valor-f8c24.firebaseapp.com",
    projectId: "valor-f8c24",
    storageBucket: "valor-f8c24.firebasestorage.app",
    messagingSenderId: "136308043891",
    appId: "1:136308043891:web:b51c7b9424bfcf6f91fa06",
    measurementId: "G-71VQNWX5FB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

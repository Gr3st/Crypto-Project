// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-lHsr2KhwjwCPj-0W7xNRs5tXuAZqRWY",
  authDomain: "crypto-36a25.firebaseapp.com",
  projectId: "crypto-36a25",
  storageBucket: "crypto-36a25.appspot.com",
  messagingSenderId: "40795038567",
  appId: "1:40795038567:web:882852815225984cfd85c2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
export const firestore = getFirestore(app);

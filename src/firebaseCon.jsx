import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyCi_7vON2iaQfV2PERv2m6m9YjZLNp--fM",
  authDomain: "kriya1-5fb0d.firebaseapp.com",
  projectId: "kriya1-5fb0d",
  storageBucket: "kriya1-5fb0d.appspot.com",
  messagingSenderId: "892248196632",
  appId: "1:892248196632:web:86e5a8f33dad9603eea56d",
  measurementId: "G-7LNS22RP2N"
};

// const firebaseConfig = {
//   apiKey: "AIzaSyC4BCKtcLrSoQTvhenfNjRAIoe57TvUWT4",
//   authDomain: "urban-aura-services-b690a.firebaseapp.com",
//   projectId: "urban-aura-services-b690a",
//   storageBucket: "urban-aura-services-b690a.firebasestorage.app",
//   messagingSenderId: "255632842124",
//   appId: "1:255632842124:web:24cd94ce8656098fa74aa9",
//   measurementId: "G-CMLRRSLQ12"
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const firestore=getFirestore(app);
export const storage = getStorage(app);
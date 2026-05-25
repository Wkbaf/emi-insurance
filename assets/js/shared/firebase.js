// assets/js/shared/firebase.js

const firebaseConfig = {
  apiKey: "AIzaSyCcvbf5k-0IywLEF1NEcrqGPC1vQZRC57g",
  authDomain: "emi-insurance-9f19d.firebaseapp.com",
  projectId: "emi-insurance-9f19d",
  storageBucket: "emi-insurance-9f19d.firebasestorage.app",
  messagingSenderId: "267715366989",
  appId: "1:267715366989:web:ca6f4c35ebfaae15d60c04",
  measurementId: "G-YM00TLCCWF",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

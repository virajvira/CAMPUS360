export const firebaseConfig = {
  apiKey: "AIzaSyBUXAUV4F7bawfzFOdOSsE0950VavvYRyM",
  authDomain: "delhi-technical-campus-app.firebaseapp.com",
  projectId: "delhi-technical-campus-app",
  storageBucket: "delhi-technical-campus-app.firebasestorage.app",
  messagingSenderId: "900990668160",
  appId: "1:900990668160:web:b8158ff0c31afa381ec565",
  measurementId: "G-YKN0TNWL06"
};

export const firebaseConfigReady = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.length > 0
);

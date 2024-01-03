import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAoRZer7mAiQ2p2YMPJhQ0_LIEPic4pti0",
  authDomain: "travelstory-db05b.firebaseapp.com",
  projectId: "travelstory-db05b",
  storageBucket: "travelstory-db05b.appspot.com",
  messagingSenderId: "486855249372",
  appId: "1:486855249372:web:11316f0f26efa8b843d319",
  databaseURL:
    "https://travelstory-db05b-default-rtdb.europe-west1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };

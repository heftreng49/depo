// auth.js
import { auth, provider, db } from "./firebase.js";
import {
  signInWithPopup, signOut, onAuthStateChanged,
  signInWithEmailAndPassword, createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

export let currentUser = null;

export function setupAuthUI() {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  loginBtn.onclick = () => signInWithPopup(auth, provider);
  logoutBtn.onclick = () => signOut(auth);

  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    loginBtn.style.display = user ? "none" : "inline-block";
    logoutBtn.style.display = user ? "inline-block" : "none";

    if (user) {
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        joinedAt: Date.now()
      }, { merge: true });
    }
  });
}

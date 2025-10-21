// users.js
import { db } from "./firebase.js";
import { currentUser } from "./auth.js";
import {
  doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const ADMIN_EMAIL = "siirgibi49@gmail.com";

/**
 * Kullanıcıyı Firestore'a kaydeder veya günceller
 */
export async function saveUserProfile(user) {
  if (!user) return;
  const ref = doc(db, "users", user.uid);
  await setDoc(ref, {
    name: user.displayName || "",
    email: user.email,
    photo: user.photoURL || "",
    joinedAt: Date.now()
  }, { merge: true });
}

/**
 * Kullanıcının admin olup olmadığını döndürür
 */
export function isAdmin(user) {
  return user?.email === ADMIN_EMAIL;
}

/**
 * Kullanıcı profilini HTML'e yazdırır
 * @param {string} containerId - HTML element ID
 */
export async function renderUserProfile(containerId) {
  if (!currentUser) return;
  const ref = doc(db, "users", currentUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const d = snap.data();
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center">
      <img src="${d.photo || 'https://via.placeholder.com/80'}" style="width:80px;height:80px;border-radius:50%;" />
      <div>
        <div style="font-weight:700">${d.name || 'Bênav'}</div>
        <div style="color:#666">${d.email}</div>
        ${isAdmin(currentUser) ? '<div style="color:#e0245e;font-weight:bold;">👑 Admin</div>' : ''}
      </div>
    </div>
  `;
}

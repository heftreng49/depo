// comments.js
import { db } from "./firebase.js";
import { currentUser } from "./auth.js";
import {
  collection, addDoc, query, orderBy, onSnapshot,
  doc, updateDoc, deleteDoc, increment
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

export function setupComments(postId) {
  const commentsRef = collection(db, "posts", postId, "comments");
  const commentList = document.getElementById("commentList");
  const sendBtn = document.getElementById("sendComment");
  const textEl = document.getElementById("commentText");

  sendBtn.onclick = async () => {
    if (!currentUser) return alert("Giriş yapın.");
    const text = textEl.value.trim();
    if (!text) return;
    await addDoc(commentsRef, {
      text,
      userName: currentUser.displayName,
      userPhoto: currentUser.photoURL,
      userId: currentUser.uid,
      timestamp: Date.now(),
      likes: 0
    });
    textEl.value = "";
  };

  onSnapshot(query(commentsRef, orderBy("timestamp", "asc")), (snapshot) => {
    commentList.innerHTML = "";
    snapshot.forEach(docSnap => {
      const c = docSnap.data();
      const id = docSnap.id;
      const div = document.createElement("div");
      div.className = "comment-item";
      div.innerHTML = `
        <strong>${c.userName}</strong>
        <p>${c.text}</p>
        <small>${new Date(c.timestamp).toLocaleString()}</small>
        <button class="likeBtn" data-id="${id}">🤍 ${c.likes || 0}</button>
      `;
      commentList.appendChild(div);
    });
  });
}

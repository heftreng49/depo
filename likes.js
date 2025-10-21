// likes.js
import { db } from "./firebase.js";
import { currentUser } from "./auth.js";
import { doc, updateDoc, setDoc, onSnapshot, increment } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

export function setupLikes(postId) {
  const postRef = doc(db, "posts", postId);
  const likeBtn = document.getElementById("likePostBtn");
  const likeCount = document.getElementById("likeCount");

  likeBtn.onclick = async () => {
    if (!currentUser) return alert("Giriş yapın.");
    const liked = localStorage.getItem("postLiked_" + postId) === "true";
    await setDoc(postRef, { likes: 0 }, { merge: true });
    await updateDoc(postRef, { likes: increment(liked ? -1 : 1) });
    localStorage.setItem("postLiked_" + postId, liked ? "false" : "true");
  };

  onSnapshot(postRef, (docSnap) => {
    const count = docSnap.data()?.likes || 0;
    likeCount.textContent = count;
    const liked = localStorage.getItem("postLiked_" + postId) === "true";
    likeBtn.innerHTML = liked ? "❤️ Beğendim" : "🤍 Beğen";
  });
}

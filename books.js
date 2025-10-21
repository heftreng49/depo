// books.js
import { db } from "./firebase.js";
import { currentUser } from "./auth.js";
import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc, increment, query, where
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const ADMIN_EMAIL = "siirgibi49@gmail.com";

export function setupBooks() {
  const uploadBtn = document.getElementById("kitapYukleBtn");
  const kitapList = document.getElementById("kitapList");
  const filter = document.getElementById("kitapFilter");

  uploadBtn.onclick = async () => {
    const title = document.getElementById("kitapBaslik").value.trim();
    const desc = document.getElementById("kitapAciklama").value.trim();
    const category = document.getElementById("kitapKategori").value;
    const fileUrl = document.getElementById("kitapPDF").value.trim();
    if (!title || !desc || !category || !fileUrl || !currentUser) return;

    await addDoc(collection(db, "books"), {
      title, description: desc, category, fileUrl,
      userId: currentUser.uid,
      approved: currentUser.email === ADMIN_EMAIL,
      views: 0,
      timestamp: Date.now()
    });
    loadBooks();
  };

  filter.onchange = () => loadBooks();

  async function loadBooks() {
    kitapList.innerHTML = "";
    let q = collection(db, "books");
    const selected = filter.value;
    if (selected) q = query(q, where("category", "==", selected));
    const snap = await getDocs(q);
    snap.forEach(docSnap => {
      const d = docSnap.data();
      if (!d.approved && currentUser?.email !== ADMIN_EMAIL) return;
      const div = document.createElement("div");
      div.className = "kitap-card";
      div.innerHTML = `
        <h3>${d.title}</h3>
        <p>${d.description}</p>
        <div>${d.category} • ${d.views} görüntüleme</div>
        <a href="${d.fileUrl}" target="_blank">📥 İndir</a>
      `;
      kitapList.appendChild(div);
      updateDoc(doc(db, "books", docSnap.id), { views: increment(1) });
    });
  }

  loadBooks();
}

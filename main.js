// main.js
import { setupAuthUI } from "./auth.js";
import { setupComments } from "./comments.js";
import { setupLikes } from "./likes.js";
import { setupBooks } from "./books.js";

const postId = location.pathname.replace(/\//g, "_") || "default";

setupAuthUI();
setupComments(postId);
setupLikes(postId);
setupBooks();

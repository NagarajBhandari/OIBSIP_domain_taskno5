let socket = null;
let currentRoom = null;
const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const roomTitle = document.getElementById("room-title");
const emojiBtn = document.getElementById("emoji-btn");
const attachBtn = document.getElementById("attach-btn");
const fileInput = document.getElementById("file-input");
const uploadForm = document.getElementById("upload-form");

function appendMessage({ user, content, file, mine=false }) {
  const el = document.createElement("div");
  el.className = `message ${mine ? "me" : "other"}`;
  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = user;
  el.appendChild(meta);

  if (file) {
    // basic preview: image or video
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = `/uploads/${file.filename}`;
      el.appendChild(img);
    } else if (file.mimetype && file.mimetype.startsWith("video/")) {
      const vid = document.createElement("video");
      vid.src = `/uploads/${file.filename}`;
      vid.controls = true;
      el.appendChild(vid);
    } else {
      const link = document.createElement("a");
      link.href = `/uploads/${file.filename}`;
      link.textContent = `Download ${file.filename}`;
      el.appendChild(link);
    }
  }

  if (content && content.trim() !== "") {
    const p = document.createElement("div");
    p.textContent = content; // (Tip: for emoji shortcodes, map to Unicode here)
    el.appendChild(p);
  }

  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function connectSocket() {
  socket = io();

  socket.on("connected", () => {
    console.log("Socket connected");
  });

  socket.on("history", (data) => {
    messagesEl.innerHTML = "";
    data.messages.forEach(m => appendMessage({ user: m.user, content: m.content, file: m.file }));
  });

  socket.on("message", (data) => {
    const mine = data.user === CURRENT_USER;
    if (document.hidden && !mine) notify(`${data.user}: ${data.content}`);
    appendMessage({ user: data.user, content: data.content, mine });
  });

  socket.on("file", (data) => {
    const mine = data.user === CURRENT_USER;
    if (document.hidden && !mine) notify(`${data.user} sent a file`);
    appendMessage({ user: data.user, content: "", file: { filename: data.filename, mimetype: data.mimetype }, mine });
  });

  socket.on("system", (data) => {
    console.log(data.message);
  });

  socket.on("error", (data) => {
    alert(data.message || "An error occurred.");
  });
}

function joinRoom(name) {
  if (!socket) connectSocket();
  if (currentRoom) socket.emit("leave", { room: currentRoom });
  currentRoom = name;
  roomTitle.textContent = `Room: ${name}`;
  socket.emit("join", { room: name });
}

function sendMessage() {
  const text = inputEl.value.trim();
  if (!text || !currentRoom) return;
  socket.emit("message", { room: currentRoom, content: text });
  inputEl.value = "";
}

function notify(body) {
  if (Notification.permission === "granted") {
    new Notification("New message", { body });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // request notification permission
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }

  document.querySelectorAll(".room-btn").forEach(btn => {
    btn.addEventListener("click", () => joinRoom(btn.dataset.room));
  });

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Emoji picker (super simple: toggle a small palette)
  emojiBtn.addEventListener("click", () => {
    const palette = ["😀","😂","😍","👍","🔥","🎉","🙏","😢","😎","💡","🚀","✅"];
    const menu = document.createElement("div");
    menu.style.position = "absolute";
    menu.style.bottom = "70px";
    menu.style.right = "20px";
    menu.style.background = "#0b1220";
    menu.style.border = "1px solid #1f2937";
    menu.style.borderRadius = "10px";
    menu.style.padding = "8px";
    menu.style.display = "grid";
    menu.style.gridTemplateColumns = "repeat(6, 24px)";
    menu.style.gap = "6px";
    palette.forEach(e => {
      const b = document.createElement("button");
      b.className = "btn small";
      b.textContent = e;
      b.style.padding = "4px";
      b.addEventListener("click", () => {
        inputEl.value += e;
        document.body.removeChild(menu);
        inputEl.focus();
      });
      menu.appendChild(b);
    });
    const close = () => { if (document.body.contains(menu)) document.body.removeChild(menu); };
    setTimeout(() => document.addEventListener("click", close, { once: true }), 0);
    document.body.appendChild(menu);
  });

  // File upload flow
  attachBtn.addEventListener("click", () => {
    if (!currentRoom) { alert("Join a room first."); return; }
    fileInput.value = "";
    uploadForm.action = UPLOAD_ENDPOINT(currentRoom);
    fileInput.click();
  });
  fileInput.addEventListener("change", () => {
    if (!fileInput.files || !fileInput.files[0]) return;
    uploadForm.submit();
  });
});

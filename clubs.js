import { getApp, getApps, initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  getFirestore,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseConfig, firebaseConfigReady } from "./firebase-config.js";

const list = document.querySelector("#clubs-list");
const createForm = document.querySelector("#create-club-form");
const createButton = document.querySelector("#create-club-button");
const createError = document.querySelector("#clubs-error");
const chatTitle = document.querySelector("#chat-title");
const chatTopic = document.querySelector("#chat-topic");
const chatStatus = document.querySelector("#chat-status");
const messagesRoot = document.querySelector("#club-messages");
const messageForm = document.querySelector("#club-message-form");
const messageInput = document.querySelector("#club-message");
const sendButton = document.querySelector("#send-message-button");

let activeUser = null;
let activeClubId = null;
let stopMessages = null;

const showCreateError = (message) => {
  createError.textContent = message;
  createError.hidden = false;
};

const showListError = (message) => {
  list.replaceChildren();
  const status = document.createElement("p");
  status.className = "clubs-list-status";
  status.textContent = message;
  list.append(status);
};

const renderDemoClubs = () => {
  const demoClubs = [
    { name: "Coding Club", topic: "Technology", description: "Build projects together, share programming tips, and learn by making." },
    { name: "Robotics & Innovation", topic: "Engineering", description: "Explore robotics, electronics, and hands-on engineering ideas." },
    { name: "Cultural Society", topic: "Arts & culture", description: "Celebrate campus culture through music, dance, and creative events." },
    { name: "Photography Club", topic: "Creative arts", description: "Practice photography, exchange feedback, and capture campus life." },
    { name: "Sports Club", topic: "Fitness", description: "Find teammates and discover sports and fitness activities on campus." }
  ];
  createForm.closest(".clubs-panel").hidden = true;
  list.replaceChildren();
  demoClubs.forEach((club) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "club-list-item";
    button.setAttribute("aria-pressed", "false");
    const name = document.createElement("strong");
    name.textContent = club.name;
    const topic = document.createElement("span");
    topic.textContent = club.topic;
    const description = document.createElement("span");
    description.textContent = club.description;
    button.append(name, topic, description);
    button.addEventListener("click", () => {
      list.querySelectorAll(".club-list-item").forEach((item) => {
        const selected = item === button;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      chatTitle.textContent = club.name;
      chatTopic.textContent = club.topic;
      chatStatus.textContent = `${club.description} Club details are examples for the demo; confirm official information with campus.`;
      messagesRoot.replaceChildren();
      messageForm.hidden = true;
    });
    list.append(button);
  });
  chatStatus.textContent = "Choose a club to see its information.";
  document.querySelector(".clubs-chat .eyebrow").textContent = "CLUB INFORMATION · DEMO";
  messageForm.hidden = true;
};

const formatMessageTime = (timestamp) => {
  if (!timestamp || typeof timestamp.toDate !== "function") return "Sending…";
  return timestamp.toDate().toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
};

const renderMessage = (message) => {
  const article = document.createElement("article");
  article.className = `club-message${message.authorId === activeUser.uid ? " is-own" : ""}`;

  const author = document.createElement("div");
  author.className = "club-message-author";
  const authorName = document.createElement("strong");
  authorName.textContent = message.authorName || "Campus member";
  const time = document.createElement("time");
  time.textContent = formatMessageTime(message.createdAt);
  author.append(authorName, time);

  const body = document.createElement("p");
  body.textContent = message.text || "";
  article.append(author, body);
  return article;
};

const renderMessages = (snapshot) => {
  const fragment = document.createDocumentFragment();
  snapshot.forEach((messageSnapshot) => fragment.append(renderMessage(messageSnapshot.data())));
  messagesRoot.replaceChildren(fragment);
  messagesRoot.scrollTop = messagesRoot.scrollHeight;
  chatStatus.textContent = snapshot.empty ? "No messages yet. Start the conversation." : "";
};

const selectClub = (clubId, club) => {
  activeClubId = clubId;
  list.querySelectorAll(".club-list-item").forEach((button) => {
    const isSelected = button.dataset.clubId === clubId;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  if (stopMessages) stopMessages();
  chatTitle.textContent = club.name;
  chatTopic.textContent = club.topic;
  chatStatus.textContent = "Loading conversation…";
  messagesRoot.replaceChildren();
  messageForm.hidden = false;

  const messagesQuery = query(
    collection(getFirestore(), "clubs", clubId, "messages"),
    orderBy("createdAt", "asc"),
    limitToLast(100)
  );
  stopMessages = onSnapshot(messagesQuery, renderMessages, (error) => {
    console.error("Club messages could not be loaded.", error);
    chatStatus.textContent = "Messages could not be loaded. Check your Firestore database and security rules.";
  });
};

const renderClubs = (snapshot) => {
  list.replaceChildren();
  if (snapshot.empty) {
    const status = document.createElement("p");
    status.className = "clubs-list-status";
    status.textContent = "No clubs yet. Create one to get the conversation started.";
    list.append(status);
    return;
  }

  snapshot.forEach((clubSnapshot) => {
    const club = clubSnapshot.data();
    const button = document.createElement("button");
    button.type = "button";
    button.className = "club-list-item";
    button.dataset.clubId = clubSnapshot.id;
    button.setAttribute("aria-pressed", String(clubSnapshot.id === activeClubId));

    const name = document.createElement("strong");
    name.textContent = club.name;
    const topic = document.createElement("span");
    topic.textContent = club.topic;
    const description = document.createElement("span");
    description.textContent = club.description;
    button.append(name, topic, description);
    button.addEventListener("click", () => selectClub(clubSnapshot.id, club));
    list.append(button);
  });

  if (activeClubId) {
    const activeButton = list.querySelector(`[data-club-id="${CSS.escape(activeClubId)}"]`);
    if (activeButton) activeButton.classList.add("is-selected");
    else {
      activeClubId = null;
      if (stopMessages) stopMessages();
      stopMessages = null;
      chatTitle.textContent = "Pick a club";
      chatTopic.textContent = "";
      chatStatus.textContent = "Choose a club to see its conversation.";
      messagesRoot.replaceChildren();
      messageForm.hidden = true;
    }
  }
};

if (document.body.dataset.authMode === "demo") {
  renderDemoClubs();
} else if (!firebaseConfigReady) {
  showListError("Clubs are unavailable because Firebase is not configured.");
} else {
  try {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const database = getFirestore(app);

    onAuthStateChanged(auth, (user) => {
      if (!user) return;
      activeUser = user;

      const clubsQuery = query(collection(database, "clubs"), orderBy("createdAt", "desc"));
      onSnapshot(clubsQuery, renderClubs, (error) => {
        console.error("Clubs could not be loaded.", error);
        showListError("Clubs could not be loaded. Check your Firestore database and security rules.");
      });

      createForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (createButton.disabled) return;
        createError.hidden = true;
        const formData = new FormData(createForm);
        const name = String(formData.get("name") || "").trim();
        const topic = String(formData.get("topic") || "").trim();
        const description = String(formData.get("description") || "").trim();
        if (name.length < 3 || !topic || !description) {
          showCreateError("Enter a club name of at least 3 characters, an interest, and a description.");
          return;
        }

        createButton.disabled = true;
        try {
          const club = await addDoc(collection(database, "clubs"), {
            name,
            topic,
            description,
            createdBy: user.uid,
            createdAt: serverTimestamp()
          });
          createForm.reset();
          selectClub(club.id, { name, topic });
        } catch (error) {
          console.error("Club could not be created.", error);
          showCreateError("The club could not be created. Check your connection and Firestore security rules, then try again.");
        } finally {
          createButton.disabled = false;
        }
      });

      messageForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (sendButton.disabled) return;
        const text = messageInput.value.trim();
        if (!text || !activeClubId) return;

        sendButton.disabled = true;
        try {
          await addDoc(collection(database, "clubs", activeClubId, "messages"), {
            authorId: user.uid,
            authorName: localStorage.getItem("campusName") || user.displayName || "Campus member",
            text,
            createdAt: serverTimestamp()
          });
          messageInput.value = "";
          chatStatus.textContent = "";
        } catch (error) {
          console.error("Club message could not be sent.", error);
          chatStatus.textContent = "Your message could not be sent. Check your connection and Firestore security rules.";
        } finally {
          sendButton.disabled = false;
          messageInput.focus();
        }
      });
    }, (error) => {
      console.error("Campus club sign-in state could not be checked.", error);
      showListError("Your sign-in could not be verified. Reload the page or sign in again.");
    });
  } catch (error) {
    console.error("Campus clubs could not be initialized.", error);
    showListError("Clubs could not start. Check the Firebase configuration and try again.");
  }
}

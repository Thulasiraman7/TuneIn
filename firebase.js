import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
getAuth, 
GoogleAuthProvider, 
signInWithPopup 
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
getDatabase,
ref,
set,
get
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
 const firebaseConfig = {
    apiKey: "AIzaSyAnayBI1jbZhKm94XF9MvYVOf3JC9u-6iQ",
    authDomain: "justlisten-ba88e.firebaseapp.com",
    projectId: "justlisten-ba88e",
    storageBucket: "justlisten-ba88e.firebasestorage.app",
    messagingSenderId: "401255425596",
    appId: "1:401255425596:web:df843b0d63de8a4471c539",
    measurementId: "G-0FC4T26DWR"
  };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
window.db = db;
window.ref = ref;
window.set = set;
window.get = get;

const provider = new GoogleAuthProvider();

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {

  if (user) {
    window.currentUser = user;

    document.getElementById("defaultAvatar").style.display = "none";
    document.getElementById("signinOnly").style.display = "none";
    document.getElementById("userOnly").style.display = "block";

    document.getElementById("userName").innerText = user.displayName || "";
    document.getElementById("userMail").innerText = user.email || "";
    document.getElementById("topProfileImg").src = user.photoURL || "";
    document.getElementById("popupProfile").src = user.photoURL || "";

    const userRef = ref(db, "users/" + user.uid);
const snap = await get(userRef);

let existingData = {};

if (snap.exists()) {
  existingData = snap.val();
}

// Save/update the user's profile information while preserving existing data
await set(userRef, {
  ...existingData,

  name: user.displayName || "",
  email: user.email || "",
  profilePic: user.photoURL || "",

  savedSongs: existingData.savedSongs || [],

  friends: existingData.friends || {},

  sentRequests: existingData.sentRequests || {},

  receivedRequests: existingData.receivedRequests || {}
});

// Keep local copy
window.savedSongs = existingData.savedSongs || [];

updateSavedIcons();

  } else {
    // 🔴 THIS IS YOUR REAL SIGNOUT RESET
    window.currentUser = null;
    window.savedSongs = [];

    document.getElementById("signinOnly").style.display = "flex";
    document.getElementById("userOnly").style.display = "none";

    document.getElementById("defaultAvatar").style.display = "flex";

    document.getElementById("topProfileImg").src = "";
    document.getElementById("popupProfile").src = "";
    document.getElementById("userName").innerText = "";
    document.getElementById("userMail").innerText = "";

    document.getElementById("profilePopup").classList.remove("show");
  }
});

document.getElementById("signinOnly").onclick = async () => {
  await signInWithPopup(auth, provider);
};

import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.getElementById("signOutBtn").onclick = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.log(err);
  }
};

// 1. Get the elements from the page
const mainButton = document.getElementById("tuneInMainBtn");
const hiddenWindow = document.getElementById("tunedInModal");
const closeButton = document.getElementById("closeModalBtn");

// 2. When you click the "Tune In" button, make the window visible
mainButton.addEventListener("click", () => {
    hiddenWindow.style.display = "flex"; 
    console.log("Modal opened successfully!");
    
    // This loads your friends list right away when opened
    if (typeof loadTabItems === "function") {
        loadTabItems();
    }
});

// 3. When you click the ✕ button, hide the window again
closeButton.addEventListener("click", () => {
    hiddenWindow.style.display = "none";
});

// Tab Visual Highlight Switcher Logic
document.querySelectorAll(".tab-btn").forEach(button => {
    button.addEventListener("click", (e) => {
        // Reset all buttons to default dark theme state
        document.querySelectorAll(".tab-btn").forEach(btn => {
            btn.style.color = "#8e8e8e";
            btn.style.borderBottom = "none";
            btn.style.fontWeight = "normal";
        });
        
        // Highlight the clicked tab active blue style
        e.target.style.color = "#007bff";
        e.target.style.borderBottom = "3px solid #007bff";
        e.target.style.fontWeight = "bold";
        
        // Trigger data load logic hook updates
        if (typeof loadTabItems === "function") {
            // This updates our global variable tracker logic block
            currentTab = e.target.getAttribute("data-tab");
            document.getElementById("user-search-input").value = ""; 
            loadTabItems();
        }
    });
});

// Main function to draw a single user row in the list container
function renderUserRow(targetId, userData, relationship, isSearching = false) {
    const listContainer = document.getElementById("list-render-container");
    
    const item = document.createElement("div");
    item.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #242424;";
    
    // Set fallback if user has no uploaded profile image link
    const profilePic = userData.profilePic || "https://placeholder.com";
    const name = userData.name || "Unknown User";

    let rightSideHTML = "";

    // Determine the button based on the relationship state
    if (relationship === "none") {
        rightSideHTML = `<button class="action-trigger" data-action="tune" data-id="${targetId}" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 14px;">Tune In</button>`;
    } else if (relationship === "sent") {
        rightSideHTML = `<button class="action-trigger" data-action="cancel" data-id="${targetId}" style="background: #3a3a3a; color: #b3b3b3; border: none; padding: 8px 16px; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 14px;">Sent</button>`;
    } else if (relationship === "received") {

    rightSideHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <button class="action-trigger" data-action="accept" data-id="${targetId}" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 14px;">Tune In</button>

            <button class="action-trigger" data-action="decline" data-id="${targetId}" style="background: #242424; color: #ff4d4d; border: 1px solid #3a3a3a; width: 32px; height: 32px; border-radius: 50%; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px;">✕</button>
        </div>`;

} else if (relationship === "friends") {

    rightSideHTML = `<button class="action-trigger"
        data-action="remove"
        data-id="${targetId}"
        style="background:#3a3a3a;color:#ff4d4d;border:none;padding:8px 16px;border-radius:20px;font-weight:bold;cursor:pointer;font-size:14px;">
        Remove
    </button>`;

}

    item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 14px;">
            <img src="${profilePic}" alt="avatar" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; background: #242424; border: 1px solid #3a3a3a;">
            <div style="display:flex;flex-direction:column;">
    <span style="font-weight:600;font-size:16px;color:white;">
        ${name}
    </span>

    <span style="font-size:13px;color:#9ca3af;">
        ${userData.email || ""}
    </span>
</div>
        </div>
        <div>${rightSideHTML}</div>
    `;

    item.querySelectorAll(".action-trigger").forEach(btn => {

    btn.onclick = async () => {

        const action = btn.dataset.action;
        const targetUid = btn.dataset.id;

        await handleAction(action, targetUid);

    };

});

    listContainer.appendChild(item);

}
// =======================================================
// Tune In Helper Functions
// =======================================================

let currentTab = "friends";
let searchTimer = null;

// Returns the current logged-in user's complete data
async function getMyData() {

    if (!window.currentUser) return null;

    const snap = await get(ref(db, "users/" + window.currentUser.uid));

    if (!snap.exists()) return null;

    return snap.val();
}


// Returns ALL users from Firebase
async function getAllUsers() {

    const snap = await get(ref(db, "users"));

    if (!snap.exists()) return {};

    return snap.val();

}


// Relationship detector
function getRelationship(myData, targetUid) {

    if (!myData)
        return "none";

    if (myData.friends && myData.friends[targetUid])
        return "friends";

    if (myData.sentRequests && myData.sentRequests[targetUid])
        return "sent";

    if (myData.receivedRequests && myData.receivedRequests[targetUid])
        return "received";

    return "none";
}

// =======================================================
// Live User Search
// =======================================================

async function searchUsers(searchText) {

    const listContainer = document.getElementById("list-render-container");

    listContainer.innerHTML = "";

    searchText = searchText.trim().toLowerCase();

    if (searchText === "") {
        loadTabItems();
        return;
    }

    const myData = await getMyData();
    const users = await getAllUsers();

    for (const uid in users) {

        // Don't show yourself
        if (uid === window.currentUser.uid)
            continue;

        const user = users[uid];

        const name = (user.name || "").toLowerCase();
        const email = (user.email || "").toLowerCase();

        if (
            name.includes(searchText) ||
            email.includes(searchText)
        ) {

            const relationship = getRelationship(myData, uid);

            renderUserRow(
                uid,
                user,
                relationship,
                true
            );

        }

    }

}

document.getElementById("user-search-input").addEventListener("input", (e) => {

    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {

        searchUsers(e.target.value);

    }, 300);

});

// =======================================================
// Load Friends / Sent / Received Tabs
// =======================================================

async function loadTabItems() {

    console.log("loadTabItems()", currentTab, Date.now());

    const listContainer = document.getElementById("list-render-container");

    listContainer.innerHTML = "";

    if (!window.currentUser) return;

    const myData = await getMyData();

    if (!myData) return;

    const allUsers = await getAllUsers();

    let ids = [];

    if (currentTab === "friends") {

        ids = Object.keys(myData.friends || {});

    } else if (currentTab === "sent") {

        ids = Object.keys(myData.sentRequests || {});

    } else {

        ids = Object.keys(myData.receivedRequests || {});
    }

    ids.forEach(uid => {

        if (!allUsers[uid]) return;

        renderUserRow(

            uid,

            allUsers[uid],

            getRelationship(myData, uid),

            false

        );

    });

}

// =======================================================
// Handle Tune In Actions
// =======================================================

async function handleAction(action, targetUid) {

    if (!window.currentUser) return;

    const myUid = window.currentUser.uid;

    const myRef = ref(db, "users/" + myUid);
    const targetRef = ref(db, "users/" + targetUid);

    const mySnap = await get(myRef);
    const targetSnap = await get(targetRef);

    if (!mySnap.exists() || !targetSnap.exists()) return;

    const me = mySnap.val();
    const target = targetSnap.val();

    me.friends = me.friends || {};
    me.sentRequests = me.sentRequests || {};
    me.receivedRequests = me.receivedRequests || {};

    target.friends = target.friends || {};
    target.sentRequests = target.sentRequests || {};
    target.receivedRequests = target.receivedRequests || {};

    // ---------------- SEND ----------------

    if (action === "tune") {

        me.sentRequests[targetUid] = true;
        target.receivedRequests[myUid] = true;

    }

    // ---------------- CANCEL ----------------

    if (action === "cancel") {

        delete me.sentRequests[targetUid];
        delete target.receivedRequests[myUid];

    }

    // ---------------- ACCEPT ----------------

    if (action === "accept") {

        delete me.receivedRequests[targetUid];
        delete target.sentRequests[myUid];

        me.friends[targetUid] = true;
        target.friends[myUid] = true;

    }

    // ---------------- DECLINE ----------------

    if (action === "decline") {

        delete me.receivedRequests[targetUid];
        delete target.sentRequests[myUid];

    }

    // ---------------- REMOVE FRIEND ----------------

     if (action === "remove") {

    delete me.friends[targetUid];
    delete target.friends[myUid];

    }

    await set(myRef, me);
    await set(targetRef, target);

    // Refresh current screen instantly

    const search = document.getElementById("user-search-input").value.trim();

    if (search.length > 0) {

        searchUsers(search);

    } else {

        loadTabItems();

    }

}

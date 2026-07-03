let songs = [];
function shuffleSongs(arr){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
window.currentUser = null;
window.savedSongs = [];
let isSavedPage = false;
let currentPlaylist = [];
let currentIndex = 0;
let openedFrom = "home";
let isDragging = false;
let startY = 0;

const audio = document.getElementById("audio");

const playBtn = document.getElementById("playBtn");
const fullPlayBtn = document.getElementById("fullPlayBtn");

const progressContainer = document.getElementById("progressContainer");
const progress = document.getElementById("progress");
const hoverTime = document.getElementById("hoverTime");

const footerTitle = document.getElementById("footerTitle");
const footerArtist = document.getElementById("footerArtist");
const footerCover = document.getElementById("footerCover");

const fullTitle = document.getElementById("fullTitle");
const fullArtist = document.getElementById("fullArtist");
const fullCover = document.getElementById("fullCover");
const coverBg = document.getElementById("coverBg");

const miniProgress = document.getElementById("miniProgress");

const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const songList = document.getElementById("songList");

const fullPlayer = document.getElementById("fullPlayer");

const saveBtn = document.getElementById("saveBtn");
const fullSaveBtn = document.getElementById("fullSaveBtn");

const fullLoopBtn = document.getElementById("fullLoopBtn");


const profileBtn = document.getElementById("profileBtn");
const profilePopup = document.getElementById("profilePopup");

const signinOnly = document.getElementById("signinOnly");
const userOnly = document.getElementById("userOnly");

// open / close popup
profileBtn.onclick = (e) => {
  e.stopPropagation(); // prevent immediate close
  profilePopup.classList.toggle("show");
};
  // click anywhere else closes popup
document.addEventListener("click", (e) => {
  if (!profilePopup.contains(e.target) && !profileBtn.contains(e.target)) {
    profilePopup.classList.remove("show");
  }
});


async function loadSongsFromCloud(){

const res = await fetch("https://pub-46b3e229122a4c9ea7141f6920559012.r2.dev/songs.json");

songs = await res.json();
shuffleSongs(songs);

currentPlaylist = songs;
currentIndex = 0;

buildSongList();

loadSong(0);

}

function updateIcons(){

const icon = audio.paused ? "▶" : "⏸";

playBtn.textContent = icon;
fullPlayBtn.textContent = icon;

}

audio.onplay = updateIcons;
audio.onpause = updateIcons;

function loadSong(i){
  const s = currentPlaylist[i] || songs[i];
  if(!s) return;

updateIcons();

audio.src = s.url;

footerTitle.textContent = s.title;
footerArtist.textContent = s.artist;
footerCover.src = s.cover;

fullTitle.textContent = s.title;
fullArtist.textContent = s.artist;
fullCover.src = s.cover;

coverBg.src = s.cover;

updateSavedIcons();

}

function togglePlay(){
  audio.paused ? audio.play() : audio.pause();
}


async function toggleSave(){

if(!window.currentUser) return;

if(!songs[currentIndex]) return;

const songId = currentPlaylist[currentIndex].url;

if(window.savedSongs.includes(songId)){

window.savedSongs =
window.savedSongs.filter(id => id !== songId);

}else{

window.savedSongs.push(songId);

}

updateSavedIcons();

await window.set(
window.ref(window.db,
"users/" + window.currentUser.uid),
{
savedSongs: window.savedSongs
}
);

}

function updateSavedIcons(){

if(!songs[currentIndex]) return;

const songId = currentPlaylist[currentIndex].url;

const liked = window.savedSongs.includes(songId);

saveBtn.classList.toggle("saved-active", liked);

fullSaveBtn.classList.toggle("saved-active", liked);

saveBtn.textContent = liked ? "✦" : "⟡";

fullSaveBtn.textContent = liked ? "✦" : "⟡";

}

// Inside script.js (at the very bottom or right after the function definition)
window.updateSavedIcons = updateSavedIcons;


function toggleLoop(){

audio.loop = !audio.loop;


fullLoopBtn.classList.toggle("loop-active");

}

saveBtn.onclick = toggleSave;
fullSaveBtn.onclick = toggleSave;


fullLoopBtn.onclick = toggleLoop;

function nextSong(){

currentIndex = (currentIndex + 1) % currentPlaylist.length;

const song = currentPlaylist[currentIndex];

const realIndex = songs.findIndex(s => s.url === song.url);

loadSong(realIndex);
audio.play();

}

function prevSong(){

currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;

const song = currentPlaylist[currentIndex];

const realIndex = songs.findIndex(s => s.url === song.url);

loadSong(realIndex);
audio.play();

}


audio.addEventListener("ended", nextSong);

progressContainer.onclick = (e)=>{

const rect = progressContainer.getBoundingClientRect();

let percent = (e.clientX - rect.left) / rect.width;

audio.currentTime = percent * audio.duration;

};

function format(sec){

let m = Math.floor(sec / 60) || 0;

let s = Math.floor(sec % 60) || 0;

return m + ":" + s.toString().padStart(2,"0");

}

function openPlayer(){

fullPlayer.style.display = "flex";

history.pushState({playerOpen:true}, "");

}

function closePlayer(){

fullPlayer.style.display = "none";

// 🔥 go back based on where song was opened
if(openedFrom === "saved"){
  isSavedPage = true;
  document.getElementById("savedHeader").style.display = "block";
  renderSavedSongs();
} else {
  isSavedPage = false;
  document.getElementById("savedHeader").style.display = "none";
  buildSongList();
}

}

openFull.onclick = openPlayer;

footerCover.onclick = openPlayer;

function buildSongList(){

songList.innerHTML = "";

songs.forEach((song,i)=>{

const card = document.createElement("div");

card.className = "song-card";

card.innerHTML =
"<img src='"+song.cover+"'>" +
"<div>" +
"<div class='song-title'>" + song.title + "</div>" +
"<div class='artist'>" + song.artist + "</div>" +
"</div>";

card.onclick = ()=>{

openedFrom = "home";

currentPlaylist = songs;

isSavedPage = false;
document.getElementById("savedHeader").style.display = "none";

currentIndex = i;

loadSong(i);
audio.play();

};
songList.appendChild(card);

});

}

loadSongsFromCloud();

function renderSavedSongs(){

songList.innerHTML = "";

// only saved songs
const saved = songs.filter(s =>
  window.savedSongs.includes(s.url)
);

if(saved.length === 0){
  songList.innerHTML = "<p style='color:#aaa;text-align:center'>No saved songs</p>";
  return;
}

saved.forEach((song)=>{

const card = document.createElement("div");
card.className = "song-card";

card.innerHTML =
"<img src='"+song.cover+"'>" +
"<div>" +
"<div class='song-title'>" + song.title + "</div>" +
"<div class='artist'>" + song.artist + "</div>" +
"</div>";

card.onclick = ()=>{

openedFrom = "saved";

currentPlaylist = songs.filter(s =>
  window.savedSongs.includes(s.url)
);

currentIndex = currentPlaylist.findIndex(s => s.url === song.url);

loadSong(currentIndex);
audio.play();

};

songList.appendChild(card);

});

}

/* SEARCH */

document.getElementById("searchInput").addEventListener("input",(e)=>{

const query = e.target.value.toLowerCase();

[...songList.children].forEach(card=>{

const text = card.innerText.toLowerCase();

card.style.display = text.includes(query) ? "flex" : "none";

});

});



/* DESKTOP DRAG */

progressContainer.addEventListener("mousedown",()=>{

isDragging = true;

});

document.addEventListener("mouseup",()=>{

isDragging = false;

hoverTime.style.display = "none";

});

let dragRAF = null;

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const rect = progressContainer.getBoundingClientRect();
  let percent = (e.clientX - rect.left) / rect.width;

  percent = Math.max(0, Math.min(1, percent));

  const time = percent * audio.duration;

  // cancel previous frame (prevents lag)
  if (dragRAF) cancelAnimationFrame(dragRAF);

  dragRAF = requestAnimationFrame(() => {
    audio.currentTime = time;

    progress.style.width = percent * 100 + "%";
    miniProgress.style.width = percent * 100 + "%";

    const formatted = format(time);

    currentTime.textContent = formatted;

    hoverTime.style.display = "block";
    hoverTime.style.left =
      percent * progressContainer.offsetWidth + "px";
    hoverTime.textContent = formatted;
  });
});

/* MOBILE DRAG */

fullPlayer.addEventListener("touchstart",(e)=>{

if(isDragging) return;

startY = e.touches[0].clientY;

});

fullPlayer.addEventListener("touchmove",(e)=>{

if(isDragging) return;

if(e.touches[0].clientY - startY > 120){

closePlayer();

}

});

progressContainer.addEventListener("touchstart",()=>{

isDragging = true;

});

document.addEventListener("touchend",()=>{

isDragging = false;

hoverTime.style.display = "none";

});

let touchRAF = null;

document.addEventListener("touchmove", (e) => {
  if (!isDragging) return;

  const rect = progressContainer.getBoundingClientRect();
  let percent = (e.touches[0].clientX - rect.left) / rect.width;

  percent = Math.max(0, Math.min(1, percent));

  const time = percent * audio.duration;

  if (touchRAF) cancelAnimationFrame(touchRAF);

  touchRAF = requestAnimationFrame(() => {
    audio.currentTime = time;

    progress.style.width = percent * 100 + "%";
    miniProgress.style.width = percent * 100 + "%";

    const formatted = format(time);

    currentTime.textContent = formatted;

    hoverTime.style.display = "block";
    hoverTime.style.left =
      percent * progressContainer.offsetWidth + "px";
    hoverTime.textContent = formatted;
  });
});
/* MOBILE BACK BUTTON */

window.addEventListener("popstate",()=>{

if(fullPlayer.style.display === "flex"){
  fullPlayer.style.display = "none";

  // 🔥 return to correct page
  if(openedFrom === "saved"){
    isSavedPage = true;
    document.getElementById("savedHeader").style.display = "block";
    renderSavedSongs();
  } else {
    isSavedPage = false;
    document.getElementById("savedHeader").style.display = "none";
    buildSongList();
  }
}

});

audio.addEventListener("timeupdate", () => {
  if (isDragging) return;
  if (!audio.duration) return;

  const percent = (audio.currentTime / audio.duration) * 100;

  miniProgress.style.width = percent + "%";
  progress.style.width = percent + "%";

  currentTime.textContent = format(audio.currentTime);
  duration.textContent = format(audio.duration);
});


audio.addEventListener("loadedmetadata", () => {
  duration.textContent = format(audio.duration);
});

document.getElementById("backFromSaved").onclick = () => {
  isSavedPage = false;
  document.getElementById("savedHeader").style.display = "none";
  buildSongList();
};

document.getElementById("openSaved").onclick = () => {
  isSavedPage = true;

  document.getElementById("savedHeader").style.display = "block";

  profilePopup.classList.remove("show");

  renderSavedSongs();
};

window.prevSong = prevSong;
window.togglePlay = togglePlay;
window.nextSong = nextSong;
window.closePlayer = closePlayer;

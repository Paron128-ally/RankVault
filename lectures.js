let currentFilter = "All";
let currentLecture = LECTURES[0] || null;
let elapsed = 0;
let totalSeconds = 0;
let playing = false;
let speed = 1;
let saveTimer = null;
let progressSyncTimer = null;
let ytPlayer = null;
let ytPlayerReady = false;
let pendingAutoplay = false;
let playerInitializationAttempted = false;
let fallbackIframeMode = false;

function parseDuration(d){
  if (!d || d === "LIVE") return 0;
  if (typeof d === "number") return Math.max(0, d);
  const text = String(d).trim();
  if (!text) return 0;
  const parts = text.split(":").map((p) => Number(p.trim()));
  if (parts.some((p) => Number.isNaN(p))) return 0;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length >= 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function formatTime(sec){
  sec = Math.max(0, Math.floor(sec));
  const hours = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;
  if (hours > 0) return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function parseTimeParam(value){
  if (!value) return "";
  const text = String(value).trim().toLowerCase();
  if (/^\d+$/.test(text)) return text;
  let total = 0;
  const h = text.match(/(\d+)h/);
  const m = text.match(/(\d+)m/);
  const s = text.match(/(\d+)s/);
  if (h) total += Number(h[1]) * 3600;
  if (m) total += Number(m[1]) * 60;
  if (s) total += Number(s[1]);
  return String(total);
}

function extractVideoId(raw){
  if (!raw) return "";
  const value = String(raw).trim();
  if (!value) return "";

  if (value.includes("youtube.com") || value.includes("youtu.be")) {
    try {
      const url = new URL(value.startsWith("http") ? value : `https://${value}`);
      const videoId = url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop();
      if (/^[A-Za-z0-9_-]{11}$/.test(videoId)) return videoId;
    } catch (e) {
      // fall through to fallback parsing below
    }
  }

  const match = value.match(/([A-Za-z0-9_-]{11})/);
  return match ? match[1] : "";
}

function renderFilters(){
  const subjects = ["All", ...new Set(LECTURES.map((l) => l.subject))];
  document.getElementById("subject-filter").innerHTML = subjects.map((s) =>
    `<button class="tab-btn ${s === currentFilter ? "active" : ""}" onclick="setFilter('${s}')">${s}</button>`
  ).join("");
}

function setFilter(s){ currentFilter = s; renderFilters(); renderList(); }

function renderList(){
  const items = LECTURES.filter((l) => currentFilter === "All" || l.subject === currentFilter);
  document.getElementById("lecture-list").innerHTML = items.map((l) => {
    const total = parseDuration(l.duration);
    const pct = total ? Math.min(100, (l.watched / total) * 100) : 0;
    return `
      <div class="lec-list-item ${l.id === currentLecture?.id ? "active" : ""}" onclick="loadLecture('${l.id}')">
        <div class="lec-thumb">${l.duration === "LIVE" ? "●" : "▶"}</div>
        <div class="lec-info" style="flex:1;">
          <div class="t">${l.title}</div>
          <div class="m">${l.subject} · ${l.chapter} · ${l.duration === "LIVE" ? l.recordedOn : l.duration}</div>
          ${l.tag ? `<span class="tag ${l.tag === "Live in 2h" ? "tag-live" : l.tag === "New" ? "tag-new" : "tag-upcoming"}" style="margin-top:5px;">${l.tag}</span>` : ""}
          ${l.watched > 0 && l.duration !== "LIVE" ? `<div class="progress-track" style="margin-top:6px;"><div class="progress-fill" style="width:${pct.toFixed(0)}%;"></div></div>` : ""}
        </div>
      </div>
    `;
  }).join("");
}

function updatePlaybackButtons(){
  const playBtn = document.getElementById("play-btn");
  const ctrlPlay = document.getElementById("ctrl-play");
  if (playBtn) playBtn.style.display = playing ? "none" : "flex";
  if (ctrlPlay) ctrlPlay.textContent = playing ? "❚❚" : "▶";
}

function syncPlayerGlobals(){
  window.LECTURE_YT_PLAYER = ytPlayer;
  window.LECTURE_YT_READY = ytPlayerReady;
  window.LECTURE_CURRENT_LECTURE = currentLecture;
}

function initializePlayer(lecture = currentLecture){
  if (playerInitializationAttempted) return null;

  const playerContainer = document.getElementById("youtube-player");
  if (!playerContainer) return null;

  playerInitializationAttempted = true;
  fallbackIframeMode = true;

  const targetLecture = lecture || currentLecture;
  const videoId = targetLecture ? extractVideoId(targetLecture.youtube_url || targetLecture.youtube_id || targetLecture.youtube || "") : "";
  if (videoId) {
    const src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&playsinline=1&autoplay=0`;
    playerContainer.src = src;
    playerContainer.style.display = "block";
  }
  syncPlayerGlobals();
  return null;
}

function ensureYouTubePlayer(callback){
  if (ytPlayer && ytPlayerReady) {
    syncPlayerGlobals();
    if (callback) callback(ytPlayer);
    return ytPlayer;
  }

  if (fallbackIframeMode) {
    if (callback) callback(null);
    return null;
  }

  const player = initializePlayer();
  if (player) {
    syncPlayerGlobals();
    if (callback) callback(player);
    return player;
  }

  if (callback) window.setTimeout(() => ensureYouTubePlayer(callback), 200);
  return null;
}

function mountVideoFrame(videoId, startAt = 0){
  const oldFrame = document.getElementById("youtube-player");
  if (!oldFrame) return null;

  const nextFrame = document.createElement("iframe");
  nextFrame.id = "youtube-player";
  nextFrame.title = "Lecture video";
  nextFrame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  nextFrame.allowFullscreen = true;
  nextFrame.setAttribute("allowfullscreen", "");
  nextFrame.style.display = "block";
  nextFrame.src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&playsinline=1&start=${startAt}`;
  oldFrame.replaceWith(nextFrame);
  return nextFrame;
}

function loadLectureVideo(lecture){
  if (!lecture || lecture.duration === "LIVE") return;
  currentLecture = lecture;
  const videoId = extractVideoId(lecture.youtube_url || lecture.youtube_id || lecture.youtube || "");
  if (!videoId) return;

  const startAt = elapsed > 0 ? elapsed : 0;
  const playerContainer = mountVideoFrame(videoId, startAt);
  if (playerContainer) {
    playerContainer.style.display = "block";
    updatePlaybackButtons();
  }

  if (ytPlayer && typeof ytPlayer.destroy === "function") {
    ytPlayer.destroy();
  }
  ytPlayer = null;
  ytPlayerReady = false;
  playerInitializationAttempted = false;
  fallbackIframeMode = true;
}

function handlePlayerStateChange(event){
  if (!currentLecture || currentLecture.duration === "LIVE") return;
  if (event.data === window.YT.PlayerState.PLAYING) {
    playing = true;
    updatePlaybackButtons();
    if (!progressSyncTimer) {
      progressSyncTimer = window.setInterval(syncPlaybackProgress, 1000);
    }
  } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.CUED) {
    playing = false;
    updatePlaybackButtons();
  } else if (event.data === window.YT.PlayerState.ENDED) {
    playing = false;
    elapsed = totalSeconds;
    updatePlaybackButtons();
    updatePlayerUI();
    saveProgress();
  }
}

function syncPlaybackProgress(){
  if (!currentLecture || currentLecture.duration === "LIVE") return;
  if (!ytPlayerReady || !ytPlayer || typeof ytPlayer.getCurrentTime !== "function") return;

  const now = ytPlayer.getCurrentTime();
  if (!Number.isFinite(now)) return;
  elapsed = now;
  if (totalSeconds <= 0 && typeof ytPlayer.getDuration === "function") {
    const duration = ytPlayer.getDuration();
    if (duration > 0) totalSeconds = duration;
  }
  if (totalSeconds > 0 && elapsed >= totalSeconds) {
    elapsed = totalSeconds;
    pausePlayback();
    return;
  }
  updatePlayerUI();
}

function loadLecture(id){
  pausePlayback();
  currentLecture = LECTURES.find((m) => m.id === id) || LECTURES[0];
  if (!currentLecture) return;

  totalSeconds = parseDuration(currentLecture.duration);
  elapsed = Math.min(currentLecture.watched || 0, totalSeconds);

  document.getElementById("lec-chapter").textContent = `${currentLecture.subject} · ${currentLecture.chapter}`;
  document.getElementById("lec-title").textContent = currentLecture.title;
  document.getElementById("lec-faculty").textContent = `${currentLecture.faculty} · ${currentLecture.duration === "LIVE" ? currentLecture.recordedOn : "Recorded " + currentLecture.recordedOn}`;
  document.getElementById("secure-text").textContent = `Secure playback for ${STUDENT_ENROLLMENT} — ${STUDENT_NAME}`;
  document.getElementById("watermark").innerHTML = `${STUDENT_ENROLLMENT} · ${STUDENT_NAME} · <span id="wm-time"></span>`;

  const frame = document.getElementById("player-frame");
  const controls = document.getElementById("player-controls");
  const resumeNote = document.getElementById("resume-note");
  const playBtn = document.getElementById("play-btn");
  const ytFrame = document.getElementById("youtube-player");

  resumeNote.style.display = "none";
  document.getElementById("live-message").style.display = "none";
  playBtn.style.display = "none";
  frame.classList.remove("live");
  controls.style.display = "flex";
  if (ytFrame) ytFrame.style.display = "none";

  if (currentLecture.duration === "LIVE") {
    frame.classList.add("live");
    controls.style.display = "none";
    document.getElementById("live-message").style.display = "block";
    document.getElementById("live-message-text").textContent = currentLecture.recordedOn;
  } else {
    frame.classList.remove("live");
    if (ytFrame) {
      if (elapsed > 0) {
        resumeNote.style.display = "block";
        resumeNote.textContent = `▶ Resuming from ${formatTime(elapsed)} — saved to your profile last time you watched.`;
      }
      ytFrame.style.display = "block";
      loadLectureVideo(currentLecture);
    }
  }

  updatePlayerUI();
  renderList();
}

function togglePlay(){
  if (currentLecture.duration === "LIVE") return;
  playing ? pausePlayback() : startPlayback();
}

function startPlayback(){
  if (!currentLecture || currentLecture.duration === "LIVE") return;
  if (totalSeconds > 0 && elapsed >= totalSeconds) return;
  playing = true;
  updatePlaybackButtons();
  if (fallbackIframeMode) {
    playing = true;
    updatePlaybackButtons();
    return;
  }

  if (ytPlayerReady && ytPlayer) {
    ytPlayer.playVideo();
  } else {
    pendingAutoplay = true;
  }
  if (!progressSyncTimer) {
    progressSyncTimer = window.setInterval(syncPlaybackProgress, 1000);
  }
  saveTimer = window.setInterval(saveProgress, 8000);
}

function pausePlayback(){
  playing = false;
  clearInterval(progressSyncTimer);
  progressSyncTimer = null;
  clearInterval(saveTimer);
  saveTimer = null;
  updatePlaybackButtons();
  if (fallbackIframeMode) {
    return;
  }

  if (ytPlayerReady && ytPlayer && typeof ytPlayer.pauseVideo === "function") {
    ytPlayer.pauseVideo();
  }
  saveProgress();
}

function updatePlayerUI(){
  document.getElementById("time-elapsed").textContent = formatTime(elapsed);
  document.getElementById("time-total").textContent = formatTime(totalSeconds);
  document.getElementById("scrub-fill").style.width = totalSeconds ? `${(elapsed / totalSeconds) * 100}%` : "0%";
  const wm = document.getElementById("wm-time");
  if (wm) wm.textContent = new Date().toLocaleTimeString();
}

function seek(e){
  if (currentLecture.duration === "LIVE") return;
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  elapsed = Math.max(0, Math.min(totalSeconds, pct * totalSeconds));
  if (fallbackIframeMode) {
    const playerContainer = document.getElementById("youtube-player");
    if (playerContainer) {
      playerContainer.src = `${playerContainer.src.split("start=")[0]}start=${Math.floor(elapsed)}`;
    }
    return;
  }

  if (ytPlayerReady && ytPlayer && typeof ytPlayer.seekTo === "function") {
    ytPlayer.seekTo(elapsed, true);
  }
  updatePlayerUI();
  saveProgress();
}

function cycleSpeed(){
  speed = speed === 1 ? 1.25 : speed === 1.25 ? 1.5 : 1;
  document.getElementById("speed-btn").textContent = speed + "×";
  if (fallbackIframeMode) {
    return;
  }

  if (ytPlayerReady && ytPlayer && typeof ytPlayer.setPlaybackRate === "function") {
    ytPlayer.setPlaybackRate(speed);
  }
}

function markWatched(){
  currentLecture.watched = totalSeconds;
  elapsed = totalSeconds;
  updatePlayerUI();
  renderList();
  saveProgress();
}

function saveProgress(){
  if (!currentLecture || currentLecture.duration === "LIVE") return;
  currentLecture.watched = Math.round(elapsed);
  fetch("/api/lecture-progress", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ lecture_id: currentLecture.id, watched_sec: Math.round(elapsed) })
  }).catch(() => { /* offline — will sync next save */ });
}

if (document.getElementById("player-frame")) {
  document.getElementById("player-frame").addEventListener("contextmenu", (e) => e.preventDefault());
}
window.addEventListener("beforeunload", saveProgress);

// No YouTube iframe API is used for this page. Direct embeds load by video ID or URL.

renderFilters();
renderList();
if (currentLecture) {
  loadLecture(currentLecture.id);
}

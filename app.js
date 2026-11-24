// app.js — Główna logika aplikacji połączona z firebase-service.js i lessons.js
import {
  registerUser,
  loginUser,
  logoutUser,
  saveMissionResult,
  saveTimeTrialResult,
  saveHangarSet,
  deleteHangarSet,
  watchAuthState
} from "./firebase-service.js";
import { MODULES } from "./lessons.js";

// --- STAN APLIKACJI ---
let currentUser = null; // { uid, profile, isDemo }
let authMode = "login";
let soundEnabled = true;

let activeMission = null;
let targetText = "";
let currentIndex = 0;
let correctChars = 0;
let errorCount = 0;
let combo = 0;
let maxCombo = 0;
let startTime = null;

// --- STAN WYZWANIA CZASOWEGO 60S ---
let ttTimerInterval = null;
let ttSecondsLeft = 60;
let ttPool = [];
let ttDifficulty = "basic";

function stopTimeTrialTimer() {
  if (ttTimerInterval) {
    clearInterval(ttTimerInterval);
    ttTimerInterval = null;
  }
}

// --- SYNTEZATOR DŹWIĘKU (WEB AUDIO API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type = "sine", duration = 0.05, volume = 0.08) {
  if (!soundEnabled) return;
  if (audioCtx.state === "suspended") audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

const sfx = {
  tick: () => playTone(520, "triangle", 0.035, 0.06),
  error: () => playTone(140, "sawtooth", 0.12, 0.09),
  win: () => {
    playTone(523, "sine", 0.12, 0.1);
    setTimeout(() => playTone(659, "sine", 0.12, 0.1), 110);
    setTimeout(() => playTone(784, "sine", 0.25, 0.12), 220);
  }
};

// --- DEFINICJA WIRTUALNEJ KLAWIATURY I STREF PALCÓW ---
const KEYBOARD_ROWS = [
  [
    { code: "1", label: "1", finger: "f-pinky" },
    { code: "2", label: "2", finger: "f-ring" },
    { code: "3", label: "3", finger: "f-middle" },
    { code: "4", label: "4", finger: "f-index-l" },
    { code: "5", label: "5", finger: "f-index-l" },
    { code: "6", label: "6", finger: "f-index-r" },
    { code: "7", label: "7", finger: "f-index-r" },
    { code: "8", label: "8", finger: "f-middle" },
    { code: "9", label: "9", finger: "f-ring" },
    { code: "0", label: "0", finger: "f-pinky" },
    { code: "-", label: "-", finger: "f-pinky" },
    { code: "=", label: "=", finger: "f-pinky" }
  ],
  [
    { code: "q", label: "Q", finger: "f-pinky" },
    { code: "w", label: "W", finger: "f-ring" },
    { code: "e", label: "E", finger: "f-middle" },
    { code: "r", label: "R", finger: "f-index-l" },
    { code: "t", label: "T", finger: "f-index-l" },
    { code: "y", label: "Y", finger: "f-index-r" },
    { code: "u", label: "U", finger: "f-index-r" },
    { code: "i", label: "I", finger: "f-middle" },
    { code: "o", label: "O", finger: "f-ring" },
    { code: "p", label: "P", finger: "f-pinky" }
  ],
  [
    { code: "a", label: "A", finger: "f-pinky" },
    { code: "s", label: "S", finger: "f-ring" },
    { code: "d", label: "D", finger: "f-middle" },
    { code: "f", label: "F", finger: "f-index-l", bump: true },
    { code: "g", label: "G", finger: "f-index-l" },
    { code: "h", label: "H", finger: "f-index-r" },
    { code: "j", label: "J", finger: "f-index-r", bump: true },
    { code: "k", label: "K", finger: "f-middle" },
    { code: "l", label: "L", finger: "f-ring" },
    { code: ";", label: "; :", finger: "f-pinky" }
  ],
  [
    { code: "ShiftLeft", label: "Shift L", finger: "f-pinky", width: "wide-15" },
    { code: "z", label: "Z", finger: "f-pinky" },
    { code: "x", label: "X", finger: "f-ring" },
    { code: "c", label: "C", finger: "f-middle" },
    { code: "v", label: "V", finger: "f-index-l" },
    { code: "b", label: "B", finger: "f-index-l" },
    { code: "n", label: "N", finger: "f-index-r" },
    { code: "m", label: "M", finger: "f-index-r" },
    { code: ",", label: ",", finger: "f-middle" },
    { code: ".", label: ".", finger: "f-ring" },
    { code: "/", label: "/ ?", finger: "f-pinky" },
    { code: "ShiftRight", label: "Shift P", finger: "f-pinky", width: "wide-15" }
  ],
  [
    { code: " ", label: "SPACJA", finger: "f-thumb", width: "space" },
    { code: "AltRight", label: "Prawy Alt", finger: "f-thumb", width: "wide-2" }
  ]
];

const POLISH_MAP = {
  "ą": "a", "ć": "c", "ę": "e", "ł": "l", "ń": "n", "ó": "o", "ś": "s", "ź": "x", "ż": "z"
};

const SHIFT_SYMBOL_MAP = {
  "!": "1", "@": "2", "#": "3", "$": "4", "%": "5", "&": "7", "*": "8", "(": "9", ")": "0",
  "+": "=", ":": ";", "?": "/"
};

const RIGHT_HAND_KEYS = new Set([
  "6", "7", "8", "9", "0", "-", "=",
  "y", "u", "i", "o", "p",
  "h", "j", "k", "l", ";",
  "n", "m", ",", ".", "/"
]);

function renderKeyboard() {
  const container = document.getElementById("virtual-keyboard");
  container.innerHTML = "";
  KEYBOARD_ROWS.forEach((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "kb-row";
    row.forEach((k) => {
      const keyEl = document.createElement("div");
      keyEl.className = `key ${k.finger} ${k.width || ""} ${k.bump ? "bump" : ""}`;
      keyEl.dataset.code = k.code;
      keyEl.textContent = k.label;
      rowDiv.appendChild(keyEl);
    });
    container.appendChild(rowDiv);
  });
}

function highlightKeysForChar(char) {
  document.querySelectorAll(".key.target").forEach((el) => el.classList.remove("target"));
  if (!char) return;

  const hintEl = document.getElementById("finger-hint");
  const lower = char.toLowerCase();
  const isUpper = char !== lower && /[A-ZĄĆĘŁŃÓŚŹŻ]/.test(char);
  let baseKey = lower;
  let needsAltGr = false;
  let needsShift = isUpper;

  if (POLISH_MAP[lower]) {
    baseKey = POLISH_MAP[lower];
    needsAltGr = true;
  } else if (SHIFT_SYMBOL_MAP[char]) {
    baseKey = SHIFT_SYMBOL_MAP[char];
    needsShift = true;
  }

  const targetEl = document.querySelector(`.key[data-code="${CSS.escape(baseKey)}"]`);
  if (targetEl) targetEl.classList.add("target");

  const modifiers = [];
  if (needsAltGr) {
    document.querySelector('.key[data-code="AltRight"]')?.classList.add("target");
    modifiers.push("Prawy Alt (kciuk)");
  }
  if (needsShift) {
    const shiftCode = RIGHT_HAND_KEYS.has(baseKey) ? "ShiftLeft" : "ShiftRight";
    document.querySelector(`.key[data-code="${shiftCode}"]`)?.classList.add("target");
    modifiers.push(shiftCode === "ShiftLeft" ? "Lewy Shift" : "Prawy Shift");
  }

  const displayChar = char === " " ? "SPACJA" : char;
  hintEl.innerHTML = modifiers.length
    ? `Naciśnij: <strong>${modifiers.join(" + ")} + ${displayChar}</strong>`
    : `Następny klawisz: <strong>${displayChar}</strong>`;
}

// --- LOGOWANIE I TRYB DEMO ---
const authForm = document.getElementById("auth-form");
const authError = document.getElementById("auth-error");

document.getElementById("tab-login").addEventListener("click", () => {
  authMode = "login";
  document.getElementById("tab-login").classList.add("active");
  document.getElementById("tab-register").classList.remove("active");
  document.getElementById("auth-submit").textContent = "Wejdź na pokład";
  authError.classList.add("hidden");
});

document.getElementById("tab-register").addEventListener("click", () => {
  authMode = "register";
  document.getElementById("tab-register").classList.add("active");
  document.getElementById("tab-login").classList.remove("active");
  document.getElementById("auth-submit").textContent = "Utwórz konto pilota";
  authError.classList.add("hidden");
});

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authError.classList.add("hidden");
  const login = document.getElementById("auth-login").value;
  const pass = document.getElementById("auth-password").value;

  try {
    const session = authMode === "register"
      ? await registerUser(login, pass)
      : await loginUser(login, pass);
    enterApp({ uid: session.uid, profile: session.profile, isDemo: false });
  } catch (err) {
    authError.textContent = err.message;
    authError.classList.remove("hidden");
  }
});

document.getElementById("btn-demo-mode").addEventListener("click", () => {
  const saved = JSON.parse(localStorage.getItem("akademia_demo_profile") || "null");
  const profile = saved || {
    login: "Kadet_Demo",
    rank: "Rekrut",
    xp: 0,
    unlockedMissions: ["1.1"],
    missions: {},
    hangarSets: [],
    history: [],
    timeTrialBest: { wpm: 0, accuracy: 0, chars: 0 }
  };
  enterApp({ uid: "demo", profile, isDemo: true });
});

watchAuthState((session) => {
  if (session && session.profile) {
    enterApp({ uid: session.uid, profile: session.profile, isDemo: false });
  }
});

document.getElementById("btn-logout").addEventListener("click", async () => {
  stopTimeTrialTimer();
  if (currentUser && !currentUser.isDemo) await logoutUser();
  currentUser = null;
  document.getElementById("app-shell").classList.add("hidden");
  document.getElementById("auth-screen").classList.remove("hidden");
});

function enterApp(userObj) {
  currentUser = userObj;
  document.getElementById("auth-screen").classList.add("hidden");
  document.getElementById("app-shell").classList.remove("hidden");
  renderKeyboard();
  refreshUI();
  switchView("campaign");
}

// --- NAWIGACJA WIDOKÓW ---
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchView(btn.dataset.view));
});

function switchView(viewName) {
  if (viewName !== "arena") stopTimeTrialTimer();

  document.querySelectorAll(".nav-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === viewName);
  });
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  document.getElementById(`view-${viewName}`).classList.add("active");

  if (viewName === "campaign") renderCampaign();
  if (viewName === "timetrial") renderTimeTrial();
  if (viewName === "hangar") renderHangar();
  if (viewName === "stats") renderStats();
}

function refreshUI() {
  const p = currentUser.profile;
  document.getElementById("hud-rank").textContent = p.rank;
  document.getElementById("hud-login").textContent = p.login;
  document.getElementById("hud-xp").textContent = `${p.xp} XP`;
  renderCampaign();
}

// --- RENDEROWANIE MAPY MISJI ---
function renderCampaign() {
  const container = document.getElementById("modules-container");
  const p = currentUser.profile;
  container.innerHTML = "";

  MODULES.forEach((mod) => {
    const modEl = document.createElement("div");
    modEl.className = "module-card";
    modEl.innerHTML = `
      <div class="module-title-row">
        <h3>${mod.title}</h3>
        <span class="module-keys">${mod.keysLabel}</span>
      </div>
      <div class="missions-row"></div>
    `;

    const row = modEl.querySelector(".missions-row");
    mod.missions.forEach((m) => {
      const unlocked = p.unlockedMissions.includes(m.id);
      const record = p.missions[m.id];
      const starsCount = record ? record.stars : 0;
      const starsStr = "★".repeat(starsCount) + "☆".repeat(3 - starsCount);

      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = `mission-tile ${unlocked ? "" : "locked"} ${m.boss ? "boss" : ""}`;
      tile.innerHTML = `
        <div class="mission-top">
          <span>${unlocked ? (m.boss ? "BOSS" : "MISJA") : "🔒 ZABLOKOWANA"}</span>
          <span class="stars">${starsStr}</span>
        </div>
        <div class="mission-name">${m.title}</div>
        <div class="mission-best">${record ? `Rekord: ${record.bestWpm} WPM (${record.bestAccuracy}%)` : `Cel: min. 93% celności`}</div>
      `;

      if (unlocked) {
        tile.addEventListener("click", () => startMission(m, mod.title));
      }
      row.appendChild(tile);
    });

    container.appendChild(modEl);
  });
}

// --- SILNIK LEKCJI I PISANIA ---
const hiddenInput = document.getElementById("hidden-input");
const typingBox = document.getElementById("typing-box");

typingBox.addEventListener("click", () => hiddenInput.focus());
document.getElementById("btn-exit-arena").addEventListener("click", () => {
  const backTarget = activeMission?.isTimeTrial ? "timetrial" : "campaign";
  switchView(backTarget);
});

function startMission(mission, moduleLabel) {
  stopTimeTrialTimer();
  document.getElementById("metric-time-box").classList.add("hidden");
  document.getElementById("shield-bar-fill").classList.remove("danger");

  const pool = mission.texts || [mission.text];
  const candidates = pool.length > 1 ? pool.filter((t) => t !== targetText) : pool;
  targetText = candidates[Math.floor(Math.random() * candidates.length)];

  activeMission = mission;
  currentIndex = 0;
  correctChars = 0;
  errorCount = 0;
  combo = 0;
  maxCombo = 0;
  startTime = null;

  document.getElementById("arena-module-tag").textContent = moduleLabel.toUpperCase();
  document.getElementById("arena-title").textContent = mission.title;
  document.getElementById("shield-bar-fill").style.width = "0%";
  updateLiveMetrics();

  const textDisplay = document.getElementById("text-display");
  textDisplay.innerHTML = "";
  [...targetText].forEach((ch, idx) => {
    const span = document.createElement("span");
    span.className = `char ${ch === " " ? "space-char" : ""} ${idx === 0 ? "current" : ""}`;
    span.textContent = ch === " " ? "␣" : ch;
    textDisplay.appendChild(span);
  });

  switchView("arena");
  highlightKeysForChar(targetText[0]);
  hiddenInput.value = "";
  hiddenInput.focus();
}

// --- WYZWANIE CZASOWE 60 SEKUND ---
function renderTimeTrial() {
  const best = currentUser.profile.timeTrialBest || { wpm: 0, accuracy: 0, chars: 0 };
  document.getElementById("tt-best-wpm").textContent = `${best.wpm} WPM`;
  document.getElementById("tt-best-acc").textContent = best.wpm > 0 ? `${best.accuracy}%` : "—";
  document.getElementById("tt-best-chars").textContent = best.chars || 0;
}

document.querySelectorAll(".diff-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".diff-card").forEach((c) => c.classList.remove("active"));
    card.classList.add("active");
    ttDifficulty = card.dataset.diff;
  });
});

document.getElementById("btn-start-timetrial").addEventListener("click", () => {
  startTimeTrial(ttDifficulty);
});

function buildTimeTrialPool(diff) {
  const maxMod = diff === "basic" ? 3 : diff === "polish" ? 5 : 6;
  return MODULES
    .filter((mod) => mod.id <= maxMod)
    .flatMap((mod) => mod.missions)
    .filter((m) => m.id !== "1.1" && m.id !== "1.2")
    .flatMap((m) => m.texts || [m.text]);
}

function loadNextTimeTrialSentence() {
  const candidates = ttPool.length > 1 ? ttPool.filter((t) => t !== targetText) : ttPool;
  targetText = candidates[Math.floor(Math.random() * candidates.length)];
  currentIndex = 0;

  const textDisplay = document.getElementById("text-display");
  textDisplay.innerHTML = "";
  [...targetText].forEach((ch, idx) => {
    const span = document.createElement("span");
    span.className = `char ${ch === " " ? "space-char" : ""} ${idx === 0 ? "current" : ""}`;
    span.textContent = ch === " " ? "␣" : ch;
    textDisplay.appendChild(span);
  });
  highlightKeysForChar(targetText[0]);
}

function startTimeTrial(diff) {
  stopTimeTrialTimer();
  ttDifficulty = diff;
  ttPool = buildTimeTrialPool(diff);
  ttSecondsLeft = 60;

  activeMission = { id: "timetrial_60s", title: "Wyzwanie 60 sekund", isTimeTrial: true };
  correctChars = 0;
  errorCount = 0;
  combo = 0;
  maxCombo = 0;
  startTime = null;

  document.getElementById("arena-module-tag").textContent = "WYZWANIE CZASOWE";
  document.getElementById("arena-title").textContent = "Wyścig 60s — pisz bez zatrzymania!";

  const timeBox = document.getElementById("metric-time-box");
  const timeVal = document.getElementById("metric-time");
  timeBox.classList.remove("hidden");
  timeVal.textContent = "60s";
  timeVal.classList.remove("pulse-warn");

  const bar = document.getElementById("shield-bar-fill");
  bar.classList.remove("danger");
  bar.style.width = "100%";

  updateLiveMetrics();
  loadNextTimeTrialSentence();
  switchView("arena");

  hiddenInput.value = "";
  hiddenInput.focus();
}

// --- OBSŁUGA WPISYWANEGO TEKSTU ---
hiddenInput.addEventListener("input", () => {
  if (!activeMission || currentIndex >= targetText.length) return;
  const typed = hiddenInput.value;
  hiddenInput.value = "";
  if (!typed) return;

  if (!startTime) startTime = Date.now();

  if (activeMission.isTimeTrial && !ttTimerInterval) {
    ttTimerInterval = setInterval(() => {
      ttSecondsLeft--;
      const timeVal = document.getElementById("metric-time");
      const bar = document.getElementById("shield-bar-fill");
      timeVal.textContent = `${Math.max(ttSecondsLeft, 0)}s`;
      bar.style.width = `${Math.max((ttSecondsLeft / 60) * 100, 0)}%`;

      if (ttSecondsLeft <= 10) {
        timeVal.classList.add("pulse-warn");
        bar.classList.add("danger");
      }
      if (ttSecondsLeft <= 0) {
        stopTimeTrialTimer();
        finishMission();
      }
    }, 1000);
  }

  const expected = targetText[currentIndex];
  const typedChar = typed[typed.length - 1];
  const charSpans = document.getElementById("text-display").children;

  if (typedChar === expected) {
    sfx.tick();
    charSpans[currentIndex].classList.remove("current");
    charSpans[currentIndex].classList.add("correct");
    if (expected === " ") charSpans[currentIndex].textContent = " ";

    currentIndex++;
    correctChars++;
    combo++;
    if (combo > maxCombo) maxCombo = combo;

    if (!activeMission.isTimeTrial) {
      const pct = Math.round((currentIndex / targetText.length) * 100);
      document.getElementById("shield-bar-fill").style.width = `${pct}%`;
    }

    if (currentIndex < targetText.length) {
      charSpans[currentIndex].classList.add("current");
      highlightKeysForChar(targetText[currentIndex]);
    } else if (activeMission.isTimeTrial) {
      loadNextTimeTrialSentence();
    } else {
      finishMission();
    }
  } else {
    sfx.error();
    errorCount++;
    combo = 0;
    typingBox.classList.remove("shake");
    void typingBox.offsetWidth;
    typingBox.classList.add("shake");
  }

  updateLiveMetrics();
});

function updateLiveMetrics() {
  const total = correctChars + errorCount;
  const acc = total === 0 ? 100 : Math.round((correctChars / total) * 100);
  const accEl = document.getElementById("metric-acc");
  const minThreshold = activeMission?.isTimeTrial ? 90 : 93;
  accEl.textContent = `${acc}%`;
  accEl.className = `metric-val ${acc >= minThreshold ? "good" : "warn"}`;

  let wpm = 0;
  if (startTime && correctChars > 0) {
    const mins = (Date.now() - startTime) / 60000;
    wpm = Math.round((correctChars / 5) / Math.max(mins, 0.02));
  }
  document.getElementById("metric-wpm").textContent = `${wpm} WPM`;
  document.getElementById("metric-combo").textContent = `${combo}x`;
  return { wpm, acc };
}

async function finishMission() {
  stopTimeTrialTimer();
  const { wpm, acc } = updateLiveMetrics();

  // ZAKOŃCZENIE WYZWANIA CZASOWEGO 60S
  if (activeMission.isTimeTrial) {
    const validRecord = acc >= 90 && correctChars > 0;
    const earnedXp = Math.max(15, Math.round(correctChars / 3) + (validRecord ? 40 : 0));
    let isNewRecord = false;

    if (currentUser.isDemo) {
      const prev = currentUser.profile.timeTrialBest || { wpm: 0, accuracy: 0, chars: 0 };
      if (validRecord && wpm > prev.wpm) {
        currentUser.profile.timeTrialBest = { wpm, accuracy: acc, chars: correctChars };
        isNewRecord = true;
      }
      currentUser.profile.xp += earnedXp;
      currentUser.profile.history.push({
        date: new Date().toISOString().split("T")[0],
        wpm,
        accuracy: acc,
        missionId: "60s"
      });
      localStorage.setItem("akademia_demo_profile", JSON.stringify(currentUser.profile));
    } else {
      const res = await saveTimeTrialResult(currentUser.uid, {
        wpm, accuracy: acc, chars: correctChars, earnedXp
      });
      if (res) {
        currentUser.profile = res.profile;
        isNewRecord = res.isNewRecord;
      }
    }

    if (validRecord) sfx.win(); else sfx.error();
    refreshUI();

    const modal = document.getElementById("result-modal");
    document.getElementById("result-stars").textContent = isNewRecord ? "🏆" : (validRecord ? "⏱️" : "⚠️");
    document.getElementById("result-heading").textContent = isNewRecord
      ? "NOWY REKORD ŻYCIOWY!"
      : (validRecord ? "Czas minął! Dobra seria" : "Za dużo pomyłek (min. 90%)");
    document.getElementById("result-sub").textContent = isNewRecord
      ? `Wpisano ${correctChars} poprawnych znaków w 60 sekund!`
      : (validRecord ? "Spróbuj pobić swój najlepszy wynik!" : "Rekord wymaga minimum 90% celności.");

    document.getElementById("res-acc").textContent = `${acc}%`;
    document.getElementById("res-wpm").textContent = `${wpm} WPM`;
    document.getElementById("res-combo").textContent = `${maxCombo}x`;
    document.getElementById("res-xp").textContent = `+${earnedXp} XP`;
    document.getElementById("btn-next-mission").classList.add("hidden");
    modal.classList.remove("hidden");
    return;
  }

  // ZAKOŃCZENIE STANDARDOWEJ MISJI KAMPANII LUB HANGARU
  const passed = acc >= 93;
  let stars = 0;

  if (passed) {
    stars = 1;
    if (acc >= 96 && wpm >= (activeMission.targetWpm || 15)) stars = 2;
    if (acc >= 98 && maxCombo >= Math.floor(targetText.length * 0.5)) stars = 3;
    sfx.win();
  } else {
    sfx.error();
  }

  const earnedXp = passed ? 50 + stars * 25 + Math.min(wpm, 50) : 10;

  if (activeMission.id !== "hangar_custom") {
    if (currentUser.isDemo) {
      saveDemoResult(activeMission.id, { wpm, accuracy: acc, stars, earnedXp });
    } else {
      currentUser.profile = await saveMissionResult(currentUser.uid, activeMission.id, {
        wpm, accuracy: acc, stars, earnedXp
      });
    }
  } else {
    currentUser.profile.xp += earnedXp;
    if (currentUser.isDemo) {
      localStorage.setItem("akademia_demo_profile", JSON.stringify(currentUser.profile));
    }
  }

  refreshUI();
  showResultModal({ passed, stars, wpm, acc, earnedXp });
}

function saveDemoResult(missionId, { wpm, accuracy, stars, earnedXp }) {
  const p = currentUser.profile;
  const prev = p.missions[missionId] || { stars: 0, bestWpm: 0, bestAccuracy: 0 };
  p.missions[missionId] = {
    stars: Math.max(prev.stars, stars),
    bestWpm: Math.max(prev.bestWpm, wpm),
    bestAccuracy: Math.max(prev.bestAccuracy, accuracy)
  };
  if (stars >= 1) {
    const allIds = MODULES.flatMap((m) => m.missions.map((x) => x.id));
    const nextId = allIds[allIds.indexOf(missionId) + 1];
    if (nextId && !p.unlockedMissions.includes(nextId)) p.unlockedMissions.push(nextId);
  }
  p.xp += earnedXp;
  p.history.push({ date: new Date().toISOString().split("T")[0], wpm, accuracy, missionId });
  localStorage.setItem("akademia_demo_profile", JSON.stringify(p));
}

function showResultModal({ passed, stars, wpm, acc, earnedXp }) {
  const modal = document.getElementById("result-modal");
  document.getElementById("result-stars").textContent = passed
    ? "★".repeat(stars) + "☆".repeat(3 - stars)
    : "☆☆☆";
  document.getElementById("result-heading").textContent = passed
    ? "Misja zaliczona!"
    : "Za dużo pomyłek (wymagane 93%)";
  document.getElementById("result-sub").textContent = passed
    ? "Kolejny etap na mapie został odblokowany."
    : "Zwolnij trochę i skup się na bezbłędnym trafianiu w klawisze.";

  document.getElementById("res-acc").textContent = `${acc}%`;
  document.getElementById("res-wpm").textContent = `${wpm} WPM`;
  document.getElementById("res-combo").textContent = `${maxCombo}x`;
  document.getElementById("res-xp").textContent = `+${earnedXp} XP`;

  const nextBtn = document.getElementById("btn-next-mission");
  nextBtn.classList.toggle("hidden", !passed || activeMission.id === "hangar_custom");
  modal.classList.remove("hidden");
}

document.getElementById("btn-retry-mission").addEventListener("click", () => {
  document.getElementById("result-modal").classList.add("hidden");
  if (activeMission.isTimeTrial) {
    startTimeTrial(ttDifficulty);
  } else {
    startMission(activeMission, document.getElementById("arena-module-tag").textContent);
  }
});

document.getElementById("btn-next-mission").addEventListener("click", () => {
  document.getElementById("result-modal").classList.add("hidden");
  const all = MODULES.flatMap((m) => m.missions.map((x) => ({ mission: x, modTitle: m.title })));
  const idx = all.findIndex((item) => item.mission.id === activeMission.id);
  if (idx >= 0 && all[idx + 1]) {
    startMission(all[idx + 1].mission, all[idx + 1].modTitle);
  } else {
    switchView("campaign");
  }
});

// --- HANGAR TRENINGOWY (WŁASNE SŁOWA) ---
function parseWordsInput(raw) {
  return raw
    .split(/[\n,;]+|\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

function launchCustomWords(name, wordsArray) {
  const shuffled = [...wordsArray].sort(() => Math.random() - 0.5);
  const text = shuffled.join(" ");
  startMission(
    { id: "hangar_custom", title: name || "Trening własny", targetWpm: 18, text },
    "HANGAR TRENINGOWY"
  );
}

document.getElementById("btn-hangar-start").addEventListener("click", () => {
  const words = parseWordsInput(document.getElementById("hangar-words").value);
  if (words.length < 2) {
    document.getElementById("hangar-msg").textContent = "Wpisz co najmniej 2 słowa do treningu.";
    return;
  }
  launchCustomWords(document.getElementById("hangar-name").value, words);
});

document.getElementById("btn-hangar-save").addEventListener("click", async () => {
  const name = document.getElementById("hangar-name").value.trim() || "Mój zestaw";
  const words = parseWordsInput(document.getElementById("hangar-words").value);
  const msgEl = document.getElementById("hangar-msg");

  if (words.length < 2) {
    msgEl.textContent = "Wpisz co najmniej 2 słowa, aby zapisać zestaw.";
    return;
  }

  try {
    if (currentUser.isDemo) {
      if (currentUser.profile.hangarSets.length >= 5) throw new Error("Maksymalnie 5 zestawów.");
      currentUser.profile.hangarSets.push({ id: `set_${Date.now()}`, name, words });
      localStorage.setItem("akademia_demo_profile", JSON.stringify(currentUser.profile));
    } else {
      currentUser.profile.hangarSets = await saveHangarSet(currentUser.uid, name, words);
    }
    msgEl.textContent = "Zestaw zapisany!";
    renderHangar();
  } catch (err) {
    msgEl.textContent = err.message;
  }
});

function renderHangar() {
  const list = document.getElementById("saved-sets-list");
  const sets = currentUser.profile.hangarSets || [];
  if (!sets.length) {
    list.innerHTML = `<p class="muted">Brak zapisanych zestawów. Dodaj swój pierwszy zestaw obok!</p>`;
    return;
  }

  list.innerHTML = "";
  sets.forEach((s) => {
    const item = document.createElement("div");
    item.className = "saved-set-item";
    item.innerHTML = `
      <div>
        <strong>${s.name}</strong>
        <div class="muted">${s.words.length} słów: ${s.words.slice(0, 4).join(", ")}...</div>
      </div>
      <div class="btn-row">
        <button class="btn-primary small" data-play="${s.id}">Ćwicz</button>
        <button class="btn-ghost small" data-del="${s.id}">Usuń</button>
      </div>
    `;
    item.querySelector(`[data-play="${s.id}"]`).addEventListener("click", () => launchCustomWords(s.name, s.words));
    item.querySelector(`[data-del="${s.id}"]`).addEventListener("click", async () => {
      if (currentUser.isDemo) {
        currentUser.profile.hangarSets = currentUser.profile.hangarSets.filter((x) => x.id !== s.id);
        localStorage.setItem("akademia_demo_profile", JSON.stringify(currentUser.profile));
      } else {
        currentUser.profile.hangarSets = await deleteHangarSet(currentUser.uid, s.id);
      }
      renderHangar();
    });
    list.appendChild(item);
  });
}

// --- STATYSTYKI I WYKRES SVG ---
function renderStats() {
  const p = currentUser.profile;
  const completedCount = Object.values(p.missions).filter((m) => m.stars >= 1).length;
  const history = p.history || [];
  const avgAcc = history.length
    ? Math.round(history.reduce((sum, h) => sum + h.accuracy, 0) / history.length) + "%"
    : "—";

  document.getElementById("stat-rank").textContent = p.rank;
  document.getElementById("stat-xp").textContent = `${p.xp} XP`;
  document.getElementById("stat-missions").textContent = `${completedCount} / 25`;
  document.getElementById("stat-avg-acc").textContent = avgAcc;

  const chartBox = document.getElementById("progress-chart");
  if (history.length < 2) {
    chartBox.innerHTML = `<p class="muted">Ukończ co najmniej 2 sesje, aby zobaczyć wykres swojego postępu.</p>`;
    return;
  }

  const w = 680, h = 200, pad = 30;
  const maxWpm = Math.max(...history.map((x) => x.wpm), 35);
  const points = history.map((item, idx) => {
    const x = pad + (idx / (history.length - 1)) * (w - pad * 2);
    const y = h - pad - (item.wpm / maxWpm) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  chartBox.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="210">
      <line x1="${pad}" y1="${h - pad}" x2="${w - pad}" y2="${h - pad}" stroke="#26334d" />
      <polyline fill="none" stroke="#38bdf8" stroke-width="3" points="${points}" />
      ${history.map((item, idx) => {
        const x = pad + (idx / (history.length - 1)) * (w - pad * 2);
        const y = h - pad - (item.wpm / maxWpm) * (h - pad * 2);
        return `
          <circle cx="${x}" cy="${y}" r="4.5" fill="#22c55e" />
          <text x="${x}" y="${y - 10}" fill="#f1f5f9" font-size="11" text-anchor="middle">${item.wpm}</text>
        `;
      }).join("")}
    </svg>
  `;
}

// --- PRZEŁĄCZNIK DŹWIĘKU ---
document.getElementById("btn-sound").addEventListener("click", (e) => {
  soundEnabled = !soundEnabled;
  e.target.textContent = soundEnabled ? "🔊" : "🔇";
});

// firebase-service.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// 1. Wklej tutaj swój obiekt firebaseConfig z konsoli Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDLgwyhhmanHnh36THz9fM8UKCywnqjoow",
  authDomain: "akademia-klawiatury.firebaseapp.com",
  projectId: "akademia-klawiatury",
  storageBucket: "akademia-klawiatury.firebasestorage.app",
  messagingSenderId: "625078258706",
  appId: "1:625078258706:web:b56c664727617e5d8e1ccb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Kolejność wszystkich 25 misji do automatycznego odblokowywania kolejnej
const MISSION_ORDER = [
  "1.1", "1.2", "1.3", "1.4", "1.5",
  "2.1", "2.2", "2.3", "2.4", "2.5",
  "3.1", "3.2", "3.3", "3.4",
  "4.1", "4.2", "4.3", "4.4",
  "5.1", "5.2", "5.3", "5.4",
  "6.1", "6.2", "6.3"
];

// Zamiana loginu na wewnętrzny identyfikator techniczny
function loginToInternalEmail(login) {
  const clean = login.trim().toLowerCase();
  if (!/^[a-z0-9_-]{3,20}$/.test(clean)) {
    throw new Error("Login może mieć 3–20 znaków (tylko litery bez ogonków, cyfry, _ lub -).");
  }
  return `${clean}@akademia-klawiatury.local`;
}

// Tłumaczenie błędów Firebase na przyjazne komunikaty
function mapAuthError(error) {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "Ten login jest już zajęty. Wybierz inny.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Nieprawidłowy login lub hasło.";
    case "auth/weak-password":
      return "Hasło musi mieć co najmniej 6 znaków.";
    default:
      return error.message || "Wystąpił błąd połączenia z bazą.";
  }
}

// REJESTRACJA NOWEGO KONTA (tylko login i hasło)
export async function registerUser(login, password) {
  try {
    const internalEmail = loginToInternalEmail(login);
    const cred = await createUserWithEmailAndPassword(auth, internalEmail, password);

    const initialProfile = {
      login: login.trim(),
      rank: "Rekrut",
      xp: 0,
      unlockedMissions: ["1.1"],
      missions: {},
      hangarSets: [],
      history: [],
      timeTrialBest: { wpm: 0, accuracy: 0, chars: 0 }
    };

    await setDoc(doc(db, "users", cred.user.uid), initialProfile);
    return { uid: cred.user.uid, profile: initialProfile };
  } catch (err) {
    throw new Error(mapAuthError(err));
  }
}

// LOGOWANIE ISTNIEJĄCEGO UŻYTKOWNIKA
export async function loginUser(login, password) {
  try {
    const internalEmail = loginToInternalEmail(login);
    const cred = await signInWithEmailAndPassword(auth, internalEmail, password);
    const profile = await getUserProfile(cred.user.uid);
    return { uid: cred.user.uid, profile };
  } catch (err) {
    throw new Error(mapAuthError(err));
  }
}

export async function logoutUser() {
  await signOut(auth);
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// WYLICZANIE RANGI NA PODSTAWIE UKOŃCZONYCH BOSSÓW MODUŁÓW
function calculateRank(missionsMap) {
  if (missionsMap["6.3"]?.stars >= 1) return "Mistrz Klawiatury";
  if (missionsMap["4.4"]?.stars >= 1) return "Komandor";
  if (missionsMap["3.4"]?.stars >= 1) return "Pilot";
  if (missionsMap["2.5"]?.stars >= 1) return "Nawigator";
  if (missionsMap["1.5"]?.stars >= 1) return "Kadet";
  return "Rekrut";
}

// ZAPIS WYNIKU PO UKOŃCZONEJ LEKCJI KAMPANII
export async function saveMissionResult(uid, missionId, { wpm, accuracy, stars, earnedXp }) {
  const userRef = doc(db, "users", uid);
  const profile = await getUserProfile(uid);
  if (!profile) return;

  const prev = profile.missions[missionId] || { stars: 0, bestWpm: 0, bestAccuracy: 0 };

  profile.missions[missionId] = {
    stars: Math.max(prev.stars, stars),
    bestWpm: Math.max(prev.bestWpm, wpm),
    bestAccuracy: Math.max(prev.bestAccuracy, accuracy)
  };

  if (stars >= 1) {
    const currentIndex = MISSION_ORDER.indexOf(missionId);
    const nextMission = MISSION_ORDER[currentIndex + 1];
    if (nextMission && !profile.unlockedMissions.includes(nextMission)) {
      profile.unlockedMissions.push(nextMission);
    }
  }

  profile.xp += earnedXp;
  profile.rank = calculateRank(profile.missions);

  const today = new Date().toISOString().split("T")[0];
  profile.history.push({ date: today, wpm, accuracy, missionId });
  if (profile.history.length > 30) {
    profile.history = profile.history.slice(-30);
  }

  await updateDoc(userRef, {
    missions: profile.missions,
    unlockedMissions: profile.unlockedMissions,
    xp: profile.xp,
    rank: profile.rank,
    history: profile.history
  });

  return profile;
}

// ZAPIS WYNIKU WYZWANIA CZASOWEGO (60 SEKUND)
export async function saveTimeTrialResult(uid, { wpm, accuracy, chars, earnedXp }) {
  const userRef = doc(db, "users", uid);
  const profile = await getUserProfile(uid);
  if (!profile) return null;

  const prev = profile.timeTrialBest || { wpm: 0, accuracy: 0, chars: 0 };
  const isNewRecord = accuracy >= 90 && wpm > prev.wpm;

  if (isNewRecord) {
    profile.timeTrialBest = { wpm, accuracy, chars };
  }

  profile.xp += earnedXp;

  const today = new Date().toISOString().split("T")[0];
  profile.history.push({ date: today, wpm, accuracy, missionId: "60s" });
  if (profile.history.length > 30) {
    profile.history = profile.history.slice(-30);
  }

  await updateDoc(userRef, {
    timeTrialBest: profile.timeTrialBest,
    xp: profile.xp,
    history: profile.history
  });

  return { profile, isNewRecord };
}

// ZAPIS WŁASNEGO ZESTAWU SŁÓW W HANGARZE TRENINGOWYM (MAX 5)
export async function saveHangarSet(uid, setName, wordsArray) {
  const userRef = doc(db, "users", uid);
  const profile = await getUserProfile(uid);
  if (!profile) return;

  if (profile.hangarSets.length >= 5) {
    throw new Error("Możesz zapisać maksymalnie 5 własnych zestawów. Usuń jeden, aby dodać nowy.");
  }

  const newSet = {
    id: `set_${Date.now()}`,
    name: setName.trim(),
    words: wordsArray.filter((w) => w.trim().length > 0)
  };

  profile.hangarSets.push(newSet);
  await updateDoc(userRef, { hangarSets: profile.hangarSets });
  return profile.hangarSets;
}

export async function deleteHangarSet(uid, setId) {
  const userRef = doc(db, "users", uid);
  const profile = await getUserProfile(uid);
  if (!profile) return;

  profile.hangarSets = profile.hangarSets.filter((s) => s.id !== setId);
  await updateDoc(userRef, { hangarSets: profile.hangarSets });
  return profile.hangarSets;
}

// Nasłuchiwanie czy użytkownik jest już zalogowany po odświeżeniu strony
export function watchAuthState(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      callback({ uid: user.uid, profile });
    } else {
      callback(null);
    }
  });
}

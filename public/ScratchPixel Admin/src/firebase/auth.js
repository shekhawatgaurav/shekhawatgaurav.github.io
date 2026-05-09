import {
  browserLocalPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "./firebaseConfig";

function cleanEmail(email = "") {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function loginAdmin(email, password) {
  const finalEmail = cleanEmail(email);

  if (!finalEmail) {
    throw new Error("Email is required.");
  }

  if (!isValidEmail(finalEmail)) {
    throw new Error("Please enter a valid email address.");
  }

  if (!password) {
    throw new Error("Password is required.");
  }

  await setPersistence(auth, browserLocalPersistence);

  return signInWithEmailAndPassword(auth, finalEmail, password);
}

export async function logoutAdmin() {
  return signOut(auth);
}

export async function resetAdminPassword(email) {
  const finalEmail = cleanEmail(email);

  if (!finalEmail) {
    throw new Error("Email is required.");
  }

  if (!isValidEmail(finalEmail)) {
    throw new Error("Please enter a valid email address.");
  }

  return sendPasswordResetEmail(auth, finalEmail);
}

export function getCurrentAdmin() {
  return auth.currentUser;
}
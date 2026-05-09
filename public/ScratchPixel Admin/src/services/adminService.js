import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { ROLE_PERMISSIONS } from "../utils/permissions";

const ADMINS_COLLECTION = "admins";

function requireValue(value, message) {
  if (!String(value || "").trim()) {
    throw new Error(message);
  }
}

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function getAdmins() {
  const q = query(
    collection(db, ADMINS_COLLECTION),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function getAdminById(adminId) {
  requireValue(adminId, "Admin ID is required.");

  const ref = doc(db, ADMINS_COLLECTION, adminId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}

export async function createAdminProfile(formData = {}) {
  const uid = String(formData.uid || "").trim();
  const name = String(formData.name || "").trim();
  const email = String(formData.email || "").trim().toLowerCase();
  const role = formData.role || "support";
  const status = formData.status || "active";

  requireValue(uid, "Firebase Auth UID is required.");
  requireValue(name, "Admin name is required.");
  requireValue(email, "Admin email is required.");

  if (!isValidEmail(email)) {
    throw new Error("Please enter a valid email address.");
  }

  if (!["owner", "manager", "finance", "support"].includes(role)) {
    throw new Error("Invalid admin role.");
  }

  if (!["active", "inactive"].includes(status)) {
    throw new Error("Invalid admin status.");
  }

  const adminRef = doc(db, ADMINS_COLLECTION, uid);
  const existing = await getDoc(adminRef);

  if (existing.exists()) {
    throw new Error("Admin profile already exists for this UID.");
  }

  await setDoc(adminRef, {
    name,
    email,
    role,
    status,
    permissions: ROLE_PERMISSIONS[role] || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateAdminStatus(adminId, status) {
  requireValue(adminId, "Admin ID is required.");

  if (!["active", "inactive"].includes(status)) {
    throw new Error("Invalid admin status.");
  }

  const adminRef = doc(db, ADMINS_COLLECTION, adminId);
  const snap = await getDoc(adminRef);

  if (!snap.exists()) {
    throw new Error("Admin profile not found.");
  }

  await updateDoc(adminRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}
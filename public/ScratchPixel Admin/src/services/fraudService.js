import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

const USERS_COLLECTION = "users";
const FRAUD_REPORTS_COLLECTION = "fraudReports";

function requireId(id, label = "ID") {
  if (!id) {
    throw new Error(`${label} is required.`);
  }
}

export async function getSuspiciousUsers(maxLimit = 50) {
  const q = query(
    collection(db, USERS_COLLECTION),
    where("riskStatus", "in", ["suspicious", "high-risk"]),
    orderBy("createdAt", "desc"),
    limit(maxLimit)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function markUserSuspicious(
  userId,
  reason = "Marked suspicious by admin"
) {
  requireId(userId, "User ID");

  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User not found.");
  }

  await updateDoc(userRef, {
    riskStatus: "suspicious",
    fraudReason: reason || "Marked suspicious by admin",
    riskUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function markUserHighRisk(
  userId,
  reason = "Marked high-risk by admin"
) {
  requireId(userId, "User ID");

  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User not found.");
  }

  await updateDoc(userRef, {
    riskStatus: "high-risk",
    status: "blocked",
    fraudReason: reason || "Marked high-risk by admin",
    blockReason: reason || "Marked high-risk by admin",
    riskUpdatedAt: serverTimestamp(),
    blockedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function clearUserRisk(userId) {
  requireId(userId, "User ID");

  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User not found.");
  }

  await updateDoc(userRef, {
    riskStatus: "normal",
    fraudReason: "",
    riskClearedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getFraudReports(maxLimit = 100) {
  const q = query(
    collection(db, FRAUD_REPORTS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(maxLimit)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function updateFraudReportStatus(
  reportId,
  status,
  note = ""
) {
  requireId(reportId, "Fraud report ID");

  if (!status) {
    throw new Error("Fraud report status is required.");
  }

  const reportRef = doc(db, FRAUD_REPORTS_COLLECTION, reportId);
  const reportSnap = await getDoc(reportRef);

  if (!reportSnap.exists()) {
    throw new Error("Fraud report not found.");
  }

  await updateDoc(reportRef, {
    status,
    note,
    resolvedAt: status === "resolved" ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });
}
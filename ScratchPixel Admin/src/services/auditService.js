import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

const AUDIT_COLLECTION = "auditLogs";

function cleanText(value = "", fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

export async function addAuditLog({
  adminId = "",
  adminEmail = "",
  action = "",
  targetType = "",
  targetId = "",
  details = "",
}) {
  const cleanAction = cleanText(action);

  if (!cleanAction) {
    throw new Error("Audit action is required.");
  }

  await addDoc(collection(db, AUDIT_COLLECTION), {
    adminId: cleanText(adminId),
    adminEmail: cleanText(adminEmail).toLowerCase(),
    action: cleanAction,
    targetType: cleanText(targetType, "system"),
    targetId: cleanText(targetId),
    details: cleanText(details),
    createdAt: serverTimestamp(),
  });
}

export async function getAuditLogs(maxLimit = 100) {
  const safeLimit = Number(maxLimit) > 0 ? Number(maxLimit) : 100;

  const q = query(
    collection(db, AUDIT_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(safeLimit)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}
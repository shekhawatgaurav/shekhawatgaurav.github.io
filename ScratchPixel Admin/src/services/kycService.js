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

const KYC_COLLECTION = "kycRequests";
const USERS_COLLECTION = "users";

function requireKycId(kycId) {
  if (!kycId) {
    throw new Error("KYC ID is required.");
  }
}

export async function getKycRequests(status = "pending", maxLimit = 100) {
  let q;

  if (status === "all") {
    q = query(
      collection(db, KYC_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(maxLimit)
    );
  } else {
    q = query(
      collection(db, KYC_COLLECTION),
      where("status", "==", status),
      orderBy("createdAt", "desc"),
      limit(maxLimit)
    );
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function getKycRequestById(kycId) {
  requireKycId(kycId);

  const kycRef = doc(db, KYC_COLLECTION, kycId);
  const snap = await getDoc(kycRef);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}

async function updateUserKycStatus(userId, status, extraData = {}) {
  if (!userId) return;

  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  await updateDoc(userRef, {
    kycStatus: status,
    isKycVerified: status === "approved",
    ...extraData,
    updatedAt: serverTimestamp(),
  });
}

export async function approveKycRequest(kycId, note = "") {
  requireKycId(kycId);

  const kycRef = doc(db, KYC_COLLECTION, kycId);
  const kycSnap = await getDoc(kycRef);

  if (!kycSnap.exists()) {
    throw new Error("KYC request not found.");
  }

  const kyc = kycSnap.data();
  const userId = kyc.userId || "";

  await updateDoc(kycRef, {
    status: "approved",
    note: note || "KYC approved by admin",
    reviewedAt: serverTimestamp(),
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateUserKycStatus(userId, "approved", {
    kycApprovedAt: serverTimestamp(),
    kycRejectedAt: null,
    kycRejectionReason: "",
  });
}

export async function rejectKycRequest(kycId, note = "") {
  requireKycId(kycId);

  if (!note.trim()) {
    throw new Error("Rejection reason is required.");
  }

  const kycRef = doc(db, KYC_COLLECTION, kycId);
  const kycSnap = await getDoc(kycRef);

  if (!kycSnap.exists()) {
    throw new Error("KYC request not found.");
  }

  const kyc = kycSnap.data();
  const userId = kyc.userId || "";

  await updateDoc(kycRef, {
    status: "rejected",
    note: note || "KYC rejected by admin",
    reviewedAt: serverTimestamp(),
    rejectedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateUserKycStatus(userId, "rejected", {
    kycRejectedAt: serverTimestamp(),
    kycRejectionReason: note || "KYC rejected by admin",
    isKycVerified: false,
  });
}

export async function reopenKycRequest(kycId, note = "") {
  requireKycId(kycId);

  const kycRef = doc(db, KYC_COLLECTION, kycId);
  const kycSnap = await getDoc(kycRef);

  if (!kycSnap.exists()) {
    throw new Error("KYC request not found.");
  }

  const kyc = kycSnap.data();
  const userId = kyc.userId || "";

  await updateDoc(kycRef, {
    status: "pending",
    note: note || "KYC reopened by admin",
    reviewedAt: null,
    reopenedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateUserKycStatus(userId, "pending", {
    isKycVerified: false,
    kycRejectionReason: "",
  });
}

export async function updateKycStatus(kycId, status, note = "") {
  requireKycId(kycId);

  if (!status) {
    throw new Error("KYC status is required.");
  }

  if (status === "approved") {
    return approveKycRequest(kycId, note || "KYC approved by admin");
  }

  if (status === "rejected") {
    return rejectKycRequest(kycId, note || "KYC rejected by admin");
  }

  if (status === "pending") {
    return reopenKycRequest(kycId, note || "KYC reopened by admin");
  }

  const kycRef = doc(db, KYC_COLLECTION, kycId);

  await updateDoc(kycRef, {
    status,
    note,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export const approveKyc = approveKycRequest;
export const rejectKyc = rejectKycRequest;
export const reopenKyc = reopenKycRequest;
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

const NOTIFICATIONS_COLLECTION = "notifications";

export async function createNotification({
  title,
  message,
  targetType = "all",
  targetUserId = "",
  type = "general",
  isActive = true,
  imageUrl = "",
  actionUrl = "",
  actionText = "",
}) {
  const finalTitle = String(title || "").trim();
  const finalMessage = String(message || "").trim();
  const finalTargetType = String(targetType || "all").trim();

  if (!finalTitle) {
    throw new Error("Notification title is required.");
  }

  if (!finalMessage) {
    throw new Error("Notification message is required.");
  }

  if (finalTargetType === "user" && !String(targetUserId || "").trim()) {
    throw new Error("Target user ID is required for user notification.");
  }

  const finalTargetUserId =
    finalTargetType === "user" ? String(targetUserId || "").trim() : "";

  return addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    title: finalTitle,
    message: finalMessage,

    targetType: finalTargetType,
    targetUserId: finalTargetUserId,

    // legacy fields kept for old app/admin compatibility
    target: finalTargetType,
    userId: finalTargetUserId,

    type: type || "general",

    status: isActive ? "sent" : "inactive",
    isActive: !!isActive,

    imageUrl: imageUrl || "",
    actionUrl: actionUrl || "",
    actionText: actionText || "",

    readBy: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getNotifications(maxLimit = 100) {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(maxLimit)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function updateNotificationStatus(notificationId, status) {
  if (!notificationId) {
    throw new Error("Notification ID is required.");
  }

  if (!status) {
    throw new Error("Status is required.");
  }

  const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);

  await updateDoc(notificationRef, {
    status,
    isActive: status === "sent" || status === "active",
    updatedAt: serverTimestamp(),
  });
}

export async function toggleNotificationActive(notificationId, isActive) {
  if (!notificationId) {
    throw new Error("Notification ID is required.");
  }

  const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);

  await updateDoc(notificationRef, {
    isActive: !!isActive,
    status: isActive ? "sent" : "inactive",
    updatedAt: serverTimestamp(),
  });
}

export async function archiveNotification(notificationId) {
  if (!notificationId) {
    throw new Error("Notification ID is required.");
  }

  const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);

  await updateDoc(notificationRef, {
    status: "archived",
    isActive: false,
    archivedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
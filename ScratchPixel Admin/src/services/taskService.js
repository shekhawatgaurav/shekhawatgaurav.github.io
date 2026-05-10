import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

const TASKS_COLLECTION = "tasks";

export const TASK_TYPES = [
  {
    value: "ads",
    label: "Watch Ads",
    actionKey: "watch_ad",
    helper: "User must watch rewarded ads. Progress counts from rewarded ad watch events.",
  },
  {
    value: "scratch",
    label: "Scratch Cards",
    actionKey: "scratch_card",
    helper: "User must complete scratch cards. Progress counts from scratch history.",
  },
  {
    value: "referral",
    label: "Invite Friends",
    actionKey: "invite_friend",
    helper: "User must complete valid referrals.",
  },
  {
    value: "profile",
    label: "Complete Profile",
    actionKey: "complete_profile",
    helper: "User must complete profile details.",
  },
  {
    value: "custom",
    label: "Custom / Manual",
    actionKey: "manual",
    helper:
      "Custom task. Use carefully because app may allow manual claim depending on target.",
  },
];

export function getActionKeyForType(type) {
  const item = TASK_TYPES.find((taskType) => taskType.value === type);
  return item?.actionKey || "manual";
}

export function getTaskTypeLabel(type) {
  const item = TASK_TYPES.find((taskType) => taskType.value === type);
  return item?.label || type || "Custom";
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isPastDate(dateValue) {
  if (!dateValue) return false;

  const selected = new Date(dateValue);
  selected.setHours(23, 59, 59, 999);

  return selected.getTime() < Date.now();
}

export function normalizeTaskForm(formData = {}) {
  const type = formData.type || "ads";

  const actionKey =
    formData.actionKey && formData.actionKey !== "auto"
      ? String(formData.actionKey).trim()
      : getActionKeyForType(type);

  return {
    title: String(formData.title || "").trim(),
    description: String(formData.description || "").trim(),

    type,
    actionKey,

    rewardCoins: toNumber(formData.rewardCoins, 0),
    targetCount: toNumber(formData.targetCount, 1),

    status: formData.status || "active",
    expiryDate: formData.expiryDate || "",

    sortOrder: toNumber(formData.sortOrder, 0),
    isFeatured: !!formData.isFeatured,

    autoClaim: !!formData.autoClaim,
    requiresVerification:
      formData.requiresVerification === undefined
        ? true
        : !!formData.requiresVerification,
  };
}

export function validateTaskForm(formData = {}) {
  const payload = normalizeTaskForm(formData);

  if (!payload.title) return "Task title is required.";
  if (!payload.description) return "Task description is required.";
  if (!payload.actionKey) return "Action key is required.";

  if (!Number.isFinite(payload.rewardCoins) || payload.rewardCoins <= 0) {
    return "Reward coins must be greater than 0.";
  }

  if (!Number.isFinite(payload.targetCount) || payload.targetCount <= 0) {
    return "Target count must be at least 1.";
  }

  if (!Number.isFinite(payload.sortOrder)) {
    return "Sort order must be a valid number.";
  }

  if (payload.expiryDate && isPastDate(payload.expiryDate)) {
    return "Expiry date cannot be in the past.";
  }

  if (!["active", "inactive", "draft"].includes(payload.status)) {
    return "Invalid task status.";
  }

  return "";
}

export async function getTasks(maxLimit = 100) {
  const q = query(
    collection(db, TASKS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(maxLimit)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function getTaskById(taskId) {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  const snap = await getDoc(doc(db, TASKS_COLLECTION, taskId));

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}

export async function createTask(formData) {
  const validationError = validateTaskForm(formData);

  if (validationError) {
    throw new Error(validationError);
  }

  const payload = normalizeTaskForm(formData);

  return addDoc(collection(db, TASKS_COLLECTION), {
    ...payload,
    totalClaims: 0,
    totalCompletions: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateTask(taskId, formData) {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  const validationError = validateTaskForm(formData);

  if (validationError) {
    throw new Error(validationError);
  }

  const payload = normalizeTaskForm(formData);

  await updateDoc(doc(db, TASKS_COLLECTION, taskId), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

export async function updateTaskStatus(taskId, status) {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  if (!["active", "inactive", "draft"].includes(status)) {
    throw new Error("Invalid task status.");
  }

  await updateDoc(doc(db, TASKS_COLLECTION, taskId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTask(taskId) {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
}
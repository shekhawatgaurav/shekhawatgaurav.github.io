import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { storage } from "./firebaseConfig";

const MAX_IMAGE_SIZE_MB = 5;
const MAX_DOCUMENT_SIZE_MB = 8;

function sanitizeFileName(fileName = "file") {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-_]/g, "");
}

function getSafeFileName(file) {
  const cleanName = sanitizeFileName(file?.name || "file");
  return `${Date.now()}-${cleanName}`;
}

function validateFile(file, options = {}) {
  if (!file) {
    throw new Error("No file selected.");
  }

  const {
    allowedTypes = [],
    maxSizeMb = MAX_DOCUMENT_SIZE_MB,
  } = options;

  const sizeMb = file.size / (1024 * 1024);

  if (sizeMb > maxSizeMb) {
    throw new Error(`File size must be less than ${maxSizeMb}MB.`);
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new Error("Selected file type is not allowed.");
  }
}

export async function uploadFile(path, file, options = {}) {
  validateFile(file, options);

  const fileRef = ref(storage, path);
  const snapshot = await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);

  return {
    path,
    downloadURL,
    name: file.name,
    size: file.size,
    type: file.type,
  };
}

export async function uploadUserKycFile(userId, file) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const fileName = getSafeFileName(file);
  const path = `kyc/${userId}/${fileName}`;

  return uploadFile(path, file, {
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
    maxSizeMb: MAX_DOCUMENT_SIZE_MB,
  });
}

export async function uploadKycSelfieFile(userId, file) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const fileName = getSafeFileName(file);
  const path = `kyc/${userId}/selfies/${fileName}`;

  return uploadFile(path, file, {
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSizeMb: MAX_IMAGE_SIZE_MB,
  });
}

export async function uploadBannerFile(file) {
  const fileName = getSafeFileName(file);
  const path = `banners/${fileName}`;

  return uploadFile(path, file, {
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSizeMb: MAX_IMAGE_SIZE_MB,
  });
}

export async function uploadContentImage(file, folder = "content") {
  const fileName = getSafeFileName(file);
  const safeFolder = sanitizeFileName(folder || "content");
  const path = `${safeFolder}/${fileName}`;

  return uploadFile(path, file, {
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSizeMb: MAX_IMAGE_SIZE_MB,
  });
}

export async function deleteFile(path) {
  if (!path) return;

  const fileRef = ref(storage, path);
  return deleteObject(fileRef);
}

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
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebaseConfig";

function requireValue(value, message) {
  if (!String(value || "").trim()) {
    throw new Error(message);
  }
}

function safeLimit(value, fallback = 100) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getCollectionRef(collectionName) {
  requireValue(collectionName, "Collection name is required.");
  return collection(db, collectionName);
}

export function getDocumentRef(collectionName, documentId) {
  requireValue(collectionName, "Collection name is required.");
  requireValue(documentId, "Document ID is required.");

  return doc(db, collectionName, documentId);
}

export async function getDocument(collectionName, documentId) {
  if (!collectionName || !documentId) return null;

  const ref = getDocumentRef(collectionName, documentId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}

export async function getCollection(collectionName, maxLimit = 100) {
  requireValue(collectionName, "Collection name is required.");

  const q = query(
    collection(db, collectionName),
    limit(safeLimit(maxLimit))
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function getOrderedCollection({
  collectionName,
  orderField = "createdAt",
  orderDirection = "desc",
  maxLimit = 100,
}) {
  requireValue(collectionName, "Collection name is required.");
  requireValue(orderField, "Order field is required.");

  const q = query(
    collection(db, collectionName),
    orderBy(orderField, orderDirection),
    limit(safeLimit(maxLimit))
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function getWhereCollection({
  collectionName,
  field,
  operator = "==",
  value,
  orderField = "createdAt",
  orderDirection = "desc",
  maxLimit = 100,
  useOrderBy = true,
}) {
  requireValue(collectionName, "Collection name is required.");
  requireValue(field, "Where field is required.");

  const queryParts = [where(field, operator, value)];

  if (useOrderBy && orderField) {
    queryParts.push(orderBy(orderField, orderDirection));
  }

  queryParts.push(limit(safeLimit(maxLimit)));

  const q = query(collection(db, collectionName), ...queryParts);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function createDocument(collectionName, data = {}) {
  requireValue(collectionName, "Collection name is required.");

  return addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function createDocumentWithId(
  collectionName,
  documentId,
  data = {},
  merge = true
) {
  requireValue(collectionName, "Collection name is required.");
  requireValue(documentId, "Document ID is required.");

  const ref = doc(db, collectionName, documentId);

  await setDoc(
    ref,
    {
      ...data,
      createdAt: data.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge }
  );

  return ref;
}

export async function updateDocument(collectionName, documentId, data = {}) {
  requireValue(collectionName, "Collection name is required.");
  requireValue(documentId, "Document ID is required.");

  const ref = doc(db, collectionName, documentId);

  return updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDocument(collectionName, documentId) {
  requireValue(collectionName, "Collection name is required.");
  requireValue(documentId, "Document ID is required.");

  const ref = doc(db, collectionName, documentId);
  return deleteDoc(ref);
}
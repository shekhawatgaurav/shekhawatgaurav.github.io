import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

const WALLET_TRANSACTIONS_COLLECTION = "walletTransactions";

export async function getUserWalletTransactions(userId, maxLimit = 100) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const q = query(
    collection(db, WALLET_TRANSACTIONS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(maxLimit)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function addWalletTransaction({
  userId,
  type,
  coins = 0,
  amount = 0,
  source = "admin",
  status = "completed",
  note = "",
  referralId = "",
  withdrawalId = "",
  taskId = "",
  paymentRef = "",
  oldCoins = null,
  newCoins = null,
}) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!type) {
    throw new Error("Transaction type is required.");
  }

  const finalCoins = Number(coins || 0);
  const finalAmount = Number(amount || 0);

  if (!Number.isFinite(finalCoins) || finalCoins < 0) {
    throw new Error("Invalid coins value.");
  }

  if (!Number.isFinite(finalAmount) || finalAmount < 0) {
    throw new Error("Invalid amount value.");
  }

  return addDoc(collection(db, WALLET_TRANSACTIONS_COLLECTION), {
    userId,
    type,
    coins: finalCoins,
    amount: finalAmount,
    source,
    status,
    note,

    referralId,
    withdrawalId,
    taskId,
    paymentRef,

    oldCoins,
    newCoins,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getAllWalletTransactions(maxLimit = 100) {
  const q = query(
    collection(db, WALLET_TRANSACTIONS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(maxLimit)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function getWalletTransactionsBySource(source, maxLimit = 100) {
  if (!source) {
    throw new Error("Source is required.");
  }

  const q = query(
    collection(db, WALLET_TRANSACTIONS_COLLECTION),
    where("source", "==", source),
    orderBy("createdAt", "desc"),
    limit(maxLimit)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}
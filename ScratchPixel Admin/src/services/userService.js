import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

const USERS_COLLECTION = "users";
const WALLET_TRANSACTIONS_COLLECTION = "walletTransactions";
const ACCOUNT_DELETION_COLLECTION = "accountDeletionRequests";

function requireUserId(userId) {
  if (!userId) {
    throw new Error("User ID is required.");
  }
}

export async function getUsers(maxLimit = 100) {
  const q = query(
    collection(db, USERS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(maxLimit)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function getUserById(userId) {
  requireUserId(userId);

  const ref = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}

export async function updateUserStatus(userId, status) {
  requireUserId(userId);

  if (!status) {
    throw new Error("Status is required.");
  }

  const ref = doc(db, USERS_COLLECTION, userId);

  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function blockUser(userId, reason = "Blocked by admin") {
  requireUserId(userId);

  const ref = doc(db, USERS_COLLECTION, userId);

  await updateDoc(ref, {
    status: "blocked",
    blockReason: reason || "Blocked by admin",
    blockedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function unblockUser(userId) {
  requireUserId(userId);

  const ref = doc(db, USERS_COLLECTION, userId);

  await updateDoc(ref, {
    status: "active",
    blockReason: "",
    unblockedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserProfile(userId, profileData = {}) {
  requireUserId(userId);

  const ref = doc(db, USERS_COLLECTION, userId);

  await updateDoc(ref, {
    name: profileData.name || "",
    email: profileData.email || "",
    phone: profileData.phone || "",
    gender: profileData.gender || "",
    avatarId: profileData.avatarId || "avatar_1",
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserCoins(
  userId,
  coins,
  note = "Coins updated by admin"
) {
  requireUserId(userId);

  const newCoins = Number(coins || 0);

  if (!Number.isFinite(newCoins)) {
    throw new Error("Invalid coin value.");
  }

  if (newCoins < 0) {
    throw new Error("Coins cannot be negative.");
  }

  const userRef = doc(db, USERS_COLLECTION, userId);

  let walletTransactionData = null;

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found.");
    }

    const oldCoins = Number(userSnap.data().coins || 0);
    const difference = newCoins - oldCoins;

    transaction.update(userRef, {
      coins: newCoins,
      updatedAt: serverTimestamp(),
    });

    if (difference !== 0) {
      walletTransactionData = {
        userId,
        type: difference > 0 ? "credit" : "debit",
        coins: Math.abs(difference),
        amount: 0,
        source: "admin",
        status: "completed",
        note,
        oldCoins,
        newCoins,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
    }
  });

  if (walletTransactionData) {
    await addDoc(
      collection(db, WALLET_TRANSACTIONS_COLLECTION),
      walletTransactionData
    );
  }
}

export async function addCoinsToUser(
  userId,
  coins,
  note = "Coins added by admin"
) {
  requireUserId(userId);

  const coinValue = Number(coins || 0);

  if (!Number.isFinite(coinValue) || coinValue <= 0) {
    throw new Error("Coins must be greater than 0.");
  }

  const userRef = doc(db, USERS_COLLECTION, userId);

  let walletTransactionData = null;

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found.");
    }

    const oldCoins = Number(userSnap.data().coins || 0);
    const newCoins = oldCoins + coinValue;

    transaction.update(userRef, {
      coins: increment(coinValue),
      updatedAt: serverTimestamp(),
    });

    walletTransactionData = {
      userId,
      type: "credit",
      coins: coinValue,
      amount: 0,
      source: "admin",
      status: "completed",
      note,
      oldCoins,
      newCoins,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  });

  if (walletTransactionData) {
    await addDoc(
      collection(db, WALLET_TRANSACTIONS_COLLECTION),
      walletTransactionData
    );
  }
}

export async function removeCoinsFromUser(
  userId,
  coins,
  note = "Coins removed by admin"
) {
  requireUserId(userId);

  const coinValue = Number(coins || 0);

  if (!Number.isFinite(coinValue) || coinValue <= 0) {
    throw new Error("Coins must be greater than 0.");
  }

  const userRef = doc(db, USERS_COLLECTION, userId);

  let walletTransactionData = null;

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found.");
    }

    const oldCoins = Number(userSnap.data().coins || 0);

    if (oldCoins < coinValue) {
      throw new Error("User does not have enough coins.");
    }

    const newCoins = oldCoins - coinValue;

    transaction.update(userRef, {
      coins: increment(-coinValue),
      updatedAt: serverTimestamp(),
    });

    walletTransactionData = {
      userId,
      type: "debit",
      coins: coinValue,
      amount: 0,
      source: "admin",
      status: "completed",
      note,
      oldCoins,
      newCoins,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  });

  if (walletTransactionData) {
    await addDoc(
      collection(db, WALLET_TRANSACTIONS_COLLECTION),
      walletTransactionData
    );
  }
}

export async function getUserDeleteRequest(userId) {
  requireUserId(userId);

  const q = query(
    collection(db, ACCOUNT_DELETION_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const docItem = snapshot.docs[0];

  return {
    id: docItem.id,
    ...docItem.data(),
  };
}

export async function updateUserDeleteRequestStatus(
  requestId,
  status,
  note = ""
) {
  if (!requestId) {
    throw new Error("Request ID is required.");
  }

  if (!status) {
    throw new Error("Status is required.");
  }

  const ref = doc(db, ACCOUNT_DELETION_COLLECTION, requestId);

  await updateDoc(ref, {
    status,
    adminNote: note,
    updatedAt: serverTimestamp(),
  });
}
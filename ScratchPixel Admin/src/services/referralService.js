import {
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  addDoc,
  collection,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  runTransaction,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

const REFERRALS_COLLECTION = "referrals";
const USERS_COLLECTION = "users";
const WALLET_TRANSACTIONS_COLLECTION = "walletTransactions";

export async function getReferrals(maxLimit = 100) {
  const q = query(
    collection(db, REFERRALS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(maxLimit)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function completeReferralManually(
  referralId,
  note = "Referral reward manually approved by admin"
) {
  if (!referralId) {
    throw new Error("Referral ID is required.");
  }

  const referralRef = doc(db, REFERRALS_COLLECTION, referralId);

  let walletTransactionData = null;

  await runTransaction(db, async (transaction) => {
    const referralSnap = await transaction.get(referralRef);

    if (!referralSnap.exists()) {
      throw new Error("Referral not found.");
    }

    const referral = referralSnap.data();

    if (referral.rewardGiven) {
      throw new Error("Reward already given.");
    }

    const referrerId = referral.referrerId;

    if (!referrerId) {
      throw new Error("Referrer ID missing.");
    }

    const rewardCoins = Number(referral.rewardCoins || 25);

    if (!Number.isFinite(rewardCoins) || rewardCoins <= 0) {
      throw new Error("Invalid referral reward coins.");
    }

    const referrerRef = doc(db, USERS_COLLECTION, referrerId);
    const referrerSnap = await transaction.get(referrerRef);

    if (!referrerSnap.exists()) {
      throw new Error("Referrer user not found.");
    }

    const oldCoins = Number(referrerSnap.data().coins || 0);
    const newCoins = oldCoins + rewardCoins;

    transaction.update(referrerRef, {
      coins: increment(rewardCoins),
      referralCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    transaction.update(referralRef, {
      status: "completed",
      rewardGiven: true,
      rewardCoins,
      note,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    walletTransactionData = {
      userId: referrerId,
      type: "credit",
      coins: rewardCoins,
      amount: 0,
      source: "referral",
      status: "completed",
      note,
      referralId,
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

export async function rejectReferral(referralId, note = "") {
  if (!referralId) {
    throw new Error("Referral ID is required.");
  }

  if (!note.trim()) {
    throw new Error("Rejection reason is required.");
  }

  const referralRef = doc(db, REFERRALS_COLLECTION, referralId);

  await updateDoc(referralRef, {
    status: "rejected",
    note: note || "Referral rejected by admin",
    rejectedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function reopenReferral(referralId, note = "") {
  if (!referralId) {
    throw new Error("Referral ID is required.");
  }

  const referralRef = doc(db, REFERRALS_COLLECTION, referralId);
  const referralSnap = await getDoc(referralRef);

  if (!referralSnap.exists()) {
    throw new Error("Referral not found.");
  }

  const referral = referralSnap.data();

  if (referral.rewardGiven) {
    throw new Error("Completed referral cannot be reopened after reward is given.");
  }

  await updateDoc(referralRef, {
    status: "pending",
    rewardGiven: false,
    note: note || "Referral reopened by admin",
    reopenedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function tryAutoCompleteReferral(
  referralId,
  requiredEarnCoins = 100,
  note = "Referral reward unlocked automatically"
) {
  if (!referralId) {
    throw new Error("Referral ID is required.");
  }

  const referralRef = doc(db, REFERRALS_COLLECTION, referralId);

  let walletTransactionData = null;
  let completed = false;

  await runTransaction(db, async (transaction) => {
    const referralSnap = await transaction.get(referralRef);

    if (!referralSnap.exists()) {
      throw new Error("Referral not found.");
    }

    const referral = referralSnap.data();

    if (referral.rewardGiven || referral.status === "completed") {
      completed = false;
      return;
    }

    const referrerId = referral.referrerId;
    const referredUserId = referral.referredUserId;

    if (!referrerId || !referredUserId) {
      throw new Error("Referral user IDs are missing.");
    }

    const referredUserRef = doc(db, USERS_COLLECTION, referredUserId);
    const referrerRef = doc(db, USERS_COLLECTION, referrerId);

    const referredUserSnap = await transaction.get(referredUserRef);
    const referrerSnap = await transaction.get(referrerRef);

    if (!referredUserSnap.exists()) {
      throw new Error("Referred user not found.");
    }

    if (!referrerSnap.exists()) {
      throw new Error("Referrer user not found.");
    }

    const referredEarnedCoins = Number(
      referredUserSnap.data().totalEarnedCoins ||
        referredUserSnap.data().earnedCoins ||
        referredUserSnap.data().coins ||
        0
    );

    if (referredEarnedCoins < Number(requiredEarnCoins || 100)) {
      completed = false;
      return;
    }

    const rewardCoins = Number(referral.rewardCoins || 25);

    if (!Number.isFinite(rewardCoins) || rewardCoins <= 0) {
      throw new Error("Invalid referral reward coins.");
    }

    const oldCoins = Number(referrerSnap.data().coins || 0);
    const newCoins = oldCoins + rewardCoins;

    transaction.update(referrerRef, {
      coins: increment(rewardCoins),
      referralCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    transaction.update(referralRef, {
      status: "completed",
      rewardGiven: true,
      rewardCoins,
      requiredEarnCoins: Number(requiredEarnCoins || 100),
      referredEarnedCoins,
      note,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    walletTransactionData = {
      userId: referrerId,
      type: "credit",
      coins: rewardCoins,
      amount: 0,
      source: "referral",
      status: "completed",
      note,
      referralId,
      oldCoins,
      newCoins,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    completed = true;
  });

  if (walletTransactionData) {
    await addDoc(
      collection(db, WALLET_TRANSACTIONS_COLLECTION),
      walletTransactionData
    );
  }

  return completed;
}
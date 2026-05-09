import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
  runTransaction,
  increment,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

const WITHDRAWALS_COLLECTION = "withdrawals";
const USERS_COLLECTION = "users";
const WALLET_TRANSACTIONS_COLLECTION = "walletTransactions";

export async function getWithdrawals(status = "all", maxLimit = 100) {
  let q;

  if (status === "all") {
    q = query(
      collection(db, WITHDRAWALS_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(maxLimit)
    );
  } else {
    q = query(
      collection(db, WITHDRAWALS_COLLECTION),
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

export async function approveWithdrawal(withdrawalId, note = "") {
  if (!withdrawalId) {
    throw new Error("Withdrawal ID is required.");
  }

  const ref = doc(db, WITHDRAWALS_COLLECTION, withdrawalId);

  await updateDoc(ref, {
    status: "approved",
    note: note || "Approved by admin",
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function rejectWithdrawal(withdrawalId, note = "") {
  if (!withdrawalId) {
    throw new Error("Withdrawal ID is required.");
  }

  if (!note.trim()) {
    throw new Error("Rejection note is required.");
  }

  const ref = doc(db, WITHDRAWALS_COLLECTION, withdrawalId);

  await updateDoc(ref, {
    status: "rejected",
    note: note || "Rejected by admin",
    rejectedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function reopenWithdrawal(withdrawalId, note = "") {
  if (!withdrawalId) {
    throw new Error("Withdrawal ID is required.");
  }

  const ref = doc(db, WITHDRAWALS_COLLECTION, withdrawalId);

  await updateDoc(ref, {
    status: "pending",
    note: note || "Reopened by admin",
    reopenedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function markWithdrawalPaid(
  withdrawalId,
  paymentRef = "",
  note = ""
) {
  if (!withdrawalId) {
    throw new Error("Withdrawal ID is required.");
  }

  if (!paymentRef.trim()) {
    throw new Error("Payment reference / UTR is required.");
  }

  const withdrawalRef = doc(db, WITHDRAWALS_COLLECTION, withdrawalId);

  let walletTransactionData = null;

  await runTransaction(db, async (transaction) => {
    const withdrawalSnap = await transaction.get(withdrawalRef);

    if (!withdrawalSnap.exists()) {
      throw new Error("Withdrawal not found.");
    }

    const withdrawal = withdrawalSnap.data();
    const currentStatus = String(withdrawal.status || "pending").toLowerCase();

    if (currentStatus === "paid") {
      throw new Error("Withdrawal is already marked as paid.");
    }

    if (currentStatus !== "approved") {
      throw new Error("Only approved withdrawals can be marked as paid.");
    }

    const userId = withdrawal.userId;
    const amount = Number(withdrawal.amount || 0);
    const coinsFromDoc = Number(withdrawal.coins || withdrawal.deductedCoins || 0);
    const coinValue = Number(withdrawal.coinValue || 100);

    const coinsToDeduct =
      coinsFromDoc > 0 ? coinsFromDoc : Math.ceil(amount * coinValue);

    if (!userId) {
      throw new Error("User ID missing in withdrawal.");
    }

    if (amount <= 0) {
      throw new Error("Invalid withdrawal amount.");
    }

    if (coinsToDeduct <= 0) {
      throw new Error("Invalid coins amount for deduction.");
    }

    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found.");
    }

    const user = userSnap.data();
    const currentCoins = Number(user.coins || 0);

    if (!withdrawal.coinsDeducted && currentCoins < coinsToDeduct) {
      throw new Error("User does not have enough coins to deduct.");
    }

    if (!withdrawal.coinsDeducted) {
      transaction.update(userRef, {
        coins: increment(-coinsToDeduct),
        updatedAt: serverTimestamp(),
      });
    }

    transaction.update(withdrawalRef, {
      status: "paid",
      paymentRef: paymentRef.trim(),
      note: note || "Marked as paid by admin",
      coinsDeducted: true,
      deductedCoins: coinsToDeduct,
      paidAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    walletTransactionData = {
      userId,
      type: "debit",
      coins: coinsToDeduct,
      amount,
      source: "withdrawal",
      status: "completed",
      withdrawalId,
      paymentRef: paymentRef.trim(),
      note: note || "Withdrawal paid by admin",
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

export async function updateWithdrawalStatus(withdrawalId, status, note = "") {
  if (!withdrawalId) {
    throw new Error("Withdrawal ID is required.");
  }

  if (!status) {
    throw new Error("Status is required.");
  }

  const ref = doc(db, WITHDRAWALS_COLLECTION, withdrawalId);

  await updateDoc(ref, {
    status,
    note,
    updatedAt: serverTimestamp(),
  });
}
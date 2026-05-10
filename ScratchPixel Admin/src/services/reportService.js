import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

const COLLECTIONS = {
  USERS: "users",
  WITHDRAWALS: "withdrawals",
  KYC_REQUESTS: "kycRequests",
  REFERRALS: "referrals",
  TASKS: "tasks",
  SUPPORT_TICKETS: "supportTickets",
};

function normalizeStatus(value, fallback = "") {
  return String(value || fallback).toLowerCase().trim();
}

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function getDashboardStats() {
  const [
    usersSnap,
    withdrawalsSnap,
    kycSnap,
    referralsSnap,
    tasksSnap,
    supportSnap,
  ] = await Promise.all([
    getDocs(collection(db, COLLECTIONS.USERS)),
    getDocs(collection(db, COLLECTIONS.WITHDRAWALS)),
    getDocs(collection(db, COLLECTIONS.KYC_REQUESTS)),
    getDocs(collection(db, COLLECTIONS.REFERRALS)),
    getDocs(collection(db, COLLECTIONS.TASKS)),
    getDocs(collection(db, COLLECTIONS.SUPPORT_TICKETS)),
  ]);

  let totalCoins = 0;
  let activeUsers = 0;
  let blockedUsers = 0;
  let suspendedUsers = 0;
  let suspiciousUsers = 0;
  let highRiskUsers = 0;

  let pendingWithdrawals = 0;
  let approvedWithdrawals = 0;
  let paidWithdrawals = 0;
  let rejectedWithdrawals = 0;

  let totalWithdrawalAmount = 0;
  let pendingWithdrawalAmount = 0;
  let approvedWithdrawalAmount = 0;
  let paidWithdrawalAmount = 0;
  let rejectedWithdrawalAmount = 0;

  let pendingKyc = 0;
  let approvedKyc = 0;
  let rejectedKyc = 0;

  let pendingReferrals = 0;
  let completedReferrals = 0;
  let rejectedReferrals = 0;

  let activeTasks = 0;
  let inactiveTasks = 0;
  let draftTasks = 0;

  let openSupport = 0;
  let resolvedSupport = 0;
  let closedSupport = 0;

  usersSnap.forEach((docItem) => {
    const user = docItem.data();

    const userStatus = normalizeStatus(user.status, "active");
    const riskStatus = normalizeStatus(user.riskStatus, "normal");

    totalCoins += safeNumber(user.coins, 0);

    if (userStatus === "active") activeUsers += 1;
    if (userStatus === "blocked") blockedUsers += 1;
    if (userStatus === "suspended") suspendedUsers += 1;

    if (riskStatus === "suspicious") suspiciousUsers += 1;
    if (riskStatus === "high-risk") highRiskUsers += 1;
  });

  withdrawalsSnap.forEach((docItem) => {
    const withdrawal = docItem.data();

    const status = normalizeStatus(withdrawal.status, "pending");
    const amount = safeNumber(withdrawal.amount, 0);

    totalWithdrawalAmount += amount;

    if (status === "pending") {
      pendingWithdrawals += 1;
      pendingWithdrawalAmount += amount;
    }

    if (status === "approved") {
      approvedWithdrawals += 1;
      approvedWithdrawalAmount += amount;
    }

    if (status === "paid") {
      paidWithdrawals += 1;
      paidWithdrawalAmount += amount;
    }

    if (status === "rejected") {
      rejectedWithdrawals += 1;
      rejectedWithdrawalAmount += amount;
    }
  });

  kycSnap.forEach((docItem) => {
    const kyc = docItem.data();
    const status = normalizeStatus(kyc.status, "pending");

    if (status === "pending") pendingKyc += 1;
    if (status === "approved") approvedKyc += 1;
    if (status === "rejected") rejectedKyc += 1;
  });

  referralsSnap.forEach((docItem) => {
    const referral = docItem.data();
    const status = normalizeStatus(referral.status, "pending");

    if (status === "pending") pendingReferrals += 1;
    if (status === "completed") completedReferrals += 1;
    if (status === "rejected") rejectedReferrals += 1;
  });

  tasksSnap.forEach((docItem) => {
    const task = docItem.data();
    const status = normalizeStatus(task.status, "active");

    if (status === "active") activeTasks += 1;
    if (status === "inactive") inactiveTasks += 1;
    if (status === "draft") draftTasks += 1;
  });

  supportSnap.forEach((docItem) => {
    const ticket = docItem.data();
    const status = normalizeStatus(ticket.status, "open");

    if (["open", "replied", "in_review"].includes(status)) {
      openSupport += 1;
    }

    if (status === "resolved") resolvedSupport += 1;
    if (status === "closed") closedSupport += 1;
  });

  return {
    totalUsers: usersSnap.size,
    activeUsers,
    blockedUsers,
    suspendedUsers,
    suspiciousUsers: suspiciousUsers + highRiskUsers,
    highRiskUsers,
    totalCoins,

    totalWithdrawals: withdrawalsSnap.size,
    pendingWithdrawals,
    approvedWithdrawals,
    paidWithdrawals,
    rejectedWithdrawals,

    totalWithdrawalAmount,
    pendingWithdrawalAmount,
    approvedWithdrawalAmount,
    paidWithdrawalAmount,
    rejectedWithdrawalAmount,

    pendingKyc,
    approvedKyc,
    rejectedKyc,

    pendingReferrals,
    completedReferrals,
    rejectedReferrals,

    totalTasks: tasksSnap.size,
    activeTasks,
    inactiveTasks,
    draftTasks,

    openSupport,
    resolvedSupport,
    closedSupport,
  };
}

export async function getRecentUsers(maxLimit = 20) {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    orderBy("createdAt", "desc"),
    limit(maxLimit)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function getRecentWithdrawals(maxLimit = 10) {
  const q = query(
    collection(db, COLLECTIONS.WITHDRAWALS),
    orderBy("createdAt", "desc"),
    limit(maxLimit)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}
import {
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

async function getCollectionCount(collectionName, filters = []) {
  try {
    const baseRef = collection(db, collectionName);

    const q =
      filters.length > 0
        ? query(
            baseRef,
            ...filters.map((filter) =>
              where(filter.field, filter.operator, filter.value)
            )
          )
        : baseRef;

    const snapshot = await getCountFromServer(q);
    return snapshot.data().count || 0;
  } catch (error) {
    console.error(`Unable to count ${collectionName}`, error);
    return 0;
  }
}

export async function getAdminSidebarBadges() {
  const [
    pendingWithdrawals,
    pendingKyc,
    pendingReferrals,
    openSupport,
    repliedSupport,
    inReviewSupport,
    pendingDeleteRequests,
  ] = await Promise.all([
    getCollectionCount("withdrawals", [
      { field: "status", operator: "==", value: "pending" },
    ]),

    getCollectionCount("kycRequests", [
      { field: "status", operator: "==", value: "pending" },
    ]),

    getCollectionCount("referrals", [
      { field: "status", operator: "==", value: "pending" },
    ]),

    getCollectionCount("supportTickets", [
      { field: "status", operator: "==", value: "open" },
    ]),

    getCollectionCount("supportTickets", [
      { field: "status", operator: "==", value: "replied" },
    ]),

    getCollectionCount("supportTickets", [
      { field: "status", operator: "==", value: "in_review" },
    ]),

    getCollectionCount("accountDeletionRequests", [
      { field: "status", operator: "==", value: "pending" },
    ]),
  ]);

  return {
    withdrawals: pendingWithdrawals,
    kyc: pendingKyc,
    referrals: pendingReferrals,
    support: openSupport + repliedSupport + inReviewSupport,
    users: pendingDeleteRequests,
  };
}
import { useEffect, useState } from "react";
import * as withdrawalService from "../services/withdrawalService";

const {
  getWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  markWithdrawalPaid,
  updateWithdrawalStatus,
} = withdrawalService;

const reopenWithdrawal = withdrawalService.reopenWithdrawal;

const VALID_STATUSES = ["all", "pending", "approved", "paid", "rejected"];

export default function useWithdrawals(defaultStatus = "all", autoLoad = true) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [status, setStatus] = useState(defaultStatus);

  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState("");

  function isValidId(id) {
    return !!String(id || "").trim();
  }

  function safeStatus(value = "all") {
    return VALID_STATUSES.includes(value) ? value : "all";
  }

  async function loadWithdrawals(nextStatus = status, maxLimit = 100) {
    try {
      setLoading(true);
      setError("");

      const finalStatus = safeStatus(nextStatus);
      const safeLimit = Number(maxLimit) > 0 ? Number(maxLimit) : 100;

      const data = await getWithdrawals(finalStatus, safeLimit);

      setWithdrawals(data);
      setStatus(finalStatus);

      return data;
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load withdrawals.");
      return [];
    } finally {
      setLoading(false);
    }
  }

  function updateWithdrawalInState(id, updates) {
    setWithdrawals((items) =>
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }

  async function approve(id, note = "Approved by admin") {
    if (!isValidId(id)) {
      setError("Withdrawal ID is missing.");
      return false;
    }

    try {
      setError("");

      await approveWithdrawal(id, note);

      updateWithdrawalInState(id, {
        status: "approved",
        note,
        approvedAt: new Date(),
        updatedAt: new Date(),
      });

      return true;
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to approve withdrawal.");
      return false;
    }
  }

  async function reject(id, note = "Rejected by admin") {
    if (!isValidId(id)) {
      setError("Withdrawal ID is missing.");
      return false;
    }

    try {
      setError("");

      await rejectWithdrawal(id, note);

      updateWithdrawalInState(id, {
        status: "rejected",
        note,
        rejectedAt: new Date(),
        updatedAt: new Date(),
      });

      return true;
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to reject withdrawal.");
      return false;
    }
  }

  async function markPaid(id, paymentRef = "", note = "Marked as paid by admin") {
    if (!isValidId(id)) {
      setError("Withdrawal ID is missing.");
      return false;
    }

    try {
      setError("");

      await markWithdrawalPaid(id, paymentRef, note);

      updateWithdrawalInState(id, {
        status: "paid",
        paymentRef,
        note,
        coinsDeducted: true,
        paidAt: new Date(),
        updatedAt: new Date(),
      });

      return true;
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to mark withdrawal as paid.");
      return false;
    }
  }

  async function reopen(id, note = "") {
    if (!isValidId(id)) {
      setError("Withdrawal ID is missing.");
      return false;
    }

    try {
      setError("");

      if (typeof reopenWithdrawal === "function") {
        await reopenWithdrawal(id, note);
      } else {
        await updateWithdrawalStatus(id, "pending", note);
      }

      updateWithdrawalInState(id, {
        status: "pending",
        note,
        reopenedAt: new Date(),
        updatedAt: new Date(),
      });

      return true;
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to reopen withdrawal.");
      return false;
    }
  }

  async function updateStatus(id, nextStatus, note = "") {
    if (!isValidId(id)) {
      setError("Withdrawal ID is missing.");
      return false;
    }

    if (!VALID_STATUSES.includes(nextStatus) || nextStatus === "all") {
      setError("Invalid withdrawal status.");
      return false;
    }

    try {
      setError("");

      await updateWithdrawalStatus(id, nextStatus, note);

      updateWithdrawalInState(id, {
        status: nextStatus,
        note,
        updatedAt: new Date(),
      });

      return true;
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update withdrawal status.");
      return false;
    }
  }

  useEffect(() => {
    if (autoLoad) {
      loadWithdrawals(defaultStatus);
    }
  }, [autoLoad, defaultStatus]);

  return {
    withdrawals,
    status,
    loading,
    error,

    setWithdrawals,
    setStatus,
    setError,

    loadWithdrawals,

    approve,
    reject,
    markPaid,
    reopen,
    updateStatus,
  };
}
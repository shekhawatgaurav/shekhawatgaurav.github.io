import { useEffect, useMemo, useState } from "react";
import { Download, RefreshCcw, BadgeIndianRupee } from "lucide-react";

import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";
import StatCard from "../../components/cards/StatCard";

import { formatCurrency, formatCoins } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/formatDate";
import { downloadCSV } from "../../utils/helpers";

import {
  approveWithdrawal,
  getWithdrawals,
  markWithdrawalPaid,
  rejectWithdrawal,
  reopenWithdrawal,
} from "../../services/withdrawalService";

function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const [confirmData, setConfirmData] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData(nextStatus = status) {
    try {
      setLoading(true);
      setError("");
      setStatus(nextStatus);

      const data = await getWithdrawals(nextStatus, 100);
      setWithdrawals(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load withdrawals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData("all");
  }, []);

  const filteredWithdrawals = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return withdrawals;

    return withdrawals.filter((item) => {
      return (
        String(item.userName || "").toLowerCase().includes(keyword) ||
        String(item.userEmail || "").toLowerCase().includes(keyword) ||
        String(item.userPhone || "").toLowerCase().includes(keyword) ||
        String(item.userId || "").toLowerCase().includes(keyword) ||
        String(item.upiId || "").toLowerCase().includes(keyword) ||
        String(item.status || "").toLowerCase().includes(keyword) ||
        String(item.paymentRef || "").toLowerCase().includes(keyword)
      );
    });
  }, [withdrawals, search]);

  function getStatusType(value) {
    const statusValue = String(value || "pending").toLowerCase();

    if (statusValue === "approved" || statusValue === "paid") return "success";
    if (statusValue === "pending") return "warning";
    if (statusValue === "rejected") return "danger";

    return "muted";
  }

  function openConfirm(row, action) {
    setAdminNote("");
    setError("");
    setMessage("");

    setConfirmData({
      id: row.id,
      action,
      user: row.userName || row.userId || "Unknown User",
      amount: row.amount || 0,
      coins: row.coins || row.deductedCoins || 0,
      upiId: row.upiId || "N/A",
    });
  }

  function closeConfirm() {
    if (processing) return;

    setConfirmData(null);
    setAdminNote("");
  }

  function openPaidModal(row) {
    setPaymentRef("");
    setAdminNote("");
    setError("");
    setMessage("");
    setPaymentModal(row);
  }

  function closePaidModal() {
    if (processing) return;

    setPaymentModal(null);
    setPaymentRef("");
    setAdminNote("");
  }

  async function handleConfirm(e) {
    e?.preventDefault?.();

    if (!confirmData) return;

    setError("");
    setMessage("");

    if (confirmData.action === "reject" && !adminNote.trim()) {
      setError("Rejection note is required.");
      return;
    }

    try {
      setProcessing(true);

      if (confirmData.action === "approve") {
        await approveWithdrawal(
          confirmData.id,
          adminNote.trim() || "Approved by admin"
        );

        setMessage("Withdrawal approved successfully.");
      }

      if (confirmData.action === "reject") {
        await rejectWithdrawal(
          confirmData.id,
          adminNote.trim() || "Rejected by admin"
        );

        setMessage("Withdrawal rejected successfully.");
      }

      if (confirmData.action === "reopen") {
        await reopenWithdrawal(
          confirmData.id,
          adminNote.trim() || "Reopened by admin"
        );

        setMessage("Withdrawal reopened successfully.");
      }

      closeConfirm();
      await loadData(status);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update withdrawal.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleMarkPaid(e) {
    e?.preventDefault?.();

    if (!paymentModal) return;

    setError("");
    setMessage("");

    if (!paymentRef.trim()) {
      setError("Payment reference / UTR is required.");
      return;
    }

    try {
      setProcessing(true);

      await markWithdrawalPaid(
        paymentModal.id,
        paymentRef.trim(),
        adminNote.trim() || "Marked as paid by admin"
      );

      setMessage("Withdrawal marked as paid and coins deducted.");
      closePaidModal();
      await loadData(status);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to mark withdrawal as paid.");
    } finally {
      setProcessing(false);
    }
  }

  function exportWithdrawals() {
    const rows = filteredWithdrawals.map((item) => ({
      id: item.id,
      userId: item.userId || "",
      name: item.userName || "",
      email: item.userEmail || "",
      phone: item.userPhone || "",
      amount: item.amount || 0,
      coins: item.coins || item.deductedCoins || 0,
      upiId: item.upiId || "",
      status: item.status || "",
      paymentRef: item.paymentRef || "",
      note: item.note || "",
      createdAt: formatDateTime(item.createdAt),
      updatedAt: formatDateTime(item.updatedAt),
    }));

    downloadCSV("withdrawals.csv", rows);
  }

  const columns = [
    {
      key: "user",
      label: "User",
      render: (row) => (
        <div>
          <strong>{row.userName || "Unknown User"}</strong>
          <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
            {row.userEmail || row.userPhone || row.userId || "No info"}
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => <strong>{formatCurrency(row.amount || 0)}</strong>,
    },
    {
      key: "coins",
      label: "Coins",
      render: (row) => formatCoins(row.coins || row.deductedCoins || 0),
    },
    {
      key: "upiId",
      label: "UPI ID",
      render: (row) => row.upiId || "N/A",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge type={getStatusType(row.status)} dot>
          {row.status || "pending"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Requested",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  const pendingCount = withdrawals.filter(
    (item) => String(item.status || "pending").toLowerCase() === "pending"
  ).length;

  const approvedCount = withdrawals.filter(
    (item) => String(item.status || "").toLowerCase() === "approved"
  ).length;

  const paidCount = withdrawals.filter(
    (item) => String(item.status || "").toLowerCase() === "paid"
  ).length;

  const rejectedCount = withdrawals.filter(
    (item) => String(item.status || "").toLowerCase() === "rejected"
  ).length;

  if (loading) return <Loader text="Loading withdrawals..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Withdrawals</h2>
          <p>Approve, reject, reopen and mark withdrawal requests as paid.</p>
        </div>

        <div className="actions" style={{ marginTop: 0 }}>
          <Button variant="secondary" onClick={() => loadData(status)}>
            <RefreshCcw size={18} />
            Refresh
          </Button>

          <Button variant="secondary" onClick={exportWithdrawals}>
            <Download size={18} />
            Export CSV
          </Button>
        </div>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard
          title="Pending"
          value={pendingCount}
          icon={BadgeIndianRupee}
          variant="warning"
        />

        <StatCard
          title="Approved"
          value={approvedCount}
          icon={BadgeIndianRupee}
          variant="success"
        />

        <StatCard
          title="Paid"
          value={paidCount}
          icon={BadgeIndianRupee}
          variant="primary"
        />

        <StatCard
          title="Rejected"
          value={rejectedCount}
          icon={BadgeIndianRupee}
          variant="danger"
        />
      </div>

      <div className="card table-card">
        <div className="table-header">
          <h3>Withdrawal Requests</h3>

          <div className="actions" style={{ marginTop: 0 }}>
            <input
              className="search-input"
              type="search"
              placeholder="Search user, UPI, status, UTR..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="search-input"
              value={status}
              onChange={(e) => loadData(e.target.value)}
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredWithdrawals}
          emptyText="No withdrawal requests found."
          showIndex
          renderActions={(row) => {
            const currentStatus = String(row.status || "pending")
              .toLowerCase()
              .trim();

            return (
              <div className="actions" style={{ marginTop: 0 }}>
                {currentStatus === "pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => openConfirm(row, "approve")}
                    >
                      Approve
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => openConfirm(row, "reject")}
                    >
                      Reject
                    </Button>
                  </>
                )}

                {currentStatus === "approved" && (
                  <>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => openPaidModal(row)}
                    >
                      Mark Paid
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openConfirm(row, "reopen")}
                    >
                      Back Pending
                    </Button>
                  </>
                )}

                {currentStatus === "rejected" && (
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => openConfirm(row, "reopen")}
                  >
                    Reopen
                  </Button>
                )}

                {currentStatus === "paid" && (
                  <Badge type="paid" dot>
                    Done
                  </Badge>
                )}
              </div>
            );
          }}
        />
      </div>

      <Modal
        isOpen={!!confirmData}
        title={
          confirmData?.action === "approve"
            ? "Approve withdrawal?"
            : confirmData?.action === "reject"
            ? "Reject withdrawal?"
            : "Move withdrawal back to pending?"
        }
        onClose={closeConfirm}
        closeOnBackdrop={!processing}
      >
        {confirmData && (
          <form className="form-grid" onSubmit={handleConfirm}>
            <div className="detail-list">
              <div className="detail-item">
                <span>User</span>
                <strong>{confirmData.user}</strong>
              </div>

              <div className="detail-item">
                <span>Amount</span>
                <strong>{formatCurrency(confirmData.amount || 0)}</strong>
              </div>

              <div className="detail-item">
                <span>Coins</span>
                <strong>{formatCoins(confirmData.coins || 0)}</strong>
              </div>

              <div className="detail-item">
                <span>UPI ID</span>
                <strong>{confirmData.upiId}</strong>
              </div>
            </div>

            <div className="form-row">
              <label>
                Admin Note{" "}
                {confirmData.action === "reject" ? "(Required)" : "(Optional)"}
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={
                  confirmData.action === "reject"
                    ? "Example: Invalid UPI ID / suspicious activity..."
                    : "Optional admin note..."
                }
              />
            </div>

            <div className="actions">
              <Button
                type="button"
                variant="secondary"
                onClick={closeConfirm}
                disabled={processing}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant={
                  confirmData.action === "reject"
                    ? "danger"
                    : confirmData.action === "reopen"
                    ? "warning"
                    : "success"
                }
                loading={processing}
              >
                Continue
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={!!paymentModal}
        title="Mark withdrawal as paid"
        onClose={closePaidModal}
        closeOnBackdrop={!processing}
      >
        {paymentModal && (
          <form className="form-grid" onSubmit={handleMarkPaid}>
            <div className="warning-box">
              Mark paid only after manually sending payment to UPI ID:{" "}
              <b>{paymentModal.upiId || "N/A"}</b>
            </div>

            <div className="detail-list">
              <div className="detail-item">
                <span>User</span>
                <strong>{paymentModal.userName || paymentModal.userId}</strong>
              </div>

              <div className="detail-item">
                <span>Amount</span>
                <strong>{formatCurrency(paymentModal.amount || 0)}</strong>
              </div>

              <div className="detail-item">
                <span>Coins</span>
                <strong>
                  {formatCoins(paymentModal.coins || paymentModal.deductedCoins || 0)}
                </strong>
              </div>

              <div className="detail-item">
                <span>UPI ID</span>
                <strong>{paymentModal.upiId || "N/A"}</strong>
              </div>
            </div>

            <div className="form-row">
              <label>Payment Reference / UTR</label>
              <input
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="UPI transaction ID / UTR"
              />
            </div>

            <div className="form-row">
              <label>Admin Note</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Optional note..."
              />
            </div>

            <div className="actions">
              <Button
                type="button"
                variant="secondary"
                onClick={closePaidModal}
                disabled={processing}
              >
                Cancel
              </Button>

              <Button type="submit" variant="success" loading={processing}>
                Confirm Paid
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default Withdrawals;
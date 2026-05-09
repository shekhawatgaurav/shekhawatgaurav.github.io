import { useEffect, useState } from "react";
import { CheckCircle, RefreshCcw, XCircle } from "lucide-react";

import useWithdrawals from "../../hooks/useWithdrawals";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";

import { formatCurrency, formatCoins } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/formatDate";

function PendingWithdrawals() {
  const { withdrawals, loading, error, loadWithdrawals, approve, reject } =
    useWithdrawals("pending", false);

  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [actionType, setActionType] = useState("");
  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    loadWithdrawals("pending");
  }, []);

  function openActionModal(row, type) {
    setSelectedWithdrawal(row);
    setActionType(type);
    setNote("");
    setMessage("");
    setLocalError("");
  }

  function closeActionModal() {
    if (saving) return;

    setSelectedWithdrawal(null);
    setActionType("");
    setNote("");
  }

  async function handleAction(e) {
    e.preventDefault();

    setMessage("");
    setLocalError("");

    if (!selectedWithdrawal || !actionType) return;

    if (actionType === "reject" && !note.trim()) {
      setLocalError("Rejection note is required.");
      return;
    }

    try {
      setSaving(true);

      let success = false;

      if (actionType === "approve") {
        success = await approve(
          selectedWithdrawal.id,
          note.trim() || "Approved by admin"
        );
      }

      if (actionType === "reject") {
        success = await reject(
          selectedWithdrawal.id,
          note.trim() || "Rejected by admin"
        );
      }

      if (success) {
        setMessage(
          actionType === "approve"
            ? "Withdrawal approved successfully."
            : "Withdrawal rejected successfully."
        );

        closeActionModal();
        await loadWithdrawals("pending");
      }
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    {
      key: "userName",
      label: "User",
      render: (row) => (
        <div>
          <strong>{row.userName || row.userId || "Unknown"}</strong>
          <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
            {row.userEmail || row.userPhone || row.userId || "No user info"}
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
      render: () => (
        <Badge type="pending" dot>
          pending
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Requested",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  if (loading) return <Loader text="Loading pending withdrawals..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Pending Withdrawals</h2>
          <p>Requests waiting for review.</p>
        </div>

        <Button variant="secondary" onClick={() => loadWithdrawals("pending")}>
          <RefreshCcw size={18} />
          Refresh
        </Button>
      </div>

      {message && <div className="success-box">{message}</div>}
      {(error || localError) && (
        <div className="error-box">{error || localError}</div>
      )}

      <div className="card table-card">
        <div className="table-header">
          <h3>Pending Requests</h3>
        </div>

        <Table
          columns={columns}
          data={withdrawals}
          emptyText="No pending withdrawals found."
          showIndex
          renderActions={(row) => (
            <div className="actions" style={{ marginTop: 0 }}>
              <Button
                size="sm"
                variant="success"
                onClick={() => openActionModal(row, "approve")}
              >
                <CheckCircle size={16} />
                Approve
              </Button>

              <Button
                size="sm"
                variant="danger"
                onClick={() => openActionModal(row, "reject")}
              >
                <XCircle size={16} />
                Reject
              </Button>
            </div>
          )}
        />
      </div>

      <Modal
        isOpen={!!selectedWithdrawal}
        title={
          actionType === "approve"
            ? "Approve withdrawal?"
            : "Reject withdrawal?"
        }
        onClose={closeActionModal}
        closeOnBackdrop={!saving}
      >
        {selectedWithdrawal && (
          <form className="form-grid" onSubmit={handleAction}>
            <div className="detail-list">
              <div className="detail-item">
                <span>User</span>
                <strong>
                  {selectedWithdrawal.userName ||
                    selectedWithdrawal.userId ||
                    "Unknown"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Amount</span>
                <strong>{formatCurrency(selectedWithdrawal.amount || 0)}</strong>
              </div>

              <div className="detail-item">
                <span>Coins</span>
                <strong>
                  {formatCoins(
                    selectedWithdrawal.coins ||
                      selectedWithdrawal.deductedCoins ||
                      0
                  )}
                </strong>
              </div>

              <div className="detail-item">
                <span>UPI ID</span>
                <strong>{selectedWithdrawal.upiId || "N/A"}</strong>
              </div>
            </div>

            <div className="form-row">
              <label>
                Admin Note {actionType === "reject" ? "(Required)" : "(Optional)"}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  actionType === "approve"
                    ? "Example: Verified and approved..."
                    : "Example: Invalid UPI ID / suspicious activity..."
                }
              />
            </div>

            <div className="actions">
              <Button
                type="button"
                variant="secondary"
                onClick={closeActionModal}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant={actionType === "approve" ? "success" : "danger"}
                loading={saving}
              >
                {actionType === "approve" ? "Confirm Approve" : "Confirm Reject"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default PendingWithdrawals;
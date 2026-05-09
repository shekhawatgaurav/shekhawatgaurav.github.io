import { useEffect, useState } from "react";
import { RefreshCcw, BadgeIndianRupee } from "lucide-react";

import useWithdrawals from "../../hooks/useWithdrawals";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";

import { formatCurrency, formatCoins } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/formatDate";

function ApprovedWithdrawals() {
  const { withdrawals, loading, error, loadWithdrawals, markPaid } =
    useWithdrawals("approved", false);

  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    loadWithdrawals("approved");
  }, []);

  function openPaidModal(row) {
    setSelectedWithdrawal(row);
    setPaymentRef("");
    setNote("");
    setMessage("");
    setLocalError("");
  }

  function closePaidModal() {
    if (saving) return;

    setSelectedWithdrawal(null);
    setPaymentRef("");
    setNote("");
  }

  async function handleMarkPaid(e) {
    e.preventDefault();

    setMessage("");
    setLocalError("");

    if (!selectedWithdrawal) return;

    if (!paymentRef.trim()) {
      setLocalError("Payment reference is required.");
      return;
    }

    try {
      setSaving(true);

      const success = await markPaid(
        selectedWithdrawal.id,
        paymentRef.trim(),
        note.trim() || "Payment completed by admin"
      );

      if (success) {
        setMessage("Withdrawal marked as paid successfully.");
        closePaidModal();
        await loadWithdrawals("approved");
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
        <Badge type="approved" dot>
          approved
        </Badge>
      ),
    },
    {
      key: "approvedAt",
      label: "Approved",
      render: (row) => formatDateTime(row.approvedAt || row.updatedAt || row.createdAt),
    },
  ];

  if (loading) return <Loader text="Loading approved withdrawals..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Approved Withdrawals</h2>
          <p>Requests approved and waiting for payment.</p>
        </div>

        <Button variant="secondary" onClick={() => loadWithdrawals("approved")}>
          <RefreshCcw size={18} />
          Refresh
        </Button>
      </div>

      {message && <div className="success-box">{message}</div>}
      {(error || localError) && <div className="error-box">{error || localError}</div>}

      <div className="card table-card">
        <div className="table-header">
          <h3>Approved Requests</h3>
        </div>

        <Table
          columns={columns}
          data={withdrawals}
          emptyText="No approved withdrawals found."
          showIndex
          renderActions={(row) => (
            <Button size="sm" variant="success" onClick={() => openPaidModal(row)}>
              <BadgeIndianRupee size={16} />
              Mark Paid
            </Button>
          )}
        />
      </div>

      <Modal
        isOpen={!!selectedWithdrawal}
        title="Mark withdrawal as paid"
        onClose={closePaidModal}
        closeOnBackdrop={!saving}
      >
        {selectedWithdrawal && (
          <form className="form-grid" onSubmit={handleMarkPaid}>
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
                <span>UPI ID</span>
                <strong>{selectedWithdrawal.upiId || "N/A"}</strong>
              </div>
            </div>

            <div className="form-row">
              <label>Payment Reference / UTR</label>
              <input
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="Enter UTR / transaction reference"
              />
            </div>

            <div className="form-row">
              <label>Admin Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note..."
              />
            </div>

            <div className="actions">
              <Button
                type="button"
                variant="secondary"
                onClick={closePaidModal}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button type="submit" variant="success" loading={saving}>
                Confirm Paid
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default ApprovedWithdrawals;
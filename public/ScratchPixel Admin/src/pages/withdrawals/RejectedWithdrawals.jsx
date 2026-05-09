import { useEffect, useState } from "react";
import { RefreshCcw, RotateCcw } from "lucide-react";

import useWithdrawals from "../../hooks/useWithdrawals";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { formatCurrency, formatCoins } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/formatDate";

function RejectedWithdrawals() {
  const { withdrawals, loading, error, loadWithdrawals, reopen } =
    useWithdrawals("rejected", false);

  const [confirmData, setConfirmData] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    loadWithdrawals("rejected");
  }, []);

  async function handleReopen() {
    if (!confirmData?.id) return;

    try {
      setProcessing(true);
      setMessage("");
      setLocalError("");

      const success = await reopen(
        confirmData.id,
        "Reopened by admin from rejected withdrawals"
      );

      if (success) {
        setMessage("Withdrawal moved back to pending successfully.");
        setConfirmData(null);
        await loadWithdrawals("rejected");
      }
    } catch (err) {
      console.error(err);
      setLocalError("Unable to reopen withdrawal.");
    } finally {
      setProcessing(false);
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
      key: "note",
      label: "Reason",
      render: (row) => row.note || "No reason added",
    },
    {
      key: "status",
      label: "Status",
      render: () => (
        <Badge type="rejected" dot>
          rejected
        </Badge>
      ),
    },
    {
      key: "rejectedAt",
      label: "Rejected",
      render: (row) =>
        formatDateTime(row.rejectedAt || row.updatedAt || row.createdAt),
    },
  ];

  if (loading) return <Loader text="Loading rejected withdrawals..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Rejected Withdrawals</h2>
          <p>Requests rejected due to fraud, invalid UPI or policy issues.</p>
        </div>

        <Button variant="secondary" onClick={() => loadWithdrawals("rejected")}>
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
          <h3>Rejected Requests</h3>
        </div>

        <Table
          columns={columns}
          data={withdrawals}
          emptyText="No rejected withdrawals found."
          showIndex
          renderActions={(row) => (
            <Button
              size="sm"
              variant="warning"
              onClick={() =>
                setConfirmData({
                  id: row.id,
                  title: "Reopen withdrawal?",
                  message:
                    "This rejected withdrawal will be moved back to pending for review.",
                })
              }
            >
              <RotateCcw size={16} />
              Reopen
            </Button>
          )}
        />
      </div>

      <ConfirmDialog
        isOpen={!!confirmData}
        title={confirmData?.title}
        message={confirmData?.message}
        confirmText="Reopen"
        variant="warning"
        loading={processing}
        onCancel={() => {
          if (!processing) setConfirmData(null);
        }}
        onConfirm={handleReopen}
      />
    </div>
  );
}

export default RejectedWithdrawals;
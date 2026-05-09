import { useEffect, useMemo, useState } from "react";
import {
  RefreshCcw,
  Users,
  Gift,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";

import {
  completeReferralManually,
  getReferrals,
  rejectReferral,
  reopenReferral,
} from "../../services/referralService";

import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import StatCard from "../../components/cards/StatCard";

import { formatDateTime } from "../../utils/formatDate";
import { formatCoins } from "../../utils/formatCurrency";

function Referrals() {
  const [referrals, setReferrals] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [actionData, setActionData] = useState(null);
  const [adminNote, setAdminNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadReferrals() {
    try {
      setLoading(true);
      setError("");

      const data = await getReferrals(150);
      setReferrals(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load referrals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReferrals();
  }, []);

  const filteredReferrals = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return referrals.filter((item) => {
      const itemStatus = String(item.status || "pending").toLowerCase();
      const statusMatch = status === "all" || itemStatus === status;

      const searchMatch =
        !keyword ||
        String(item.referrerName || "").toLowerCase().includes(keyword) ||
        String(item.referredName || "").toLowerCase().includes(keyword) ||
        String(item.referrerId || "").toLowerCase().includes(keyword) ||
        String(item.referredUserId || "").toLowerCase().includes(keyword) ||
        String(item.referralCode || "").toLowerCase().includes(keyword) ||
        String(item.status || "").toLowerCase().includes(keyword) ||
        String(item.rewardCoins || "").toLowerCase().includes(keyword);

      return statusMatch && searchMatch;
    });
  }, [referrals, search, status]);

  const totalRewardCoins = referrals
    .filter((item) => String(item.status || "").toLowerCase() === "completed")
    .reduce((sum, item) => sum + Number(item.rewardCoins || 0), 0);

  const pendingCount = referrals.filter(
    (item) => String(item.status || "pending").toLowerCase() === "pending"
  ).length;

  const completedCount = referrals.filter(
    (item) => String(item.status || "").toLowerCase() === "completed"
  ).length;

  const rejectedCount = referrals.filter(
    (item) => String(item.status || "").toLowerCase() === "rejected"
  ).length;

  function getStatusType(value) {
    const referralStatus = String(value || "pending").toLowerCase();

    if (referralStatus === "completed") return "success";
    if (referralStatus === "rejected") return "danger";
    if (referralStatus === "pending") return "warning";

    return "muted";
  }

  function openAction(row, action) {
    setAdminNote("");
    setMessage("");
    setError("");

    setActionData({
      id: row.id,
      action,
      referrerName: row.referrerName || row.referrerId || "Unknown Referrer",
      referredName:
        row.referredName || row.referredUserId || "Unknown Friend",
      rewardCoins: Number(row.rewardCoins || 25),
    });
  }

  function closeAction() {
    if (processing) return;

    setActionData(null);
    setAdminNote("");
  }

  async function handleAction(e) {
    e?.preventDefault?.();

    if (!actionData) return;

    setMessage("");
    setError("");

    if (actionData.action === "reject" && !adminNote.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    try {
      setProcessing(true);

      if (actionData.action === "complete") {
        await completeReferralManually(
          actionData.id,
          adminNote.trim() || "Referral reward manually approved by admin"
        );

        setMessage("Referral completed and reward credited.");
      }

      if (actionData.action === "reject") {
        await rejectReferral(
          actionData.id,
          adminNote.trim() || "Referral rejected by admin"
        );

        setMessage("Referral rejected successfully.");
      }

      if (actionData.action === "reopen") {
        await reopenReferral(
          actionData.id,
          adminNote.trim() || "Referral reopened by admin"
        );

        setMessage("Referral reopened successfully.");
      }

      closeAction();
      await loadReferrals();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update referral.");
    } finally {
      setProcessing(false);
    }
  }

  const columns = [
    {
      key: "referrer",
      label: "Referrer",
      render: (row) => (
        <div>
          <strong>{row.referrerName || "Unknown"}</strong>
          <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
            {row.referrerId || "No ID"}
          </p>
        </div>
      ),
    },
    {
      key: "referred",
      label: "Referred User",
      render: (row) => (
        <div>
          <strong>{row.referredName || "Unknown"}</strong>
          <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
            {row.referredUserId || "No ID"}
          </p>
        </div>
      ),
    },
    {
      key: "referralCode",
      label: "Code",
      render: (row) => row.referralCode || "N/A",
    },
    {
      key: "rewardCoins",
      label: "Reward",
      render: (row) => `${formatCoins(row.rewardCoins || 0)} coins`,
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
      label: "Date",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  if (loading) return <Loader text="Loading referrals..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Referrals</h2>
          <p>Track referral joins, unlock progress and reward approvals.</p>
        </div>

        <Button variant="secondary" onClick={loadReferrals}>
          <RefreshCcw size={18} />
          Refresh
        </Button>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard
          title="Total Referrals"
          value={referrals.length}
          icon={Users}
        />

        <StatCard
          title="Pending"
          value={pendingCount}
          icon={Gift}
          variant="warning"
        />

        <StatCard
          title="Completed"
          value={completedCount}
          icon={CheckCircle}
          variant="success"
        />

        <StatCard
          title="Rejected"
          value={rejectedCount}
          icon={XCircle}
          variant="danger"
        />
      </div>

      <div className="grid grid-1" style={{ marginBottom: 18 }}>
        <StatCard
          title="Reward Coins Credited"
          value={formatCoins(totalRewardCoins)}
          icon={Gift}
          subtitle="Completed referrals only"
          variant="success"
        />
      </div>

      <div className="card table-card">
        <div className="table-header">
          <h3>Referral History</h3>

          <div className="actions" style={{ marginTop: 0 }}>
            <input
              className="search-input"
              type="search"
              placeholder="Search name, code, user ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="search-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredReferrals}
          emptyText="No referrals found."
          showIndex
          renderActions={(row) => {
            const rowStatus = String(row.status || "pending").toLowerCase();

            return (
              <div className="actions" style={{ marginTop: 0 }}>
                {rowStatus === "pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => openAction(row, "complete")}
                    >
                      Complete
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => openAction(row, "reject")}
                    >
                      Reject
                    </Button>
                  </>
                )}

                {rowStatus === "rejected" && (
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => openAction(row, "reopen")}
                  >
                    <RotateCcw size={14} />
                    Reopen
                  </Button>
                )}

                {rowStatus === "completed" && (
                  <Badge type="completed" dot>
                    Reward Given
                  </Badge>
                )}
              </div>
            );
          }}
        />
      </div>

      <Modal
        isOpen={!!actionData}
        title={
          actionData?.action === "complete"
            ? "Complete referral?"
            : actionData?.action === "reject"
            ? "Reject referral?"
            : "Reopen referral?"
        }
        onClose={closeAction}
        closeOnBackdrop={!processing}
      >
        {actionData && (
          <form className="form-grid" onSubmit={handleAction}>
            <div className="detail-list">
              <div className="detail-item">
                <span>Referrer</span>
                <strong>{actionData.referrerName}</strong>
              </div>

              <div className="detail-item">
                <span>Referred User</span>
                <strong>{actionData.referredName}</strong>
              </div>

              <div className="detail-item">
                <span>Reward Coins</span>
                <strong>{formatCoins(actionData.rewardCoins)}</strong>
              </div>
            </div>

            <div className="form-row">
              <label>
                {actionData.action === "reject"
                  ? "Rejection Reason (Required)"
                  : "Admin Note (Optional)"}
              </label>

              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={
                  actionData.action === "reject"
                    ? "Example: Invalid referral activity."
                    : "Optional note..."
                }
              />
            </div>

            <div className="actions">
              <Button
                type="button"
                variant="secondary"
                onClick={closeAction}
                disabled={processing}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant={
                  actionData.action === "complete"
                    ? "success"
                    : actionData.action === "reject"
                    ? "danger"
                    : "warning"
                }
                disabled={processing}
                loading={processing}
              >
                {actionData.action === "complete"
                  ? "Complete"
                  : actionData.action === "reject"
                  ? "Reject"
                  : "Reopen"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default Referrals;
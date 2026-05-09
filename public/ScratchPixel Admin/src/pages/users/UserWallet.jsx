import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Coins, Plus, Minus, RefreshCcw } from "lucide-react";

import useUsers from "../../hooks/useUsers";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import StatCard from "../../components/cards/StatCard";

import { getUserWalletTransactions } from "../../services/walletService";

import {
  addCoinsToUser,
  removeCoinsFromUser,
} from "../../services/userService";

import { formatCoins, formatCurrency } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/formatDate";

function UserWallet() {
  const { userId } = useParams();

  const { selectedUser, loading, error, loadUserById } = useUsers(false);

  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    type: "credit",
    coins: "",
    note: "",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [txLoading, setTxLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [walletError, setWalletError] = useState("");

  function normalize(value = "", fallback = "") {
    return String(value || fallback).toLowerCase().trim();
  }

  async function loadWallet() {
    try {
      setTxLoading(true);
      setWalletError("");

      const data = await getUserWalletTransactions(userId, 100);
      setTransactions(data);
    } catch (err) {
      console.error(err);
      setWalletError(err.message || "Unable to load wallet transactions.");
    } finally {
      setTxLoading(false);
    }
  }

  async function refreshAll() {
    try {
      setMessage("");
      setWalletError("");
      await Promise.all([loadUserById(userId), loadWallet()]);
    } catch (err) {
      console.error(err);
      setWalletError(err.message || "Unable to refresh wallet.");
    }
  }

  useEffect(() => {
    refreshAll();
  }, [userId]);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function validateBeforeConfirm(e) {
    e.preventDefault();

    setMessage("");
    setWalletError("");

    const coinAmount = Number(formData.coins || 0);
    const currentCoins = Number(selectedUser?.coins || 0);

    if (!Number.isFinite(coinAmount) || coinAmount <= 0) {
      setWalletError("Coins must be greater than 0.");
      return;
    }

    if (formData.type === "debit" && coinAmount > currentCoins) {
      setWalletError("Debit coins cannot be greater than current user balance.");
      return;
    }

    if (!formData.note.trim()) {
      setWalletError("Admin note is required for manual coin adjustment.");
      return;
    }

    setConfirmOpen(true);
  }

  async function handleAdjustCoins() {
    const coinAmount = Number(formData.coins || 0);
    const note = formData.note.trim();

    try {
      setSaving(true);
      setMessage("");
      setWalletError("");

      if (formData.type === "credit") {
        await addCoinsToUser(userId, coinAmount, note);
      } else {
        await removeCoinsFromUser(userId, coinAmount, note);
      }

      setFormData({
        type: "credit",
        coins: "",
        note: "",
      });

      setConfirmOpen(false);
      setMessage("Wallet updated successfully.");

      await refreshAll();
    } catch (err) {
      console.error(err);
      setWalletError(err.message || "Unable to update wallet.");
    } finally {
      setSaving(false);
    }
  }

  function getTransactionType(row) {
    return normalize(row.type) === "credit" ? "success" : "danger";
  }

  function getStatusType(status) {
    const value = normalize(status, "completed");

    if (value === "completed" || value === "paid") return "success";
    if (value === "pending") return "warning";
    if (value === "failed" || value === "rejected") return "danger";

    return "muted";
  }

  function getSourceType(source) {
    const value = normalize(source, "app");

    if (value === "admin") return "primary";
    if (value === "withdrawal") return "danger";
    if (["scratch", "ad", "ads", "task", "referral"].includes(value)) {
      return "success";
    }

    return "muted";
  }

  const creditCoins = transactions
    .filter((item) => normalize(item.type) === "credit")
    .reduce((sum, item) => sum + Number(item.coins || 0), 0);

  const debitCoins = transactions
    .filter((item) => normalize(item.type) === "debit")
    .reduce((sum, item) => sum + Number(item.coins || 0), 0);

  const netTransactionCoins = creditCoins - debitCoins;

  const columns = [
    {
      key: "type",
      label: "Type",
      render: (row) => (
        <Badge type={getTransactionType(row)} dot>
          {row.type || "transaction"}
        </Badge>
      ),
    },
    {
      key: "coins",
      label: "Coins",
      render: (row) => formatCoins(row.coins || 0),
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => formatCurrency(row.amount || 0),
    },
    {
      key: "source",
      label: "Source",
      render: (row) => (
        <Badge type={getSourceType(row.source)}>
          {row.source || "app"}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge type={getStatusType(row.status)} dot>
          {row.status || "completed"}
        </Badge>
      ),
    },
    {
      key: "note",
      label: "Note",
      render: (row) => row.note || "No note",
    },
    {
      key: "createdAt",
      label: "Date",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  if (loading || txLoading) return <Loader text="Loading user wallet..." />;

  if (!selectedUser) {
    return (
      <div className="empty-page">
        <div className="empty-card">
          <h1>User Not Found</h1>
          <p>This user does not exist.</p>
          <Link to="/users" className="primary-button">
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  const userStatus = normalize(selectedUser.status, "active");
  const riskStatus = normalize(selectedUser.riskStatus, "normal");

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>User Wallet</h2>
          <p>View wallet balance and manually adjust user coins.</p>
        </div>

        <div className="actions" style={{ marginTop: 0 }}>
          <Button variant="secondary" onClick={refreshAll}>
            <RefreshCcw size={18} />
            Refresh
          </Button>

          <Link to={`/users/${userId}/transactions`} className="secondary-button">
            Transactions
          </Link>

          <Link to={`/users/${userId}`} className="secondary-button">
            User Details
          </Link>

          <Link to="/users" className="secondary-button">
            Back
          </Link>
        </div>
      </div>

      {message && <div className="success-box">{message}</div>}
      {(error || walletError) && (
        <div className="error-box">{walletError || error}</div>
      )}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard
          title="Current Coins"
          value={formatCoins(selectedUser.coins || 0)}
          icon={Coins}
        />

        <StatCard
          title="Credits"
          value={formatCoins(creditCoins)}
          icon={Plus}
          variant="success"
        />

        <StatCard
          title="Debits"
          value={formatCoins(debitCoins)}
          icon={Minus}
          variant="danger"
        />

        <StatCard
          title="Net Txn Coins"
          value={formatCoins(netTransactionCoins)}
          icon={Coins}
          variant={netTransactionCoins >= 0 ? "success" : "danger"}
        />
      </div>

      <div className="grid grid-2">
        <div className="card form-card">
          <form className="form-grid" onSubmit={validateBeforeConfirm}>
            <h3 style={{ margin: 0 }}>Manual Coin Adjustment</h3>

            <div className="warning-box">
              Use this only for corrections, support cases or verified bonuses.
              Every manual adjustment will be recorded in wallet transactions.
            </div>

            <div className="form-row">
              <label>Adjustment Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="credit">Credit Coins</option>
                <option value="debit">Debit Coins</option>
              </select>
            </div>

            <div className="form-row">
              <label>Coins</label>
              <input
                type="number"
                min="1"
                name="coins"
                placeholder="Enter coins"
                value={formData.coins}
                onChange={handleChange}
              />
              {formData.type === "debit" && (
                <small>
                  Current balance: {formatCoins(selectedUser.coins || 0)} coins
                </small>
              )}
            </div>

            <div className="form-row">
              <label>Admin Note</label>
              <textarea
                name="note"
                placeholder="Reason for adjustment..."
                value={formData.note}
                onChange={handleChange}
              />
            </div>

            <Button
              type="submit"
              variant={formData.type === "credit" ? "success" : "danger"}
              disabled={saving}
              loading={saving}
            >
              {formData.type === "credit" ? (
                <Plus size={18} />
              ) : (
                <Minus size={18} />
              )}
              Update Wallet
            </Button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>User Summary</h3>

          <div className="detail-list">
            <div className="detail-item">
              <span>Name</span>
              <strong>{selectedUser.name || "N/A"}</strong>
            </div>

            <div className="detail-item">
              <span>Email / Phone</span>
              <strong>
                {selectedUser.email || selectedUser.phone || "N/A"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Gender</span>
              <strong>{selectedUser.gender || "Not added"}</strong>
            </div>

            <div className="detail-item">
              <span>Avatar</span>
              <strong>{selectedUser.avatarId || "avatar_1"}</strong>
            </div>

            <div className="detail-item">
              <span>UPI</span>
              <strong>{selectedUser.upiId || "N/A"}</strong>
            </div>

            <div className="detail-item">
              <span>Status</span>
              <strong>
                <Badge
                  type={userStatus === "blocked" ? "danger" : "success"}
                  dot
                >
                  {userStatus}
                </Badge>
              </strong>
            </div>

            <div className="detail-item">
              <span>Risk</span>
              <strong>
                <Badge
                  type={
                    riskStatus === "high-risk"
                      ? "danger"
                      : riskStatus === "suspicious"
                      ? "warning"
                      : "success"
                  }
                  dot
                >
                  {riskStatus}
                </Badge>
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="card table-card" style={{ marginTop: 18 }}>
        <div className="table-header">
          <h3>Wallet Transactions</h3>

          <Link to={`/users/${userId}/transactions`} className="secondary-button">
            View All
          </Link>
        </div>

        <Table
          columns={columns}
          data={transactions}
          emptyText="No wallet transactions found."
          showIndex
        />
      </div>

      <Modal
        isOpen={confirmOpen}
        title={
          formData.type === "credit"
            ? "Credit coins to user?"
            : "Debit coins from user?"
        }
        onClose={() => {
          if (!saving) setConfirmOpen(false);
        }}
        closeOnBackdrop={!saving}
      >
        <div className="detail-list">
          <div className="detail-item">
            <span>User</span>
            <strong>{selectedUser.name || selectedUser.email || userId}</strong>
          </div>

          <div className="detail-item">
            <span>Action</span>
            <strong>{formData.type === "credit" ? "Credit" : "Debit"}</strong>
          </div>

          <div className="detail-item">
            <span>Coins</span>
            <strong>{formatCoins(formData.coins || 0)}</strong>
          </div>

          <div className="detail-item">
            <span>Note</span>
            <strong>{formData.note || "No note"}</strong>
          </div>
        </div>

        <div className="actions">
          <Button
            variant="secondary"
            onClick={() => setConfirmOpen(false)}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant={formData.type === "credit" ? "success" : "danger"}
            onClick={handleAdjustCoins}
            disabled={saving}
            loading={saving}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default UserWallet;
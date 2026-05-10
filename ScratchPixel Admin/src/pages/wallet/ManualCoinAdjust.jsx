import { useState } from "react";
import { Search, Plus, Minus } from "lucide-react";

import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import StatCard from "../../components/cards/StatCard";

import {
  getUserById,
  addCoinsToUser,
  removeCoinsFromUser,
} from "../../services/userService";

import { formatCoins } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/formatDate";

function ManualCoinAdjust() {
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    type: "credit",
    coins: "",
    note: "",
  });

  const [adjustments, setAdjustments] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function normalize(value = "", fallback = "") {
    return String(value || fallback).toLowerCase().trim();
  }

  async function handleSearch(e) {
    e.preventDefault();

    setMessage("");
    setError("");
    setUser(null);

    const cleanUserId = userId.trim();

    if (!cleanUserId) {
      setError("Please enter a user ID.");
      return;
    }

    try {
      setLoading(true);

      const data = await getUserById(cleanUserId);

      if (!data) {
        setError("User not found.");
        return;
      }

      setUser(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to search user.");
    } finally {
      setLoading(false);
    }
  }

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
    setError("");

    if (!user) {
      setError("Search and select a user first.");
      return;
    }

    const coins = Number(formData.coins || 0);
    const currentCoins = Number(user.coins || 0);

    if (!Number.isFinite(coins) || coins <= 0) {
      setError("Coins must be greater than 0.");
      return;
    }

    if (formData.type === "debit" && coins > currentCoins) {
      setError("Debit coins cannot be greater than current user balance.");
      return;
    }

    if (!formData.note.trim()) {
      setError("Adjustment note is required.");
      return;
    }

    setConfirmOpen(true);
  }

  async function handleAdjust() {
    if (!user) return;

    const coins = Number(formData.coins || 0);
    const note = formData.note.trim();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      if (formData.type === "credit") {
        await addCoinsToUser(user.id, coins, note);
      } else {
        await removeCoinsFromUser(user.id, coins, note);
      }

      const updatedCoins =
        formData.type === "credit"
          ? Number(user.coins || 0) + coins
          : Number(user.coins || 0) - coins;

      setUser((current) => ({
        ...current,
        coins: updatedCoins,
      }));

      const adjustment = {
        id: `${Date.now()}`,
        userId: user.id,
        userName: user.name || user.email || user.phone || "Unknown",
        type: formData.type,
        coins,
        note,
        createdAt: new Date(),
      };

      setAdjustments((items) => [adjustment, ...items]);

      setFormData({
        type: "credit",
        coins: "",
        note: "",
      });

      setConfirmOpen(false);
      setMessage("Coins adjusted successfully and transaction recorded.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to adjust coins.");
    } finally {
      setSaving(false);
    }
  }

  function getStatusType(status) {
    const value = normalize(status, "active");

    if (value === "active") return "success";
    if (value === "blocked") return "danger";
    if (value === "suspended") return "warning";

    return "muted";
  }

  function getRiskType(riskStatus) {
    const value = normalize(riskStatus, "normal");

    if (value === "high-risk") return "danger";
    if (value === "suspicious") return "warning";

    return "success";
  }

  const columns = [
    {
      key: "userName",
      label: "User",
      render: (row) => (
        <div>
          <strong>{row.userName}</strong>
          <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
            {row.userId}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (row) => (
        <Badge type={row.type === "credit" ? "success" : "danger"} dot>
          {row.type}
        </Badge>
      ),
    },
    {
      key: "coins",
      label: "Coins",
      render: (row) => formatCoins(row.coins),
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

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Manual Coin Adjust</h2>
          <p>Credit or debit coins for a specific user after verification.</p>
        </div>
      </div>

      <div className="warning-box">
        Manual adjustment should always have a clear reason. Every adjustment is
        recorded in wallet transactions automatically.
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      {user && (
        <div className="grid grid-4" style={{ marginBottom: 18 }}>
          <StatCard
            title="Current Coins"
            value={formatCoins(user.coins || 0)}
            icon={Plus}
          />

          <StatCard
            title="Status"
            value={user.status || "active"}
            icon={Search}
            variant={getStatusType(user.status)}
          />

          <StatCard
            title="Risk"
            value={user.riskStatus || "normal"}
            icon={Search}
            variant={getRiskType(user.riskStatus)}
          />

          <StatCard
            title="Adjustments"
            value={adjustments.length}
            icon={Search}
          />
        </div>
      )}

      <div className="grid grid-2">
        <div className="card form-card">
          <form className="form-grid" onSubmit={handleSearch}>
            <h3 style={{ margin: 0 }}>Search User</h3>

            <div className="form-row">
              <label>User ID</label>
              <input
                placeholder="Paste user document ID"
                value={userId}
                disabled={loading}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              disabled={loading}
              loading={loading}
            >
              <Search size={18} />
              Search User
            </Button>
          </form>

          {user && (
            <div className="user-found-card">
              <h3>{user.name || "Unnamed User"}</h3>

              <p>{user.email || user.phone || user.id}</p>

              <div className="detail-list" style={{ marginTop: 12 }}>
                <div className="detail-item">
                  <span>Coins</span>
                  <strong>{formatCoins(user.coins || 0)}</strong>
                </div>

                <div className="detail-item">
                  <span>Gender</span>
                  <strong>{user.gender || "Not added"}</strong>
                </div>

                <div className="detail-item">
                  <span>Avatar</span>
                  <strong>{user.avatarId || "avatar_1"}</strong>
                </div>

                <div className="detail-item">
                  <span>Status</span>
                  <strong>
                    <Badge type={getStatusType(user.status)} dot>
                      {user.status || "active"}
                    </Badge>
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Risk</span>
                  <strong>
                    <Badge type={getRiskType(user.riskStatus)} dot>
                      {user.riskStatus || "normal"}
                    </Badge>
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card form-card">
          <form className="form-grid" onSubmit={validateBeforeConfirm}>
            <h3 style={{ margin: 0 }}>Adjust Coins</h3>

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
              {user && formData.type === "debit" && (
                <small>Current balance: {formatCoins(user.coins || 0)}</small>
              )}
            </div>

            <div className="form-row">
              <label>Reason / Note</label>
              <textarea
                name="note"
                placeholder="Example: reward correction, support case, fraud reversal..."
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
              Apply Adjustment
            </Button>
          </form>
        </div>
      </div>

      <div className="card table-card" style={{ marginTop: 18 }}>
        <div className="table-header">
          <h3>Recent Manual Adjustments This Session</h3>
        </div>

        <Table
          columns={columns}
          data={adjustments}
          emptyText="No manual adjustments in this session."
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
        {user && (
          <>
            <div className="detail-list">
              <div className="detail-item">
                <span>User</span>
                <strong>{user.name || user.email || user.id}</strong>
              </div>

              <div className="detail-item">
                <span>Current Balance</span>
                <strong>{formatCoins(user.coins || 0)}</strong>
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
                onClick={handleAdjust}
                disabled={saving}
                loading={saving}
              >
                Confirm
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default ManualCoinAdjust;
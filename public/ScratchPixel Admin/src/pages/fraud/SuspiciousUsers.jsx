import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, ShieldAlert } from "lucide-react";

import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Loader from "../../components/common/Loader";
import StatCard from "../../components/cards/StatCard";

import {
  clearUserRisk,
  getSuspiciousUsers,
  markUserHighRisk,
} from "../../services/fraudService";

function SuspiciousUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [confirmData, setConfirmData] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const data = await getSuspiciousUsers(100);
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load suspicious users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return users;

    return users.filter((user) => {
      return (
        String(user.name || "").toLowerCase().includes(keyword) ||
        String(user.email || "").toLowerCase().includes(keyword) ||
        String(user.phone || "").toLowerCase().includes(keyword) ||
        String(user.id || "").toLowerCase().includes(keyword) ||
        String(user.upiId || "").toLowerCase().includes(keyword)
      );
    });
  }, [users, search]);

  function getRiskType(riskStatus) {
    if (riskStatus === "high-risk") return "danger";
    if (riskStatus === "suspicious") return "warning";
    return "success";
  }

  async function handleConfirm() {
    if (!confirmData) return;

    try {
      setProcessing(true);
      setError("");
      setMessage("");

      if (confirmData.action === "block") {
        await markUserHighRisk(
          confirmData.userId,
          "Blocked from suspicious users page"
        );

        setUsers((items) =>
          items.map((item) =>
            item.id === confirmData.userId
              ? { ...item, riskStatus: "high-risk", status: "blocked" }
              : item
          )
        );

        setMessage("User blocked and marked as high-risk.");
      }

      if (confirmData.action === "clear") {
        await clearUserRisk(confirmData.userId);

        setUsers((items) =>
          items.filter((item) => item.id !== confirmData.userId)
        );

        setMessage("User risk cleared successfully.");
      }

      setConfirmData(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update suspicious user.");
    } finally {
      setProcessing(false);
    }
  }

  const columns = [
    {
      key: "name",
      label: "User",
      render: (row) => (
        <div>
          <strong>{row.name || "Unnamed User"}</strong>
          <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
            {row.email || row.phone || row.id}
          </p>
        </div>
      ),
    },
    {
      key: "coins",
      label: "Coins",
      render: (row) => row.coins || 0,
    },
    {
      key: "upiId",
      label: "UPI",
      render: (row) => row.upiId || "N/A",
    },
    {
      key: "riskStatus",
      label: "Risk",
      render: (row) => (
        <Badge type={getRiskType(row.riskStatus)}>
          {row.riskStatus || "normal"}
        </Badge>
      ),
    },
    {
      key: "fraudReason",
      label: "Reason",
      render: (row) => row.fraudReason || "No reason added",
    },
  ];

  if (loading) return <Loader text="Loading suspicious users..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Suspicious Users</h2>
          <p>Review users flagged by risk checks or admin actions.</p>
        </div>

        <Button variant="secondary" onClick={loadUsers}>
          <RefreshCcw size={18} />
          Refresh
        </Button>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <StatCard title="Total Flagged" value={users.length} icon={ShieldAlert} />

        <StatCard
          title="High Risk"
          value={users.filter((user) => user.riskStatus === "high-risk").length}
          icon={ShieldAlert}
        />

        <StatCard
          title="Suspicious"
          value={users.filter((user) => user.riskStatus === "suspicious").length}
          icon={ShieldAlert}
        />
      </div>

      <div className="card table-card">
        <div className="table-header">
          <h3>Flagged Accounts</h3>

          <input
            className="search-input"
            type="search"
            placeholder="Search user, email, phone, UPI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Table
          columns={columns}
          data={filteredUsers}
          emptyText="No suspicious users found."
          showIndex
          renderActions={(row) => (
            <div className="actions" style={{ marginTop: 0 }}>
              <Button
                size="sm"
                variant="danger"
                onClick={() =>
                  setConfirmData({
                    action: "block",
                    userId: row.id,
                    title: "Block User?",
                    message:
                      "This will mark the user as high-risk and block the account.",
                  })
                }
              >
                Block
              </Button>

              <Button
                size="sm"
                variant="success"
                onClick={() =>
                  setConfirmData({
                    action: "clear",
                    userId: row.id,
                    title: "Clear Risk?",
                    message: "This will remove this user from suspicious list.",
                  })
                }
              >
                Clear
              </Button>
            </div>
          )}
        />
      </div>

      <ConfirmDialog
        isOpen={!!confirmData}
        title={confirmData?.title}
        message={confirmData?.message}
        confirmText="Confirm"
        variant={confirmData?.action === "clear" ? "success" : "danger"}
        loading={processing}
        onCancel={() => setConfirmData(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

export default SuspiciousUsers;

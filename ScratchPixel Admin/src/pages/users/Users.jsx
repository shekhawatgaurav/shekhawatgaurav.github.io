import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, RefreshCcw, Users as UsersIcon } from "lucide-react";

import useUsers from "../../hooks/useUsers";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import StatCard from "../../components/cards/StatCard";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { formatCoins } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/formatDate";
import { downloadCSV } from "../../utils/helpers";

function Users() {
  const {
    users,
    loading,
    error,
    loadUsers,
    blockSelectedUser,
    unblockSelectedUser,
  } = useUsers(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [risk, setRisk] = useState("all");
  const [confirmData, setConfirmData] = useState(null);

  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");

  function normalize(value = "", fallback = "") {
    return String(value || fallback).toLowerCase().trim();
  }

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return users.filter((user) => {
      const userStatus = normalize(user.status, "active");
      const userRisk = normalize(user.riskStatus, "normal");

      const statusMatch = status === "all" || userStatus === status;
      const riskMatch = risk === "all" || userRisk === risk;

      const searchMatch =
        !keyword ||
        String(user.name || "").toLowerCase().includes(keyword) ||
        String(user.email || "").toLowerCase().includes(keyword) ||
        String(user.phone || "").toLowerCase().includes(keyword) ||
        String(user.id || "").toLowerCase().includes(keyword) ||
        String(user.upiId || "").toLowerCase().includes(keyword) ||
        String(user.gender || "").toLowerCase().includes(keyword) ||
        String(user.avatarId || "").toLowerCase().includes(keyword) ||
        String(user.referralCode || "").toLowerCase().includes(keyword) ||
        String(user.riskStatus || "").toLowerCase().includes(keyword) ||
        String(user.kycStatus || "").toLowerCase().includes(keyword);

      return statusMatch && riskMatch && searchMatch;
    });
  }, [users, search, status, risk]);

  function getStatusType(value) {
    const statusValue = normalize(value, "active");

    if (statusValue === "active") return "success";
    if (statusValue === "blocked") return "danger";
    if (statusValue === "suspended") return "warning";

    return "muted";
  }

  function getRiskType(value) {
    const riskValue = normalize(value, "normal");

    if (riskValue === "high-risk") return "danger";
    if (riskValue === "suspicious") return "warning";

    return "success";
  }

  function exportUsers() {
    setMessage("");
    setLocalError("");

    if (!filteredUsers.length) {
      setLocalError("No users available to export.");
      return;
    }

    const rows = filteredUsers.map((user) => ({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      gender: user.gender || "",
      avatarId: user.avatarId || "",
      coins: user.coins || 0,
      status: user.status || "active",
      riskStatus: user.riskStatus || "normal",
      kycStatus: user.kycStatus || "",
      referralCode: user.referralCode || "",
      referralCount: user.referralCount || 0,
      upiId: user.upiId || "",
      createdAt: formatDateTime(user.createdAt),
    }));

    downloadCSV("users.csv", rows);
    setMessage("Users exported successfully.");
  }

  function openConfirm(row, action) {
    setMessage("");
    setLocalError("");

    setConfirmData({
      userId: row.id,
      action,
      title: action === "unblock" ? "Unblock User?" : "Block User?",
      message:
        action === "unblock"
          ? "This user will be able to use the app again."
          : "This user will be blocked from app activity and withdrawals.",
    });
  }

  async function handleConfirm() {
    if (!confirmData) return;

    try {
      setProcessing(true);
      setMessage("");
      setLocalError("");

      if (confirmData.action === "block") {
        await blockSelectedUser(confirmData.userId, "Blocked by admin");
        setMessage("User blocked successfully.");
      }

      if (confirmData.action === "unblock") {
        await unblockSelectedUser(confirmData.userId);
        setMessage("User unblocked successfully.");
      }

      setConfirmData(null);
    } catch (err) {
      console.error(err);
      setLocalError(err.message || "Unable to update user status.");
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

          <small style={{ color: "var(--muted)", fontWeight: 700 }}>
            {row.gender ? String(row.gender).toUpperCase() : "GENDER NOT ADDED"} ·{" "}
            {row.avatarId || "avatar_1"}
          </small>
        </div>
      ),
    },
    {
      key: "coins",
      label: "Coins",
      render: (row) => formatCoins(row.coins || 0),
    },
    {
      key: "upiId",
      label: "UPI",
      render: (row) => row.upiId || "N/A",
    },
    {
      key: "referralCode",
      label: "Referral",
      render: (row) => (
        <div>
          <strong>{row.referralCode || "N/A"}</strong>
          <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
            {row.referralCount || 0} referrals
          </p>
        </div>
      ),
    },
    {
      key: "kycStatus",
      label: "KYC",
      render: (row) => row.kycStatus || "N/A",
    },
    {
      key: "riskStatus",
      label: "Risk",
      render: (row) => (
        <Badge type={getRiskType(row.riskStatus)} dot>
          {row.riskStatus || "normal"}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge type={getStatusType(row.status)} dot>
          {row.status || "active"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  const activeUsers = users.filter(
    (user) => normalize(user.status, "active") === "active"
  ).length;

  const blockedUsers = users.filter(
    (user) => normalize(user.status) === "blocked"
  ).length;

  const suspiciousUsers = users.filter((user) =>
    ["suspicious", "high-risk"].includes(normalize(user.riskStatus, "normal"))
  ).length;

  if (loading) return <Loader text="Loading users..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Users</h2>
          <p>Manage user accounts, wallet coins, risk status and activity.</p>
        </div>

        <div className="actions" style={{ marginTop: 0 }}>
          <Button variant="secondary" onClick={() => loadUsers()}>
            <RefreshCcw size={18} />
            Refresh
          </Button>

          <Button variant="secondary" onClick={exportUsers}>
            <Download size={18} />
            Export CSV
          </Button>
        </div>
      </div>

      {message && <div className="success-box">{message}</div>}
      {(error || localError) && (
        <div className="error-box">{localError || error}</div>
      )}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard title="Total Users" value={users.length} icon={UsersIcon} />

        <StatCard
          title="Active Users"
          value={activeUsers}
          icon={UsersIcon}
          variant="success"
        />

        <StatCard
          title="Blocked Users"
          value={blockedUsers}
          icon={UsersIcon}
          variant="danger"
        />

        <StatCard
          title="Risk Users"
          value={suspiciousUsers}
          icon={UsersIcon}
          variant="warning"
        />
      </div>

      <div className="card table-card">
        <div className="table-header">
          <h3>User List</h3>

          <div className="actions" style={{ marginTop: 0 }}>
            <input
              className="search-input"
              type="search"
              placeholder="Search name, email, phone, UPI, referral..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="search-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              className="search-input"
              value={risk}
              onChange={(e) => setRisk(e.target.value)}
            >
              <option value="all">All Risk</option>
              <option value="normal">Normal</option>
              <option value="suspicious">Suspicious</option>
              <option value="high-risk">High Risk</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredUsers}
          emptyText="No users found."
          showIndex
          renderActions={(row) => {
            const rowStatus = normalize(row.status, "active");

            return (
              <div className="actions" style={{ marginTop: 0 }}>
                <Link to={`/users/${row.id}`} className="secondary-button btn-sm">
                  View
                </Link>

                <Link
                  to={`/users/${row.id}/wallet`}
                  className="secondary-button btn-sm"
                >
                  Wallet
                </Link>

                <Link
                  to={`/users/${row.id}/transactions`}
                  className="secondary-button btn-sm"
                >
                  Txns
                </Link>

                {rowStatus === "blocked" ? (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => openConfirm(row, "unblock")}
                  >
                    Unblock
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => openConfirm(row, "block")}
                  >
                    Block
                  </Button>
                )}
              </div>
            );
          }}
        />
      </div>

      <ConfirmDialog
        isOpen={!!confirmData}
        title={confirmData?.title}
        message={confirmData?.message}
        confirmText="Confirm"
        variant={confirmData?.action === "unblock" ? "success" : "danger"}
        loading={processing}
        onCancel={() => {
          if (!processing) setConfirmData(null);
        }}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

export default Users;
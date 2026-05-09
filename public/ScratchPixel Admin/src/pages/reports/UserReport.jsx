import { useEffect, useMemo, useState } from "react";
import { Download, RefreshCcw, Users, ShieldAlert } from "lucide-react";

import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import StatCard from "../../components/cards/StatCard";

import { getUsers } from "../../services/userService";
import { formatCoins } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/formatDate";
import { downloadCSV } from "../../utils/helpers";

function UserReport() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("all");
  const [risk, setRisk] = useState("all");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const data = await getUsers(300);
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load user report.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return users.filter((user) => {
      const userStatus = String(user.status || "active").toLowerCase();
      const userRisk = String(user.riskStatus || "normal").toLowerCase();

      const statusMatch = status === "all" || userStatus === status;
      const riskMatch = risk === "all" || userRisk === risk;

      const searchMatch =
        !keyword ||
        String(user.name || "").toLowerCase().includes(keyword) ||
        String(user.email || "").toLowerCase().includes(keyword) ||
        String(user.phone || "").toLowerCase().includes(keyword) ||
        String(user.id || "").toLowerCase().includes(keyword) ||
        String(user.gender || "").toLowerCase().includes(keyword) ||
        String(user.upiId || "").toLowerCase().includes(keyword) ||
        String(user.referralCode || "").toLowerCase().includes(keyword);

      return statusMatch && riskMatch && searchMatch;
    });
  }, [users, status, risk, search]);

  function getStatusType(value) {
    if (value === "active") return "success";
    if (value === "blocked") return "danger";
    if (value === "suspended") return "warning";
    return "muted";
  }

  function getRiskType(value) {
    if (value === "high-risk") return "danger";
    if (value === "suspicious") return "warning";
    return "success";
  }

  function exportUsers() {
    if (!filteredUsers.length) {
      setError("No users available to export.");
      return;
    }

    const rows = filteredUsers.map((user) => ({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      gender: user.gender || "",
      upiId: user.upiId || "",
      avatarId: user.avatarId || "",
      coins: user.coins || 0,
      referralCount: user.referralCount || 0,
      referralCode: user.referralCode || "",
      status: user.status || "active",
      riskStatus: user.riskStatus || "normal",
      kycStatus: user.kycStatus || "",
      createdAt: formatDateTime(user.createdAt),
    }));

    downloadCSV("user-report.csv", rows);
    setMessage("User report exported successfully.");
  }

  const totalCoins = filteredUsers.reduce(
    (sum, user) => sum + Number(user.coins || 0),
    0
  );

  const activeCount = filteredUsers.filter(
    (user) => String(user.status || "active").toLowerCase() === "active"
  ).length;

  const blockedCount = filteredUsers.filter(
    (user) => String(user.status || "").toLowerCase() === "blocked"
  ).length;

  const riskCount = filteredUsers.filter((user) =>
    ["suspicious", "high-risk"].includes(
      String(user.riskStatus || "normal").toLowerCase()
    )
  ).length;

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
      render: (row) => formatCoins(row.coins || 0),
    },
    {
      key: "upiId",
      label: "UPI",
      render: (row) => row.upiId || "N/A",
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
      key: "riskStatus",
      label: "Risk",
      render: (row) => (
        <Badge type={getRiskType(row.riskStatus)} dot>
          {row.riskStatus || "normal"}
        </Badge>
      ),
    },
    {
      key: "kycStatus",
      label: "KYC",
      render: (row) => row.kycStatus || "N/A",
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  if (loading) return <Loader text="Loading user report..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>User Report</h2>
          <p>Filter users by status, coins, risk and join dates.</p>
        </div>

        <div className="actions" style={{ marginTop: 0 }}>
          <Button variant="secondary" onClick={loadUsers}>
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
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard title="Filtered Users" value={filteredUsers.length} icon={Users} />

        <StatCard
          title="Active Users"
          value={activeCount}
          icon={Users}
          variant="success"
        />

        <StatCard
          title="Blocked Users"
          value={blockedCount}
          icon={Users}
          variant="danger"
        />

        <StatCard
          title="Risk Users"
          value={riskCount}
          icon={ShieldAlert}
          variant="warning"
        />
      </div>

      <div className="grid grid-1" style={{ marginBottom: 18 }}>
        <StatCard
          title="Total Coins in Filtered Users"
          value={formatCoins(totalCoins)}
          icon={Users}
        />
      </div>

      <div className="card table-card">
        <div className="table-header">
          <h3>Users</h3>

          <div className="actions" style={{ marginTop: 0 }}>
            <input
              className="search-input"
              type="search"
              placeholder="Search user, email, phone, UPI..."
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
        />
      </div>
    </div>
  );
}

export default UserReport;
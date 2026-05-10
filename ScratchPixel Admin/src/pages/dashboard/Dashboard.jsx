import { useEffect, useState } from "react";
import {
  Users,
  Coins,
  BadgeIndianRupee,
  ShieldAlert,
  BadgeCheck,
  RefreshCcw,
  Gift,
  LifeBuoy,
} from "lucide-react";

import StatCard from "../../components/cards/StatCard";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

import {
  getDashboardStats,
  getRecentUsers,
  getRecentWithdrawals,
} from "../../services/reportService";

import { formatCurrency, formatCoins } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/formatDate";
import logo from "../../assets/logo.png";

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCoins: 0,
    blockedUsers: 0,
    suspiciousUsers: 0,

    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    approvedWithdrawals: 0,
    paidWithdrawals: 0,
    rejectedWithdrawals: 0,

    totalWithdrawalAmount: 0,
    pendingWithdrawalAmount: 0,
    approvedWithdrawalAmount: 0,
    paidWithdrawalAmount: 0,

    pendingKyc: 0,
    pendingReferrals: 0,
    activeTasks: 0,
    openSupport: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [statsData, usersData, withdrawalsData] = await Promise.all([
        getDashboardStats(),
        getRecentUsers(20),
        getRecentWithdrawals(8),
      ]);

      setStats((current) => ({
        ...current,
        ...statsData,
      }));

      setRecentUsers(usersData);
      setRecentWithdrawals(withdrawalsData);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function getUserStatusType(status) {
    const value = String(status || "active").toLowerCase();

    if (value === "active") return "success";
    if (value === "blocked") return "danger";
    if (value === "suspended") return "warning";

    return "muted";
  }

  function getWithdrawalStatusType(status) {
    const value = String(status || "pending").toLowerCase();

    if (value === "paid" || value === "approved") return "success";
    if (value === "pending") return "warning";
    if (value === "rejected") return "danger";

    return "muted";
  }

  const userColumns = [
    {
      key: "name",
      label: "User",
      render: (row) => {
        const displayName =
          row.name || row.userName || row.fullName || "Unnamed User";

        const contact =
          row.email || row.userEmail || row.phone || row.userPhone || row.id;

        return (
          <div>
            <strong>{displayName}</strong>
            <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
              {contact}
            </p>

            {row.gender && (
              <small style={{ color: "var(--muted)", fontWeight: 700 }}>
                {String(row.gender).toUpperCase()}
              </small>
            )}
          </div>
        );
      },
    },
    {
      key: "coins",
      label: "Coins",
      render: (row) =>
        formatCoins(row.coins ?? row.walletCoins ?? row.totalCoins ?? 0),
    },
    {
      key: "riskStatus",
      label: "Risk",
      render: (row) => row.riskStatus || "normal",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge type={getUserStatusType(row.status)} dot>
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

  const withdrawalColumns = [
    {
      key: "userName",
      label: "User",
      render: (row) => (
        <div>
          <strong>{row.userName || "Unknown User"}</strong>
          <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
            {row.userEmail || row.userPhone || row.upiId || row.userId || "No payout info"}
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
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge type={getWithdrawalStatusType(row.status)} dot>
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

  if (loading) return <Loader text="Loading dashboard..." />;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <img src={logo} alt="Scratch Pixel Logo" style={{ height: "48px", width: "auto", borderRadius: "8px" }} />
          <div>
            <h2>Dashboard</h2>
            <p>Quick overview of users, coins, withdrawals, KYC and alerts.</p>
          </div>
        </div>

        <Button variant="secondary" onClick={loadDashboard}>
          <RefreshCcw size={18} />
          Refresh
        </Button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />

        <StatCard
          title="Active Users"
          value={stats.activeUsers || 0}
          icon={Users}
          variant="success"
        />

        <StatCard
          title="Total Coins"
          value={formatCoins(stats.totalCoins)}
          icon={Coins}
        />

        <StatCard
          title="Pending KYC"
          value={stats.pendingKyc}
          icon={BadgeCheck}
          variant="warning"
        />
      </div>

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard
          title="Pending Withdrawals"
          value={stats.pendingWithdrawals}
          icon={BadgeIndianRupee}
          variant="warning"
        />

        <StatCard
          title="Approved Waiting"
          value={stats.approvedWithdrawals || 0}
          icon={BadgeCheck}
          variant="success"
        />

        <StatCard
          title="Paid Withdrawals"
          value={stats.paidWithdrawals || 0}
          icon={BadgeCheck}
          variant="success"
        />

        <StatCard
          title="Rejected Withdrawals"
          value={stats.rejectedWithdrawals || 0}
          icon={ShieldAlert}
          variant="danger"
        />
      </div>

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard
          title="Total Withdrawal Amount"
          value={formatCurrency(stats.totalWithdrawalAmount)}
          icon={BadgeIndianRupee}
        />

        <StatCard
          title="Pending Amount"
          value={formatCurrency(stats.pendingWithdrawalAmount || 0)}
          icon={BadgeIndianRupee}
          variant="warning"
        />

        <StatCard
          title="Paid Amount"
          value={formatCurrency(stats.paidWithdrawalAmount || 0)}
          icon={BadgeIndianRupee}
          variant="success"
        />

        <StatCard
          title="Risk Users"
          value={stats.suspiciousUsers || 0}
          icon={ShieldAlert}
          variant="danger"
        />
      </div>

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard
          title="Pending Referrals"
          value={stats.pendingReferrals || 0}
          icon={Gift}
          variant="warning"
        />

        <StatCard
          title="Open Support"
          value={stats.openSupport || 0}
          icon={LifeBuoy}
          variant="warning"
        />

        <StatCard
          title="Active Tasks"
          value={stats.activeTasks || 0}
          icon={Gift}
        />

        <StatCard
          title="Blocked Users"
          value={stats.blockedUsers || 0}
          icon={ShieldAlert}
          variant="danger"
        />
      </div>

      <div className="grid grid-2">
        <div className="card table-card dashboard-users-table">
          <div className="table-header">
            <h3>Recent Users</h3>
          </div>

          <Table
            columns={userColumns}
            data={recentUsers}
            emptyText="No recent users found."
            showIndex
          />
        </div>

        <div className="card table-card">
          <div className="table-header">
            <h3>Recent Withdrawals</h3>
          </div>

          <Table
            columns={withdrawalColumns}
            data={recentWithdrawals}
            emptyText="No recent withdrawals found."
            showIndex
          />
        </div>
      </div>

      <div className="card dashboard-note" style={{ marginTop: 18 }}>
        <h3>Admin Safety Note</h3>
        <p>
          Always verify suspicious accounts before approving withdrawals. Check
          same device, same UPI, unusual coin jumps, repeated referrals and ad
          abuse before marking any payout as paid.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
import { useEffect, useState } from "react";
import {
  BarChart3,
  BadgeIndianRupee,
  Coins,
  Download,
  RefreshCcw,
  Users,
  ShieldAlert,
  BadgeCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

import {
  getDashboardStats,
  getRecentUsers,
  getRecentWithdrawals,
} from "../../services/reportService";

import { formatCurrency, formatCoins } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/formatDate";
import { downloadCSV } from "../../utils/helpers";

function Reports() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadReports() {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const [statsData, usersData, withdrawalsData] = await Promise.all([
        getDashboardStats(),
        getRecentUsers(10),
        getRecentWithdrawals(10),
      ]);

      setStats(statsData);
      setRecentUsers(usersData);
      setRecentWithdrawals(withdrawalsData);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  function getUserStatusType(status) {
    if (status === "active") return "success";
    if (status === "blocked") return "danger";
    if (status === "suspended") return "warning";
    return "muted";
  }

  function getWithdrawalStatusType(status) {
    if (status === "paid" || status === "approved") return "success";
    if (status === "pending") return "warning";
    if (status === "rejected") return "danger";
    return "muted";
  }

  function exportSummary() {
    if (!stats) {
      setError("No report data available to export.");
      return;
    }

    downloadCSV("summary-report.csv", [
      {
        totalUsers: stats.totalUsers || 0,
        activeUsers: stats.activeUsers || 0,
        blockedUsers: stats.blockedUsers || 0,
        suspiciousUsers: stats.suspiciousUsers || 0,
        totalCoins: stats.totalCoins || 0,

        totalWithdrawals: stats.totalWithdrawals || 0,
        pendingWithdrawals: stats.pendingWithdrawals || 0,
        approvedWithdrawals: stats.approvedWithdrawals || 0,
        paidWithdrawals: stats.paidWithdrawals || 0,
        rejectedWithdrawals: stats.rejectedWithdrawals || 0,
        totalWithdrawalAmount: stats.totalWithdrawalAmount || 0,

        pendingKyc: stats.pendingKyc || 0,
        pendingReferrals: stats.pendingReferrals || 0,
        activeTasks: stats.activeTasks || 0,
        openSupport: stats.openSupport || 0,
      },
    ]);

    setMessage("Summary report exported successfully.");
  }

  const userColumns = [
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
          <strong>{row.userName || "Unknown"}</strong>
          <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
            {row.userEmail || row.userPhone || row.userId || "No info"}
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => formatCurrency(row.amount || 0),
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
        <Badge type={getWithdrawalStatusType(row.status)} dot>
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

  if (loading) return <Loader text="Loading reports..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Reports</h2>
          <p>Overview of users, rewards, withdrawals and platform health.</p>
        </div>

        <div className="actions" style={{ marginTop: 0 }}>
          <Button variant="secondary" onClick={loadReports}>
            <RefreshCcw size={18} />
            Refresh
          </Button>

          <Button variant="secondary" onClick={exportSummary}>
            <Download size={18} />
            Export Summary
          </Button>
        </div>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
        />

        <StatCard
          title="Total Coins"
          value={formatCoins(stats?.totalCoins || 0)}
          icon={Coins}
        />

        <StatCard
          title="Total Withdrawals"
          value={stats?.totalWithdrawals || 0}
          icon={BadgeIndianRupee}
        />

        <StatCard
          title="Withdrawal Amount"
          value={formatCurrency(stats?.totalWithdrawalAmount || 0)}
          icon={BarChart3}
        />
      </div>

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard
          title="Pending KYC"
          value={stats?.pendingKyc || 0}
          icon={BadgeCheck}
          variant="warning"
        />

        <StatCard
          title="Pending Withdrawals"
          value={stats?.pendingWithdrawals || 0}
          icon={BadgeIndianRupee}
          variant="warning"
        />

        <StatCard
          title="Risk Users"
          value={stats?.suspiciousUsers || 0}
          icon={ShieldAlert}
          variant="danger"
        />

        <StatCard
          title="Open Support"
          value={stats?.openSupport || 0}
          icon={BarChart3}
          variant="primary"
        />
      </div>

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <Link to="/reports/users" className="card report-link-card">
          <Users size={24} />
          <div>
            <h3>User Report</h3>
            <p>Users, status, coins and join dates.</p>
          </div>
        </Link>

        <Link to="/reports/revenue" className="card report-link-card">
          <Coins size={24} />
          <div>
            <h3>Revenue Report</h3>
            <p>Estimated ad income and payout planning.</p>
          </div>
        </Link>

        <Link to="/reports/withdrawals" className="card report-link-card">
          <BadgeIndianRupee size={24} />
          <div>
            <h3>Withdrawal Report</h3>
            <p>Pending, approved, paid and rejected payouts.</p>
          </div>
        </Link>

        <Link to="/audit-logs" className="card report-link-card">
          <BarChart3 size={24} />
          <div>
            <h3>Audit Logs</h3>
            <p>Admin activity and system actions.</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-2">
        <div className="card table-card">
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
    </div>
  );
}

export default Reports;
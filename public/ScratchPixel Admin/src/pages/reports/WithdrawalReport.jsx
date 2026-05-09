import { useEffect, useMemo, useState } from "react";
import { BadgeIndianRupee, Download, RefreshCcw } from "lucide-react";

import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import StatCard from "../../components/cards/StatCard";

import { getWithdrawals } from "../../services/withdrawalService";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/formatDate";
import { downloadCSV } from "../../utils/helpers";

function WithdrawalReport() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadWithdrawals() {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const data = await getWithdrawals("all", 300);
      setWithdrawals(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load withdrawal report.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const filteredWithdrawals = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return withdrawals.filter((item) => {
      const itemStatus = String(item.status || "pending").toLowerCase();

      const statusMatch = status === "all" || itemStatus === status;

      const searchMatch =
        !keyword ||
        String(item.userName || "").toLowerCase().includes(keyword) ||
        String(item.userEmail || "").toLowerCase().includes(keyword) ||
        String(item.userPhone || "").toLowerCase().includes(keyword) ||
        String(item.userId || "").toLowerCase().includes(keyword) ||
        String(item.upiId || "").toLowerCase().includes(keyword) ||
        String(item.paymentRef || "").toLowerCase().includes(keyword) ||
        String(item.status || "").toLowerCase().includes(keyword);

      return statusMatch && searchMatch;
    });
  }, [withdrawals, status, search]);

  const totalAmount = filteredWithdrawals.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const pendingAmount = filteredWithdrawals
    .filter((item) => String(item.status || "pending").toLowerCase() === "pending")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const approvedAmount = filteredWithdrawals
    .filter((item) => String(item.status || "").toLowerCase() === "approved")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const paidAmount = filteredWithdrawals
    .filter((item) => String(item.status || "").toLowerCase() === "paid")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  function getStatusType(value) {
    const currentStatus = String(value || "pending").toLowerCase();

    if (currentStatus === "paid" || currentStatus === "approved") return "success";
    if (currentStatus === "pending") return "warning";
    if (currentStatus === "rejected") return "danger";
    return "muted";
  }

  function exportWithdrawals() {
    if (!filteredWithdrawals.length) {
      setError("No withdrawals available to export.");
      return;
    }

    const rows = filteredWithdrawals.map((item) => ({
      id: item.id,
      userId: item.userId || "",
      userName: item.userName || "",
      userEmail: item.userEmail || "",
      userPhone: item.userPhone || "",
      amount: item.amount || 0,
      coins: item.coins || 0,
      paymentRef: item.paymentRef || "",
      deductedCoins: item.deductedCoins || "",
      upiId: item.upiId || "",
      status: item.status || "",
      note: item.note || "",
      createdAt: formatDateTime(item.createdAt),
      approvedAt: formatDateTime(item.approvedAt),
      paidAt: formatDateTime(item.paidAt),
      rejectedAt: formatDateTime(item.rejectedAt),
    }));

    downloadCSV("withdrawal-report.csv", rows);
    setMessage("Withdrawal report exported successfully.");
  }

  const columns = [
    {
      key: "user",
      label: "User",
      render: (row) => (
        <div>
          <strong>{row.userName || "Unknown User"}</strong>
          <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
            {row.userEmail || row.userPhone || row.userId || "No info"}
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
      render: (row) => row.coins || row.deductedCoins || 0,
    },
    {
      key: "upiId",
      label: "UPI ID",
      render: (row) => row.upiId || "N/A",
    },
    {
      key: "paymentRef",
      label: "Payment Ref",
      render: (row) => row.paymentRef || "N/A",
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
      label: "Requested",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  if (loading) return <Loader text="Loading withdrawal report..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Withdrawal Report</h2>
          <p>Track payout status, pending amount and processed withdrawals.</p>
        </div>

        <div className="actions" style={{ marginTop: 0 }}>
          <Button variant="secondary" onClick={loadWithdrawals}>
            <RefreshCcw size={18} />
            Refresh
          </Button>

          <Button variant="secondary" onClick={exportWithdrawals}>
            <Download size={18} />
            Export CSV
          </Button>
        </div>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard
          title="Filtered Requests"
          value={filteredWithdrawals.length}
          icon={BadgeIndianRupee}
        />

        <StatCard
          title="Total Amount"
          value={formatCurrency(totalAmount)}
          icon={BadgeIndianRupee}
        />

        <StatCard
          title="Pending Amount"
          value={formatCurrency(pendingAmount)}
          icon={BadgeIndianRupee}
          variant="warning"
        />

        <StatCard
          title="Paid Amount"
          value={formatCurrency(paidAmount)}
          icon={BadgeIndianRupee}
          variant="success"
        />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <StatCard
          title="Approved Waiting Payment"
          value={formatCurrency(approvedAmount)}
          icon={BadgeIndianRupee}
          variant="success"
        />

        <StatCard
          title="Paid Requests"
          value={
            filteredWithdrawals.filter(
              (item) => String(item.status || "").toLowerCase() === "paid"
            ).length
          }
          icon={BadgeIndianRupee}
        />
      </div>

      <div className="card table-card">
        <div className="table-header">
          <h3>Withdrawals</h3>

          <div className="actions" style={{ marginTop: 0 }}>
            <input
              className="search-input"
              type="search"
              placeholder="Search user, UPI, payment ref..."
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
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredWithdrawals}
          emptyText="No withdrawals found."
          showIndex
        />
      </div>
    </div>
  );
}

export default WithdrawalReport;
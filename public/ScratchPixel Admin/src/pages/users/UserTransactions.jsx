import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download, RefreshCcw, Coins } from "lucide-react";

import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import StatCard from "../../components/cards/StatCard";

import { getUserWalletTransactions } from "../../services/walletService";
import { formatCoins, formatCurrency } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/formatDate";
import { downloadCSV } from "../../utils/helpers";

function UserTransactions() {
  const { userId } = useParams();

  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState("all");
  const [source, setSource] = useState("all");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function normalize(value = "", fallback = "") {
    return String(value || fallback).toLowerCase().trim();
  }

  async function loadTransactions() {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const data = await getUserWalletTransactions(userId, 150);
      setTransactions(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load user transactions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, [userId]);

  const filteredTransactions = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return transactions.filter((item) => {
      const itemType = normalize(item.type, "transaction");
      const itemSource = normalize(item.source, "app");

      const typeMatch = type === "all" || itemType === type;
      const sourceMatch = source === "all" || itemSource === source;

      const searchMatch =
        !keyword ||
        String(item.source || "").toLowerCase().includes(keyword) ||
        String(item.note || "").toLowerCase().includes(keyword) ||
        String(item.status || "").toLowerCase().includes(keyword) ||
        String(item.type || "").toLowerCase().includes(keyword) ||
        String(item.referralId || "").toLowerCase().includes(keyword) ||
        String(item.withdrawalId || "").toLowerCase().includes(keyword);

      return typeMatch && sourceMatch && searchMatch;
    });
  }, [transactions, type, source, search]);

  function exportTransactions() {
    setMessage("");
    setError("");

    if (!filteredTransactions.length) {
      setError("No transactions available to export.");
      return;
    }

    const rows = filteredTransactions.map((item) => ({
      id: item.id,
      userId,
      type: item.type || "",
      coins: item.coins || 0,
      amount: item.amount || 0,
      source: item.source || "",
      status: item.status || "",
      note: item.note || "",
      referralId: item.referralId || "",
      withdrawalId: item.withdrawalId || "",
      createdAt: formatDateTime(item.createdAt),
    }));

    downloadCSV(`user-${userId}-transactions.csv`, rows);
    setMessage("User transactions exported successfully.");
  }

  function getTypeColor(row) {
    return normalize(row.type) === "credit" ? "success" : "danger";
  }

  function getStatusType(status) {
    const value = normalize(status, "completed");

    if (value === "completed" || value === "paid") return "success";
    if (value === "pending") return "warning";
    if (value === "failed" || value === "rejected") return "danger";

    return "muted";
  }

  function getSourceType(value) {
    const sourceValue = normalize(value, "app");

    if (sourceValue === "admin") return "primary";
    if (sourceValue === "withdrawal") return "danger";

    if (["scratch", "ad", "ads", "task", "referral"].includes(sourceValue)) {
      return "success";
    }

    return "muted";
  }

  const creditCoins = filteredTransactions
    .filter((item) => normalize(item.type) === "credit")
    .reduce((sum, item) => sum + Number(item.coins || 0), 0);

  const debitCoins = filteredTransactions
    .filter((item) => normalize(item.type) === "debit")
    .reduce((sum, item) => sum + Number(item.coins || 0), 0);

  const netCoins = creditCoins - debitCoins;

  const uniqueSources = Array.from(
    new Set(
      transactions
        .map((item) => normalize(item.source, "app"))
        .filter(Boolean)
    )
  ).sort();

  const columns = [
    {
      key: "type",
      label: "Type",
      render: (row) => (
        <Badge type={getTypeColor(row)} dot>
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

  if (loading) return <Loader text="Loading transactions..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>User Transactions</h2>
          <p>View all coin credits, debits, rewards and admin adjustments.</p>
        </div>

        <div className="actions" style={{ marginTop: 0 }}>
          <Button variant="secondary" onClick={loadTransactions}>
            <RefreshCcw size={18} />
            Refresh
          </Button>

          <Button variant="secondary" onClick={exportTransactions}>
            <Download size={18} />
            Export CSV
          </Button>

          <Link to={`/users/${userId}/wallet`} className="secondary-button">
            Wallet
          </Link>

          <Link to={`/users/${userId}`} className="secondary-button">
            Back
          </Link>
        </div>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard
          title="Filtered Credits"
          value={formatCoins(creditCoins)}
          icon={Coins}
          variant="success"
        />

        <StatCard
          title="Filtered Debits"
          value={formatCoins(debitCoins)}
          icon={Coins}
          variant="danger"
        />

        <StatCard
          title="Net Coins"
          value={formatCoins(netCoins)}
          icon={Coins}
          variant={netCoins >= 0 ? "success" : "danger"}
        />

        <StatCard
          title="Transactions"
          value={filteredTransactions.length}
          icon={Coins}
        />
      </div>

      <div className="card table-card">
        <div className="table-header">
          <h3>Transaction History</h3>

          <div className="actions" style={{ marginTop: 0 }}>
            <input
              className="search-input"
              type="search"
              placeholder="Search source, note, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="search-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>

            <select
              className="search-input"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="all">All Sources</option>
              {uniqueSources.map((itemSource) => (
                <option key={itemSource} value={itemSource}>
                  {itemSource}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredTransactions}
          emptyText="No transactions found."
          showIndex
        />
      </div>
    </div>
  );
}

export default UserTransactions;
import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, Download, ScrollText } from "lucide-react";

import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import StatCard from "../../components/cards/StatCard";

import { getAuditLogs } from "../../services/auditService";
import { formatDateTime } from "../../utils/formatDate";
import { downloadCSV } from "../../utils/helpers";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [targetFilter, setTargetFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadLogs() {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const data = await getAuditLogs(200);
      setLogs(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load audit logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  function getActionBadgeType(action = "") {
    const safeAction = String(action || "").toLowerCase();

    if (
      safeAction.includes("approve") ||
      safeAction.includes("create") ||
      safeAction.includes("complete") ||
      safeAction.includes("paid") ||
      safeAction.includes("activate")
    ) {
      return "success";
    }

    if (
      safeAction.includes("reject") ||
      safeAction.includes("block") ||
      safeAction.includes("delete") ||
      safeAction.includes("remove") ||
      safeAction.includes("deactivate")
    ) {
      return "danger";
    }

    if (
      safeAction.includes("update") ||
      safeAction.includes("change") ||
      safeAction.includes("edit") ||
      safeAction.includes("reopen")
    ) {
      return "warning";
    }

    return "muted";
  }

  function getActionGroup(action = "") {
    const type = getActionBadgeType(action);

    if (type === "success") return "positive";
    if (type === "danger") return "danger";
    if (type === "warning") return "change";

    return "other";
  }

  const targetTypes = useMemo(() => {
    const items = logs
      .map((log) => String(log.targetType || "").trim())
      .filter(Boolean);

    return Array.from(new Set(items)).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return logs.filter((log) => {
      const targetType = String(log.targetType || "").toLowerCase();
      const actionGroup = getActionGroup(log.action);

      const targetMatch =
        targetFilter === "all" || targetType === targetFilter.toLowerCase();

      const actionMatch =
        actionFilter === "all" || actionGroup === actionFilter;

      const searchMatch =
        !keyword ||
        String(log.adminEmail || "").toLowerCase().includes(keyword) ||
        String(log.adminId || "").toLowerCase().includes(keyword) ||
        String(log.action || "").toLowerCase().includes(keyword) ||
        String(log.targetType || "").toLowerCase().includes(keyword) ||
        String(log.targetId || "").toLowerCase().includes(keyword) ||
        String(log.details || "").toLowerCase().includes(keyword);

      return targetMatch && actionMatch && searchMatch;
    });
  }, [logs, search, targetFilter, actionFilter]);

  function exportLogs() {
    setMessage("");
    setError("");

    if (!filteredLogs.length) {
      setError("No audit logs available to export.");
      return;
    }

    const rows = filteredLogs.map((log) => ({
      id: log.id,
      adminId: log.adminId || "",
      adminEmail: log.adminEmail || "",
      action: log.action || "",
      targetType: log.targetType || "",
      targetId: log.targetId || "",
      details: log.details || "",
      createdAt: formatDateTime(log.createdAt),
    }));

    downloadCSV("audit-logs.csv", rows);
    setMessage("Audit logs exported successfully.");
  }

  const positiveActions = logs.filter(
    (log) => getActionGroup(log.action) === "positive"
  ).length;

  const dangerActions = logs.filter(
    (log) => getActionGroup(log.action) === "danger"
  ).length;

  const changeActions = logs.filter(
    (log) => getActionGroup(log.action) === "change"
  ).length;

  const columns = [
    {
      key: "adminEmail",
      label: "Admin",
      render: (row) => (
        <div>
          <strong>{row.adminEmail || "Unknown Admin"}</strong>
          <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
            {row.adminId || "No admin ID"}
          </p>
        </div>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <Badge type={getActionBadgeType(row.action)} dot>
          {row.action || "action"}
        </Badge>
      ),
    },
    {
      key: "targetType",
      label: "Target",
      render: (row) => (
        <div>
          <strong>{row.targetType || "N/A"}</strong>
          <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
            {row.targetId || "No target ID"}
          </p>
        </div>
      ),
    },
    {
      key: "details",
      label: "Details",
      render: (row) => row.details || "No details",
    },
    {
      key: "createdAt",
      label: "Date & Time",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  if (loading) return <Loader text="Loading audit logs..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Audit Logs</h2>
          <p>Track admin actions like approvals, blocks, edits and settings changes.</p>
        </div>

        <div className="actions" style={{ marginTop: 0 }}>
          <Button variant="secondary" onClick={loadLogs}>
            <RefreshCcw size={18} />
            Refresh
          </Button>

          <Button variant="secondary" onClick={exportLogs}>
            <Download size={18} />
            Export CSV
          </Button>
        </div>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard title="Total Logs" value={logs.length} icon={ScrollText} />

        <StatCard
          title="Filtered Logs"
          value={filteredLogs.length}
          icon={ScrollText}
        />

        <StatCard
          title="Positive Actions"
          value={positiveActions}
          icon={ScrollText}
          variant="success"
        />

        <StatCard
          title="Danger Actions"
          value={dangerActions}
          icon={ScrollText}
          variant="danger"
        />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <StatCard
          title="Change Actions"
          value={changeActions}
          icon={ScrollText}
          variant="warning"
        />

        <StatCard
          title="Latest Action"
          value={logs[0]?.action || "N/A"}
          icon={ScrollText}
        />
      </div>

      <div className="card table-card">
        <div className="table-header">
          <h3>Admin Activity</h3>

          <div className="actions" style={{ marginTop: 0 }}>
            <input
              className="search-input"
              type="search"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="search-input"
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
            >
              <option value="all">All Targets</option>
              {targetTypes.map((target) => (
                <option key={target} value={target}>
                  {target}
                </option>
              ))}
            </select>

            <select
              className="search-input"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="all">All Actions</option>
              <option value="positive">Positive</option>
              <option value="change">Changes</option>
              <option value="danger">Danger</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredLogs}
          emptyText="No audit logs found."
          showIndex
        />
      </div>
    </div>
  );
}

export default AuditLogs;
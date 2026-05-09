import { useEffect, useState } from "react";
import {
  ShieldAlert,
  Users,
  RefreshCcw,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

import StatCard from "../../components/cards/StatCard";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Loader from "../../components/common/Loader";

import {
  getFraudReports,
  getSuspiciousUsers,
  updateFraudReportStatus,
  clearUserRisk,
  markUserHighRisk,
} from "../../services/fraudService";

import { formatDateTime } from "../../utils/formatDate";

function FraudCenter() {
  const [suspiciousUsers, setSuspiciousUsers] = useState([]);
  const [fraudReports, setFraudReports] = useState([]);

  const [confirmData, setConfirmData] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadFraudData() {
    try {
      setLoading(true);
      setError("");

      const [usersData, reportsData] = await Promise.all([
        getSuspiciousUsers(50),
        getFraudReports(50),
      ]);

      setSuspiciousUsers(usersData);
      setFraudReports(reportsData);
    } catch (err) {
      console.error(err);
      setError("Unable to load fraud center data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFraudData();
  }, []);

  function riskBadgeType(riskStatus) {
    if (riskStatus === "high-risk") return "danger";
    if (riskStatus === "suspicious") return "warning";
    return "success";
  }

  async function handleConfirm() {
    if (!confirmData) return;

    try {
      setProcessing(true);
      setMessage("");
      setError("");

      if (confirmData.type === "clear-risk") {
        await clearUserRisk(confirmData.id);

        setSuspiciousUsers((items) =>
          items.filter((item) => item.id !== confirmData.id)
        );

        setMessage("User risk cleared successfully.");
      }

      if (confirmData.type === "high-risk") {
        await markUserHighRisk(confirmData.id, "Marked high-risk from admin");

        setSuspiciousUsers((items) =>
          items.map((item) =>
            item.id === confirmData.id
              ? { ...item, riskStatus: "high-risk", status: "blocked" }
              : item
          )
        );

        setMessage("User blocked and marked high-risk.");
      }

      if (confirmData.type === "resolve-report") {
        await updateFraudReportStatus(
          confirmData.id,
          "resolved",
          "Resolved by admin"
        );

        setFraudReports((items) =>
          items.map((item) =>
            item.id === confirmData.id
              ? { ...item, status: "resolved" }
              : item
          )
        );

        setMessage("Fraud report resolved successfully.");
      }

      setConfirmData(null);
    } catch (err) {
      console.error(err);
      setError("Unable to process fraud action.");
    } finally {
      setProcessing(false);
    }
  }

  const suspiciousColumns = [
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
      key: "riskStatus",
      label: "Risk",
      render: (row) => (
        <Badge type={riskBadgeType(row.riskStatus)}>
          {row.riskStatus || "normal"}
        </Badge>
      ),
    },
    {
      key: "fraudReason",
      label: "Reason",
      render: (row) => row.fraudReason || "No reason",
    },
  ];

  const reportColumns = [
    {
      key: "type",
      label: "Report Type",
      render: (row) => <strong>{row.type || "Fraud Report"}</strong>,
    },
    {
      key: "userId",
      label: "User ID",
      render: (row) => row.userId || "N/A",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge type={row.status === "resolved" ? "success" : "warning"}>
          {row.status || "pending"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  if (loading) return <Loader text="Loading fraud center..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Fraud Center</h2>
          <p>Monitor suspicious users, fraud reports and abuse signals.</p>
        </div>

        <Button variant="secondary" onClick={loadFraudData}>
          <RefreshCcw size={18} />
          Refresh
        </Button>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard
          title="Suspicious Users"
          value={suspiciousUsers.length}
          icon={ShieldAlert}
        />

        <StatCard
          title="High Risk Users"
          value={
            suspiciousUsers.filter((user) => user.riskStatus === "high-risk")
              .length
          }
          icon={AlertTriangle}
        />

        <StatCard
          title="Fraud Reports"
          value={fraudReports.length}
          icon={ShieldAlert}
        />

        <StatCard
          title="Resolved Reports"
          value={
            fraudReports.filter((report) => report.status === "resolved").length
          }
          icon={CheckCircle}
        />
      </div>

      <div className="grid grid-2">
        <div className="card table-card">
          <div className="table-header">
            <h3>Suspicious Users</h3>
          </div>

          <Table
            columns={suspiciousColumns}
            data={suspiciousUsers}
            emptyText="No suspicious users found."
            showIndex
            renderActions={(row) => (
              <div className="actions" style={{ marginTop: 0 }}>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() =>
                    setConfirmData({
                      id: row.id,
                      type: "high-risk",
                      title: "Mark High Risk?",
                      message:
                        "This will block the user and mark their account as high-risk.",
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
                      id: row.id,
                      type: "clear-risk",
                      title: "Clear Risk?",
                      message:
                        "This will remove suspicious risk status from this user.",
                    })
                  }
                >
                  Clear
                </Button>
              </div>
            )}
          />
        </div>

        <div className="card table-card">
          <div className="table-header">
            <h3>Fraud Reports</h3>
          </div>

          <Table
            columns={reportColumns}
            data={fraudReports}
            emptyText="No fraud reports found."
            showIndex
            renderActions={(row) =>
              row.status !== "resolved" ? (
                <Button
                  size="sm"
                  variant="success"
                  onClick={() =>
                    setConfirmData({
                      id: row.id,
                      type: "resolve-report",
                      title: "Resolve Report?",
                      message: "Mark this fraud report as resolved?",
                    })
                  }
                >
                  Resolve
                </Button>
              ) : (
                <Badge type="success">Done</Badge>
              )
            }
          />
        </div>
      </div>

      <div className="card fraud-tips" style={{ marginTop: 18 }}>
        <h3>Fraud signals to check before payout</h3>
        <div className="fraud-tip-grid">
          <span>Same device with multiple accounts</span>
          <span>Same UPI used by many users</span>
          <span>Very high coins in short time</span>
          <span>Fake referral chain</span>
          <span>VPN/emulator activity</span>
          <span>Unusual ad watch speed</span>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!confirmData}
        title={confirmData?.title}
        message={confirmData?.message}
        confirmText="Confirm"
        variant={confirmData?.type === "clear-risk" ? "success" : "danger"}
        loading={processing}
        onCancel={() => setConfirmData(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

export default FraudCenter;

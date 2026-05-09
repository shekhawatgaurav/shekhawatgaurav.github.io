import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCcw, BadgeCheck, XCircle, RotateCcw } from "lucide-react";

import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import StatCard from "../../components/cards/StatCard";

import {
  getKycRequests,
  approveKyc,
  rejectKyc,
  reopenKyc,
} from "../../services/kycService";

import { formatDateTime } from "../../utils/formatDate";

function KycRequests() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const [actionData, setActionData] = useState(null);
  const [adminNote, setAdminNote] = useState("");

  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadRequests(nextStatus = status) {
    try {
      setLoading(true);
      setError("");

      const data = await getKycRequests(nextStatus, 100);
      setRequests(data);
      setStatus(nextStatus);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load KYC requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests("all");
  }, []);

  const filteredRequests = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return requests;

    return requests.filter((item) => {
      return (
        String(item.name || "").toLowerCase().includes(keyword) ||
        String(item.userName || "").toLowerCase().includes(keyword) ||
        String(item.email || item.userEmail || "").toLowerCase().includes(keyword) ||
        String(item.phone || item.userPhone || "").toLowerCase().includes(keyword) ||
        String(item.userId || "").toLowerCase().includes(keyword) ||
        String(item.documentName || "").toLowerCase().includes(keyword) ||
        String(item.documentType || "").toLowerCase().includes(keyword) ||
        String(item.documentNumber || item.panNumber || item.aadhaarNumber || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.status || "").toLowerCase().includes(keyword)
      );
    });
  }, [requests, search]);

  function openAction(item, action) {
    setMessage("");
    setError("");
    setAdminNote("");

    setActionData({
      id: item.id,
      action,
      name: item.name || item.userName || "Unknown User",
      documentName: item.documentName || "N/A",
      documentType: item.documentType || "N/A",
      documentNumber:
        item.documentNumber || item.panNumber || item.aadhaarNumber || "N/A",
    });
  }

  function closeAction() {
    if (processing) return;

    setActionData(null);
    setAdminNote("");
  }

  async function handleAction(e) {
    e?.preventDefault?.();

    if (!actionData) return;

    setError("");
    setMessage("");

    if (actionData.action === "reject" && !adminNote.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    try {
      setProcessing(true);

      if (actionData.action === "approve") {
        await approveKyc(
          actionData.id,
          adminNote.trim() || "KYC approved by admin"
        );

        setMessage("KYC approved successfully.");
      }

      if (actionData.action === "reject") {
        await rejectKyc(
          actionData.id,
          adminNote.trim() || "KYC rejected by admin"
        );

        setMessage("KYC rejected successfully.");
      }

      if (actionData.action === "reopen") {
        await reopenKyc(
          actionData.id,
          adminNote.trim() || "KYC reopened by admin"
        );

        setMessage("KYC moved back to pending.");
      }

      closeAction();
      await loadRequests(status);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update KYC request.");
    } finally {
      setProcessing(false);
    }
  }

  function getStatusType(value) {
    const statusValue = String(value || "pending").toLowerCase();

    if (statusValue === "approved") return "success";
    if (statusValue === "rejected") return "danger";
    if (statusValue === "pending") return "warning";

    return "muted";
  }

  const columns = [
    {
      key: "user",
      label: "User",
      render: (item) => (
        <div>
          <strong>{item.name || item.userName || "Unknown"}</strong>
          <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
            {item.email || item.userEmail || item.phone || item.userPhone || item.userId || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "documentName",
      label: "Document Name",
      render: (item) => item.documentName || "-",
    },
    {
      key: "documentType",
      label: "Document Type",
      render: (item) => item.documentType || "-",
    },
    {
      key: "documentNumber",
      label: "Document Number",
      render: (item) =>
        item.documentNumber || item.panNumber || item.aadhaarNumber || "-",
    },
    {
      key: "dob",
      label: "DOB",
      render: (item) => item.dob || "-",
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Badge type={getStatusType(item.status)} dot>
          {item.status || "pending"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Submitted",
      render: (item) => formatDateTime(item.createdAt),
    },
    {
      key: "reviewedAt",
      label: "Reviewed",
      render: (item) => formatDateTime(item.reviewedAt),
    },
  ];

  const pendingCount = requests.filter(
    (item) => String(item.status || "pending").toLowerCase() === "pending"
  ).length;

  const approvedCount = requests.filter(
    (item) => String(item.status || "").toLowerCase() === "approved"
  ).length;

  const rejectedCount = requests.filter(
    (item) => String(item.status || "").toLowerCase() === "rejected"
  ).length;

  if (loading) return <Loader text="Loading KYC requests..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>KYC Requests</h2>
          <p>Review user identity details before allowing withdrawals.</p>
        </div>

        <Button variant="secondary" onClick={() => loadRequests(status)}>
          <RefreshCcw size={18} />
          Refresh
        </Button>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <StatCard
          title="Pending"
          value={pendingCount}
          icon={BadgeCheck}
          variant="warning"
        />

        <StatCard
          title="Approved"
          value={approvedCount}
          icon={BadgeCheck}
          variant="success"
        />

        <StatCard
          title="Rejected"
          value={rejectedCount}
          icon={XCircle}
          variant="danger"
        />
      </div>

      <div className="card table-card">
        <div className="table-header">
          <h3>KYC Review List</h3>

          <div className="actions" style={{ marginTop: 0 }}>
            <input
              className="search-input"
              type="search"
              placeholder="Search KYC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="search-input"
              value={status}
              onChange={(e) => loadRequests(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredRequests}
          emptyText="No KYC requests found."
          showIndex
          renderActions={(item) => {
            const itemStatus = String(item.status || "pending").toLowerCase();

            return (
              <div className="actions" style={{ marginTop: 0 }}>
                <Link to={`/kyc/${item.id}`} className="secondary-button btn-sm">
                  View
                </Link>

                {item.documentImageUrl && (
                  <a
                    href={item.documentImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="secondary-button btn-sm"
                  >
                    Doc
                  </a>
                )}

                {item.documentBackImageUrl && (
                  <a
                    href={item.documentBackImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="secondary-button btn-sm"
                  >
                    Back
                  </a>
                )}

                {item.selfieUrl && (
                  <a
                    href={item.selfieUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="secondary-button btn-sm"
                  >
                    Selfie
                  </a>
                )}

                {itemStatus === "pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => openAction(item, "approve")}
                    >
                      Approve
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => openAction(item, "reject")}
                    >
                      Reject
                    </Button>
                  </>
                )}

                {itemStatus === "rejected" && (
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => openAction(item, "reopen")}
                  >
                    <RotateCcw size={14} />
                    Reopen
                  </Button>
                )}

                {itemStatus === "approved" && (
                  <Badge type="success" dot>
                    Verified
                  </Badge>
                )}
              </div>
            );
          }}
        />
      </div>

      <Modal
        isOpen={!!actionData}
        title={
          actionData?.action === "approve"
            ? "Approve KYC"
            : actionData?.action === "reject"
            ? "Reject KYC"
            : "Reopen KYC"
        }
        onClose={closeAction}
        closeOnBackdrop={!processing}
      >
        {actionData && (
          <form className="form-grid" onSubmit={handleAction}>
            <div className="detail-list">
              <div className="detail-item">
                <span>User</span>
                <strong>{actionData.name}</strong>
              </div>

              <div className="detail-item">
                <span>Document</span>
                <strong>
                  {actionData.documentName} / {actionData.documentType}
                </strong>
              </div>

              <div className="detail-item">
                <span>Number</span>
                <strong>{actionData.documentNumber}</strong>
              </div>
            </div>

            <div className="form-row">
              <label>
                {actionData.action === "reject"
                  ? "Rejection Reason (Required)"
                  : "Admin Note (Optional)"}
              </label>

              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={
                  actionData.action === "reject"
                    ? "Example: Document details are not clear."
                    : "Optional note..."
                }
              />
            </div>

            <div className="actions">
              <Button
                type="button"
                variant="secondary"
                onClick={closeAction}
                disabled={processing}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant={
                  actionData.action === "approve"
                    ? "success"
                    : actionData.action === "reject"
                    ? "danger"
                    : "warning"
                }
                disabled={processing}
                loading={processing}
              >
                {actionData.action === "approve"
                  ? "Approve"
                  : actionData.action === "reject"
                  ? "Reject"
                  : "Reopen"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default KycRequests;
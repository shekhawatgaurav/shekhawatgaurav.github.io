import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BadgeCheck, XCircle, RotateCcw, ArrowLeft } from "lucide-react";

import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";

import {
  approveKycRequest,
  rejectKycRequest,
  reopenKycRequest,
  getKycRequestById,
} from "../../services/kycService";

import { formatDateTime } from "../../utils/formatDate";

function KycDetails() {
  const { kycId } = useParams();

  const [kyc, setKyc] = useState(null);
  const [actionData, setActionData] = useState(null);
  const [adminNote, setAdminNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadKyc() {
    try {
      setLoading(true);
      setError("");

      const data = await getKycRequestById(kycId);
      setKyc(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load KYC details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadKyc();
  }, [kycId]);

  function getStatusType(status) {
    const value = String(status || "pending").toLowerCase();

    if (value === "approved") return "success";
    if (value === "rejected") return "danger";
    return "warning";
  }

  function openAction(action) {
    setMessage("");
    setError("");
    setAdminNote("");
    setActionData({ action });
  }

  function closeAction() {
    if (processing) return;

    setActionData(null);
    setAdminNote("");
  }

  async function handleAction(e) {
    e?.preventDefault?.();

    if (!actionData || !kyc) return;

    setMessage("");
    setError("");

    if (actionData.action === "reject" && !adminNote.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    try {
      setProcessing(true);

      if (actionData.action === "approve") {
        const note = adminNote.trim() || "KYC approved by admin";

        await approveKycRequest(kyc.id, note);

        setKyc((current) => ({
          ...current,
          status: "approved",
          note,
          reviewedAt: new Date(),
        }));

        setMessage("KYC approved successfully.");
      }

      if (actionData.action === "reject") {
        const note = adminNote.trim() || "KYC rejected by admin";

        await rejectKycRequest(kyc.id, note);

        setKyc((current) => ({
          ...current,
          status: "rejected",
          note,
          reviewedAt: new Date(),
        }));

        setMessage("KYC rejected successfully.");
      }

      if (actionData.action === "reopen") {
        const note = adminNote.trim() || "KYC reopened by admin";

        await reopenKycRequest(kyc.id, note);

        setKyc((current) => ({
          ...current,
          status: "pending",
          note,
          reopenedAt: new Date(),
        }));

        setMessage("KYC moved back to pending.");
      }

      closeAction();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update KYC status.");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <Loader text="Loading KYC details..." />;

  if (!kyc) {
    return (
      <div className="empty-page">
        <div>
          <h1>KYC Not Found</h1>
          <p>This KYC request does not exist.</p>
          <Link to="/kyc">Back to KYC Requests</Link>
        </div>
      </div>
    );
  }

  const status = String(kyc.status || "pending").toLowerCase();

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>KYC Details</h2>
          <p>Review document details, user information and uploaded files.</p>
        </div>

        <Link to="/kyc" className="secondary-button">
          <ArrowLeft size={18} />
          Back
        </Link>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>User Information</h3>

          <div className="detail-list">
            <div className="detail-item">
              <span>Name</span>
              <strong>{kyc.name || kyc.userName || "N/A"}</strong>
            </div>

            <div className="detail-item">
              <span>Email</span>
              <strong>{kyc.email || kyc.userEmail || "N/A"}</strong>
            </div>

            <div className="detail-item">
              <span>Phone</span>
              <strong>{kyc.phone || kyc.userPhone || "N/A"}</strong>
            </div>

            <div className="detail-item">
              <span>User ID</span>
              <strong>{kyc.userId || "N/A"}</strong>
            </div>

            <div className="detail-item">
              <span>Status</span>
              <strong>
                <Badge type={getStatusType(kyc.status)} dot>
                  {kyc.status || "pending"}
                </Badge>
              </strong>
            </div>

            <div className="detail-item">
              <span>Submitted</span>
              <strong>{formatDateTime(kyc.createdAt)}</strong>
            </div>

            <div className="detail-item">
              <span>Reviewed</span>
              <strong>{formatDateTime(kyc.reviewedAt)}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Document Information</h3>

          <div className="detail-list">
            <div className="detail-item">
              <span>Document Name</span>
              <strong>{kyc.documentName || "N/A"}</strong>
            </div>

            <div className="detail-item">
              <span>Document Type</span>
              <strong>{kyc.documentType || "PAN / Aadhaar"}</strong>
            </div>

            <div className="detail-item">
              <span>Document Number</span>
              <strong>
                {kyc.documentNumber || kyc.panNumber || kyc.aadhaarNumber || "N/A"}
              </strong>
            </div>

            <div className="detail-item">
              <span>DOB</span>
              <strong>{kyc.dob || "N/A"}</strong>
            </div>

            <div className="detail-item">
              <span>Admin Note</span>
              <strong>{kyc.note || kyc.adminNote || "No note"}</strong>
            </div>
          </div>

          <div className="actions">
            {kyc.documentImageUrl && (
              <a
                href={kyc.documentImageUrl}
                target="_blank"
                rel="noreferrer"
                className="secondary-button"
              >
                Open Document
              </a>
            )}

            {kyc.documentBackImageUrl && (
              <a
                href={kyc.documentBackImageUrl}
                target="_blank"
                rel="noreferrer"
                className="secondary-button"
              >
                Open Back Side
              </a>
            )}

            {kyc.selfieUrl && (
              <a
                href={kyc.selfieUrl}
                target="_blank"
                rel="noreferrer"
                className="secondary-button"
              >
                Open Selfie
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3 style={{ marginTop: 0 }}>Review Action</h3>
        <p style={{ color: "var(--muted)" }}>
          Approve only if the document is clear and matches the user
          information. Reject with a clear reason if details are incorrect.
        </p>

        <div className="actions">
          {status === "pending" && (
            <>
              <Button variant="success" onClick={() => openAction("approve")}>
                <BadgeCheck size={18} />
                Approve KYC
              </Button>

              <Button variant="danger" onClick={() => openAction("reject")}>
                <XCircle size={18} />
                Reject KYC
              </Button>
            </>
          )}

          {status === "rejected" && (
            <Button variant="warning" onClick={() => openAction("reopen")}>
              <RotateCcw size={18} />
              Reopen KYC
            </Button>
          )}

          {status === "approved" && (
            <Badge type="success" dot>
              Verified
            </Badge>
          )}
        </div>
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
        <form className="form-grid" onSubmit={handleAction}>
          <div className="form-row">
            <label>
              {actionData?.action === "reject"
                ? "Rejection Reason (Required)"
                : "Admin Note (Optional)"}
            </label>

            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder={
                actionData?.action === "reject"
                  ? "Example: Document image is not clear."
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
                actionData?.action === "approve"
                  ? "success"
                  : actionData?.action === "reject"
                  ? "danger"
                  : "warning"
              }
              disabled={processing}
              loading={processing}
            >
              {actionData?.action === "approve"
                ? "Approve"
                : actionData?.action === "reject"
                ? "Reject"
                : "Reopen"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default KycDetails;
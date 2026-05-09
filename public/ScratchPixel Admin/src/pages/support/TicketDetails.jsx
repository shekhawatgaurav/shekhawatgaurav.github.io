import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { ArrowLeft, Send } from "lucide-react";

import { db } from "../../firebase/firebaseConfig";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { formatDateTime } from "../../utils/formatDate";
import { useAuth } from "../../context/AuthContext";
import { createNotification } from "../../services/notificationService";

const SUPPORT_COLLECTION = "supportTickets";
const SUPPORT_REPLIES_COLLECTION = "supportReplies";

const VALID_STATUSES = ["open", "replied", "in_review", "resolved", "closed"];

function TicketDetails() {
  const { ticketId } = useParams();
  const { adminData } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState("");

  const [confirmData, setConfirmData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function normalize(value = "", fallback = "") {
    return String(value || fallback).toLowerCase().trim();
  }

  async function loadTicket() {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const ref = doc(db, SUPPORT_COLLECTION, ticketId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setTicket(null);
        return;
      }

      setTicket({
        id: snap.id,
        ...snap.data(),
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load ticket details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  function getStatusType(value) {
    const safeStatus = normalize(value, "open");

    if (safeStatus === "resolved") return "success";
    if (safeStatus === "replied") return "primary";
    if (safeStatus === "in_review") return "warning";
    if (safeStatus === "closed") return "muted";

    return "warning";
  }

  async function handleReply(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const finalReply = reply.trim();

    if (!finalReply) {
      setError("Please write a reply.");
      return;
    }

    if (finalReply.length < 3) {
      setError("Reply message is too short.");
      return;
    }

    if (!ticket) {
      setError("Ticket data not found.");
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, SUPPORT_REPLIES_COLLECTION), {
        ticketId,
        userId: ticket.userId || "",
        adminId: adminData?.id || "",
        adminEmail: adminData?.email || "",
        adminName: adminData?.name || "",
        reply: finalReply,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, SUPPORT_COLLECTION, ticketId), {
        lastReply: finalReply,
        lastReplyBy: "admin",
        repliedAt: serverTimestamp(),
        status: "replied",
        updatedAt: serverTimestamp(),
      });

      let notificationSent = false;

      if (ticket.userId) {
        try {
          await createNotification({
            title: "Support Reply",
            message: finalReply,
            targetType: "user",
            targetUserId: ticket.userId,
            type: "support",
            isActive: true,
          });

          notificationSent = true;
        } catch (notificationError) {
          console.warn("Support notification failed:", notificationError);
        }
      }

      setTicket((current) => ({
        ...current,
        lastReply: finalReply,
        lastReplyBy: "admin",
        status: "replied",
      }));

      setReply("");

      setMessage(
        notificationSent
          ? "Reply saved and user notification created."
          : "Reply saved. User notification was not sent."
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save reply.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(nextStatus) {
    if (!VALID_STATUSES.includes(nextStatus)) {
      setError("Invalid ticket status.");
      return;
    }

    try {
      setProcessing(true);
      setMessage("");
      setError("");

      await updateDoc(doc(db, SUPPORT_COLLECTION, ticketId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
        resolvedAt: nextStatus === "resolved" ? serverTimestamp() : null,
        closedAt: nextStatus === "closed" ? serverTimestamp() : null,
      });

      setTicket((current) => ({
        ...current,
        status: nextStatus,
      }));

      if (nextStatus === "resolved") {
        setMessage("Ticket marked as resolved.");
      } else if (nextStatus === "closed") {
        setMessage("Ticket closed successfully.");
      } else if (nextStatus === "open") {
        setMessage("Ticket reopened successfully.");
      } else {
        setMessage("Ticket status updated.");
      }

      setConfirmData(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update ticket status.");
    } finally {
      setProcessing(false);
    }
  }

  function openStatusConfirm(nextStatus) {
    const titleMap = {
      resolved: "Mark ticket as resolved?",
      closed: "Close ticket?",
      open: "Reopen ticket?",
    };

    const messageMap = {
      resolved: "This ticket will be marked as resolved.",
      closed: "This ticket will be closed.",
      open: "This ticket will move back to open status.",
    };

    setMessage("");
    setError("");

    setConfirmData({
      action: nextStatus,
      title: titleMap[nextStatus] || "Update ticket?",
      message: messageMap[nextStatus] || "This ticket status will be updated.",
    });
  }

  if (loading) return <Loader text="Loading ticket details..." />;

  if (!ticket) {
    return (
      <div className="empty-page">
        <div className="empty-card">
          <h1>Ticket Not Found</h1>
          <p>This support ticket does not exist.</p>
          <Link to="/support" className="primary-button">
            Back to Support
          </Link>
        </div>
      </div>
    );
  }

  const currentStatus = normalize(ticket.status, "open");

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Ticket Details</h2>
          <p>Review user issue and reply to the support ticket.</p>
        </div>

        <Link to="/support" className="secondary-button">
          <ArrowLeft size={18} />
          Back
        </Link>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Ticket Information</h3>

          <div className="detail-list">
            <div className="detail-item">
              <span>Subject</span>
              <strong>{ticket.subject || "No Subject"}</strong>
            </div>

            <div className="detail-item">
              <span>Category</span>
              <strong>
                <Badge type="primary">{ticket.category || "general"}</Badge>
              </strong>
            </div>

            <div className="detail-item">
              <span>Status</span>
              <strong>
                <Badge type={getStatusType(ticket.status)} dot>
                  {ticket.status || "open"}
                </Badge>
              </strong>
            </div>

            <div className="detail-item">
              <span>Created</span>
              <strong>{formatDateTime(ticket.createdAt)}</strong>
            </div>

            <div className="detail-item">
              <span>Updated</span>
              <strong>{formatDateTime(ticket.updatedAt)}</strong>
            </div>

            <div className="detail-item">
              <span>Replied At</span>
              <strong>{formatDateTime(ticket.repliedAt)}</strong>
            </div>

            <div className="detail-item">
              <span>User</span>
              <strong>{ticket.userName || ticket.userId || "Unknown"}</strong>
            </div>

            <div className="detail-item">
              <span>Contact</span>
              <strong>{ticket.userEmail || ticket.userPhone || "N/A"}</strong>
            </div>

            <div className="detail-item">
              <span>User ID</span>
              <strong>{ticket.userId || "N/A"}</strong>
            </div>
          </div>

          <div className="actions">
            {currentStatus !== "resolved" && currentStatus !== "closed" && (
              <Button
                variant="success"
                onClick={() => openStatusConfirm("resolved")}
              >
                Mark Resolved
              </Button>
            )}

            {currentStatus !== "closed" && (
              <Button
                variant="danger"
                onClick={() => openStatusConfirm("closed")}
              >
                Close Ticket
              </Button>
            )}

            {(currentStatus === "closed" || currentStatus === "resolved") && (
              <Button
                variant="warning"
                onClick={() => openStatusConfirm("open")}
              >
                Reopen Ticket
              </Button>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>User Message</h3>

          <p style={{ color: "var(--muted)", lineHeight: 1.7, fontWeight: 700 }}>
            {ticket.message || "No message provided."}
          </p>

          {ticket.attachmentUrl && (
            <div className="actions">
              <a
                href={ticket.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="secondary-button"
              >
                Open Attachment
              </a>
            </div>
          )}

          {ticket.lastReply && (
            <div className="success-box" style={{ marginTop: 16 }}>
              <strong>Last reply:</strong>
              <br />
              {ticket.lastReply}
            </div>
          )}
        </div>
      </div>

      <div className="card form-card" style={{ marginTop: 18 }}>
        <form className="form-grid" onSubmit={handleReply}>
          <h3 style={{ margin: 0 }}>Admin Reply</h3>

          <div className="warning-box">
            This reply will be saved in support replies and a notification will
            be sent to the user if user ID is available.
          </div>

          <div className="form-row">
            <label>Reply Message</label>
            <textarea
              placeholder="Write your reply to the user..."
              value={reply}
              disabled={saving}
              onChange={(e) => setReply(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={saving} loading={saving}>
            <Send size={18} />
            Save Reply
          </Button>
        </form>
      </div>

      <ConfirmDialog
        isOpen={!!confirmData}
        title={confirmData?.title}
        message={confirmData?.message}
        confirmText="Confirm"
        variant={
          confirmData?.action === "resolved"
            ? "success"
            : confirmData?.action === "open"
            ? "warning"
            : "danger"
        }
        loading={processing}
        onCancel={() => {
          if (!processing) setConfirmData(null);
        }}
        onConfirm={() => updateStatus(confirmData?.action)}
      />
    </div>
  );
}

export default TicketDetails;
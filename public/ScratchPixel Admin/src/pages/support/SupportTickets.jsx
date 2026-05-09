import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { LifeBuoy, RefreshCcw } from "lucide-react";

import { db } from "../../firebase/firebaseConfig";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import StatCard from "../../components/cards/StatCard";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { formatDateTime } from "../../utils/formatDate";

const SUPPORT_COLLECTION = "supportTickets";

const VALID_STATUSES = ["open", "replied", "in_review", "resolved", "closed"];

function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [confirmData, setConfirmData] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function normalize(value = "", fallback = "") {
    return String(value || fallback).toLowerCase().trim();
  }

  async function loadTickets() {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const q = query(
        collection(db, SUPPORT_COLLECTION),
        orderBy("createdAt", "desc"),
        limit(150)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      setTickets(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load support tickets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return tickets.filter((ticket) => {
      const ticketStatus = normalize(ticket.status, "open");
      const statusMatch = status === "all" || ticketStatus === status;

      const searchMatch =
        !keyword ||
        String(ticket.subject || "").toLowerCase().includes(keyword) ||
        String(ticket.message || "").toLowerCase().includes(keyword) ||
        String(ticket.userName || "").toLowerCase().includes(keyword) ||
        String(ticket.userEmail || "").toLowerCase().includes(keyword) ||
        String(ticket.userPhone || "").toLowerCase().includes(keyword) ||
        String(ticket.userId || "").toLowerCase().includes(keyword) ||
        String(ticket.category || "").toLowerCase().includes(keyword) ||
        String(ticket.status || "").toLowerCase().includes(keyword);

      return statusMatch && searchMatch;
    });
  }, [tickets, search, status]);

  function getStatusType(value) {
    const safeStatus = normalize(value, "open");

    if (safeStatus === "resolved") return "success";
    if (safeStatus === "open") return "warning";
    if (safeStatus === "replied") return "primary";
    if (safeStatus === "in_review") return "warning";
    if (safeStatus === "closed") return "muted";

    return "warning";
  }

  async function updateTicketStatus(ticketId, nextStatus) {
    if (!ticketId) {
      setError("Ticket ID is missing.");
      return;
    }

    if (!VALID_STATUSES.includes(nextStatus)) {
      setError("Invalid ticket status.");
      return;
    }

    try {
      setProcessing(true);
      setError("");
      setMessage("");

      await updateDoc(doc(db, SUPPORT_COLLECTION, ticketId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
        resolvedAt: nextStatus === "resolved" ? serverTimestamp() : null,
        closedAt: nextStatus === "closed" ? serverTimestamp() : null,
      });

      setTickets((items) =>
        items.map((item) =>
          item.id === ticketId
            ? {
                ...item,
                status: nextStatus,
              }
            : item
        )
      );

      if (nextStatus === "resolved") {
        setMessage("Support ticket marked as resolved.");
      } else if (nextStatus === "closed") {
        setMessage("Support ticket closed successfully.");
      } else if (nextStatus === "open") {
        setMessage("Support ticket reopened successfully.");
      } else {
        setMessage("Support ticket updated successfully.");
      }

      setConfirmData(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update ticket status.");
    } finally {
      setProcessing(false);
    }
  }

  function openConfirm(row, nextStatus) {
    const titleMap = {
      resolved: "Mark Resolved?",
      closed: "Close Ticket?",
      open: "Reopen Ticket?",
    };

    const messageMap = {
      resolved: "This ticket will be marked as resolved.",
      closed: "This ticket will be closed.",
      open: "This ticket will move back to open status.",
    };

    setMessage("");
    setError("");

    setConfirmData({
      id: row.id,
      action: nextStatus,
      title: titleMap[nextStatus] || "Update Ticket?",
      message: messageMap[nextStatus] || "This ticket status will be updated.",
    });
  }

  const columns = [
    {
      key: "subject",
      label: "Ticket",
      render: (row) => (
        <div>
          <strong>{row.subject || "No Subject"}</strong>
          <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
            {row.message || "No message"}
          </p>
        </div>
      ),
    },
    {
      key: "user",
      label: "User",
      render: (row) => (
        <div>
          <strong>{row.userName || "Unknown User"}</strong>
          <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
            {row.userEmail || row.userPhone || row.userId || "No user info"}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (row) => <Badge type="primary">{row.category || "general"}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge type={getStatusType(row.status)} dot>
          {row.status || "open"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  const openCount = tickets.filter(
    (ticket) => normalize(ticket.status, "open") === "open"
  ).length;

  const activeCount = tickets.filter((ticket) =>
    ["open", "replied", "in_review"].includes(normalize(ticket.status, "open"))
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) => normalize(ticket.status) === "resolved"
  ).length;

  const closedCount = tickets.filter(
    (ticket) => normalize(ticket.status) === "closed"
  ).length;

  if (loading) return <Loader text="Loading support tickets..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Support Tickets</h2>
          <p>Manage user complaints, withdrawal issues and reward problems.</p>
        </div>

        <Button variant="secondary" onClick={loadTickets}>
          <RefreshCcw size={18} />
          Refresh
        </Button>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard title="Total Tickets" value={tickets.length} icon={LifeBuoy} />

        <StatCard
          title="Open"
          value={openCount}
          icon={LifeBuoy}
          variant="warning"
        />

        <StatCard
          title="Active"
          value={activeCount}
          icon={LifeBuoy}
          variant="warning"
        />

        <StatCard
          title="Resolved"
          value={resolvedCount}
          icon={LifeBuoy}
          variant="success"
        />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <StatCard
          title="Closed"
          value={closedCount}
          icon={LifeBuoy}
          variant="muted"
        />

        <StatCard
          title="Filtered Tickets"
          value={filteredTickets.length}
          icon={LifeBuoy}
        />
      </div>

      <div className="card table-card">
        <div className="table-header">
          <h3>Tickets</h3>

          <div className="actions" style={{ marginTop: 0 }}>
            <input
              className="search-input"
              type="search"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="search-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="replied">Replied</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredTickets}
          emptyText="No support tickets found."
          showIndex
          renderActions={(row) => {
            const currentStatus = normalize(row.status, "open");

            return (
              <div className="actions" style={{ marginTop: 0 }}>
                <Link to={`/support/${row.id}`} className="secondary-button btn-sm">
                  View
                </Link>

                {currentStatus !== "resolved" && currentStatus !== "closed" && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => openConfirm(row, "resolved")}
                  >
                    Resolve
                  </Button>
                )}

                {currentStatus !== "closed" && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => openConfirm(row, "closed")}
                  >
                    Close
                  </Button>
                )}

                {(currentStatus === "closed" || currentStatus === "resolved") && (
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => openConfirm(row, "open")}
                  >
                    Reopen
                  </Button>
                )}
              </div>
            );
          }}
        />
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
        onConfirm={() =>
          updateTicketStatus(confirmData?.id, confirmData?.action)
        }
      />
    </div>
  );
}

export default SupportTickets;
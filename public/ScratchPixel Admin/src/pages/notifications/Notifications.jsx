import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Archive, Bell, Plus, RefreshCcw } from "lucide-react";

import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import StatCard from "../../components/cards/StatCard";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { formatDateTime } from "../../utils/formatDate";
import {
  archiveNotification,
  getNotifications,
  toggleNotificationActive,
} from "../../services/notificationService";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [targetFilter, setTargetFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [confirmData, setConfirmData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const data = await getNotifications(150);
      setNotifications(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return notifications.filter((item) => {
      const targetType = item.targetType || item.target || "all";
      const status = item.status || (item.isActive === false ? "inactive" : "active");

      const targetMatch =
        targetFilter === "all" ||
        String(targetType).toLowerCase() === targetFilter;

      const statusMatch =
        statusFilter === "all" || String(status).toLowerCase() === statusFilter;

      const searchMatch =
        !keyword ||
        String(item.title || "").toLowerCase().includes(keyword) ||
        String(item.message || "").toLowerCase().includes(keyword) ||
        String(item.type || "").toLowerCase().includes(keyword) ||
        String(item.targetUserId || item.userId || "")
          .toLowerCase()
          .includes(keyword);

      return targetMatch && statusMatch && searchMatch;
    });
  }, [notifications, search, targetFilter, statusFilter]);

  async function handleToggle(item) {
    try {
      setProcessingId(item.id);
      setMessage("");
      setError("");

      const nextActive = !item.isActive;

      await toggleNotificationActive(item.id, nextActive);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === item.id
            ? {
                ...notification,
                isActive: nextActive,
                status: nextActive ? "sent" : "inactive",
              }
            : notification
        )
      );

      setMessage(
        nextActive
          ? "Notification activated successfully."
          : "Notification deactivated successfully."
      );
    } catch (err) {
      console.error(err);
      setError("Unable to update notification.");
    } finally {
      setProcessingId("");
    }
  }

  async function handleArchive() {
    if (!confirmData?.id) return;

    try {
      setProcessingId(confirmData.id);
      setMessage("");
      setError("");

      await archiveNotification(confirmData.id);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === confirmData.id
            ? {
                ...notification,
                isActive: false,
                status: "archived",
              }
            : notification
        )
      );

      setConfirmData(null);
      setMessage("Notification archived successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to archive notification.");
    } finally {
      setProcessingId("");
    }
  }

  const activeCount = notifications.filter((item) => item.isActive !== false).length;

  const allUsersCount = notifications.filter(
    (item) => (item.targetType || item.target || "all") === "all"
  ).length;

  const userSpecificCount = notifications.filter(
    (item) => (item.targetType || item.target) === "user"
  ).length;

  const archivedCount = notifications.filter(
    (item) => String(item.status || "").toLowerCase() === "archived"
  ).length;

  const columns = [
    {
      key: "title",
      label: "Notification",
      render: (row) => (
        <div>
          <strong>{row.title || "Untitled"}</strong>
          <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
            {row.message || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (row) => <Badge type={row.type || "general"}>{row.type || "general"}</Badge>,
    },
    {
      key: "targetType",
      label: "Target",
      render: (row) => {
        const targetType = row.targetType || row.target || "all";
        const targetUserId = row.targetUserId || row.userId || "";

        return (
          <div>
            <Badge type={targetType === "all" ? "success" : "warning"} dot>
              {targetType === "all" ? "All Users" : "Specific User"}
            </Badge>

            {targetType === "user" && (
              <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>
                {targetUserId || "No user ID"}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const status =
          row.status || (row.isActive === false ? "inactive" : "active");

        return (
          <Badge type={row.isActive === false ? "muted" : status} dot>
            {status}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  if (loading) return <Loader text="Loading notifications..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Notifications</h2>
          <p>Create and manage app notifications.</p>
        </div>

        <div className="actions" style={{ marginTop: 0 }}>
          <Button variant="secondary" onClick={loadNotifications}>
            <RefreshCcw size={18} />
            Refresh
          </Button>

          <Link to="/notifications/send" className="primary-button">
            <Plus size={18} />
            Send Notification
          </Link>
        </div>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard title="Active" value={activeCount} icon={Bell} variant="success" />
        <StatCard title="All Users" value={allUsersCount} icon={Bell} />
        <StatCard title="Specific Users" value={userSpecificCount} icon={Bell} />
        <StatCard title="Archived" value={archivedCount} icon={Archive} variant="muted" />
      </div>

      <div className="card table-card">
        <div className="table-header">
          <h3>Notification History</h3>

          <div className="actions" style={{ marginTop: 0 }}>
            <input
              className="search-input"
              type="search"
              placeholder="Search notification..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="search-input"
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
            >
              <option value="all">All Targets</option>
              <option value="user">Specific User</option>
            </select>

            <select
              className="search-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredNotifications}
          emptyText="No notifications found."
          showIndex
          renderActions={(row) => {
            const isArchived = String(row.status || "").toLowerCase() === "archived";

            return (
              <div className="actions" style={{ marginTop: 0 }}>
                {!isArchived && (
                  <>
                    <Button
                      size="sm"
                      variant={row.isActive === false ? "success" : "warning"}
                      onClick={() => handleToggle(row)}
                      loading={processingId === row.id}
                    >
                      {row.isActive === false ? "Activate" : "Deactivate"}
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setConfirmData({
                          id: row.id,
                          title: "Archive notification?",
                          message:
                            "This notification will be hidden from active use but kept in history.",
                        })
                      }
                    >
                      Archive
                    </Button>
                  </>
                )}

                {isArchived && (
                  <Badge type="muted" dot>
                    Archived
                  </Badge>
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
        confirmText="Archive"
        variant="warning"
        loading={!!processingId}
        onCancel={() => {
          if (!processingId) setConfirmData(null);
        }}
        onConfirm={handleArchive}
      />
    </div>
  );
}

export default Notifications;
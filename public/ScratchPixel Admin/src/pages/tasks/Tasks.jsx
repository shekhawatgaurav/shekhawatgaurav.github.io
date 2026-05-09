import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckSquare, Plus, RefreshCcw, Trash2 } from "lucide-react";

import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import StatCard from "../../components/cards/StatCard";

import { formatDate, formatDateTime } from "../../utils/formatDate";
import { formatCoins } from "../../utils/formatCurrency";
import {
  deleteTask,
  getTaskTypeLabel,
  getTasks,
  updateTaskStatus,
} from "../../services/taskService";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");

  const [selectedTask, setSelectedTask] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");

      const data = await getTasks(150);
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return tasks.filter((task) => {
      const taskStatus = String(task.status || "active").toLowerCase();
      const taskType = String(task.type || "custom").toLowerCase();

      const statusMatch = status === "all" || taskStatus === status;
      const typeMatch = type === "all" || taskType === type;

      const searchMatch =
        !keyword ||
        String(task.title || "").toLowerCase().includes(keyword) ||
        String(task.type || "").toLowerCase().includes(keyword) ||
        String(task.actionKey || "").toLowerCase().includes(keyword) ||
        String(task.description || "").toLowerCase().includes(keyword) ||
        String(task.status || "").toLowerCase().includes(keyword) ||
        String(task.expiryDate || "").toLowerCase().includes(keyword);

      return statusMatch && typeMatch && searchMatch;
    });
  }, [tasks, search, status, type]);

  function getStatusType(value) {
    if (value === "active") return "success";
    if (value === "inactive") return "muted";
    if (value === "draft") return "warning";
    return "warning";
  }

  function openConfirm(task, action) {
    setMessage("");
    setError("");
    setSelectedTask(task);
    setConfirmAction(action);
  }

  function closeConfirm() {
    if (processing) return;

    setSelectedTask(null);
    setConfirmAction(null);
  }

  async function handleConfirmAction() {
    if (!selectedTask || !confirmAction) return;

    try {
      setProcessing(true);
      setMessage("");
      setError("");

      if (confirmAction === "delete") {
        await deleteTask(selectedTask.id);

        setTasks((items) =>
          items.filter((item) => item.id !== selectedTask.id)
        );

        setMessage("Task deleted successfully.");
      } else {
        const nextStatus =
          confirmAction === "disable"
            ? "inactive"
            : confirmAction === "draft"
            ? "draft"
            : "active";

        await updateTaskStatus(selectedTask.id, nextStatus);

        setTasks((items) =>
          items.map((item) =>
            item.id === selectedTask.id
              ? { ...item, status: nextStatus }
              : item
          )
        );

        setMessage(
          nextStatus === "active"
            ? "Task enabled successfully."
            : nextStatus === "draft"
            ? "Task moved to draft successfully."
            : "Task disabled successfully."
        );
      }

      closeConfirm();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to complete action.");
    } finally {
      setProcessing(false);
    }
  }

  const columns = [
    {
      key: "title",
      label: "Task",
      render: (row) => (
        <div>
          <strong>{row.title || "Untitled Task"}</strong>
          <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
            {row.description || "No description"}
          </p>

          <div className="actions" style={{ marginTop: 8 }}>
            <Badge type="primary">{row.actionKey || "manual"}</Badge>

            {row.isFeatured && (
              <Badge type="warning" dot>
                Featured
              </Badge>
            )}

            {row.requiresVerification !== false && (
              <Badge type="success" dot>
                Verified Action
              </Badge>
            )}

            {row.autoClaim && (
              <Badge type="warning" dot>
                Auto Claim
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (row) => (
        <Badge type="primary">{getTaskTypeLabel(row.type)}</Badge>
      ),
    },
    {
      key: "targetCount",
      label: "Target",
      render: (row) => row.targetCount || 1,
    },
    {
      key: "rewardCoins",
      label: "Reward",
      render: (row) => `${formatCoins(row.rewardCoins || 0)} coins`,
    },
    {
      key: "expiryDate",
      label: "Expiry",
      render: (row) => (row.expiryDate ? formatDate(row.expiryDate) : "No expiry"),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge type={getStatusType(row.status)} dot>
          {row.status || "active"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  const activeCount = tasks.filter((task) => task.status === "active").length;
  const draftCount = tasks.filter((task) => task.status === "draft").length;
  const adsCount = tasks.filter((task) => task.type === "ads").length;
  const totalRewardCoins = tasks.reduce(
    (sum, task) => sum + Number(task.rewardCoins || 0),
    0
  );

  if (loading) return <Loader text="Loading tasks..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Tasks</h2>
          <p>Create and manage app action-based reward tasks.</p>
        </div>

        <div className="actions" style={{ marginTop: 0 }}>
          <Button variant="secondary" onClick={loadTasks}>
            <RefreshCcw size={18} />
            Refresh
          </Button>

          <Link to="/tasks/create" className="primary-button">
            <Plus size={18} />
            Create Task
          </Link>
        </div>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard title="Total Tasks" value={tasks.length} icon={CheckSquare} />
        <StatCard title="Active Tasks" value={activeCount} icon={CheckSquare} variant="success" />
        <StatCard title="Draft Tasks" value={draftCount} icon={CheckSquare} variant="warning" />
        <StatCard
          title="Reward Pool"
          value={formatCoins(totalRewardCoins)}
          icon={CheckSquare}
          subtitle="Coins per task total"
        />
      </div>

      <div className="card table-card">
        <div className="table-header">
          <h3>Task List</h3>

          <div className="actions" style={{ marginTop: 0 }}>
            <input
              className="search-input"
              type="search"
              placeholder="Search task..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="search-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="ads">Ads</option>
              <option value="scratch">Scratch</option>
              <option value="referral">Referral</option>
              <option value="profile">Profile</option>
              <option value="custom">Custom</option>
            </select>

            <select
              className="search-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredTasks}
          emptyText="No tasks found."
          showIndex
          renderActions={(row) => {
            const rowStatus = String(row.status || "active").toLowerCase();

            return (
              <div className="actions" style={{ marginTop: 0 }}>
                <Link to={`/tasks/${row.id}`} className="secondary-button btn-sm">
                  View
                </Link>

                {rowStatus === "active" ? (
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => openConfirm(row, "disable")}
                  >
                    Disable
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => openConfirm(row, "enable")}
                  >
                    Enable
                  </Button>
                )}

                {rowStatus !== "draft" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openConfirm(row, "draft")}
                  >
                    Draft
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => openConfirm(row, "delete")}
                >
                  <Trash2 size={15} />
                  Delete
                </Button>
              </div>
            );
          }}
        />
      </div>

      <ConfirmDialog
        isOpen={!!confirmAction}
        title={
          confirmAction === "delete"
            ? "Delete task?"
            : confirmAction === "disable"
            ? "Disable task?"
            : confirmAction === "draft"
            ? "Move task to draft?"
            : "Enable task?"
        }
        message={
          confirmAction === "delete"
            ? "This task will be permanently deleted."
            : confirmAction === "disable"
            ? "Users will no longer see this task in the app."
            : confirmAction === "draft"
            ? "This task will be saved as draft and hidden from users."
            : "Users will be able to see and complete this task."
        }
        confirmText={
          confirmAction === "delete"
            ? "Delete"
            : confirmAction === "disable"
            ? "Disable"
            : confirmAction === "draft"
            ? "Move to Draft"
            : "Enable"
        }
        variant={
          confirmAction === "delete"
            ? "danger"
            : confirmAction === "enable"
            ? "success"
            : "warning"
        }
        loading={processing}
        onCancel={closeConfirm}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}

export default Tasks;
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Save, CheckSquare } from "lucide-react";

import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { formatDateTime } from "../../utils/formatDate";
import { formatCoins } from "../../utils/formatCurrency";
import {
  getActionKeyForType,
  getTaskById,
  getTaskTypeLabel,
  TASK_TYPES,
  updateTask,
} from "../../services/taskService";

function TaskDetails() {
  const { taskId } = useParams();

  const [task, setTask] = useState(null);
  const [formData, setFormData] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadTask() {
    try {
      setLoading(true);
      setError("");

      const data = await getTaskById(taskId);

      if (!data) {
        setTask(null);
        setFormData(null);
        return;
      }

      setTask(data);
      setFormData({
        title: data.title || "",
        description: data.description || "",
        type: data.type || "ads",
        rewardCoins: data.rewardCoins || 0,
        targetCount: data.targetCount || 1,
        status: data.status || "active",
        expiryDate: data.expiryDate || "",
        actionKey: data.actionKey || getActionKeyForType(data.type || "ads"),
        sortOrder: data.sortOrder || 0,
        isFeatured: !!data.isFeatured,
        autoClaim: !!data.autoClaim,
        requiresVerification:
          data.requiresVerification === undefined ? true : !!data.requiresVerification,
      });
    } catch (err) {
      console.error(err);
      setError("Unable to load task details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTask();
  }, [taskId]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((current) => {
      const next = {
        ...current,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "type") {
        next.actionKey = getActionKeyForType(value);

        if (value === "profile") {
          next.targetCount = 1;
          next.autoClaim = false;
          next.requiresVerification = true;
        }

        if (value === "ads") {
          next.actionKey = "watch_ad";
          next.autoClaim = false;
          next.requiresVerification = true;
        }

        if (value === "scratch") {
          next.actionKey = "scratch_card";
          next.autoClaim = false;
          next.requiresVerification = true;
        }
      }

      return next;
    });
  }

  function isPastDate(dateValue) {
    if (!dateValue) return false;

    const selected = new Date(dateValue);
    selected.setHours(23, 59, 59, 999);

    return selected.getTime() < Date.now();
  }

  function validateBeforeSave(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const rewardCoins = Number(formData.rewardCoins || 0);
    const targetCount = Number(formData.targetCount || 0);
    const sortOrder = Number(formData.sortOrder || 0);

    if (!formData.title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Task description is required.");
      return;
    }

    if (!formData.actionKey.trim()) {
      setError("Action key is required.");
      return;
    }

    if (!Number.isFinite(rewardCoins) || rewardCoins <= 0) {
      setError("Reward coins must be greater than 0.");
      return;
    }

    if (!Number.isFinite(targetCount) || targetCount <= 0) {
      setError("Target count must be at least 1.");
      return;
    }

    if (!Number.isFinite(sortOrder)) {
      setError("Sort order must be a valid number.");
      return;
    }

    if (isPastDate(formData.expiryDate)) {
      setError("Expiry date cannot be in the past.");
      return;
    }

    setConfirmOpen(true);
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        actionKey: formData.actionKey.trim(),
        rewardCoins: Number(formData.rewardCoins || 0),
        targetCount: Number(formData.targetCount || 1),
        sortOrder: Number(formData.sortOrder || 0),
        isFeatured: !!formData.isFeatured,
        autoClaim: !!formData.autoClaim,
        requiresVerification: !!formData.requiresVerification,
      };

      await updateTask(taskId, payload);

      setTask((current) => ({
        ...current,
        ...payload,
      }));

      setMessage("Task updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update task.");
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  }

  function getStatusType(status) {
    if (status === "active") return "success";
    if (status === "inactive") return "muted";
    if (status === "draft") return "warning";
    return "warning";
  }

  if (loading) return <Loader text="Loading task details..." />;

  if (!task || !formData) {
    return (
      <div className="empty-page">
        <div>
          <h1>Task Not Found</h1>
          <p>This task does not exist.</p>
          <Link to="/tasks">Back to Tasks</Link>
        </div>
      </div>
    );
  }

  const selectedType = TASK_TYPES.find((type) => type.value === formData.type);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Task Details</h2>
          <p>Edit task reward, action type, target and status.</p>
        </div>

        <Link to="/tasks" className="secondary-button">
          <ArrowLeft size={18} />
          Back
        </Link>
      </div>

      <div className="warning-box">
        <CheckSquare size={18} />
        Keep verification ON for ads and scratch tasks. App should update
        progress only after the real user action is completed.
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-2">
        <div className="card form-card">
          <form className="form-grid" onSubmit={validateBeforeSave}>
            <div className="settings-section">
              <div className="section-title">
                <CheckSquare size={18} />
                <h3>Task Content</h3>
              </div>

              <div className="form-row">
                <label>Task Title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="settings-section">
              <div className="section-title">
                <CheckSquare size={18} />
                <h3>Task Logic</h3>
              </div>

              <div className="grid grid-2">
                <div className="form-row">
                  <label>Task Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    {TASK_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <small>{selectedType?.helper}</small>
                </div>

                <div className="form-row">
                  <label>Action Key</label>
                  <input
                    name="actionKey"
                    value={formData.actionKey}
                    onChange={handleChange}
                  />
                  <small>Example: watch_ad, scratch_card, complete_profile.</small>
                </div>

                <div className="form-row">
                  <label>Reward Coins</label>
                  <input
                    type="number"
                    name="rewardCoins"
                    value={formData.rewardCoins}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <label>Target Count</label>
                  <input
                    type="number"
                    name="targetCount"
                    value={formData.targetCount}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row checkbox-row">
                  <label>
                    <input
                      type="checkbox"
                      name="requiresVerification"
                      checked={!!formData.requiresVerification}
                      onChange={handleChange}
                    />
                    Require app action verification
                  </label>
                  <small>
                    Keep ON for ads/scratch tasks so reward cannot be claimed directly.
                  </small>
                </div>

                <div className="form-row checkbox-row">
                  <label>
                    <input
                      type="checkbox"
                      name="autoClaim"
                      checked={!!formData.autoClaim}
                      onChange={handleChange}
                    />
                    Auto claim reward after target complete
                  </label>
                  <small>Recommended OFF for safer reward control.</small>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <div className="section-title">
                <CheckSquare size={18} />
                <h3>Publish Settings</h3>
              </div>

              <div className="grid grid-2">
                <div className="form-row">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="form-row">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <label>Sort Order</label>
                  <input
                    type="number"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row checkbox-row">
                  <label>
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={!!formData.isFeatured}
                      onChange={handleChange}
                    />
                    Featured task
                  </label>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saving} loading={saving}>
              <Save size={18} />
              Save Changes
            </Button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Task Info</h3>

          <div className="detail-list">
            <div className="detail-item">
              <span>Status</span>
              <strong>
                <Badge type={getStatusType(task.status)} dot>
                  {task.status || "active"}
                </Badge>
              </strong>
            </div>

            <div className="detail-item">
              <span>Type</span>
              <strong>{getTaskTypeLabel(task.type)}</strong>
            </div>

            <div className="detail-item">
              <span>Action Key</span>
              <strong>{task.actionKey || "manual"}</strong>
            </div>

            <div className="detail-item">
              <span>Reward</span>
              <strong>{formatCoins(task.rewardCoins || 0)} coins</strong>
            </div>

            <div className="detail-item">
              <span>Target Count</span>
              <strong>{task.targetCount || 1}</strong>
            </div>

            <div className="detail-item">
              <span>Verification</span>
              <strong>{task.requiresVerification === false ? "OFF" : "ON"}</strong>
            </div>

            <div className="detail-item">
              <span>Auto Claim</span>
              <strong>{task.autoClaim ? "ON" : "OFF"}</strong>
            </div>

            <div className="detail-item">
              <span>Total Claims</span>
              <strong>{task.totalClaims || 0}</strong>
            </div>

            <div className="detail-item">
              <span>Total Completions</span>
              <strong>{task.totalCompletions || 0}</strong>
            </div>

            <div className="detail-item">
              <span>Created</span>
              <strong>{formatDateTime(task.createdAt)}</strong>
            </div>

            <div className="detail-item">
              <span>Updated</span>
              <strong>{formatDateTime(task.updatedAt)}</strong>
            </div>

            <div className="detail-item">
              <span>Task ID</span>
              <strong>{task.id}</strong>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Save task changes?"
        message="This will update the task for users in the app."
        confirmText="Save"
        variant="success"
        loading={saving}
        onConfirm={handleSave}
        onCancel={() => {
          if (!saving) setConfirmOpen(false);
        }}
      />
    </div>
  );
}

export default TaskDetails;
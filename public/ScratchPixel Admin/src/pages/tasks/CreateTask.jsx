import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, CheckSquare } from "lucide-react";

import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  createTask,
  getActionKeyForType,
  TASK_TYPES,
} from "../../services/taskService";

function CreateTask() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "ads",
    rewardCoins: 5,
    targetCount: 1,
    status: "active",
    expiryDate: "",
    actionKey: "watch_ad",
    sortOrder: 0,
    isFeatured: false,
    autoClaim: false,
    requiresVerification: true,
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  function validateBeforeConfirm(e) {
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

  async function handleCreate() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      await createTask({
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        actionKey: formData.actionKey.trim(),
        rewardCoins: Number(formData.rewardCoins || 0),
        targetCount: Number(formData.targetCount || 1),
        sortOrder: Number(formData.sortOrder || 0),
        autoClaim: !!formData.autoClaim,
        requiresVerification: !!formData.requiresVerification,
      });

      setMessage("Task created successfully.");

      setTimeout(() => {
        navigate("/tasks");
      }, 700);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to create task.");
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  }

  const selectedType = TASK_TYPES.find((type) => type.value === formData.type);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Create Task</h2>
          <p>Add action-based tasks connected with app progress tracking.</p>
        </div>

        <Link to="/tasks" className="secondary-button">
          <ArrowLeft size={18} />
          Back
        </Link>
      </div>

      <div className="warning-box">
        <CheckSquare size={18} />
        Ads task should not reward directly. App should increase progress only
        after rewarded ad is actually watched, then user can claim reward.
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="card form-card">
        <form className="form-grid" onSubmit={validateBeforeConfirm}>
          <div className="settings-section">
            <div className="section-title">
              <CheckSquare size={18} />
              <h3>Task Content</h3>
            </div>

            <div className="form-row">
              <label>Task Title</label>
              <input
                name="title"
                placeholder="Watch 5 Ads"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Watch 5 rewarded ads and claim coins."
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
                <select name="type" value={formData.type} onChange={handleChange}>
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
                <small>
                  App uses this key for progress tracking. Example: watch_ad.
                </small>
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
                <small>
                  Example: Watch 5 ads → target count 5. Profile task should be 1.
                </small>
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
                  Keep ON for ads/scratch tasks so reward is not given without action.
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
                <small>
                  Recommended OFF. User should claim after progress completes.
                </small>
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
                <small>Optional. Leave empty for no expiry.</small>
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
            Create Task
          </Button>
        </form>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Create this task?"
        message={`This will create "${formData.title}" with ${formData.rewardCoins} reward coins and target ${formData.targetCount}.`}
        confirmText="Create Task"
        variant="success"
        loading={saving}
        onConfirm={handleCreate}
        onCancel={() => {
          if (!saving) setConfirmOpen(false);
        }}
      />
    </div>
  );
}

export default CreateTask;
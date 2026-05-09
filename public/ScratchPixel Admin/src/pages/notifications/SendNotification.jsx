import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Send } from "lucide-react";

import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { createNotification } from "../../services/notificationService";

function SendNotification() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetType: "all",
    targetUserId: "",
    type: "general",
    isActive: true,
    imageUrl: "",
    actionUrl: "",
    actionText: "",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const [messageText, setMessageText] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function isValidUrl(value) {
    if (!value) return true;

    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  function validateBeforeSend(e) {
    e.preventDefault();

    setMessageText("");
    setError("");

    if (!formData.title.trim()) {
      setError("Notification title is required.");
      return;
    }

    if (!formData.message.trim()) {
      setError("Notification message is required.");
      return;
    }

    if (formData.targetType === "user" && !formData.targetUserId.trim()) {
      setError("Target user ID is required for user-specific notification.");
      return;
    }

    if (formData.imageUrl.trim() && !isValidUrl(formData.imageUrl.trim())) {
      setError("Image URL must be a valid URL.");
      return;
    }

    if (formData.actionUrl.trim() && !isValidUrl(formData.actionUrl.trim())) {
      setError("Action URL must be a valid URL.");
      return;
    }

    if (formData.actionText.trim() && !formData.actionUrl.trim()) {
      setError("Action URL is required when action text is added.");
      return;
    }

    setConfirmOpen(true);
  }

  async function handleSend() {
    try {
      setSending(true);
      setError("");
      setMessageText("");

      await createNotification({
        ...formData,
        title: formData.title.trim(),
        message: formData.message.trim(),
        targetUserId: formData.targetUserId.trim(),
        imageUrl: formData.imageUrl.trim(),
        actionUrl: formData.actionUrl.trim(),
        actionText: formData.actionText.trim(),
      });

      setMessageText("Notification created successfully.");

      setTimeout(() => {
        navigate("/notifications");
      }, 700);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to create notification.");
    } finally {
      setSending(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Send Notification</h2>
          <p>Create app notifications for all users or a specific user.</p>
        </div>

        <Link to="/notifications" className="secondary-button">
          <ArrowLeft size={18} />
          Back
        </Link>
      </div>

      <div className="warning-box">
        <Bell size={18} />
        For all users, use target type <b>All Users</b>. For one user, paste
        the user UID.
      </div>

      {messageText && <div className="success-box">{messageText}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="card form-card">
        <form className="form-grid" onSubmit={validateBeforeSend}>
          <div className="settings-section">
            <div className="section-title">
              <Bell size={18} />
              <h3>Notification Content</h3>
            </div>

            <div className="form-row">
              <label>Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Withdrawal Update"
              />
            </div>

            <div className="form-row">
              <label>Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write the notification message..."
              />
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <Bell size={18} />
              <h3>Target & Type</h3>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>Target Type</label>
                <select
                  name="targetType"
                  value={formData.targetType}
                  onChange={handleChange}
                >
                  <option value="all">All Users</option>
                  <option value="user">Specific User</option>
                </select>
              </div>

              <div className="form-row">
                <label>Notification Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option value="general">General</option>
                  <option value="reward">Reward</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="kyc">KYC</option>
                  <option value="support">Support</option>
                  <option value="security">Security</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {formData.targetType === "user" && (
              <div className="form-row">
                <label>Target User ID</label>
                <input
                  name="targetUserId"
                  value={formData.targetUserId}
                  onChange={handleChange}
                  placeholder="Paste user UID"
                />
              </div>
            )}

            <div className="form-row checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={!!formData.isActive}
                  onChange={handleChange}
                />
                Active immediately
              </label>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <Bell size={18} />
              <h3>Optional Action</h3>
            </div>

            <div className="form-row">
              <label>Image URL</label>
              <input
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.png"
              />
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label>Action Text</label>
                <input
                  name="actionText"
                  value={formData.actionText}
                  onChange={handleChange}
                  placeholder="Open"
                />
              </div>

              <div className="form-row">
                <label>Action URL</label>
                <input
                  name="actionUrl"
                  value={formData.actionUrl}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={sending} loading={sending}>
            <Send size={18} />
            Create Notification
          </Button>
        </form>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Create notification?"
        message={
          formData.targetType === "all"
            ? "This notification will be visible to all app users."
            : `This notification will be visible only to user ID: ${formData.targetUserId}`
        }
        confirmText="Create"
        variant="success"
        loading={sending}
        onConfirm={handleSend}
        onCancel={() => {
          if (!sending) setConfirmOpen(false);
        }}
      />
    </div>
  );
}

export default SendNotification;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, ArrowLeft } from "lucide-react";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { ADMIN_ROLES } from "../../utils/constants";
import { createAdminProfile } from "../../services/adminService";

function CreateAdmin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    uid: "",
    name: "",
    email: "",
    role: ADMIN_ROLES.SUPPORT,
    status: "active",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function validateForm() {
    if (!formData.uid.trim()) return "Firebase Auth UID is required.";
    if (!formData.name.trim()) return "Admin name is required.";
    if (!formData.email.trim()) return "Admin email is required.";

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      formData.email.trim()
    );

    if (!emailValid) return "Please enter a valid email address.";

    if (!["owner", "manager", "finance", "support"].includes(formData.role)) {
      return "Invalid admin role.";
    }

    if (!["active", "inactive"].includes(formData.status)) {
      return "Invalid admin status.";
    }

    return "";
  }

  function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setConfirmOpen(true);
  }

  async function handleCreateAdmin() {
    setError("");
    setMessage("");

    try {
      setLoading(true);

      await createAdminProfile(formData);

      setMessage("Admin profile created successfully.");

      setTimeout(() => {
        navigate("/admins");
      }, 700);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to create admin profile.");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Create Admin</h2>
          <p>Add an admin profile using Firebase Authentication UID.</p>
        </div>

        <Link to="/admins" className="secondary-button">
          <ArrowLeft size={18} />
          Back
        </Link>
      </div>

      <div className="warning-box">
        First create this admin user in Firebase Console → Authentication. Then
        copy that user UID and paste it here.
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="card form-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <Input
            label="Firebase Auth UID"
            name="uid"
            placeholder="Paste admin UID here"
            value={formData.uid}
            onChange={handleChange}
            helperText="This UID must exist in Firebase Authentication."
            required
          />

          <Input
            label="Admin Name"
            name="name"
            placeholder="Example: Gaurav Admin"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Admin Email"
            name="email"
            type="email"
            placeholder="admin@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="grid grid-2">
            <div className="form-row">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="owner">Owner</option>
                <option value="manager">Manager</option>
                <option value="finance">Finance</option>
                <option value="support">Support</option>
              </select>
              <small>
                Permissions are assigned automatically based on selected role.
              </small>
            </div>

            <div className="form-row">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="actions">
            <Button type="submit" disabled={loading} loading={loading}>
              <UserPlus size={18} />
              Create Admin
            </Button>

            <Link to="/admins" className="secondary-button">
              Cancel
            </Link>
          </div>
        </form>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Create admin profile?"
        message={`This will create an admin profile for ${formData.email
          .trim()
          .toLowerCase()} with ${formData.role} access.`}
        confirmText="Create Admin"
        variant="success"
        loading={loading}
        onConfirm={handleCreateAdmin}
        onCancel={() => {
          if (!loading) setConfirmOpen(false);
        }}
      />
    </div>
  );
}

export default CreateAdmin;
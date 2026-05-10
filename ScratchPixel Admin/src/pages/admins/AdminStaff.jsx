import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserCog, Plus, RefreshCcw, ShieldCheck } from "lucide-react";

import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import StatCard from "../../components/cards/StatCard";

import { formatDateTime } from "../../utils/formatDate";
import { getAdmins, updateAdminStatus } from "../../services/adminService";
import { useAuth } from "../../context/AuthContext";

function AdminStaff() {
  const { currentAdmin } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadAdmins() {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const data = await getAdmins();
      setAdmins(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load admin staff.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  function openConfirm(admin, action) {
    setMessage("");
    setError("");

    if (admin.id === currentAdmin?.uid && action === "deactivate") {
      setError("You cannot deactivate your own admin account while logged in.");
      return;
    }

    setSelectedAdmin(admin);
    setConfirmAction(action);
  }

  function closeConfirm() {
    if (processing) return;

    setSelectedAdmin(null);
    setConfirmAction(null);
  }

  async function handleStatusUpdate() {
    if (!selectedAdmin || !confirmAction) return;

    const nextStatus = confirmAction === "activate" ? "active" : "inactive";

    try {
      setProcessing(true);
      setMessage("");
      setError("");

      await updateAdminStatus(selectedAdmin.id, nextStatus);

      setMessage(
        `Admin ${
          nextStatus === "active" ? "activated" : "deactivated"
        } successfully.`
      );

      closeConfirm();
      await loadAdmins();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update admin status.");
    } finally {
      setProcessing(false);
    }
  }

  function getStatusType(status) {
    return status === "active" ? "success" : "danger";
  }

  const columns = [
    {
      key: "name",
      label: "Admin",
      render: (row) => (
        <div>
          <strong>{row.name || "Unnamed Admin"}</strong>
          <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
            {row.email || "No email"}
          </p>
          <small style={{ color: "var(--muted)" }}>UID: {row.id}</small>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (row) => <Badge type="primary">{row.role || "support"}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge type={getStatusType(row.status)} dot>
          {row.status || "inactive"}
        </Badge>
      ),
    },
    {
      key: "permissions",
      label: "Permissions",
      render: (row) => row.permissions?.length || 0,
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  const activeAdmins = admins.filter((admin) => admin.status === "active").length;
  const ownerAdmins = admins.filter((admin) => admin.role === "owner").length;
  const inactiveAdmins = admins.filter((admin) => admin.status !== "active").length;

  if (loading) return <Loader text="Loading admin staff..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Admin Staff</h2>
          <p>Manage owner, manager, finance and support access.</p>
        </div>

        <div className="actions" style={{ marginTop: 0 }}>
          <Button variant="secondary" onClick={loadAdmins}>
            <RefreshCcw size={18} />
            Reload
          </Button>

          <Link to="/admins/create" className="primary-button">
            <Plus size={18} />
            Create Admin
          </Link>
        </div>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard title="Total Admins" value={admins.length} icon={UserCog} />

        <StatCard
          title="Active Admins"
          value={activeAdmins}
          icon={ShieldCheck}
          variant="success"
        />

        <StatCard
          title="Inactive"
          value={inactiveAdmins}
          icon={UserCog}
          variant="danger"
        />

        <StatCard
          title="Owners"
          value={ownerAdmins}
          icon={ShieldCheck}
          variant="primary"
        />
      </div>

      <div className="card table-card">
        <div className="table-header">
          <h3>Admin List</h3>

          <Link to="/admins/roles" className="secondary-button">
            Roles & Permissions
          </Link>
        </div>

        <Table
          columns={columns}
          data={admins}
          emptyText="No admin profiles found."
          showIndex
          renderActions={(row) => {
            const isSelf = row.id === currentAdmin?.uid;

            return (
              <div className="actions" style={{ marginTop: 0 }}>
                {row.status === "active" ? (
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={isSelf}
                    title={isSelf ? "You cannot deactivate yourself" : ""}
                    onClick={() => openConfirm(row, "deactivate")}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => openConfirm(row, "activate")}
                  >
                    Activate
                  </Button>
                )}
              </div>
            );
          }}
        />
      </div>

      <ConfirmDialog
        isOpen={!!confirmAction}
        title={
          confirmAction === "activate"
            ? "Activate admin?"
            : "Deactivate admin?"
        }
        message={
          confirmAction === "activate"
            ? `This will allow ${
                selectedAdmin?.name || "this admin"
              } to access the admin panel again.`
            : `This will block ${
                selectedAdmin?.name || "this admin"
              } from admin panel access.`
        }
        confirmText={confirmAction === "activate" ? "Activate" : "Deactivate"}
        variant={confirmAction === "activate" ? "success" : "danger"}
        loading={processing}
        onConfirm={handleStatusUpdate}
        onCancel={closeConfirm}
      />
    </div>
  );
}

export default AdminStaff;
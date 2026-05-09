import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";

import Badge from "../../components/common/Badge";
import { ROLE_PERMISSIONS } from "../../utils/permissions";

function RolesPermissions() {
  const roleLabels = {
    owner: "Owner",
    manager: "Manager",
    finance: "Finance",
    support: "Support",
  };

  const roleDescriptions = {
    owner: "Full access to all pages, settings and admin staff.",
    manager: "Can manage users, KYC, withdrawals, referrals, fraud and settings.",
    finance: "Can manage withdrawals, payment status and reports.",
    support: "Can view users, KYC, withdrawal details and support tickets.",
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Roles & Permissions</h2>
          <p>Understand what each admin role can access.</p>
        </div>

        <Link to="/admins" className="secondary-button">
          <ArrowLeft size={18} />
          Back to Admin Staff
        </Link>
      </div>

      <div className="grid grid-2">
        {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => (
          <div className="card role-card" key={role}>
            <div className="role-card-header">
              <div className="stat-icon">
                <ShieldCheck size={22} />
              </div>

              <div>
                <h3>{roleLabels[role] || role}</h3>
                <p>{roleDescriptions[role] || "Custom admin access."}</p>
              </div>
            </div>

            <div className="permission-list">
              {permissions.length === 0 ? (
                <Badge type="muted">No permissions assigned</Badge>
              ) : (
                permissions.map((permission) => (
                  <Badge key={permission} type="primary">
                    {permission.replaceAll("_", " ")}
                  </Badge>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RolesPermissions;
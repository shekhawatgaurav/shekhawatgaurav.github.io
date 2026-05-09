import { useAuth } from "../context/AuthContext";

const ROLE_LEVELS = {
  owner: 4,
  manager: 3,
  finance: 2,
  support: 1,
};

const DEFAULT_ROLE = "support";

export default function useAdminRole() {
  const { adminData } = useAuth();

  const role = adminData?.role || DEFAULT_ROLE;
  const status = adminData?.status || "active";
  const permissions = Array.isArray(adminData?.permissions)
    ? adminData.permissions
    : [];

  const roleLevel = ROLE_LEVELS[role] || 0;
  const isActiveAdmin = status === "active";

  function hasRole(requiredRole) {
    const requiredLevel = ROLE_LEVELS[requiredRole] || 0;
    return isActiveAdmin && roleLevel >= requiredLevel;
  }

  function canAccess(permission) {
    if (!isActiveAdmin) return false;
    if (role === "owner") return true;

    if (Array.isArray(permission)) {
      return permission.some((item) => permissions.includes(item));
    }

    return permissions.includes(permission);
  }

  function canAccessAll(requiredPermissions = []) {
    if (!isActiveAdmin) return false;
    if (role === "owner") return true;

    return requiredPermissions.every((permission) =>
      permissions.includes(permission)
    );
  }

  function canAccessAny(requiredPermissions = []) {
    if (!isActiveAdmin) return false;
    if (role === "owner") return true;

    return requiredPermissions.some((permission) =>
      permissions.includes(permission)
    );
  }

  return {
    role,
    status,
    permissions,
    roleLevel,

    isActiveAdmin,
    isOwner: role === "owner",
    isManager: role === "manager",
    isFinance: role === "finance",
    isSupport: role === "support",

    hasRole,
    canAccess,
    canAccessAll,
    canAccessAny,
  };
}
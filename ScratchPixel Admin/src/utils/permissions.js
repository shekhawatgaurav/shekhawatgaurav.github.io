export const PERMISSIONS = {
  VIEW_DASHBOARD: "view_dashboard",

  VIEW_USERS: "view_users",
  EDIT_USERS: "edit_users",
  BLOCK_USERS: "block_users",
  ADJUST_COINS: "adjust_coins",

  VIEW_WALLET: "view_wallet",
  MANAGE_WALLET: "manage_wallet",

  VIEW_WITHDRAWALS: "view_withdrawals",
  APPROVE_WITHDRAWALS: "approve_withdrawals",
  REJECT_WITHDRAWALS: "reject_withdrawals",
  MARK_WITHDRAWAL_PAID: "mark_withdrawal_paid",

  VIEW_KYC: "view_kyc",
  APPROVE_KYC: "approve_kyc",
  REJECT_KYC: "reject_kyc",
  MANAGE_KYC_SETTINGS: "manage_kyc_settings",

  VIEW_FRAUD: "view_fraud",
  MANAGE_FRAUD: "manage_fraud",

  MANAGE_SCRATCH: "manage_scratch",
  MANAGE_ADS: "manage_ads",
  MANAGE_TASKS: "manage_tasks",

  VIEW_REFERRALS: "view_referrals",
  MANAGE_REFERRALS: "manage_referrals",

  VIEW_SUPPORT: "view_support",
  MANAGE_SUPPORT: "manage_support",

  SEND_NOTIFICATIONS: "send_notifications",
  MANAGE_NOTIFICATIONS: "manage_notifications",

  VIEW_REPORTS: "view_reports",
  VIEW_AUDIT_LOGS: "view_audit_logs",

  MANAGE_CONTENT: "manage_content",
  MANAGE_SETTINGS: "manage_settings",
  MANAGE_VERSION_CONTROL: "manage_version_control",

  VIEW_ADMINS: "view_admins",
  CREATE_ADMINS: "create_admins",
  MANAGE_ADMINS: "manage_admins",
};

export const ROLE_PERMISSIONS = {
  owner: Object.values(PERMISSIONS),

  manager: [
    PERMISSIONS.VIEW_DASHBOARD,

    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.BLOCK_USERS,
    PERMISSIONS.ADJUST_COINS,

    PERMISSIONS.VIEW_WALLET,
    PERMISSIONS.MANAGE_WALLET,

    PERMISSIONS.VIEW_WITHDRAWALS,
    PERMISSIONS.APPROVE_WITHDRAWALS,
    PERMISSIONS.REJECT_WITHDRAWALS,

    PERMISSIONS.VIEW_KYC,
    PERMISSIONS.APPROVE_KYC,
    PERMISSIONS.REJECT_KYC,
    PERMISSIONS.MANAGE_KYC_SETTINGS,

    PERMISSIONS.VIEW_FRAUD,
    PERMISSIONS.MANAGE_FRAUD,

    PERMISSIONS.MANAGE_SCRATCH,
    PERMISSIONS.MANAGE_ADS,
    PERMISSIONS.MANAGE_TASKS,

    PERMISSIONS.VIEW_REFERRALS,
    PERMISSIONS.MANAGE_REFERRALS,

    PERMISSIONS.VIEW_SUPPORT,
    PERMISSIONS.MANAGE_SUPPORT,

    PERMISSIONS.SEND_NOTIFICATIONS,
    PERMISSIONS.MANAGE_NOTIFICATIONS,

    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_CONTENT,
  ],

  finance: [
    PERMISSIONS.VIEW_DASHBOARD,

    PERMISSIONS.VIEW_USERS,

    PERMISSIONS.VIEW_WALLET,
    PERMISSIONS.ADJUST_COINS,

    PERMISSIONS.VIEW_WITHDRAWALS,
    PERMISSIONS.APPROVE_WITHDRAWALS,
    PERMISSIONS.REJECT_WITHDRAWALS,
    PERMISSIONS.MARK_WITHDRAWAL_PAID,

    PERMISSIONS.VIEW_KYC,

    PERMISSIONS.VIEW_REPORTS,
  ],

  support: [
    PERMISSIONS.VIEW_DASHBOARD,

    PERMISSIONS.VIEW_USERS,

    PERMISSIONS.VIEW_WITHDRAWALS,
    PERMISSIONS.VIEW_KYC,

    PERMISSIONS.VIEW_SUPPORT,
    PERMISSIONS.MANAGE_SUPPORT,

    PERMISSIONS.SEND_NOTIFICATIONS,
  ],
};

export const ROLE_LEVELS = {
  owner: 4,
  manager: 3,
  finance: 2,
  support: 1,
};

export function getRolePermissions(role = "support") {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.support;
}

export function hasPermission(role = "support", permission) {
  if (role === "owner") return true;

  const permissions = getRolePermissions(role);
  return permissions.includes(permission);
}

export function hasAnyPermission(role = "support", permissions = []) {
  if (role === "owner") return true;

  const rolePermissions = getRolePermissions(role);
  return permissions.some((permission) => rolePermissions.includes(permission));
}

export function hasAllPermissions(role = "support", permissions = []) {
  if (role === "owner") return true;

  const rolePermissions = getRolePermissions(role);
  return permissions.every((permission) => rolePermissions.includes(permission));
}

export function canManageRole(currentRole = "support", targetRole = "support") {
  return (ROLE_LEVELS[currentRole] || 0) > (ROLE_LEVELS[targetRole] || 0);
}

export function getRoleLevel(role = "support") {
  return ROLE_LEVELS[role] || 0;
}
function Badge({
  children,
  type = "muted",
  dot = false,
  className = "",
  title = "",
}) {
  const normalized = String(type || "muted").toLowerCase();

  const successTypes = [
    "success",
    "active",
    "approved",
    "paid",
    "completed",
    "sent",
    "verified",
    "resolved",
    "open",
  ];

  const warningTypes = [
    "warning",
    "pending",
    "in_review",
    "approved_waiting",
    "replied",
    "suspicious",
    "review",
  ];

  const dangerTypes = [
    "danger",
    "blocked",
    "rejected",
    "failed",
    "high-risk",
    "high_risk",
    "closed",
    "suspended",
    "deleted",
  ];

  const primaryTypes = [
    "primary",
    "info",
    "general",
    "reward",
    "withdrawal",
    "kyc",
    "support",
    "security",
    "admin",
  ];

  const badgeClass = successTypes.includes(normalized)
    ? "badge-success"
    : warningTypes.includes(normalized)
    ? "badge-warning"
    : dangerTypes.includes(normalized)
    ? "badge-danger"
    : primaryTypes.includes(normalized)
    ? "badge-primary"
    : "badge-muted";

  return (
    <span className={`badge ${badgeClass} ${className}`} title={title}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}

export default Badge;
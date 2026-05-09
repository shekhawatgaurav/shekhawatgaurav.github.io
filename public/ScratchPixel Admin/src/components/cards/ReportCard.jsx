function ReportCard({
  title,
  value,
  subtitle = "",
  trend = "",
  icon: Icon,
  variant = "primary",
  onClick,
  className = "",
}) {
  const clickableClass = onClick ? "clickable-card" : "";

  return (
    <div
      className={`card report-card report-card-${variant} ${clickableClass} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (!onClick) return;

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="report-card-top">
        <div>
          <h3>{title}</h3>
          <strong>{value ?? 0}</strong>
        </div>

        {Icon && (
          <div className="stat-icon">
            <Icon size={22} />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="report-card-bottom">
          {subtitle && <span>{subtitle}</span>}
          {trend && <b>{trend}</b>}
        </div>
      )}
    </div>
  );
}

export default ReportCard;
function StatCard({
  title,
  value,
  icon: Icon,
  subtitle = "",
  trend = "",
  variant = "primary",
  className = "",
  onClick,
}) {
  const clickableClass = onClick ? "clickable-card" : "";

  return (
    <div
      className={`card stat-card stat-card-${variant} ${clickableClass} ${className}`}
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
      <div>
        <h3>{title}</h3>
        <strong>{value ?? 0}</strong>

        {subtitle && <p className="stat-subtitle">{subtitle}</p>}

        {trend && <span className="stat-trend">{trend}</span>}
      </div>

      {Icon && (
        <div className="stat-icon">
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}

export default StatCard;
function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  loadingText = "Please wait...",
  onClick,
  className = "",
  fullWidth = false,
  title = "",
}) {
  const variantClass =
    variant === "secondary"
      ? "secondary-button"
      : variant === "danger"
      ? "danger-button"
      : variant === "success"
      ? "success-button"
      : variant === "warning"
      ? "warning-button"
      : "primary-button";

  const sizeClass =
    size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "btn-md";

  const classes = [
    variantClass,
    sizeClass,
    fullWidth ? "btn-full" : "",
    loading ? "btn-loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      title={title}
      className={classes}
    >
      {loading ? loadingText : children}
    </button>
  );
}

export default Button;
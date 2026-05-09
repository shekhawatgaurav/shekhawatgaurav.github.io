import { useEffect } from "react";

function ConfirmDialog({
  isOpen,
  title = "Are you sure?",
  message = "Please confirm this action.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape" && onCancel && !loading) {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onCancel, loading]);

  if (!isOpen) return null;

  const isSuccess = variant === "success";
  const isWarning = variant === "warning";

  const buttonClass = isSuccess
    ? "success-button"
    : isWarning
    ? "warning-button"
    : variant === "secondary"
    ? "secondary-button"
    : "danger-button";

  const icon = isSuccess ? "✓" : "!";

  function handleCancel() {
    if (!loading && onCancel) {
      onCancel();
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className={`confirm-dialog confirm-${variant}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirm-icon">{icon}</div>

        <h3>{title}</h3>

        {message && <p>{message}</p>}

        <div className="confirm-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={buttonClass}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
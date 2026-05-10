import { useEffect } from "react";

function Modal({
  title,
  children,
  isOpen,
  onClose,
  size = "md",
  footer = null,
  closeOnBackdrop = true,
  showCloseButton = true,
}) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape" && onClose) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass =
    size === "sm" ? "modal-sm" : size === "lg" ? "modal-lg" : "modal-md";

  function handleBackdropClick() {
    if (closeOnBackdrop && onClose) {
      onClose();
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        className={`modal-card ${sizeClass}`}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Modal"}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            {title && <h3>{title}</h3>}
          </div>

          {showCloseButton && (
            <button type="button" className="icon-button" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
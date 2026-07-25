import { useEffect } from "react";
import { FaExclamationTriangle, FaInbox, FaTimes } from "react-icons/fa";

import { titleCase } from "../../utils/format";
import "./ui.css";

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="page-subtitle">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="page-heading-action">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading data..." }) {
  return (
    <div className="content-state">
      <div className="loader-spinner" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="content-state error-state">
      <FaExclamationTriangle />
      <strong>We could not load this page</strong>
      <p>{message}</p>
      {onRetry && (
        <button className="secondary-button" onClick={onRetry} type="button">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", message, action }) {
  return (
    <div className="content-state empty-state">
      <FaInbox />
      <strong>{title}</strong>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function StatusBadge({ value }) {
  const normalized = (value || "UNKNOWN").toString().toUpperCase();
  const success = ["OPEN", "AVAILABLE", "ACTIVE", "SUCCESS", "COMPLETED", "VERIFIED"];
  const warning = ["PENDING", "CONFIRMED", "RESERVED", "OCCUPIED", "PLANNED"];
  const danger = ["FAILED", "CANCELLED", "CLOSED", "INTERRUPTED", "OUT_OF_SERVICE"];
  const className = success.includes(normalized)
    ? "success"
    : warning.includes(normalized)
      ? "warning"
      : danger.includes(normalized)
        ? "danger"
        : "neutral";

  return <span className={`status-badge ${className}`}>{titleCase(normalized)}</span>;
}

export function MetricCard({ icon, label, value, hint, accent = "orange" }) {
  return (
    <article className={`dashboard-stat-card metric-${accent}`}>
      <div className="dashboard-card-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <h2>{value}</h2>
        {hint && <span>{hint}</span>}
      </div>
    </article>
  );
}

export function Modal({ title, description, onClose, children, wide = false }) {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKey);
    document.body.classList.add("modal-open");

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.classList.remove("modal-open");
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-modal="true"
        className={`modal-card ${wide ? "modal-wide" : ""}`}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button className="icon-button" onClick={onClose} type="button" aria-label="Close">
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}

export function Field({ label, children, hint, full = false }) {
  return (
    <label className={`form-field ${full ? "field-full" : ""}`}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function FormActions({ onCancel, loading, submitLabel = "Save" }) {
  return (
    <div className="form-actions field-full">
      <button className="secondary-button" onClick={onCancel} type="button">
        Cancel
      </button>
      <button className="primary-button" disabled={loading} type="submit">
        {loading ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}

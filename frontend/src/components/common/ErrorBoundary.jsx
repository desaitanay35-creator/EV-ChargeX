import React from "react";
import { FaExclamationTriangle, FaRedo } from "react-icons/fa";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught a component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "3rem", textAlign: "center", maxWidth: "600px", margin: "2rem auto" }}>
          <FaExclamationTriangle style={{ fontSize: "2.5rem", color: "var(--danger, #ef4444)", marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "1.3rem", color: "var(--text-primary)" }}>Unable to display this view.</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "0.95rem" }}>
            A unexpected rendering error occurred. The application state remains protected.
          </p>
          <button
            className="secondary-button"
            style={{ marginTop: "1.5rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
            onClick={() => this.setState({ hasError: false, error: null })}
            type="button"
          >
            <FaRedo /> Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

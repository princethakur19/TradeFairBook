import React from "react";

const LoadingSpinner = ({ label = "Loading", className = "" }) => (
  <div className={`loading-spinner-wrap ${className}`.trim()} role="status" aria-live="polite">
    <div className="spinner" aria-hidden="true"></div>
    {label ? <span className="loading-spinner-label">{label}</span> : null}
  </div>
);

export default LoadingSpinner;

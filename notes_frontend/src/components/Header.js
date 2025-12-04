import React from "react";

/**
 * PUBLIC_INTERFACE
 * Header component for the Notes app.
 * Props:
 * - onNew: () => void
 * - onDelete: () => void
 * - canDelete: boolean
 * - saving: boolean
 * - status: string | null
 */
export function Header({ onNew, onDelete, canDelete, saving, status }) {
  return (
    <div className="header" role="banner">
      <div className="brand" aria-label="Ocean Notes">
        <span style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: "linear-gradient(135deg, #2563EB, #F59E0B)"
        }} />
        <span>Ocean Notes</span>
      </div>
      <div className="header-actions">
        <button className="btn primary" onClick={onNew} aria-label="Create new note">
          + New
        </button>
        <button
          className="btn danger"
          onClick={onDelete}
          disabled={!canDelete}
          aria-disabled={!canDelete}
          aria-label="Delete selected note"
          style={{ opacity: canDelete ? 1 : 0.5 }}
        >
          Delete
        </button>
        <span aria-live="polite" style={{ color: "#6B7280", fontSize: 12 }}>
          {saving ? "Saving..." : status || ""}
        </span>
      </div>
    </div>
  );
}

import React from "react";

/**
 * PUBLIC_INTERFACE
 * Sidebar component for listing and filtering notes.
 * Props:
 * - notes: Note[]
 * - activeId: string | null
 * - onSelect: (id: string) => void
 * - query: string
 * - onQueryChange: (s: string) => void
 */
export function Sidebar({ notes, activeId, onSelect, query, onQueryChange }) {
  return (
    <aside className="sidebar" aria-label="Notes list">
      <div className="search">
        <input
          className="input"
          placeholder="Search notes..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search notes"
        />
      </div>
      <div className="notes-list" role="list">
        {notes.map((n) => (
          <button
            key={n.id}
            className={`note-list-item ${n.id === activeId ? "active" : ""}`}
            onClick={() => onSelect(n.id)}
            role="listitem"
            aria-pressed={n.id === activeId}
            title={n.title}
          >
            <div className="note-title">{n.title || "Untitled"}</div>
            <div className="note-updated">
              {new Date(n.updatedAt).toLocaleString()}
            </div>
          </button>
        ))}
        {notes.length === 0 && (
          <div className="note-updated" style={{ textAlign: "center", padding: 12 }}>
            No notes found
          </div>
        )}
      </div>
    </aside>
  );
}

import React from "react";

/**
 * PUBLIC_INTERFACE
 * NoteEditor component.
 * Props:
 * - note: { id, title, body, createdAt, updatedAt } | null
 * - onChange: (patch: {title?: string, body?: string}) => void
 * - onSave: () => void
 * - onDelete: () => void
 * - disabled: boolean
 */
export function NoteEditor({ note, onChange, onSave, onDelete, disabled }) {
  if (!note) {
    return (
      <section className="editor" aria-label="Note editor">
        <div style={{ color: "#6B7280" }}>Select or create a note to get started.</div>
      </section>
    );
  }

  return (
    <section className="editor" aria-label="Note editor">
      <input
        className="editor-title"
        value={note.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Title"
        disabled={disabled}
        aria-label="Note title"
      />
      <textarea
        className="editor-body"
        value={note.body}
        onChange={(e) => onChange({ body: e.target.value })}
        placeholder="Write your note..."
        disabled={disabled}
        aria-label="Note body"
      />
      <div className="editor-footer">
        <div style={{ color: "#6B7280", fontSize: 12 }}>
          Last updated: {new Date(note.updatedAt).toLocaleString()}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn secondary" onClick={onSave} disabled={disabled} aria-label="Save note">
            Save (Ctrl/Cmd+S)
          </button>
          <button className="btn danger" onClick={onDelete} disabled={disabled} aria-label="Delete note">
            Delete
          </button>
        </div>
      </div>
    </section>
  );
}

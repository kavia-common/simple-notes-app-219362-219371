import React, { useEffect, useMemo, useState } from "react";
import "./theme.css";
import "./App.css";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { NoteEditor } from "./components/NoteEditor";
import { createNotesService } from "./services/NotesService";
import { useHotkeys } from "./hooks/useHotkeys";

/**
 * PUBLIC_INTERFACE
 * App
 * Notes single-page application entry point.
 * - Detects backend base URL from env (REACT_APP_API_BASE || REACT_APP_BACKEND_URL) else falls back to localStorage.
 * - Provides keyboard shortcut Ctrl/Cmd+S to save current note.
 * - Optimistic UI updates with minimal error handling.
 */
function App() {
  const service = useMemo(() => createNotesService(), []);
  const [notes, setNotes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [activeDraft, setActiveDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  // Load initial notes
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    service
      .list()
      .then((items) => {
        if (!mounted) return;
        setNotes(items);
        setFiltered(items);
        if (items.length > 0) {
          setActiveId(items[0].id);
          setActiveDraft(items[0]);
        }
      })
      .catch((e) => {
        console.error(e);
        setStatus("Failed to load notes");
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [service]);

  // Filter notes
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setFiltered(notes);
    } else {
      setFiltered(
        notes.filter(
          (n) =>
            (n.title || "").toLowerCase().includes(q) ||
            (n.body || "").toLowerCase().includes(q)
        )
      );
    }
  }, [notes, query]);

  // Keep draft in sync with active note updates
  useEffect(() => {
    if (!activeId) {
      setActiveDraft(null);
      return;
    }
    const current = notes.find((n) => n.id === activeId) || null;
    setActiveDraft(current);
  }, [activeId, notes]);

  function setStatusTemp(text) {
    setStatus(text);
    if (text) {
      setTimeout(() => setStatus(""), 1500);
    }
  }

  // Create new note
  async function handleNew() {
    const optimistic = {
      id: `tmp-${Date.now()}`,
      title: "Untitled",
      body: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [optimistic, ...prev]);
    setActiveId(optimistic.id);
    setActiveDraft(optimistic);
    try {
      const created = await service.create({ title: "Untitled", body: "" });
      setNotes((prev) => {
        const copy = prev.slice();
        const idx = copy.findIndex((n) => n.id === optimistic.id);
        if (idx !== -1) {
          copy[idx] = created;
        } else {
          copy.unshift(created);
        }
        return copy;
      });
      setActiveId(created.id);
      setActiveDraft(created);
      setStatusTemp("Created");
    } catch (e) {
      console.error(e);
      setStatus("Create failed");
      // rollback
      setNotes((prev) => prev.filter((n) => n.id !== optimistic.id));
      setActiveId(null);
      setActiveDraft(null);
    }
  }

  // Delete note
  async function handleDelete() {
    const id = activeId;
    if (!id) return;
    const confirmDelete = window.confirm("Delete this note?");
    if (!confirmDelete) return;
    const prev = notes;
    setNotes(prev.filter((n) => n.id !== id));
    setActiveId(null);
    setActiveDraft(null);
    try {
      await service.remove(id);
      setStatusTemp("Deleted");
    } catch (e) {
      console.error(e);
      setStatus("Delete failed");
      // rollback
      setNotes(prev);
    }
  }

  // Update draft
  function handleDraftChange(patch) {
    if (!activeDraft) return;
    const updated = { ...activeDraft, ...patch, updatedAt: new Date().toISOString() };
    setActiveDraft(updated);
    // Optimistically reflect in list for better feedback
    setNotes((prev) =>
      prev.map((n) => (n.id === updated.id ? { ...n, ...patch, updatedAt: updated.updatedAt } : n))
    );
  }

  // Save
  async function handleSave() {
    if (!activeDraft) return;
    setSaving(true);
    try {
      const saved = await service.update(activeDraft.id, {
        title: activeDraft.title,
        body: activeDraft.body,
      });
      setNotes((prev) => prev.map((n) => (n.id === saved.id ? saved : n)));
      setActiveDraft(saved);
      setStatusTemp("Saved");
    } catch (e) {
      console.error(e);
      setStatus("Save failed");
    } finally {
      setSaving(false);
    }
  }

  // Hotkey: Ctrl/Cmd+S
  useHotkeys({ combo: "Ctrl+S", handler: handleSave, deps: [activeDraft] });
  useHotkeys({ combo: "Cmd+S", handler: handleSave, deps: [activeDraft] });

  const canDelete = Boolean(activeId);
  const visibleNotes = filtered;

  return (
    <div className="app-shell">
      <Header
        onNew={handleNew}
        onDelete={handleDelete}
        canDelete={canDelete}
        saving={saving || loading}
        status={status}
      />
      <Sidebar
        notes={visibleNotes}
        activeId={activeId}
        onSelect={setActiveId}
        query={query}
        onQueryChange={setQuery}
      />
      <NoteEditor
        note={activeDraft}
        onChange={handleDraftChange}
        onSave={handleSave}
        onDelete={handleDelete}
        disabled={loading || saving}
      />
    </div>
  );
}

export default App;

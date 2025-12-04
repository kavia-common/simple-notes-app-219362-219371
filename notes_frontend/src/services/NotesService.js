//
// NotesService.js
// Provides a swappable notes service interface with LocalStorage and Remote implementations.
//

/**
 * PUBLIC_INTERFACE
 * NotesService interface definition (documented via comments)
 * Methods:
 *  - list(): Promise<Note[]>
 *  - get(id: string): Promise<Note|null>
 *  - create(note: Partial<Note>): Promise<Note>
 *  - update(id: string, patch: Partial<Note>): Promise<Note>
 *  - remove(id: string): Promise<void>
 *
 * Note type:
 * {
 *   id: string,
 *   title: string,
 *   body: string,
 *   createdAt: string,
 *   updatedAt: string
 * }
 */

const STORAGE_KEY = "ocean-notes-data-v1";
const STORAGE_SEEDED_KEY = "ocean-notes-seeded-v1";

function nowIso() {
  return new Date().toISOString();
}

function generateId() {
  // Simple unique id
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function seedIfNeeded() {
  if (localStorage.getItem(STORAGE_SEEDED_KEY)) return;
  const sample = [
    {
      id: generateId(),
      title: "Welcome to Ocean Notes",
      body:
        "This is a simple notes app.\n\n- Use the sidebar to browse notes\n- Click + New to create a note\n- Use Ctrl/Cmd+S to save quickly\n\nEnjoy!",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: generateId(),
      title: "Tips",
      body:
        "You can filter notes using the search box.\n\nStyling follows the Ocean Professional theme with blue and amber accents.",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
  localStorage.setItem(STORAGE_SEEDED_KEY, "true");
}

class LocalStorageNotesService {
  constructor() {
    seedIfNeeded();
  }

  _read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  _write(notes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  // PUBLIC_INTERFACE
  async list() {
    /** Return list of notes sorted by updatedAt desc. */
    const notes = this._read();
    return notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  // PUBLIC_INTERFACE
  async get(id) {
    /** Get a single note by id, or null. */
    const notes = this._read();
    return notes.find((n) => n.id === id) || null;
  }

  // PUBLIC_INTERFACE
  async create(note) {
    /** Create a new note. */
    const notes = this._read();
    const newNote = {
      id: generateId(),
      title: note.title || "Untitled",
      body: note.body || "",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    notes.push(newNote);
    this._write(notes);
    return newNote;
  }

  // PUBLIC_INTERFACE
  async update(id, patch) {
    /** Update a note by id and return updated note. */
    const notes = this._read();
    const idx = notes.findIndex((n) => n.id === id);
    if (idx === -1) throw new Error("Note not found");
    const updated = {
      ...notes[idx],
      ...patch,
      updatedAt: nowIso(),
    };
    notes[idx] = updated;
    this._write(notes);
    return updated;
  }

  // PUBLIC_INTERFACE
  async remove(id) {
    /** Delete a note by id. */
    const notes = this._read();
    const filtered = notes.filter((n) => n.id !== id);
    this._write(filtered);
  }
}

class RemoteNotesService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  async _fetch(path, opts = {}) {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...opts,
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(`Request failed: ${res.status} ${msg}`);
    }
    if (res.status === 204) return null;
    return res.json();
  }

  // PUBLIC_INTERFACE
  async list() {
    /** Return list of notes from remote API. */
    return this._fetch("/notes", { method: "GET" });
  }

  // PUBLIC_INTERFACE
  async get(id) {
    /** Get a single note by id from remote. */
    return this._fetch(`/notes/${id}`, { method: "GET" });
  }

  // PUBLIC_INTERFACE
  async create(note) {
    /** Create a note via remote API. */
    return this._fetch("/notes", {
      method: "POST",
      body: JSON.stringify(note),
    });
  }

  // PUBLIC_INTERFACE
  async update(id, patch) {
    /** Update a note via remote API. */
    return this._fetch(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
  }

  // PUBLIC_INTERFACE
  async remove(id) {
    /** Delete a note via remote API. */
    await this._fetch(`/notes/${id}`, { method: "DELETE" });
  }
}

// PUBLIC_INTERFACE
export function createNotesService() {
  /**
   * Create the appropriate notes service based on environment variables.
   * Detect API base as:
   *   process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || ''
   * If empty, use LocalStorageNotesService.
   */
  const base =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    "";
  if (base) {
    return new RemoteNotesService(base);
    }
  return new LocalStorageNotesService();
}

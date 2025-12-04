# Notes Frontend (Ocean Professional)

A simple React single-page notes app with a sidebar list and main editor, styled with the Ocean Professional theme.

## Run locally

- npm install
- npm start
- App runs at http://localhost:3000

## Features

- Sidebar with search/filter, select to open in editor
- Create, edit, delete notes with confirmation
- Ctrl/Cmd+S to save
- Optimistic UI updates
- Minimal loading/error states
- Responsive layout (sidebar + editor stack on small screens)

## Data storage

The app selects a data provider at runtime:

- If REACT_APP_API_BASE or REACT_APP_BACKEND_URL is defined:
  - Uses it as the base URL for a remote API (expected endpoints):
    - GET    <base>/notes
    - POST   <base>/notes
    - GET    <base>/notes/:id
    - PUT    <base>/notes/:id
    - DELETE <base>/notes/:id
- Otherwise:
  - Falls back to LocalStorage with an initial sample seed on first load.

Environment detection logic:
- process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || ''

## Environment variables

Configure these in .env if needed (do not commit secrets):

- REACT_APP_API_BASE
- REACT_APP_BACKEND_URL
- (others defined for the container can be set but are not used here)

Example .env.example:
```
REACT_APP_API_BASE=http://localhost:4000
# or
# REACT_APP_BACKEND_URL=http://localhost:4000
```

## Theme

Ocean Professional color system is defined in src/theme.css with CSS variables:

- Primary: #2563EB
- Secondary: #F59E0B
- Error: #EF4444
- Background: #f9fafb
- Surface: #ffffff
- Text: #111827

The layout includes subtle gradients, rounded corners, and soft shadows.

## Project structure

- src/services/NotesService.js - LocalStorage and Remote services with a simple factory
- src/components/Header.js - Top bar with actions and status
- src/components/Sidebar.js - Search + notes list
- src/components/NoteEditor.js - Title/body editor, save/delete
- src/hooks/useHotkeys.js - Ctrl/Cmd+S shortcut
- src/theme.css - Theme and layout styles
- src/App.js - Main application wiring

## Notes

- This app does not require a backend to run; it will use LocalStorage by default and seed some sample notes.
- For a backend, ensure the endpoints above exist and set the env var accordingly.


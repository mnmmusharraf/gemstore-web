# GemStore Frontend

React + Vite frontend for the GemStore marketplace.  
It includes authentication, listing feed/search, profile & follow system, favorites/likes, messaging, notifications, reporting, and an AI price estimator.

## Tech Stack

- React 19
- Vite 7
- React Router 7
- Bootstrap 5
- STOMP + SockJS (real-time chat and notifications)
- Sonner / React Toastify (toasts)

## Features

- Email/username login and registration
- Google OAuth redirect flow
- Gem listing feed with search and filters
- Create and edit listings with image upload
- User profiles (own + public) with follow/follower flows
- Real-time messages with typing and status updates
- Real-time notifications
- Report listing/user/message flow
- AI-powered gemstone price estimation
- Light/dark theme tokens via `src/styles/theme.css`

## Project Structure

```text
src/
  api/            # API clients and socket services
  components/     # UI components (auth, feed, listing, messages, etc.)
  context/        # Auth context/provider
  hooks/          # Feature hooks (auth, feed, profile, messages, estimator...)
  pages/          # Page-level containers
  styles/         # Global styles and theme tokens
```

## Prerequisites

- Node.js 20+ (recommended)
- npm 10+ (recommended)
- GemStore backend running locally (default: `http://localhost:8080`)

## Getting Started

```bash
cd gemstore-frontend
npm install
npm run dev
```

Open the app at the URL printed by Vite (usually `http://localhost:5173`).

## Available Scripts

- `npm run dev` - start local dev server
- `npm run build` - create production build
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint

## Backend Configuration

This project currently uses hardcoded backend URLs:

- API base: `src/api/config.js` -> `API_BASE_URL`
- Google OAuth redirect: `src/App.jsx` -> `handleGoogleSignIn()`
- WebSocket endpoint: `${API_BASE_URL}/ws` (used by message/notification sockets)

Default backend URL:

```js
http://localhost:8080
```

If your backend runs on a different host/port, update those locations.

## Theme Notes (`src/styles/theme.css`)

`theme.css` defines design tokens as CSS variables.

- `:root` = light theme defaults
- `@media (prefers-color-scheme: dark)` overrides for dark mode

Examples of tokens:

- Backgrounds: `--bg`, `--bg-elevated`
- Text: `--text-main`, `--text-muted`
- Primary actions: `--primary`, `--primary-hover`
- Borders/inputs: `--border-soft`, `--input-border`

Use these variables in component styles to keep visual consistency.

## Notes

- Auth token is stored in `localStorage` under key `authToken`.
- On `401` responses, the app clears token and redirects to login flow.
- Some API endpoint strings currently contain minor spacing inconsistencies; verify backend compatibility if a request fails.

<div align="center">

# 💎 GemStore Frontend

### AI-Powered Gemstone Marketplace — React Client

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=flat-square&logo=reactrouter)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?style=flat-square&logo=bootstrap)

The React + Vite frontend for **GemStore** — a marketplace for buying and selling gemstones with real-time messaging, notifications, and an AI-powered price estimator.

[Related Repos](#-related-repositories) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure) · [Configuration](#-configuration)

</div>

---

## 📦 Related Repositories

| Repository | Description |
|---|---|
| [gemstore-backend](https://github.com/mnmmusharraf/gemstore-backend) | Spring Boot backend API |
| [gemstore-admin](https://github.com/mnmmusharraf/gemstore-admin) | React admin dashboard |
| [gemstore-ml-service](https://github.com/mnmmusharraf/gemstore-ml-service) | FastAPI ML price prediction service |

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| Routing | React Router 7 |
| Styling | Bootstrap 5 + CSS variables (theme tokens) |
| Real-time | STOMP over SockJS |
| Notifications | Sonner / React Toastify |

---

## ✨ Features

### Auth
- Email / username login and registration
- Google OAuth redirect flow
- JWT token management with auto-logout on `401`

### Marketplace
- Gem listing feed with search and filters
- Create and edit listings with image upload
- Like and favorite listings

### Social
- Public and own user profiles
- Follow / follower system

### Messaging
- Real-time chat with typing indicators
- Message delivery status updates

### Notifications
- Real-time push notifications via WebSocket

### Other
- Report listings, users, and messages
- AI-powered gemstone price estimator
- Light / dark theme via CSS variable tokens

---

## 📁 Project Structure

```
src/
├── api/              # API clients and WebSocket/STOMP services
├── components/       # UI components
│   ├── auth/         # Login, register, OAuth redirect
│   ├── feed/         # Listing feed and search
│   ├── listing/      # Listing create, edit, detail
│   ├── messages/     # Chat UI and message threads
│   └── ...           # Profile, notifications, reports, estimator
├── context/          # Auth context and provider
├── hooks/            # Feature hooks (auth, feed, profile, messages, estimator, ...)
├── pages/            # Page-level route containers
└── styles/
    ├── theme.css     # Design tokens (CSS variables)
    └── ...           # Global and component styles
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- [GemStore Backend](https://github.com/mnmmusharraf/gemstore-backend) running on `http://localhost:8080`

---

### 1. Clone the repository

```bash
git clone https://github.com/mnmmusharraf/gemstore-web
cd gemstore-web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the dev server

```bash
npm run dev
```

Open the URL printed by Vite — usually `http://localhost:5173`.

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start local development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## ⚙️ Configuration

The app currently uses hardcoded backend URLs. Update these locations if your backend runs on a different host or port:

| Setting | File | Default |
|---|---|---|
| API base URL | `src/api/config.js` → `API_BASE_URL` | `http://localhost:8080` |
| Google OAuth redirect | `src/App.jsx` → `handleGoogleSignIn()` | `http://localhost:8080` |
| WebSocket endpoint | Derived as `${API_BASE_URL}/ws` | `ws://localhost:8080/ws` |

---

## 🎨 Theme System

`src/styles/theme.css` defines the visual design tokens as CSS custom properties.

| Token | Description |
|---|---|
| `--bg`, `--bg-elevated` | Page and card backgrounds |
| `--text-main`, `--text-muted` | Primary and secondary text |
| `--primary`, `--primary-hover` | Action colors |
| `--border-soft`, `--input-border` | Borders and inputs |

Light and dark modes are handled automatically:

```css
:root { /* light theme defaults */ }

@media (prefers-color-scheme: dark) { /* dark overrides */ }
```

Use these variables in all component styles to maintain visual consistency across themes.

---

## 🔒 Auth Notes

- JWT token is stored in `localStorage` under the key `authToken`
- On any `401` response, the app clears the token and redirects to the login flow
- Google OAuth uses a redirect-based flow handled in `src/App.jsx`

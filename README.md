# ELARA — Election Assistance & Resource Assistant

> AI-powered election education assistant. Democracy, decoded. 🗳️

## Project Overview

ELARA helps users understand the election process, timelines, and voting steps through an interactive, context-aware AI interface powered by **Google Gemini**.

## Features

- **Election Journey Selector** — Context engine with three stages: Not Registered / Registered / Ready to Vote
- **AI Chat Panel** — Gemini-powered Q&A with visible confidence scores
- **Election Timeline** — Four clickable steps that trigger AI explanations automatically
- **Jargon Buster** — Simplifies complex election terminology into plain language
- **Smart Guidance** — Context-aware auto-triggered to-do list for unregistered voters
- **Error Boundary** — Graceful error handling with recovery UI

## Tech Stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Frontend   | React 18 + Vite 6                           |
| Backend    | Node.js + Express                           |
| AI Engine  | Google Gemini API (`@google/generative-ai`)  |
| Testing    | Jest + Supertest (backend), Vitest + React Testing Library (frontend) |
| Security   | Helmet + CORS + express-rate-limit + input sanitization |
| Container  | Docker (Cloud Run ready)                    |

## Architecture

```
Client (React/Vite) → Express API → Gemini Service → Google Gemini API
```

## Security

- `helmet` middleware for secure HTTP headers
- `cors` with configurable origin whitelist
- `express-rate-limit` — 100 requests per minute
- Input validation on all API endpoints (type, length, content)
- Context field whitelisted to valid journey stages only
- Prompt injection sanitization on user queries
- Request body size limited to 10KB
- API key stored in `.env`, never committed to repo
- Gemini safety settings block harmful content

## Accessibility

- ARIA labels on all interactive elements
- `aria-live` regions for dynamic content updates
- `aria-pressed` for toggle button states
- Keyboard navigation support with skip-to-content link
- `prefers-reduced-motion` media query respects OS settings
- Semantic HTML structure (`main`, `section`, `aside`, `header`, `form`, `ol`)
- Screen reader-only labels (`.sr-only`)
- `:focus-visible` styling for keyboard focus indicators
- Error boundary with accessible fallback UI

## Testing

### Backend (12 tests)
```bash
cd server && npm test
```
- Health endpoint validation (status, timestamp, service name)
- Input rejection (empty body, whitespace, oversized, wrong type)
- AI success path with mocked Gemini
- Context validation (whitelist enforcement)
- Error handling (Gemini failure simulation)

### Frontend (20 tests)
```bash
cd client && npm test
```
- Header rendering and Gemini badge visibility
- JourneySelector stage buttons, click handlers, aria-pressed states
- Timeline step rendering, click callbacks, accessibility labels
- JargonBuster input interaction, button states

## Setup

```bash
# Backend
cd server
npm install
cp .env.example .env    # then add your real GEMINI_API_KEY
npm start

# Frontend (separate terminal)
cd client
npm install
npm run dev
```

## Production Build

```bash
cd client && npm run build    # outputs to server/dist
cd ../server && npm start     # serves frontend + API on port 8080
```

## Docker Deployment

```bash
docker build -t elara .
docker run -e GEMINI_API_KEY=your_key -p 8080:8080 elara
```

## Google Cloud Run Deployment

```bash
cd client && npm run build
cd ../server
gcloud run deploy elara --source . --platform managed --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key
```

## Project Structure

```
ELARA/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── __tests__/
│   │   │   │   ├── Header.test.jsx
│   │   │   │   ├── JourneySelector.test.jsx
│   │   │   │   ├── Timeline.test.jsx
│   │   │   │   └── JargonBuster.test.jsx
│   │   │   ├── ChatPanel.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── JargonBuster.jsx
│   │   │   ├── JourneySelector.jsx
│   │   │   └── Timeline.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── setupTests.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/
│   ├── routes/
│   │   ├── ai.js
│   │   └── health.js
│   ├── services/
│   │   └── gemini.js
│   ├── tests/
│   │   └── api.test.js
│   ├── index.js
│   ├── .env.example
│   └── package.json
├── .gitignore
├── Dockerfile
└── README.md
```

# ELARA — Election Assistance & Resource Assistant

> AI-powered election education assistant. Democracy, decoded. 🗳️

## Project Overview

ELARA helps users understand the election process, timelines, and voting steps through an interactive, context-aware AI interface powered by **Google Gemini**. It's built for the **PromptWars hackathon** challenge: *Election Process Education*.

## Features

- **Intent-Based AI Routing** — 4 specialized Gemini prompts ensure each feature gives focused, accurate responses:
  - **Journey Mode** — Personalized next steps based on your voter registration stage
  - **Timeline Mode** — Deep explanations of each election stage (who, what, how long, what's next)
  - **Jargon Mode** — Pure term definitions only — no journey leakage
  - **General Mode** — Neutral election Q&A assistant
- **5-Step Election Timeline** — Registration → Verification → Polling Day → Counting → Results, each with clickable deep-dive explanations
- **Guided Walkthrough** — "Start Guided Walkthrough" button auto-plays all 5 election stages sequentially with a progress bar
- **Jargon Buster with Quick Picks** — 6 pre-loaded common terms (Electoral College, VVPAT, etc.) plus free-text input for instant definitions
- **Trust Badges** — AI responses tagged with quality indicators (📘 Beginner Friendly, 🧭 Step-by-Step Guidance, ⏱ Timeline Included, ✅ Verified Educational Info)
- **Election Journey Selector** — Context engine with three stages: Not Registered / Registered / Ready to Vote
- **Smart Guidance** — Context-aware auto-triggered guidance for unregistered voters on first load
- **Error Boundary** — Graceful error handling with recovery UI
- **Robust Fallback System** — Intent-specific offline responses including a built-in jargon dictionary of 6 common election terms

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
Client (React/Vite)
  ├── Journey Selector ──→ intent: journey
  ├── Timeline Steps   ──→ intent: timeline
  ├── Jargon Buster    ──→ intent: jargon
  └── Chat Input       ──→ intent: general
         │
         ▼
Express API (/api/ai)
  ├── Input validation + sanitization
  ├── Intent routing (4 specialized prompts)
  └── Fallback system (intent-aware offline responses)
         │
         ▼
Gemini Service → Google Gemini 2.0 Flash API
```

## Security

- `helmet` middleware for secure HTTP headers
- `cors` with configurable origin whitelist
- `express-rate-limit` — 100 requests per minute
- Input validation on all API endpoints (type, length, content)
- Context and intent fields whitelisted to valid values only
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

### Backend (20 tests)
```bash
cd server && npm test
```
- Health endpoint validation (status, timestamp, service name)
- Input rejection (empty body, whitespace, oversized, wrong type)
- AI success path with mocked Gemini (intent routing)
- Context and intent validation (whitelist enforcement)
- Jargon-specific fallback with built-in dictionary
- Walkthrough endpoint (5 stages, required fields)
- Error handling (Gemini failure simulation)

### Frontend (21 tests)
```bash
cd client && npm test
```
- Header rendering and Gemini badge visibility
- JourneySelector stage buttons, click handlers, aria-pressed states
- Timeline 5-step rendering, object callbacks, accessibility labels, subtitles
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
gcloud run deploy elara-app --source . --region us-central1 --allow-unauthenticated \
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
│   │   ├── ai.js          # Intent-based routing + fallback system
│   │   └── health.js
│   ├── services/
│   │   └── gemini.js      # 4 specialized prompt templates
│   ├── tests/
│   │   └── api.test.js
│   ├── index.js
│   ├── .env.example
│   └── package.json
├── .gitignore
├── Dockerfile
└── README.md
```

## Submission Links

- **GitHub Repository**: [aashitanegii/ELARA](https://github.com/aashitanegii/ELARA)
- **Live Deployment**: [ELARA on Cloud Run](https://elara-174971475950.asia-south1.run.app/)
- **LinkedIn Post**: [View Announcement](https://www.linkedin.com/feed/update/urn:li:ugcPost:7455959254038925312/)
- **Dev.to Article**: [Decoding Democracy: How ELARA is Transforming Election Education Through Specialized AI](https://dev.to/aashitanegii/decoding-democracy-how-elara-is-transforming-election-education-through-specialized-ai-12jh)

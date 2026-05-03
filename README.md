# ELARA — Election Assistance & Resource Assistant

> AI-powered election education assistant. Democracy, decoded. 🗳️

## Project Overview

ELARA helps users understand the election process, timelines, and voting steps through an interactive, context-aware AI interface powered by **Google Gemini**. It's built for the **PromptWars hackathon** challenge: *Election Process Education*.

Available in **English** and **Hindi (हिन्दी)** for inclusive access across India.

## Features

- **Intent-Based AI Routing** — 4 specialized Gemini prompts ensure each feature gives focused, accurate responses:
  - **Journey Mode** — Personalized next steps based on your voter registration stage
  - **Timeline Mode** — Deep explanations of each election stage (who, what, how long, what's next)
  - **Jargon Mode** — Pure term definitions only — no journey leakage
  - **General Mode** — Neutral election Q&A assistant
- **Hindi/English Toggle** — Switch between English and Hindi responses via Gemini's multilingual capabilities
- **5-Step Election Timeline** — Registration → Verification → Polling Day → Counting → Results, each with clickable deep-dive explanations
- **Guided Walkthrough** — "Start Guided Walkthrough" button auto-plays all 5 election stages sequentially with a progress bar
- **Jargon Buster with Quick Picks** — 8 pre-loaded common terms (Electoral College, VVPAT, NOTA, EVM, etc.) plus free-text input for instant definitions
- **Trust & Source Citations** — AI responses tagged with quality badges and official ECI source links (eci.gov.in, voters.eci.gov.in, nvsp.in)
- **Election Journey Selector** — Context engine with three stages: Not Registered / Registered / Ready to Vote
- **Smart Guidance** — Context-aware auto-triggered guidance for unregistered voters on first load
- **Error Boundary** — Graceful error handling with accessible recovery UI
- **Robust Fallback System** — Intent-specific offline responses including a built-in jargon dictionary of 8 common election terms (VVPAT, NOTA, EVM, EPIC, etc.)
- **Disclaimer Banner** — Clear disclaimer distinguishing AI guidance from official information

## Tech Stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Frontend   | React 18 + Vite 6                           |
| Backend    | Node.js + Express                           |
| AI Engine  | Google Gemini API (`@google/generative-ai` — gemini-2.0-flash)  |
| Analytics  | Google Analytics (gtag.js)                  |
| Testing    | Jest + Supertest (backend), Vitest + React Testing Library (frontend) |
| Security   | Helmet (strict CSP) + CORS + express-rate-limit + HPP + input sanitization |
| Performance| LRU Cache + Compression + React.lazy code splitting |
| Container  | Docker (Cloud Run ready)                    |

## Architecture

```
Client (React/Vite)
  ├── Journey Selector ──→ intent: journey
  ├── Timeline Steps   ──→ intent: timeline
  ├── Jargon Buster    ──→ intent: jargon
  ├── Hindi/EN Toggle  ──→ lang: hi/en
  └── Chat Input       ──→ intent: general
         │
         ▼
Express API (/api/ai)
  ├── Input validation + sanitization
  ├── Intent routing (4 specialized prompts)
  ├── Language-aware prompting (Hindi/English)
  ├── LRU response caching
  └── Fallback system (intent-aware offline responses)
         │
         ▼
Google Services
  ├── Gemini 2.0 Flash API (AI responses)
  └── Google Analytics (usage tracking)
```

## Google Services Integration

| Service | Usage |
| ------- | ----- |
| **Google Gemini API** | Core AI engine — 4 specialized system prompts with safety settings, intent routing, and Hindi/English multilingual support |
| **Google Analytics** | User interaction tracking — question events, journey selections, walkthrough starts, jargon lookups |

## Security

- `helmet` middleware with **strict Content Security Policy** (no `unsafe-inline` for scripts)
- CSP directives whitelisting only Google Fonts, Google Analytics, and Gemini API domains
- `cors` with configurable origin whitelist
- `express-rate-limit` — 100 requests per minute
- `hpp` — HTTP Parameter Pollution protection
- Input validation on all API endpoints (type, length, content)
- Context, intent, and language fields whitelisted to valid values only
- Prompt injection sanitization on user queries
- Request body size limited to 10KB
- API key stored in `.env`, never committed to repo
- Gemini safety settings block harmful content
- Error messages never leak internal details to client

## Accessibility

- ARIA labels on all interactive elements
- `aria-live` regions for dynamic content updates
- `aria-busy` attribute on chat during loading
- `aria-pressed` for toggle button states
- Keyboard navigation support with skip-to-content link
- `prefers-reduced-motion` media query respects OS settings
- Semantic HTML structure (`main`, `section`, `aside`, `header`, `form`, `ol`)
- Screen reader-only labels (`.sr-only`)
- `:focus-visible` styling for keyboard focus indicators
- Error boundary with accessible fallback UI (`role="alert"`, `aria-live="assertive"`)
- `<noscript>` fallback for non-JS browsers
- `role="status"` on loading indicators

## Testing

### Backend (33 tests)
```bash
cd server && npm test
```
- Health endpoint validation (status, timestamp, service name)
- Input rejection (empty body, whitespace, oversized, wrong type)
- AI success path with mocked Gemini (intent routing)
- Context, intent, and language validation (whitelist enforcement)
- Hindi language parameter passing
- Jargon-specific fallback with built-in dictionary
- Walkthrough endpoint (5 stages, required fields, official links)
- Error handling (Gemini failure simulation)
- **Security tests**: prompt injection stripping, error detail leakage prevention, response caching verification, security header validation
- **Fallback system tests**: timeline, journey, jargon, and NOTA dictionary

### Frontend (58 tests)
```bash
cd client && npm test
```
- Header rendering, Gemini badge, and language toggle
- JourneySelector stage buttons, click handlers, aria-pressed states
- Timeline 5-step rendering, object callbacks, accessibility labels, subtitles
- JargonBuster input interaction, button states
- **ChatPanel**: AI response display, trust badges, loading states, aria-busy, disclaimer, Hindi lang, error handling, form accessibility
- **App**: component composition, language toggle state, semantic landmarks, skip-to-content
- **ErrorBoundary**: error catch, fallback UI, recovery button, alert role, aria-live

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
│   │   │   │   ├── App.test.jsx
│   │   │   │   ├── ChatPanel.test.jsx
│   │   │   │   ├── ErrorBoundary.test.jsx
│   │   │   │   ├── Header.test.jsx
│   │   │   │   ├── JargonBuster.test.jsx
│   │   │   │   ├── JourneySelector.test.jsx
│   │   │   │   └── Timeline.test.jsx
│   │   │   ├── ChatPanel.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── JargonBuster.jsx
│   │   │   ├── JourneySelector.jsx
│   │   │   └── Timeline.jsx
│   │   ├── utils/
│   │   │   ├── constants.js          # Shared constants (badges, languages, ECI links)
│   │   │   └── markdown.jsx          # Shared markdown renderer
│   │   ├── analytics.js              # Google Analytics integration
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── setupTests.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/
│   ├── data/
│   │   ├── jargonDictionary.js        # Built-in election term definitions
│   │   └── walkthrough.js             # 5-stage election walkthrough data
│   ├── routes/
│   │   ├── ai.js                      # Intent-based routing + cache + validation
│   │   └── health.js
│   ├── services/
│   │   ├── fallbacks.js               # Intent-aware offline response builders
│   │   └── gemini.js                  # Gemini integration + Hindi/English prompts
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

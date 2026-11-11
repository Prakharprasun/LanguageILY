# Language ILY ❤️ — Duolingo Fullstack Web Application Clone

> **“Learn the language. Get the crush.”**  
> *“Your crush won't learn your language. Probably.”*

[![Live Demo](https://img.shields.io/badge/Live_Demo-language--ily.vercel.app-C81E3A?style=for-the-badge&logo=vercel)](https://language-ily.vercel.app/)
[![Backend API](https://img.shields.io/badge/Backend_API-languageily.onrender.com-46E3B7?style=for-the-badge&logo=render)](https://languageily.onrender.com)
[![Interactive Docs](https://img.shields.io/badge/Swagger_API_Docs-languageily.onrender.com%2Fdocs-0284C7?style=for-the-badge&logo=fastapi)](https://languageily.onrender.com/docs)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Prakharprasun%2FLanguageILY-181717?style=for-the-badge&logo=github)](https://github.com/Prakharprasun/LanguageILY)

---

## 🚀 Live Demo & Deliverables

| Deliverable | URL |
| :--- | :--- |
| **Frontend Application (Vercel)** | [**https://language-ily.vercel.app/**](https://language-ily.vercel.app/) |
| **Backend REST API (Render)** | [**https://languageily.onrender.com**](https://languageily.onrender.com) |
| **Interactive API Documentation (Swagger)** | [**https://languageily.onrender.com/docs**](https://languageily.onrender.com/docs) |
| **Health Check Endpoint** | [**https://languageily.onrender.com/api/health**](https://languageily.onrender.com/api/health) |
| **Public Source Code (GitHub)** | [**https://github.com/Prakharprasun/LanguageILY**](https://github.com/Prakharprasun/LanguageILY) |

---

A fullstack, gamified language-learning web application inspired by **Duolingo** with the playful **Language ILY ❤️** identity (*learn a language because you have a crush*), built with **Next.js 15 (TypeScript)** on the frontend and **Python (FastAPI + SQLite)** on the backend.

---

## Credits & Attribution (MIT License)

This project builds upon and extends the open-source UI foundation from **[`sanidhyy/duolingo-clone`](https://github.com/sanidhyy/duolingo-clone)** by **[Sanidhya Kumar Verma](https://github.com/sanidhyy)**, used under the permissive **[MIT License](./LICENSE)**:

- **Original Repository**: <https://github.com/sanidhyy/duolingo-clone>
- **Original Author**: Sanidhya Kumar Verma (`@sanidhyy`)
- **What We Built & Extended**:
  - Designed and implemented a complete **Python FastAPI + SQLite** backend (`backend/`) replacing the original serverless Postgres/Clerk/Stripe stack.
  - Designed a normalized 14-table relational SQLite schema (`backend/app/schema.sql`) with an append-only XP ledger, session & answer tracking, lazy heart regeneration, streak freeze & decay logic, daily quests, and tiered achievements.
  - Expanded the lesson player from 2 basic card types to **all 5 required Duolingo exercise types** (`MULTIPLE_CHOICE`, `TRANSLATE` word bank, `MATCH_PAIRS`, `FILL_BLANK`, `TYPE_ANSWER`), plus hoverable word hints and Web Speech API text-to-speech pronunciation.
  - Added the **Language ILY ❤️** visual theme (cream, deep crimson, soft rose/pink, and handwritten script flourishes), the interactive **"Who are you trying to impress?"** home screen, **"Crush Mode ❤️" vs. "Actually Learn This Language"** mode switcher, narrative romantic-to-fluency curriculum, **Learner Profile** page, **Settings** page, and a **Simulated Day Control** (`+1 Day`) for testing streaks and heart timers.

---

## Core Features & Assignment Checklist

### 1. Learning Path / Skill Tree (`/learn`)
- **Narrative Romantic-to-Fluency Progression**:
  - **Stage 1: Make your intentions clear ❤️** — *Make your intentions clear ("Te quiero mucho")*, *Don't immediately ruin it ("Hola, ¿cómo estás?")*, *Keep the conversation alive ("Me gusta hablar contigo")*.
  - **Stage 2: The dangerous one & Surviving the date** — *The dangerous one ("Eres muy lindo/hermosa")*, *Survive the coffee date ("¿Quieres tomar un café conmigo?")*, *Meet the family*.
  - **Stage 3: You're on your own now ♡** — *Weekend plans ("¿Tienes planes este fin de semana?")*, *Run away together*, *Ask them out ("¿Quieres salir conmigo?")*.
- **Crush Mode ❤️ vs. Actually Learn Mode**: Switch between the full grammar/vocabulary skill tree and the **Crush Mode** high-reward romantic phrasebook with confidence meters and instant native audio.
- **Lock / Unlock Progression & Crowns**: Completed skills earn a Crown badge, the current active skill shows a circular progress ring and bouncing `START ❤️` callout, and future skills remain locked until earlier skills are mastered.
- **Stage Rizz Books (Guidebooks)**: Interactive modal per unit displaying key phrases and vocabulary with one-click pronunciation.
- **Top Bar & Sticky Widgets**: Displays course flag, **Streak** counter, **Total XP**, **Gems**, and **Hearts** (with live regeneration countdown), plus a **Daily XP Goal** card and 7-day streak calendar.

### 2. Lesson Player — The Core Loop (`/lesson`, `/lesson/[lessonId]`)
- **All 5 Required Exercise Types**:
  1. `MULTIPLE_CHOICE` — Select the matching translation card (with illustrations, keyboard shortcuts `1-3`, and audio playback).
  2. `TRANSLATE` — Word-bank sentence builder (tap tiles to assemble English or Spanish translations, with hoverable word hints).
  3. `MATCH_PAIRS` — Interactive two-column pair matching between Spanish and English terms.
  4. `FILL_BLANK` — Complete the Spanish sentence by picking the missing word in context.
  5. `TYPE_ANSWER` — Free-text translation input with accent-character quick buttons (`á, é, í, ó, ú, ñ, ¿, ¡`) and accent-tolerant grading.
- **Signature Feedback Bar**: Immediate correct/incorrect bottom bar with sound effects (`correct.wav`, `incorrect.wav`, `finish.mp3`) and solution callouts.
- **Mistake Mastery Queue**: Any exercise answered incorrectly is re-queued at the end of the lesson until mastered.
- **Hearts & Failure Handling**: Wrong answers in normal lessons deduct 1 heart. Reaching 0 hearts opens the **Out of Hearts** modal offering free **Practice** or a **Shop Refill**.
- **Celebration & Confidence Card**: Confetti animation, fanfare audio, social-media-style **Confidence meter** (`Confidence: ████████░░`), XP + Flawless Bonus breakdown, and streak extension banner.

### 3. Gamification & Progress
- **Streak System & Day Simulator**: Tracks daily activity streaks, longest streak, and equipped **Streak Freezes**. Includes a **"Simulate +1 Day"** button in the sidebar to test day rollovers, streak continuation/decay, and heart regeneration during evaluation.
- **Hearts Regeneration**: Hearts regenerate automatically over time (1 heart every 30 minutes) or immediately via **Practice** (`+1 Heart, +5 XP`) or **Shop Refill** (`350 Gems`).
- **Weekly Leaderboard (`/leaderboard`)**: 15 seeded learners ranked by weekly XP with Promotion and Demotion zones.
- **Daily Quests (`/quests`)** & **Gem Shop (`/shop`)**: Earn gems from daily quests and spend them on **Refill Hearts** (`350 Gems`), **Streak Freeze** (`200 Gems`), or preview the mocked **Super ILY ❤️** tier.

### 4. Content Management, Profile & Settings
- **Learner Profile (`/profile`)**: Displays user handle, join date, active courses, 6 key statistics, a **Last 7 Days XP** bar chart, and **6 Tiered Achievement Badges** (*Heartthrob Streak*, *Smooth Talker*, *Love Lexicon*, *Zero Awkwardness*, *First Date Ready*, *Hopeless Romantic*).
- **Settings (`/settings`)**: Customize display name, switch Daily XP Goal (*Casual 10 XP*, *Regular 20 XP*, *Serious 30 XP*, *Intense 50 XP*), toggle sound/animation/listening preferences, or **Reset Seeded Demo Data**.

---

## 📌 Assumptions, Mocked Data & Design Notes

In alignment with the assignment specifications, the following design decisions, assumptions, and mocked elements were implemented:

### 1. Assumptions & Simplifications
- **Simplified Single-Learner Authentication**: As permitted in the assignment brief (*"Real user authentication may be simplified (assume a default logged-in learner)"*), the frontend automatically identifies as the seeded learner **Romeo Learner** (`user_id = 1`) via an `X-User-Id` header. This eliminates sign-in/sign-up friction and allows evaluators to test all features instantly.
- **Relational SQLite Database**: SQLite was selected and designed per the requirements (`backend/app/schema.sql`). On Render and local setups, data persists to disk. On container cold starts or fresh deployments, the app automatically detects unseeded state and runs the seeder in `<500ms`.
- **Accent-Tolerant & Whitespace-Tolerant Grading**: Spanish grading automatically forgives missing accents (`á, é, í, ó, ú, ñ`) during free typing while still showing the canonical native spelling in the feedback bar. Korean grading normalizes spacing to support beginner learners typing Hangul.
- **Web Speech API Audio**: Pronunciation uses the browser's native Web Speech API (`speechSynthesis`) with locale voices for Spanish (`es-ES`) and Korean (`ko-KR`), alongside pre-bundled sound effects (`correct.wav`, `incorrect.wav`, `finish.mp3`). This provides instantaneous audio without requiring external paid API keys.

### 2. Mocked Data & Placeholders
- **Seeded Course Curriculum**:
  - Two full courses are seeded: **Spanish (`es`)** and **Korean (`kr`)**, each with **3 Units, 9 Skills, 18 Lessons**, and **90+ varied exercises** spanning all 5 exercise types (`MULTIPLE_CHOICE`, `TRANSLATE` word bank, `MATCH_PAIRS`, `FILL_BLANK`, `TYPE_ANSWER`).
  - Follows the narrative romantic-to-fluency arc (*"Make your intentions clear"*, *"Don't immediately ruin it"*, *"The dangerous one"*, *"Survive the coffee date"*, *"Ask them out"*).
- **Gems & Shop Currency**:
  - Gems are a mocked gamification currency (`520 gems` pre-seeded for the sample learner).
  - Learners earn gems from completing lessons and daily quests, and spend them on **Heart Refills** (350 gems) and **Streak Freezes** (200 gems).
- **Super Subscription ("Super ILY ❤️")**:
  - In-app purchases / Super subscription is present as a mocked promotional tier showcasing "Unlimited Hearts, Unlimited Rizz, No Ads".
- **Leaderboard Competitors**:
  - 15 realistic rival learners are seeded with weekly XP totals in the Bronze League, creating an authentic competition environment with real-time promotion and demotion zones.
- **Achievements & Quests**:
  - 6 tiered lifetime achievements (*Heartthrob Streak*, *Smooth Talker*, *Love Lexicon*, *Zero Awkwardness*, *First Date Ready*, *Hopeless Romantic*) and 3 daily quests.

### 3. Evaluator Convenience Notes
- **Simulated Day Clock (`+1 Day`)**: Streaks and heart regeneration timers normally take 24 hours or 30 minutes to observe. A dedicated **`+1 Day`** simulation endpoint (`POST /api/dev/advance-day`) is wired to a button in the sidebar, allowing evaluators to simulate consecutive days, watch streaks increment, test streak freeze consumption, and verify streak resets after missed days.
- **One-Click Demo Reset**: An evaluator can click **"Reset Seeded Demo Data"** on `/settings` (or `POST /api/dev/reset`) at any point to restore all progress, hearts, gems, and lessons back to the pristine initial state.


---

## Repository Structure

```text
duolingo-clone/
├── backend/                  # Python FastAPI + SQLite backend
│   ├── app/
│   │   ├── main.py           # FastAPI app, CORS, lifespan auto-seeding
│   │   ├── schema.sql        # Relational SQLite DDL (14 tables)
│   │   ├── config.py         # Game constants (hearts, XP, timers, shop costs)
│   │   ├── db.py             # SQLite connection & transaction dependency
│   │   ├── clock.py          # Simulated clock for testing streaks & timers
│   │   ├── schemas.py        # Pydantic request models
│   │   ├── routers/          # REST endpoints (users, learn, sessions, gamification, dev)
│   │   └── services/         # Domain logic (grading, path, sessions, shop, profile, users)
│   ├── seed/
│   │   ├── content.py        # Course units, skills, vocab, sentences, achievements, rivals
│   │   └── seed.py           # Database seeder (generates all 5 exercise types per lesson)
│   ├── tests/
│   │   └── test_api.py       # Pytest end-to-end API & lesson loop test suite
│   └── requirements.txt
└── frontend/                 # Next.js 15 (App Router, TypeScript, Tailwind CSS)
    ├── app/
    │   ├── (marketing)/      # "Language ILY ❤️ — Who are you trying to impress?" home screen
    │   ├── (main)/           # App shell with Sidebar & StickyWrapper
    │   │   ├── learn/        # Skill tree, Crush Mode toggle, Rizz Book modal, skill popovers
    │   │   ├── leaderboard/  # Weekly league standings
    │   │   ├── quests/       # Daily quests tracker
    │   │   ├── shop/         # Gem shop (heart refill, streak freeze, mocked Super ILY)
    │   │   ├── profile/      # Learner stats, 7-day XP chart, tiered achievements
    │   │   ├── settings/     # Daily goal, preferences, demo reset
    │   │   └── courses/      # Language course selector
    │   └── lesson/           # Interactive lesson & practice player (all 5 exercise types)
    ├── components/           # Shared UI components, modals, sidebar, top progress bar
    └── lib/api.ts            # Typed API client & Web Speech API TTS helper
```

---

## Database Schema (`backend/app/schema.sql`)

The SQLite database uses `PRAGMA foreign_keys = ON` and is organized into three domains:

1. **Course Content**: `courses`, `units`, `skills`, `lessons`, `vocabulary`, `exercises`, `exercise_options`, `exercise_accepted_answers`
2. **Learner State & Activity Ledger**: `users`, `user_settings`, `lesson_sessions`, `session_exercises`, `session_answers`, `xp_events`
3. **Gamification & Simulation**: `achievements`, `user_achievements`, `quests`, `user_quest_rewards`, `app_meta`

---

## REST API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/me` | Current learner summary (streak, XP, hearts, regen timer, daily goal, 7-day calendar) |
| `PATCH` | `/api/me` | Update display name or daily XP goal |
| `PATCH` | `/api/me/settings` | Update sound/animation/listening preferences |
| `GET` | `/api/users` | List seeded learners (for the demo account switcher) |
| `GET` | `/api/users/{id}/profile` | Full profile stats, 7-day XP chart, and tiered achievements |
| `GET` | `/api/courses` | List available language courses |
| `GET` | `/api/path` | Active course skill tree (`units` → `skills` → `lessons`) with `completed` / `active` / `locked` states |
| `GET` | `/api/units/{id}/guidebook` | Vocabulary & key phrases grouped by skill for a unit |
| `POST` | `/api/lessons/{id}/sessions` | Start a lesson session (validates unlock state & hearts > 0) |
| `POST` | `/api/practice/sessions` | Start a practice session from completed lessons |
| `POST` | `/api/sessions/{id}/answers` | Grade an exercise answer, deduct heart on mistake, return solution |
| `POST` | `/api/sessions/{id}/complete` | Complete session: grant XP + bonus, update streak, quests, achievements |
| `GET` | `/api/leaderboard` | Weekly league standings with promotion/demotion zones |
| `GET` | `/api/quests` | Daily quests with live progress |
| `GET` | `/api/shop` | Shop catalog (`refill_hearts`, `streak_freeze`) |
| `POST` | `/api/shop/purchases` | Purchase a shop item with gems |
| `POST` | `/api/dev/advance-day` | Advance simulated clock by `+N` days to test streaks & heart regen |
| `POST` | `/api/dev/reset` | Re-seed database to initial state |

---

## Setup & Running Locally

### 1. Backend (FastAPI + SQLite)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Seed/reset the SQLite database (also auto-seeds on first server startup)
python -m seed.seed

# Run the backend test suite
python -m pytest -v

# Start the FastAPI server on http://127.0.0.1:8000
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (Next.js)

```bash
cd frontend
npm install

# Start the Next.js development server on http://localhost:3000
npm run dev
```

Open `http://localhost:3000` to experience the **Language ILY ❤️** home screen, or visit `http://localhost:3000/learn` for the skill tree.

---

## Deployment Guide

### Option 1: Frontend on Vercel + Backend on Railway / Render (Recommended)

This gives you a persistent SQLite database and instant zero-config Next.js hosting.

#### 1. Deploy the Backend (Railway or Render)
- **Railway**:
  1. Click **New Project** → **Deploy from GitHub repo** → select `LanguageILY`.
  2. Set **Root Directory** to `backend`.
  3. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  4. Generate a public domain (e.g. `https://language-ily-backend.up.railway.app`).
- **Render**:
  1. Click **New Web Service** → connect `LanguageILY`.
  2. Root directory: `backend`
  3. Build command: `pip install -r requirements.txt`
  4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

#### 2. Deploy the Frontend on Vercel
1. Go to [Vercel](https://vercel.com) and click **Add New** → **Project**.
2. Import `LanguageILY`.
3. Under **Project Settings**:
   - **Root Directory**: Click "Edit" and select `frontend`.
   - **Framework Preset**: Next.js (automatically detected).
4. Under **Environment Variables**:
   - Add `BACKEND_URL`: Your backend URL (e.g. `https://language-ily-backend.up.railway.app` without trailing slash).
5. Click **Deploy**. Vercel will build and serve the Next.js app with automated SSL and edge caching.

---

### Option 2: Render Free Tier (All-in-One)
You can also deploy both frontend and backend on Render using web services, or deploy the Next.js frontend to Netlify/Cloudflare Pages with the same `frontend` root directory and `BACKEND_URL` environment variable.

---

## 🧪 Evaluator & Testing Walkthrough

When evaluating the live application at [**https://language-ily.vercel.app/**](https://language-ily.vercel.app/):

1. **Home Screen (`/`)**:
   - Play with the romantic search bar (*"What do you want to say to your crush?"*).
   - Test the interactive **"Your first Spanish phrase: Te quiero mucho"** confidence card with native audio playback.
   - Click **"Get Started"** or **"I Already Have An Account"** to enter the learning path.

2. **Skill Tree & Course Switcher (`/learn`)**:
   - Switch between **🇪🇸 Spanish** and **🇰🇷 Korean** with one click in the top switcher bar.
   - Toggle **"Crush Mode ❤️"** to view high-priority romantic one-liners with confidence ratings and instant native pronunciation.
   - Click on the active glowing lesson node to begin the lesson loop.

3. **Interactive Lesson Loop (`/lesson`)**:
   - Complete exercises covering all 5 core types:
     1. `MULTIPLE_CHOICE` with card selection and keyboard shortcuts `1-3`.
     2. `TRANSLATE` word bank with tap-to-assemble sentence tiles and hoverable word hints.
     3. `MATCH_PAIRS` interactive matching columns with instant audio feedback.
     4. `FILL_BLANK` contextual word selection.
     5. `TYPE_ANSWER` free text input with special character quick buttons (`á, é, í, ó, ú, ñ, ¿, ¡`).
   - Notice the mistake queue: any wrong answer deducts 1 heart and is re-queued at the end of the lesson until mastered.
   - Experience the completion screen with animated confetti, confidence calculation, and XP award.

4. **Gamification & Simulation Controls**:
   - **Simulate +1 Day**: Click the **"+1 Day"** button in the left sidebar to advance the clock, test streak maintenance/freeze usage, and trigger heart timer rollovers.
   - **Leaderboard (`/leaderboard`)**: View weekly league standings with ranked rivals, promotion spots, and demotion zones.
   - **Shop (`/shop`)**: Refill hearts using earned gems (350 gems) or equip a Streak Freeze (200 gems).
   - **Profile (`/profile`)**: Review 6 key lifetime stats, the 7-day XP activity chart, and 6 tiered romantic achievements (*Heartthrob Streak*, *Smooth Talker*, *Love Lexicon*, etc.).
   - **Settings (`/settings`)**: Adjust Daily XP Goals (*Casual 10 XP* to *Intense 50 XP*) or use **"Reset Seeded Demo Data"** to return the database to its pristine state at any time.



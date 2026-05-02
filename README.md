# RapidMVP

AI-powered platform that turns ideas into working React apps in minutes. Describe what you want, pick an AI model, watch it stream, preview live in the same window, refine with follow-up prompts, deploy a public demo link, or export to a runnable Vite project.

![Next.js](https://img.shields.io/badge/Next.js_16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?logo=tailwindcss&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

---

## How It Works

1. **Describe your app** — plain-English prompt in the chat interface
2. **Pick a model** — choose from multiple AI providers; default is the fastest verified-working one
3. **Watch it stream** — real-time token streaming over Server-Sent Events
4. **Preview instantly** — same-origin iframe with in-browser Babel compilation
5. **Iterate** — follow-up messages refine the existing project instead of regenerating from scratch
6. **Compare versions** — every generation is saved; toggle v1, v2, v3, … in the preview header
7. **Auto-fix runtime errors** — preview surfaces a "Fix with AI" button when JS throws
8. **Share or ship** — deploy a 15-minute public demo URL on Vercel, export as a Vite project, or open in StackBlitz

---

## Features

| Feature | Description |
| ------- | ----------- |
| **AI Code Generation** | Multi-file React + Tailwind apps from natural language prompts |
| **Multi-Model Support** | 10 models across 4 providers (Novita, Gemini, OpenRouter, Anthropic) |
| **Streaming Responses** | Token-by-token output via Server-Sent Events; cancellable mid-stream |
| **Iterative Chat Refinement** | Each follow-up modifies the existing codebase. The current files are passed back into the system prompt so the AI preserves what already works. |
| **Version History** | Every generation is parsed from chat history into a v1/v2/v3 pill row in the preview header. Click to swap the preview + code viewer to that version. Includes a "Jump to latest" banner when viewing an older version. |
| **Fix with AI** | Preview iframe `postMessage`s render/runtime/promise errors to the chat page. A red banner appears under the iframe with a one-click "Fix with AI" button that sends the error back to the fastest available model and applies the patch as a new version. |
| **Live Preview** | Same-origin iframe with Babel Standalone, framer-motion shim (degrades to plain divs if AI uses motion.\* components), and an `onerror` listener so a render failure never produces a blank white page. |
| **Ephemeral Vercel Deploy** | One-click "Deploy Demo" button creates a real `https://*.vercel.app` URL via Vercel's deployment API, automatically strips SSO/password protection so it's shareable to anyone, and auto-deletes after 15 minutes (configurable). Pill in the header shows the URL, a live countdown, copy button, and end-now button. |
| **File Explorer** | VS Code-style tree view with syntax highlighting (prism-react-renderer) |
| **Export to ZIP** | Full Vite + React project — `npm install && npm run dev` ready |
| **Open in StackBlitz** | One-click browser IDE, no account needed |
| **Resizable Panels** | Drag handle between chat and preview/code panels |
| **Project Management** | Create, rename, delete projects with persistent chat history per project |
| **Auth** | Sign up / log in with JWT sessions (NextAuth v5 + MongoDB credentials) |

---

## Running Locally

### Prerequisites

| Tool | Version | Install |
| ---- | ------- | ------- |
| Node.js | ≥ 20 | [nodejs.org](https://nodejs.org/) |
| npm | bundled with Node | — |
| MongoDB | ≥ 7 | macOS: `brew tap mongodb/brew && brew install mongodb-community` |

### Setup

```bash
git clone https://github.com/vraj00222/RapidMVP.git
cd RapidMVP

npm install

cp .env.example .env.local
# Fill in your keys — see "Environment Variables" below
```

### Run the app

There are two ways to start the dev environment:

```bash
# Option A — Next.js + MongoDB together (recommended)
npm run dev:full

# Option B — Next.js only (you start MongoDB yourself)
npm run dev
```

`dev:full` boots `mongod` in the background using the macOS Homebrew config (`/opt/homebrew/etc/mongod.conf`), waits a second, then starts Next.js. On Linux/Windows, edit the `dev:full` script in `package.json` to point to your local mongod config.

If you go with Option B, start MongoDB manually first:

```bash
mongod --config /opt/homebrew/etc/mongod.conf   # foreground
# or
brew services start mongodb-community           # background (macOS)
```

Then open [http://localhost:3000](http://localhost:3000).

### Other commands

```bash
npm run build          # production build (also runs typecheck)
npm run start          # serve the production build on :3000
npm run lint           # ESLint
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values. **`.env.local` is gitignored** — never commit it. The `.env.example` file is a template with placeholder values only.

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `MONGODB_URI` | Yes | MongoDB connection string. Default for local dev: `mongodb://localhost:27017/rapidmvp` |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT signing. Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | App URL — `http://localhost:3000` for dev |
| `NOVITA_API_KEY` | One AI key min | [Novita AI](https://novita.ai/) — primary provider, 6 models |
| `GOOGLE_GEMINI_API_KEY` | One AI key min | [Google AI Studio](https://ai.google.dev/) — free tier available |
| `OPENROUTER_API_KEY` | One AI key min | [OpenRouter](https://openrouter.ai/) — free model fallback |
| `ANTHROPIC_API_KEY` | One AI key min | [Anthropic Claude](https://console.anthropic.com/) — premium tier |
| `VERCEL_TOKEN` | Optional | [Vercel access token](https://vercel.com/account/tokens) — required for the **Deploy Demo** button. Without it, deploys are disabled but everything else works. |
| `DEPLOYMENT_TTL_MINUTES` | Optional | How long an ephemeral demo deploy stays live. Clamped to 1–60. Default: `15`. |

You need **at least one AI provider key**. Models whose providers have no key configured are automatically hidden from the model picker.

---

## Available AI Models

The chat picker is sorted by verified availability (top entry is the default selection):

| # | Model | Provider | Tier |
| - | ----- | -------- | ---- |
| 1 | DeepSeek V3 *(default)* | Novita | standard |
| 2 | Qwen3 Coder 480B | Novita | premium |
| 3 | DeepSeek R1 | Novita | premium |
| 4 | Qwen3 235B | Novita | premium |
| 5 | Llama 3.3 70B | Novita | standard |
| 6 | Llama 3.1 8B | Novita | fast |
| 7 | Gemini 2.5 Flash | Google | fast |
| 8 | Gemini 2.5 Flash Lite | Google | fast |
| 9 | GLM 4.5 Air *(free)* | OpenRouter | fast |
| 10 | Claude Sonnet 4 | Anthropic | premium |

Models from providers without an API key configured are hidden automatically. The "Fix with AI" button always picks the fastest tier available so error fixes land quickly.

---

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI | shadcn/ui + Radix UI |
| Animations | Framer Motion |
| Icons | Lucide React |
| Database | MongoDB + Mongoose |
| Auth | NextAuth v5 (JWT + credentials) |
| AI Providers | Novita, Google Gemini, OpenRouter, Anthropic |
| Streaming | Server-Sent Events (SSE) |
| Code Highlighting | prism-react-renderer |
| Export | JSZip, file-saver, StackBlitz SDK |
| Demo Deploys | Vercel REST API (`/v13/deployments`) |

---

## Project Structure

```text
src/
├── app/
│   ├── page.tsx                            # Landing page
│   ├── layout.tsx                          # Root layout + providers
│   ├── login/                              # Login page
│   ├── signup/                             # Signup page
│   ├── dashboard/                          # Project dashboard
│   ├── chat/[projectId]/                   # Chat + preview + code + version pills
│   └── api/
│       ├── auth/                           # NextAuth endpoints + signup
│       ├── health/                         # Health check
│       ├── models/                         # Available AI models for the picker
│       ├── preview/[id]/                   # Same-origin preview renderer (?version=N supported)
│       └── projects/
│           ├── route.ts                    # GET (list) + POST (create)
│           └── [id]/
│               ├── route.ts                # GET / PUT / DELETE
│               ├── messages/               # Chat history
│               ├── generate/               # SSE streaming AI generation
│               └── deploy/                 # POST / GET / DELETE Vercel ephemeral deploy
├── components/
│   ├── landing/                            # Hero, features, CTA sections
│   ├── layout/                             # Navbar, Footer
│   └── ui/                                 # shadcn/ui primitives
├── lib/
│   ├── ai/models.ts                        # Model catalog & provider config
│   ├── auth/                               # NextAuth config
│   ├── db/                                 # MongoDB singleton connection
│   ├── export/scaffold.ts                  # Vite project scaffolding for ZIP/StackBlitz
│   └── preview/build-preview.ts            # Self-contained preview HTML generator (used by preview + deploy routes)
└── models/                                 # Mongoose schemas (User, Project)
```

---

## Production Build

```bash
npm run build
npm run start
```

The build is a standard Next.js production bundle. To deploy it on Vercel, push to GitHub and connect the repo to a Vercel project — the same `VERCEL_TOKEN` used for ephemeral demo deploys is **not** needed for hosting RapidMVP itself; it's only used by the Deploy Demo button at runtime to spin up demo sites for generated projects.

Set the same environment variables (excluding any local-only values) in the Vercel project settings before deploying.

---

## Security Notes

- `.env.local`, `.claude/`, `.agents/`, and `skills-lock.json` are gitignored. Don't commit them — they may contain API keys or local tooling state.
- The `Vercel Token` you configure is owner-scoped — every demo deploy goes under your Vercel account. Rotate it if it's ever shared.
- Each user's projects are owner-scoped at the API layer — `findOne({ _id, owner: session.user.id })` is enforced on every read and write.
- Generated code runs in a same-origin iframe with no `sandbox` attribute. The preview's `unhandledrejection` and `error` listeners surface failures back to the chat page via `postMessage`. Don't paste untrusted output into the preview.

---

## License

Private

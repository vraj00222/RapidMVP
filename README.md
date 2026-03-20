# RapidMVP

AI-powered platform that turns ideas into working React apps in minutes. Describe what you want, pick an AI model, and get a live preview — then export or open in StackBlitz.

![Next.js](https://img.shields.io/badge/Next.js_16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?logo=tailwindcss&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)

---

## How It Works

1. **Describe your app** — plain English prompt in the chat interface
2. **Pick a model** — choose from 10+ AI models across 4 providers
3. **Watch it stream** — real-time token streaming as the AI writes your code
4. **Preview instantly** — live in-app preview with hot reload
5. **Export & ship** — download as a Vite project or open directly in StackBlitz

---

## Features

| Feature | Description |
| ------- | ----------- |
| **AI Code Generation** | Multi-file React + Tailwind apps from natural language prompts |
| **Multi-Model Support** | 10+ models — Novita, OpenRouter, Google Gemini, Anthropic Claude |
| **Streaming Responses** | Real-time token-by-token output via Server-Sent Events |
| **Live Preview** | Same-origin iframe preview with Babel compilation |
| **File Explorer** | VS Code-style tree view with syntax highlighting (prism-react-renderer) |
| **Export to ZIP** | Full Vite + React project — `npm install && npm run dev` ready |
| **Open in StackBlitz** | One-click browser IDE, no account needed |
| **Resizable Panels** | Drag handle between chat and preview/code panels |
| **Project Management** | Create, rename, delete projects with persistent chat history |
| **Auth** | Sign up / log in with JWT sessions (NextAuth v5 + MongoDB) |

---

## Quick Start

```bash
git clone https://github.com/vraj00222/RapidMVP.git
cd RapidMVP

npm install

cp .env.example .env.local
# Fill in your keys (see below)

npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT signing |
| `NEXTAUTH_URL` | Yes | App URL (`http://localhost:3000` for dev) |
| `NOVITA_API_KEY` | One AI key min | [Novita AI](https://novita.ai/) — primary provider |
| `OPENROUTER_API_KEY` | One AI key min | [OpenRouter](https://openrouter.ai/) |
| `GOOGLE_GEMINI_API_KEY` | One AI key min | [Google Gemini](https://ai.google.dev/) |
| `ANTHROPIC_API_KEY` | One AI key min | [Anthropic Claude](https://console.anthropic.com/) |

> You need at least one AI provider key. Models from providers without keys are automatically hidden.

---

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI | shadcn/ui + Radix UI |
| Animations | Framer Motion |
| Icons | Lucide React |
| Database | MongoDB + Mongoose |
| Auth | NextAuth v5 (JWT + credentials) |
| AI | Novita, OpenRouter, Gemini, Anthropic |
| Code Highlighting | prism-react-renderer |
| Export | JSZip, file-saver, StackBlitz SDK |

---

## Project Structure

```text
src/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── layout.tsx                      # Root layout with providers
│   ├── login/                          # Login page
│   ├── signup/                         # Signup page
│   ├── dashboard/                      # Project dashboard
│   ├── chat/[projectId]/               # Chat interface + preview + code
│   └── api/
│       ├── auth/                       # NextAuth endpoints + signup
│       ├── health/                     # Health check
│       ├── models/                     # Available AI models
│       ├── preview/[id]/               # Same-origin preview renderer
│       └── projects/                   # CRUD + AI generation (SSE)
├── components/
│   ├── landing/                        # Hero, features, CTA sections
│   ├── layout/                         # Navbar, Footer
│   └── ui/                             # shadcn/ui primitives
├── lib/
│   ├── ai/models.ts                    # Model definitions & provider config
│   ├── auth/                           # NextAuth config
│   ├── db/                             # MongoDB connection (singleton)
│   └── export/scaffold.ts             # Vite project scaffolding
└── models/                             # Mongoose schemas (User, Project)
```

---

## Roadmap

- [ ] One-click deploy (Vercel / Netlify integration)
- [ ] Iterative chat — refine existing code with follow-up prompts
- [ ] Auto error recovery — send compile errors back to AI for fixing
- [ ] Version history — view and revert to previous generations
- [ ] Template library — pre-built starters to kick off projects
- [ ] Payment integration (Stripe)

---

## License

Private

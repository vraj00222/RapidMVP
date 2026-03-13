# RapidMVP

AI-powered platform that helps founders and developers go from idea to deployed MVP in minutes — not months.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui + Radix UI primitives
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Database:** MongoDB + Mongoose
- **Auth:** NextAuth v5 (JWT sessions, credentials provider)
- **AI Providers:** Novita, OpenRouter, Google Gemini, Anthropic Claude
- **Code Highlighting:** prism-react-renderer
- **Export:** JSZip + file-saver, StackBlitz SDK

## Features

- **AI Code Generation** — Describe what you want, get production-ready React + Tailwind code
- **Multi-Model Support** — Choose from 10+ AI models across 4 providers (Novita, OpenRouter, Gemini, Anthropic)
- **Streaming Responses** — Real-time token streaming via Server-Sent Events
- **Live Preview** — In-app iframe preview with Babel compilation (same-origin API route)
- **Multi-File Generation** — AI generates structured multi-file projects with proper separation of concerns
- **File Explorer** — VS Code-style tree view with folder collapsing, file icons, and syntax highlighting
- **Export to ZIP** — Downloads a complete Vite + React project (npm install && npm run dev ready)
- **Open in StackBlitz** — One-click to open your project in StackBlitz's web IDE (free, no account needed)
- **Resizable Panels** — Drag to resize chat and preview/code panels
- **Project Management** — Create, rename, delete projects with chat history persistence
- **Auth System** — Sign up, log in, JWT-based sessions with MongoDB user storage

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your API keys (at minimum MONGODB_URI, NEXTAUTH_SECRET, and one AI provider key)

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT signing |
| `NEXTAUTH_URL` | Yes | App URL (`http://localhost:3000` for dev) |
| `NOVITA_API_KEY` | At least one | Novita AI API key |
| `OPENROUTER_API_KEY` | At least one | OpenRouter API key |
| `GOOGLE_GEMINI_API_KEY` | At least one | Google Gemini API key |
| `ANTHROPIC_API_KEY` | At least one | Anthropic Claude API key |

## Project Structure

```text
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── login/                      # Login page
│   ├── signup/                     # Signup page
│   ├── chat/[projectId]/           # AI chat interface with preview
│   ├── dashboard/                  # Project dashboard
│   └── api/
│       ├── auth/                   # NextAuth + signup endpoints
│       ├── projects/               # Project CRUD
│       ├── projects/[id]/generate/ # AI generation with SSE streaming
│       ├── preview/[id]/           # Same-origin preview HTML
│       └── models/                 # Available AI models
├── components/
│   ├── landing/                    # Landing page sections
│   ├── layout/                     # Navbar, Footer
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── ai/models.ts                # AI model definitions
│   ├── auth/                       # NextAuth configuration
│   ├── db/                         # MongoDB connection
│   └── export/scaffold.ts          # Vite project scaffolding for export
└── models/                         # Mongoose schemas (User, Project)
```

## License

Private

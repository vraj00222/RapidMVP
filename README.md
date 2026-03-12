# RapidMVP

AI-powered platform that helps founders and developers go from idea to deployed MVP in minutes — not months.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui + Radix UI primitives
- **Animations:** Framer Motion
- **Icons:** Lucide React

## Current Progress

### Completed

- [x] **Landing Page** — Hero, Features, Templates, Testimonials, Pricing, and CTA sections
- [x] **Layout** — Navbar with mobile menu + Footer
- [x] **Auth Pages** — Login and Signup pages (UI only)
- [x] **Dashboard Page** — Project listing with stats, quick actions, and recent activity (UI only)
- [x] **Chat Page** — AI chat interface with project generation flow (UI only)
- [x] **UI Components** — Button, Input, Card, Badge, Avatar, Textarea (shadcn/ui)

### Pending

- [ ] Backend API integration (authentication, project CRUD)
- [ ] AI chat backend (LLM integration for MVP generation)
- [ ] Database setup (user accounts, projects, chat history)
- [ ] Template engine for code generation
- [ ] Deployment pipeline (one-click deploy)
- [ ] Payment integration (Stripe)
- [ ] Real-time collaboration features

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```text
src/
├── app/
│   ├── page.tsx          # Landing page
│   ├── layout.tsx        # Root layout
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── chat/             # AI chat interface
│   └── dashboard/        # Project dashboard
├── components/
│   ├── landing/          # Landing page sections
│   ├── layout/           # Navbar, Footer
│   └── ui/               # shadcn/ui components
└── lib/
    └── utils.ts          # Utility functions
```

## License

Private

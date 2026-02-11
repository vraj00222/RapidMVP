Plan: RapidMVP Front-End Website
Build a modern, AI-powered MVP builder front-end similar to v0.dev and bolt.dev. The workspace is currently empty, so this is a greenfield project using Next.js 14+, TypeScript, Tailwind CSS, and shadcn/ui.

Steps
Initialize Next.js project with core tooling — Set up Next.js 14 App Router with TypeScript, Tailwind CSS, ESLint, and install shadcn/ui component library for accessible, customizable UI primitives.

Build marketing pages — Create landing page with hero section (prominent prompt input CTA), feature grid showcasing the "prompt → build → deploy" flow, template carousel, testimonials, pricing table, and footer.

Implement authentication flow — Add /login/login/page.tsx) and /signup/signup/page.tsx) pages with OAuth buttons (GitHub, Google) using NextAuth.js or Clerk for session management.

Create main chat/prompt interface — Build the core product at /chat with PromptInput component, ChatHistory sidebar, live CodePreview iframe, CodeEditor (Monaco), and FileTree for generated project structure.

Build user dashboard — Create /dashboard/dashboard/page.tsx) with ProjectGrid showing saved projects, usage stats, quick actions (new project, import, templates), and settings page.

Add shared components & design system — Implement Navbar, collapsible Sidebar, Modal, Toast notifications, loading states, and ensure consistent dark/light theme support across all pages.

Further Considerations
Which authentication provider? Clerk is faster to integrate with better UX / NextAuth.js is more flexible and self-hosted — recommend Clerk for MVP speed.

Code preview sandbox approach? Iframe-based preview (simpler) / WebContainers like StackBlitz (more powerful but complex) — recommend iframe for MVP.


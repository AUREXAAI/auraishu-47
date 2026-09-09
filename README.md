# AUREXA AI

**One AI. Everything you need.**

A freemium all-in-one AI web app — chat, solve, code, create images, generate videos, edit, and learn with AI-generated courses.

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui (new-york style, zinc base)
- **Animations:** Framer Motion
- **State:** Zustand
- **i18n:** next-intl (en, kn, hi)
- **Icons:** lucide-react

## Setup

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Folder Structure

```
aurexa-ai/
├── app/
│   ├── layout.tsx          # Root layout (fonts, providers, app shell)
│   ├── page.tsx            # Home screen
│   └── globals.css         # Design tokens + global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── app-shell.tsx       # Mobile app shell (header + bottom nav)
│   ├── home-screen.tsx     # Home screen content
│   ├── bottom-nav.tsx      # Fixed bottom navigation
│   ├── logo.tsx            # AUREXA AI logo lockup
│   ├── pro-pill.tsx        # Pro badge
│   └── avatar.tsx          # User avatar
├── messages/
│   ├── en.json             # English translations
│   ├── kn.json             # Kannada translations
│   └── hi.json             # Hindi translations
├── hooks/
│   └── use-toast.ts        # Toast hook
├── lib/
│   └── utils.ts            # cn() utility
├── i18n.ts                 # next-intl config
├── middleware.ts           # next-intl middleware
├── tailwind.config.ts      # Tailwind + design tokens
└── next.config.js          # Next.js config with next-intl plugin
```

## Environment Variables

Create a `.env.local` file with the following:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
GROQ_API_KEY=
OPENAI_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

## i18n Dev Toggle

Preview Kannada locale by adding `?lang=kn` to the URL. A visible locale switcher will be added on Day 11.
